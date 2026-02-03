/**
 * Notice controller - user notices + admin create/broadcast
 */
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../prisma/client.js';

// --- User endpoints ---

export const getNoticesValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

export async function getNotices(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query', details: errors.array() });
    }
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.userNotice.findMany({
        where: { userId },
        include: {
          notice: { select: { id: true, title: true, message: true, type: true, linkUrl: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userNotice.count({ where: { userId } }),
    ]);

    const notices = items.map((un) => ({
      id: un.notice.id,
      userNoticeId: un.id,
      title: un.notice.title,
      message: un.notice.message,
      type: un.notice.type,
      linkUrl: un.notice.linkUrl,
      isRead: un.isRead,
      readAt: un.readAt?.toISOString() ?? null,
      createdAt: un.notice.createdAt.toISOString(),
    }));

    res.json({ notices, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export const markReadValidation = [param('id').isUUID()];

export async function markNoticeRead(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid notice ID' });
    }
    const userId = req.user.id;
    const { id: noticeId } = req.params;

    const userNotice = await prisma.userNotice.findFirst({
      where: { userId, noticeId },
    });
    if (!userNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    await prisma.userNotice.update({
      where: { id: userNotice.id },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.userNotice.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.id;
    const count = await prisma.userNotice.count({
      where: { userId, isRead: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

// --- Admin endpoints ---

export const createNoticeValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 10000 }),
  body('type').optional().isIn(['INFO', 'WARNING', 'SUCCESS', 'DANGER']),
  body('linkUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid URL'),
];

export async function createNotice(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { title, message, type = 'INFO', linkUrl } = req.body;

    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const notice = await prisma.$transaction(async (tx) => {
      const n = await tx.notice.create({
        data: { title, message, type, linkUrl: linkUrl || null },
      });
      await tx.userNotice.createMany({
        data: activeUsers.map((u) => ({ userId: u.id, noticeId: n.id })),
        skipDuplicates: true,
      });
      return n;
    });

    res.status(201).json({
      id: notice.id,
      title: notice.title,
      message: notice.message,
      type: notice.type,
      linkUrl: notice.linkUrl,
      createdAt: notice.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminNotices(req, res, next) {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        linkUrl: true,
        createdAt: true,
        _count: { select: { userNotices: true } },
      },
    });

    res.json(
      notices.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        linkUrl: n.linkUrl,
        createdAt: n.createdAt.toISOString(),
        recipientCount: n._count.userNotices,
      }))
    );
  } catch (err) {
    next(err);
  }
}

export const deleteNoticeValidation = [param('id').isUUID()];

export async function deleteNotice(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid notice ID' });
    }
    const { id } = req.params;

    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    await prisma.notice.delete({ where: { id } });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    next(err);
  }
}
