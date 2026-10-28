import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_WILAYAS, SERVER_PRODUCTS, ServerWilaya } from './data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Shared secret key for Admin API authorization
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'miee_secret_admin_token_2026';

export const apiRouter = Router();

// Middleware: Require Admin Authorization for sensitive order operations
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-key'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication token required.'
    });
  }
  next();
}

// SavedOrder interface
export interface SavedOrder {
  orderId: string;
  customerName: string;
  phone: string;
  wilayaId: string;
  wilayaName: string;
  deliveryMethod: 'office' | 'home';
  address?: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'new' | 'confirmed' | 'shipped' | 'cancelled';
  createdAt: string;
}

// Asynchronous & Concurrency-Safe File Operations
let fileWriteQueue = Promise.resolve();

async function loadOrders(): Promise<SavedOrder[]> {
  try {
    if (existsSync(ORDERS_FILE)) {
      const data = await fs.readFile(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Server Orders] Could not read orders.json, using empty list:', err);
  }
  return [];
}

async function saveOrders(orders: SavedOrder[]): Promise<void> {
  fileWriteQueue = fileWriteQueue.then(async () => {
    try {
      const dir = path.dirname(ORDERS_FILE);
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }
      await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[Server Orders] Could not save orders.json:', err);
    }
  });
  return fileWriteQueue;
}

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'Miee Fashion Store API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Products endpoint
apiRouter.get('/products', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: SERVER_PRODUCTS
  });
});

// Wilayas and shipping fees endpoint
apiRouter.get('/wilayas', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: SERVER_WILAYAS
  });
});

// GET all orders endpoint (Protected for Admin Dashboard only)
apiRouter.get('/orders', requireAdmin, async (_req: Request, res: Response) => {
  const orders = await loadOrders();
  res.json({
    success: true,
    data: orders
  });
});

// POST new order endpoint (Public checkout with server-side price & data verification)
apiRouter.post('/orders', async (req: Request, res: Response) => {
  const {
    orderId: customId,
    customerName,
    phone,
    wilayaId,
    deliveryMethod,
    address,
    items
  } = req.body;

  // 1. Strict Input Validation & Sanitization
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'يرجى تقديم اسم كامل صحيح.'
    });
  }
  const cleanName = customerName.trim().slice(0, 100);

  if (!phone || typeof phone !== 'string' || !/^0[567]\d{8}$/.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: 'يرجى إدخال رقم هاتف جزائري صحيح مكون من 10 أرقام (يبدأ بـ 05 أو 06 أو 07).'
    });
  }
  const cleanPhone = phone.trim();

  // Wilaya Lookup & Verification
  const cleanWilayaId = String(wilayaId || '').padStart(2, '0');
  const selectedWilaya = SERVER_WILAYAS.find((w: ServerWilaya) => w.id === cleanWilayaId || w.id === wilayaId);
  if (!selectedWilaya) {
    return res.status(400).json({
      success: false,
      message: 'الولاية المحددة غير صحيحة.'
    });
  }

  const cleanDeliveryMethod: 'home' | 'office' = deliveryMethod === 'home' ? 'home' : 'office';

  if (cleanDeliveryMethod === 'home' && (!address || typeof address !== 'string' || !address.trim())) {
    return res.status(400).json({
      success: false,
      message: 'يرجى إدخال العنوان التفصيلي للتوصيل المنزلي.'
    });
  }
  const cleanAddress = address && typeof address === 'string' ? address.trim().slice(0, 300) : '';

  if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'سلة المشتريات فارغة أو تحتوي عناصر غير صالحة.'
    });
  }

  // 2. Server-side price calculation & verification (Prevents Client Price Tampering)
  let verifiedSubtotal = 0;
  const verifiedItems = items.map((it: any) => {
    const qty = Math.max(1, Math.min(20, Number(it.qty) || 1));
    const serverProduct = SERVER_PRODUCTS.find((p) => p.id === it.id);
    // If recognized catalog item, enforce official server price; otherwise validate price is positive
    const price = serverProduct ? serverProduct.price : (Number(it.price) > 0 ? Number(it.price) : 0);
    verifiedSubtotal += price * qty;
    return {
      id: String(it.id || '').slice(0, 50),
      name: String(it.name || serverProduct?.name || 'قطعة').slice(0, 100),
      price,
      qty,
      color: String(it.color || '').slice(0, 50),
      size: String(it.size || '').slice(0, 20),
      image: String(it.image || serverProduct?.image || '').slice(0, 500)
    };
  });

  // Calculate authentic shipping fee according to wilaya matrix
  const verifiedShipping = cleanDeliveryMethod === 'home' ? selectedWilaya.homePrice : selectedWilaya.officePrice;
  const verifiedTotal = verifiedSubtotal + verifiedShipping;

  const orderId = customId && typeof customId === 'string' && /^MIEE-\d+$/i.test(customId)
    ? customId
    : `MIEE-${Date.now().toString().slice(-6)}`;

  const newOrder: SavedOrder = {
    orderId,
    customerName: cleanName,
    phone: cleanPhone,
    wilayaId: selectedWilaya.id,
    wilayaName: selectedWilaya.name,
    deliveryMethod: cleanDeliveryMethod,
    address: cleanAddress,
    items: verifiedItems,
    subtotal: verifiedSubtotal,
    shipping: verifiedShipping,
    total: verifiedTotal,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  const currentOrders = await loadOrders();
  const updatedOrders = [newOrder, ...currentOrders.filter((o) => o.orderId !== orderId)];
  await saveOrders(updatedOrders);

  console.log(`[Order Verified & Recorded] ID: ${orderId} | Name: ${cleanName} | Total: ${verifiedTotal} DZD`);

  return res.status(201).json({
    success: true,
    orderId,
    order: newOrder,
    message: 'تم تسجيل طلبك بنجاح وسنتصل بك قريباً لتأكيده.'
  });
});

// PATCH update order status (Protected for Admin)
apiRouter.patch('/orders/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const orders = await loadOrders();
  const index = orders.findIndex((o) => o.orderId === id);
  if (index !== -1) {
    orders[index].status = status;
    await saveOrders(orders);
    return res.json({ success: true, order: orders[index] });
  }
  return res.status(404).json({ success: false, message: 'Order not found' });
});

// DELETE all orders (Protected for Admin)
apiRouter.delete('/orders', requireAdmin, async (_req: Request, res: Response) => {
  await saveOrders([]);
  return res.json({ success: true, message: 'All orders cleared' });
});

// DELETE single order (Protected for Admin)
apiRouter.delete('/orders/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = await loadOrders();
  const filtered = orders.filter((o) => o.orderId !== id);
  await saveOrders(filtered);
  return res.json({ success: true });
});

// -------------------------------------------------------------
// Push Notifications Endpoints
// -------------------------------------------------------------

const TOKENS_FILE = path.join(__dirname, 'data', 'push_tokens.json');

interface PushDeviceToken {
  token: string;
  userAgent?: string;
  platform?: string;
  registeredAt: string;
}

async function loadPushTokens(): Promise<PushDeviceToken[]> {
  try {
    if (existsSync(TOKENS_FILE)) {
      const data = await fs.readFile(TOKENS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

async function savePushTokens(tokens: PushDeviceToken[]): Promise<void> {
  try {
    const dir = path.dirname(TOKENS_FILE);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Push Tokens] File write warning:', err);
  }
}

// POST register push token
apiRouter.post('/push/tokens', async (req: Request, res: Response) => {
  const { token, userAgent, platform } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid token' });
  }

  const tokens = await loadPushTokens();
  const existingIndex = tokens.findIndex((t) => t.token === token);
  const updatedDevice: PushDeviceToken = {
    token,
    userAgent: userAgent || '',
    platform: platform || '',
    registeredAt: new Date().toISOString()
  };

  if (existingIndex !== -1) {
    tokens[existingIndex] = updatedDevice;
  } else {
    tokens.push(updatedDevice);
  }

  await savePushTokens(tokens);
  console.log(`[Push Token Registered] Total devices: ${tokens.length}`);
  return res.json({ success: true, count: tokens.length });
});

// GET registered tokens count (Admin only)
apiRouter.get('/push/tokens', requireAdmin, async (_req: Request, res: Response) => {
  const tokens = await loadPushTokens();
  return res.json({ success: true, count: tokens.length, tokens });
});

// POST dispatch push notification to registered devices
apiRouter.post('/push/send', async (req: Request, res: Response) => {
  const { title, body, orderId, url } = req.body;
  const tokens = await loadPushTokens();

  console.log(`[Push Dispatch] Notification queued for ${tokens.length} device(s): "${title}"`);

  // If FCM Server Key is configured in environment, forward to FCM
  const fcmKey = process.env.FCM_SERVER_KEY;
  if (fcmKey && tokens.length > 0) {
    for (const dev of tokens) {
      if (dev.token.startsWith('web_native_')) continue;
      try {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${fcmKey}`
          },
          body: JSON.stringify({
            to: dev.token,
            notification: {
              title: title || '🛍️ طلبية جديدة في Miee!',
              body: body || 'وصلت طلبية جديدة.',
              icon: '/miee-logo.png',
              sound: 'default'
            },
            data: {
              orderId: orderId || '',
              url: url || '/#admin/orders'
            }
          })
        });
      } catch (err) {
        console.warn(`[Push FCM] Error sending to token ${dev.token.slice(0, 10)}:`, err);
      }
    }
  }

  return res.json({
    success: true,
    sentTo: tokens.length,
    message: 'Notification dispatched successfully'
  });
});
