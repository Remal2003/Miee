// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs
} from "firebase/firestore";
import { getDatabase, ref, set, onValue } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User
} from "firebase/auth";
import { Product, Wilaya } from "./types";
import { PRODUCTS } from "./data/products";
import { WILAYAS } from "./data/wilayas";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAKlfM8_e1DqRrwRn38xnKoxUPRjQ6erpM",
  authDomain: "miee-38afa.firebaseapp.com",
  databaseURL: "https://miee-38afa-default-rtdb.firebaseio.com",
  projectId: "miee-38afa",
  storageBucket: "miee-38afa.firebasestorage.app",
  messagingSenderId: "223594445887",
  appId: "1:223594445887:web:5a19ddc7f5800ab18d8c8a",
  measurementId: "G-1RBLEME17D"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export async function loginWithFirebase(email: string, pass: string, remember: boolean = true) {
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  } catch (err) {
    console.warn("[Firebase Auth] setPersistence note:", err);
  }
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function logoutFromFirebase() {
  return await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Realtime Database (safely)
let rtdbInstance: any = null;
try {
  rtdbInstance = getDatabase(app);
} catch (e) {
  console.warn("[Firebase RTDB] Init notice:", e);
}
export const rtdb = rtdbInstance;

// Initialize Analytics (Browser-safe)
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("[Firebase] Analytics initialized successfully");
    }
  });
}

// -------------------------------------------------------------
// Orders Management (Multi-layer: LocalStorage + Firestore + RTDB)
// -------------------------------------------------------------

export interface FirebaseOrder {
  orderId: string;
  customerName: string;
  phone: string;
  wilayaId: string;
  wilayaName: string;
  deliveryMethod: "office" | "home";
  address?: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "new" | "confirmed" | "shipped" | "cancelled";
  createdAt: string;
}

const ORDERS_STORAGE_KEY = "miee_all_orders";
const DELETED_ORDERS_KEY = "miee_deleted_order_ids";
const PURGE_TIMESTAMP_KEY = "miee_orders_purge_timestamp";
const ADMIN_API_KEY = "miee_secret_admin_token_2026";

function getLocalOrders(): FirebaseOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: FirebaseOrder[]) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("miee_orders_updated"));
  } catch (e) {
    console.warn("Error saving local orders:", e);
  }
}

export function getDeletedOrderIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedOrderIds(ids: string[]) {
  try {
    localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(ids));
  } catch {}
}

export function getPurgeTimestamp(): number {
  try {
    const raw = localStorage.getItem(PURGE_TIMESTAMP_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

// Module-level caches accessible by subscribeToOrders, deleteOrderFromFirebase, and clearAllOrdersFromFirebase
let cachedFirestoreOrders: FirebaseOrder[] = [];
let cachedRtdbOrders: FirebaseOrder[] = [];
let cachedServerOrders: FirebaseOrder[] = [];

/**
 * Saves order immediately to LocalStorage, Cloud Firestore, Realtime Database, and Backend API
 */
export async function saveOrderToFirebase(orderData: {
  orderId: string;
  customerName: string;
  phone: string;
  wilayaId: string;
  wilayaName: string;
  deliveryMethod: "office" | "home";
  address?: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const payload: FirebaseOrder = {
    ...orderData,
    address: orderData.address || "",
    status: "new",
    createdAt: new Date().toISOString()
  };

  // 1. Immediately save to LocalStorage so order is visible instantly
  try {
    const local = getLocalOrders();
    const updated = [payload, ...local.filter(o => o.orderId !== payload.orderId)];
    saveLocalOrders(updated);
  } catch (err) {
    console.warn("LocalStorage save warning:", err);
  }

  // 2. Sync to Backend Express API
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (apiErr) {
    console.warn("API order sync note:", apiErr);
  }

  // 3. Save to Cloud Firestore (sanitized)
  try {
    const cleanPayload = JSON.parse(JSON.stringify(payload));
    const orderDocRef = doc(db, "orders", orderData.orderId);
    await setDoc(orderDocRef, {
      ...cleanPayload,
      timestamp: serverTimestamp()
    });
    console.log(`[Firebase Firestore] Order ${orderData.orderId} saved successfully.`);
  } catch (error) {
    console.warn("[Firebase Firestore] Order write note (check Firestore rules if permission denied):", error);
  }

  // 4. Save to Realtime Database
  if (rtdb) {
    try {
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      const rtdbRef = ref(rtdb, `orders/${orderData.orderId}`);
      await set(rtdbRef, cleanPayload);
      console.log(`[Firebase Realtime Database] Order ${orderData.orderId} synced.`);
    } catch (error) {
      console.warn("[Firebase Realtime Database] Order sync note:", error);
    }
  }

  return payload;
}

/**
 * Real-time listener for all orders with multi-source merging (LocalStorage + Server API + Firestore + RTDB)
 */
export function subscribeToOrders(callback: (orders: FirebaseOrder[]) => void) {
  const mergeAndEmit = () => {
    const local = getLocalOrders();
    const deletedIds = new Set(getDeletedOrderIds());
    const purgeTime = getPurgeTimestamp();
    const map = new Map<string, FirebaseOrder>();

    const isAllowedOrder = (o: FirebaseOrder) => {
      if (!o || !o.orderId) return false;
      // Filter out any explicitly deleted order ID
      if (deletedIds.has(o.orderId)) return false;
      // Filter out any orders created before or at the purge timestamp
      if (purgeTime > 0) {
        const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        if (!t || t <= purgeTime) return false;
      }
      return true;
    };

    // 1. Server orders
    cachedServerOrders.filter(isAllowedOrder).forEach(o => map.set(o.orderId, o));
    // 2. Local orders
    local.filter(isAllowedOrder).forEach(o => map.set(o.orderId, o));
    // 3. Firestore orders
    cachedFirestoreOrders.filter(isAllowedOrder).forEach(o => map.set(o.orderId, o));
    // 4. Realtime Database orders
    cachedRtdbOrders.filter(isAllowedOrder).forEach(o => map.set(o.orderId, o));

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(merged);
  };

  // Initial emit from local
  mergeAndEmit();

  // Fetch orders from server API immediately and poll safely (respecting Spark free plan limits)
  const fetchServerOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-admin-key": ADMIN_API_KEY }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          cachedServerOrders = json.data;
          mergeAndEmit();
        }
      }
    } catch {
      // Offline fallback
    }
  };
  fetchServerOrders();
  // Poll every 20 seconds only when tab is visible, reducing free quota burn by 80%
  const pollTimer = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    fetchServerOrders();
  }, 20000);

  // Listen for local events (same tab & cross-tab)
  const handleLocalUpdate = () => mergeAndEmit();
  window.addEventListener("miee_orders_updated", handleLocalUpdate);
  window.addEventListener("storage", handleLocalUpdate);

  // Listen to Firestore
  let unsubFirestore = () => {};
  try {
    const ordersCol = collection(db, "orders");
    unsubFirestore = onSnapshot(
      ordersCol,
      (snapshot) => {
        cachedFirestoreOrders = [];
        snapshot.forEach((docSnap) => {
          cachedFirestoreOrders.push(docSnap.data() as FirebaseOrder);
        });
        mergeAndEmit();
      },
      (error) => {
        console.warn("[Firebase Firestore] Orders listener note (check security rules):", error);
      }
    );
  } catch (e) {
    console.warn("Firestore snapshot setup:", e);
  }

  // Listen to Realtime Database safely with error handler
  if (rtdb) {
    try {
      const ordersRef = ref(rtdb, "orders");
      onValue(
        ordersRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            cachedRtdbOrders = Object.values(val) as FirebaseOrder[];
            mergeAndEmit();
          } else {
            cachedRtdbOrders = [];
            mergeAndEmit();
          }
        },
        (error) => {
          console.warn("[Firebase RTDB] Orders listener note:", error);
        }
      );
    } catch (e) {
      console.warn("RTDB listener note:", e);
    }
  }

  return () => {
    clearInterval(pollTimer);
    window.removeEventListener("miee_orders_updated", handleLocalUpdate);
    window.removeEventListener("storage", handleLocalUpdate);
    unsubFirestore();
  };
}

/**
 * Updates order status across all channels
 */
export async function updateOrderStatus(orderId: string, status: FirebaseOrder["status"]) {
  // Update local immediately
  const local = getLocalOrders();
  const updated = local.map(o => o.orderId === orderId ? { ...o, status } : o);
  saveLocalOrders(updated);

  // Update server API with admin key
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_API_KEY
      },
      body: JSON.stringify({ status })
    });
  } catch {}

  // Update Firestore
  try {
    await updateDoc(doc(db, "orders", orderId), { status });
  } catch (e) {
    console.warn("Firestore update note:", e);
  }

  // Update RTDB
  if (rtdb) {
    try {
      await set(ref(rtdb, `orders/${orderId}/status`), status);
    } catch (e) {
      console.warn("RTDB update note:", e);
    }
  }
}

/**
 * Deletes an order across all channels
 */
export async function deleteOrderFromFirebase(orderId: string) {
  // 1. Track in persistent deleted IDs so it never resurrects
  const deleted = getDeletedOrderIds();
  if (!deleted.includes(orderId)) {
    saveDeletedOrderIds([...deleted, orderId]);
  }

  // 2. Delete local immediately
  const local = getLocalOrders();
  saveLocalOrders(local.filter(o => o.orderId !== orderId));

  // 3. Delete from module caches immediately
  cachedServerOrders = cachedServerOrders.filter(o => o.orderId !== orderId);
  cachedFirestoreOrders = cachedFirestoreOrders.filter(o => o.orderId !== orderId);
  cachedRtdbOrders = cachedRtdbOrders.filter(o => o.orderId !== orderId);

  // 4. Trigger UI update to immediately remove order from dashboard
  window.dispatchEvent(new Event("miee_orders_updated"));

  // 5. Delete from server API
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
      headers: { "x-admin-key": ADMIN_API_KEY }
    });
  } catch {}

  // 6. Delete from Firestore
  try {
    await deleteDoc(doc(db, "orders", orderId));
  } catch (e) {
    console.warn("Firestore delete note:", e);
  }

  // 7. Delete from RTDB
  if (rtdb) {
    try {
      await set(ref(rtdb, `orders/${orderId}`), null);
    } catch (e) {
      console.warn("RTDB delete note:", e);
    }
  }
}

/**
 * Deletes all test/dummy orders across all storage layers
 */
export async function clearAllOrdersFromFirebase() {
  const local = getLocalOrders();
  const allCurrentIds = Array.from(new Set([
    ...local.map(o => o.orderId),
    ...cachedFirestoreOrders.map(o => o.orderId),
    ...cachedRtdbOrders.map(o => o.orderId),
    ...cachedServerOrders.map(o => o.orderId)
  ]));

  // 1. Mark purge timestamp in LocalStorage so ANY existing order is permanently suppressed
  const now = Date.now();
  try {
    localStorage.setItem(PURGE_TIMESTAMP_KEY, now.toString());
    const existingDeleted = getDeletedOrderIds();
    const updated = Array.from(new Set([...existingDeleted, ...allCurrentIds]));
    saveDeletedOrderIds(updated);
  } catch {}

  // 2. Clear LocalStorage immediately
  saveLocalOrders([]);

  // 3. Clear module caches immediately
  cachedServerOrders = [];
  cachedFirestoreOrders = [];
  cachedRtdbOrders = [];

  // 4. Dispatch event immediately so all listeners receive [] right now
  window.dispatchEvent(new Event("miee_orders_updated"));

  // 5. Delete from server API
  try {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "x-admin-key": ADMIN_API_KEY }
    });
  } catch {}

  // 6. Delete all orders from Cloud Firestore directly
  try {
    const snap = await getDocs(collection(db, "orders"));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (e) {
    console.warn("Firestore purge error:", e);
    for (const id of allCurrentIds) {
      try {
        await deleteDoc(doc(db, "orders", id));
      } catch {}
    }
  }

  // 7. Clear entire orders node from Realtime Database
  if (rtdb) {
    try {
      await set(ref(rtdb, "orders"), null);
    } catch (e) {
      console.warn("RTDB purge error:", e);
      for (const id of allCurrentIds) {
        try {
          await set(ref(rtdb, `orders/${id}`), null);
        } catch {}
      }
    }
  }
}


// -------------------------------------------------------------
// Products Management (Live Catalog)
// -------------------------------------------------------------

const PRODUCTS_STORAGE_KEY = "miee_custom_products";

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

function saveLocalProducts(list: Product[]) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("miee_products_updated"));
  } catch (e) {
    console.warn("Error saving local products:", e);
  }
}

export function subscribeToProducts(callback: (products: Product[]) => void) {
  let firestoreProducts: Product[] = [];

  const mergeAndEmit = () => {
    const local = getLocalProducts();
    const map = new Map<string, Product>();
    local.forEach(p => map.set(p.id, p));
    firestoreProducts.forEach(p => map.set(p.id, p));
    callback(Array.from(map.values()));
  };

  mergeAndEmit();

  const handleUpdate = () => mergeAndEmit();
  window.addEventListener("miee_products_updated", handleUpdate);
  window.addEventListener("storage", handleUpdate);

  let unsub = () => {};
  try {
    const q = collection(db, "products");
    unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          firestoreProducts = [];
          snapshot.forEach((docSnap) => {
            firestoreProducts.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, "id">) });
          });
          mergeAndEmit();
        }
      },
      () => {
        // Fallback to local
      }
    );
  } catch {
    // Fallback
  }

  return () => {
    window.removeEventListener("miee_products_updated", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    unsub();
  };
}

export async function saveProductToFirebase(product: Product) {
  // Save local first
  const local = getLocalProducts();
  const updated = [product, ...local.filter(p => p.id !== product.id)];
  saveLocalProducts(updated);

  try {
    const prodRef = doc(db, "products", product.id);
    await setDoc(prodRef, {
      name: product.name,
      price: Number(product.price),
      image: product.image,
      category: product.category,
      colors: product.colors,
      sizes: product.sizes,
      tag: product.tag || "",
      tagStyle: product.tagStyle || "orange",
      inStock: product.inStock !== false
    });
  } catch (e) {
    console.warn("Firestore product save note:", e);
  }
}

export async function deleteProductFromFirebase(productId: string) {
  const local = getLocalProducts();
  saveLocalProducts(local.filter(p => p.id !== productId));

  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (e) {
    console.warn("Firestore product delete note:", e);
  }
}

// -------------------------------------------------------------
// Wilayas Management
// -------------------------------------------------------------

const WILAYAS_STORAGE_KEY = "miee_custom_wilayas";

function getLocalWilayas(): Wilaya[] {
  try {
    const raw = localStorage.getItem(WILAYAS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : WILAYAS;
  } catch {
    return WILAYAS;
  }
}

function saveLocalWilayas(list: Wilaya[]) {
  try {
    localStorage.setItem(WILAYAS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("miee_wilayas_updated"));
  } catch (e) {
    console.warn("Error saving local wilayas:", e);
  }
}

export function subscribeToWilayas(callback: (wilayas: Wilaya[]) => void) {
  const emit = () => callback(getLocalWilayas());
  emit();

  const handleUpdate = () => emit();
  window.addEventListener("miee_wilayas_updated", handleUpdate);
  window.addEventListener("storage", handleUpdate);

  let unsub = () => {};
  try {
    const docRef = doc(db, "settings", "wilayas");
    unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data()?.list)) {
        saveLocalWilayas(docSnap.data()?.list);
        callback(docSnap.data()?.list);
      }
    });
  } catch {
    // Fallback
  }

  return () => {
    window.removeEventListener("miee_wilayas_updated", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    unsub();
  };
}

let wilayasCloudSaveTimer: any = null;

export async function saveWilayasToFirebase(wilayasList: Wilaya[]) {
  // 1. Instant local persistence & immediate reactive event to all views
  saveLocalWilayas(wilayasList);

  // 2. Debounced save to Firestore Cloud Database
  if (wilayasCloudSaveTimer) {
    clearTimeout(wilayasCloudSaveTimer);
  }

  wilayasCloudSaveTimer = setTimeout(async () => {
    try {
      await setDoc(doc(db, "settings", "wilayas"), {
        list: wilayasList,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Firestore wilayas save note:", e);
    }
  }, 350);
}

// -------------------------------------------------------------
// Newsletter Subscriber
// -------------------------------------------------------------

export async function saveSubscriberToFirebase(email: string) {
  try {
    await addDoc(collection(db, "subscribers"), {
      email,
      subscribedAt: serverTimestamp(),
      date: new Date().toISOString()
    });
  } catch (error) {
    console.warn("[Firebase] Subscriber save note:", error);
  }
}
