import dotenv from 'dotenv';
dotenv.config();

/**
 * Move on Calendar - Express backend
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import targetRoutes from './routes/targetRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Rate limit login/register (relaxed in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
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
app.use('/', noticeRoutes);
app.use('/', calendarRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Move on Calendar API running on port ${PORT}`);
});
