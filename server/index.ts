import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers: Protected against clickjacking, sniff attacks & XSS
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to prevent interfering with local dev / external CDN assets
    crossOriginEmbedderPolicy: false
  })
);

// Rate Limiter: Protect checkout endpoint against bot abuse and denial of service
const orderSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 order requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات، يرجى الانتظار قليلاً ثم المحاولة مجدداً.'
  }
});
app.use('/api/orders', orderSubmissionLimiter);

// General API rate limiter
const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 180, // 180 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', generalApiLimiter);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// API Routes
app.use('/api', apiRouter);

// Serve static assets in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing in production
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In dev mode when dist/ doesn't exist yet, return API welcome message
      res.status(200).json({ message: 'Miee Express API Server running securely on port ' + PORT });
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Express Server] Running securely at http://localhost:${PORT}`);
  console.log(`[Express Server] API routes available at http://localhost:${PORT}/api/`);
});
