/**
 * Banner controller - active banner (public) + admin upload/delete
 * Uses Cloudinary for storage when configured; falls back to local uploads
 */
import { param, validationResult } from 'express-validator';
import { prisma } from '../prisma/client.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isConfigured } from '../config/cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Extract Cloudinary public_id from URL for destroy() */
function getPublicIdFromCloudinaryUrl(url) {
  const match = url.match(/\/upload\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : null;
}

export async function getActiveBanner(req, res, next) {
  try {
    const banner = await prisma.banner.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!banner) {
      return res.json(null);
    }
    res.json({
      id: banner.id,
      imageUrl: banner.imageUrl,
      createdAt: banner.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadBanner(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Cloudinary: req.file.path is the full URL; disk: use /uploads/filename
    const imageUrl = isConfigured ? req.file.path : '/uploads/' + req.file.filename;

    await prisma.$transaction(async (tx) => {
      await tx.banner.updateMany({ data: { isActive: false } });
      await tx.banner.create({
        data: { imageUrl, isActive: true },
      });
    });

    const banner = await prisma.banner.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(201).json({
      id: banner.id,
      imageUrl: banner.imageUrl,
      createdAt: banner.createdAt.toISOString(),
    });
  } catch (err) {
    // Rollback: delete local file only (Cloudinary has no local path)
    if (!isConfigured && req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
}

export const deleteBannerValidation = [param('id').isUUID()];

export async function deleteBanner(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const { id } = req.params;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    await prisma.banner.update({ where: { id }, data: { isActive: false } });

    // Delete from Cloudinary if URL is from Cloudinary; else delete local file
    if (isConfigured && banner.imageUrl?.includes('res.cloudinary.com')) {
      const publicId = getPublicIdFromCloudinaryUrl(banner.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
    } else {
      const filePath = path.join(__dirname, '../../uploads', path.basename(banner.imageUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Banner removed' });
  } catch (err) {
    next(err);
  }
}
