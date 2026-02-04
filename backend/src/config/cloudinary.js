/**
 * Cloudinary configuration for image uploads
 * Uses CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET from env
 */
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = !!(cloudName && apiKey && apiSecret);

if (!isConfigured) {
  console.warn(
    '[Cloudinary] Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET. ' +
    'Banner uploads will use local disk (files are lost on redeploy). Add env vars on Render for production.'
  );
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, and WebP images are allowed'), false);
  }
};

// Disk storage fallback when Cloudinary not configured (local dev without .env)
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `banner-${Date.now()}${ext}`);
  },
});

const uploadBanner = isConfigured
  ? multer({
      storage: new CloudinaryStorage({
        cloudinary,
        params: {
          folder: 'moveon/banners',
          allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
          public_id: (req, file) => `banner-${Date.now()}`,
        },
      }),
      fileFilter,
      limits: { fileSize: MAX_SIZE },
    })
  : multer({
      storage: diskStorage,
      fileFilter,
      limits: { fileSize: MAX_SIZE },
    });

export { cloudinary, uploadBanner, isConfigured };
