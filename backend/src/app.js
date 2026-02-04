import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Load .env in development; production uses Render env vars (dotenv.config is no-op if .env missing)
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Move on Calendar - Express backend
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import targetRoutes from './routes/targetRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://moveon.onrender.com';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://kookiemoveon.netlify.app',
  'https://kookiemoveon.netlify.app/', // some clients send trailing slash
  RENDER_BACKEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in our allowed list
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      
      console.log('Blocked by CORS:', origin);  // Debug logging
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
  })
);
app.use(express.json());
app.use(cookieParser());

// Test endpoint to debug cookies
app.get('/debug-cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    authorization: req.headers.authorization,
    host: req.headers.host,
    forwardedHost: req.headers['x-forwarded-host'],
  });
});

// Rate limit login/register (relaxed in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 50,
  message: { error: 'Too many attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/targets', targetRoutes);
app.use('/banner', bannerRoutes);

// Serve uploaded banner images (disk fallback when Cloudinary not configured)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public root - avoid 401 when visiting backend URL directly
app.get('/', (req, res) => {
  res.json({
    name: 'Move on Calendar API',
    frontend: 'https://kookiemoveon.netlify.app',
    health: '/health',
  });
});

// Avoid 401 on favicon request
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/', noticeRoutes);
app.use('/', calendarRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Move on Calendar API running on port ${PORT}`);
});
