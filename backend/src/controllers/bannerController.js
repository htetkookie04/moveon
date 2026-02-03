/**
 * Banner controller - active banner (public) + admin upload/delete
 */
import { param, validationResult } from 'express-validator';
import { prisma } from '../prisma/client.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

    const imageUrl = '/uploads/' + req.file.filename;

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
    if (req.file?.path && fs.existsSync(req.file.path)) {
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

    const filePath = path.join(__dirname, '../../uploads', path.basename(banner.imageUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Banner removed' });
  } catch (err) {
    next(err);
  }
}
