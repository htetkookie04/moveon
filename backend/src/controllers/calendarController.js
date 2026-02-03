/**
 * Calendar controller - entries CRUD and stats
 */
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../prisma/client.js';

export const getEntriesValidation = [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('targetId').optional().isUUID(),
];

export const getEntriesHistoryValidation = [
  query('targetId').isUUID().withMessage('Target ID required'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().trim().isLength({ max: 200 }),
  query('status').optional().isIn(['', 'NO_CONTACT', 'CONTACT', 'RESET', 'EMPTY']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
];

export async function getEntries(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query params' });
    }

    const { from, to, targetId } = req.query;
    const userId = req.user.id;

    const where = { userId };
    if (targetId) {
      const target = await prisma.target.findFirst({
        where: { id: targetId, userId },
      });
      if (!target) {
        return res.status(404).json({ error: 'Target not found' });
      }
      where.targetId = targetId;
    }
    if (from || to) {
      where.entryDate = {};
      if (from) where.entryDate.gte = new Date(from);
      if (to) where.entryDate.lte = new Date(to);
    }

    const entries = await prisma.calendarEntry.findMany({
      where,
      include: { target: { select: { id: true, displayName: true } } },
      orderBy: { entryDate: 'asc' },
    });

    res.json(entries);
  } catch (err) {
    next(err);
  }
}

export async function getEntriesHistory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query params', details: errors.array() });
    }

    const { targetId, page = 1, limit = 10, q, status, from, to } = req.query;
    const userId = req.user.id;

    const target = await prisma.target.findFirst({
      where: { id: targetId, userId },
    });
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    const where = {
      userId,
      targetId,
      AND: [
        { note: { not: null } },
        { note: { not: '' } },
      ],
    };

    if (q && q.trim()) {
      const search = q.trim().toLowerCase();
      where.OR = [
        { note: { contains: search, mode: 'insensitive' } },
        { emotionText: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== '' && status !== 'EMPTY') {
      where.status = status;
    } else if (status === 'EMPTY') {
      where.status = null;
    }

    if (from || to) {
      where.entryDate = {};
      if (from) where.entryDate.gte = new Date(from + 'T00:00:00.000Z');
      if (to) where.entryDate.lte = new Date(to + 'T23:59:59.999Z');
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [items, total] = await Promise.all([
      prisma.calendarEntry.findMany({
        where,
        orderBy: { entryDate: 'desc' },
        skip,
        take,
      }),
      prisma.calendarEntry.count({ where }),
    ]);

    const formatted = items.map((e) => ({
      id: e.id,
      entryDate: e.entryDate.toISOString().slice(0, 10),
      status: e.status,
      note: e.note,
      emotionText: e.emotionText,
      emotionEmoji: e.emotionEmoji,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    res.json({
      items: formatted,
      page: Number(page),
      limit: take,
      total,
    });
  } catch (err) {
    next(err);
  }
}

export const createEntryValidation = [
  body('targetId').isUUID().withMessage('Target ID required'),
  body('entryDate').isISO8601().withMessage('Valid date required'),
  body('status')
    .optional({ nullable: true })
    .isIn(['NO_CONTACT', 'CONTACT', 'RESET'])
    .withMessage('Status must be NO_CONTACT, CONTACT, or RESET'),
  body('note').optional().trim().isLength({ max: 2000 }),
  body('emotionText').optional().trim().isLength({ max: 200 }),
  body('emotionEmoji').optional().trim().isLength({ max: 10 }),
];

export async function createEntry(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { targetId, entryDate, status, note, emotionText, emotionEmoji } = req.body;
    const userId = req.user.id;

    const target = await prisma.target.findFirst({
      where: { id: targetId, userId },
    });
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    // Parse YYYY-MM-DD at noon UTC to avoid timezone shift (e.g. "2026-01-31" -> Jan 31)
    const date = new Date(entryDate + 'T12:00:00.000Z');

    const statusVal = status ?? null;
    const noteVal = note?.trim() || null;
    const emotionTextVal = emotionText?.trim() || null;
    const emotionEmojiVal = emotionEmoji || null;

    // Optional cleanup: if status is null and all other fields empty, treat as "no entry" → delete
    const isEmptyEntry = statusVal == null && !noteVal && !emotionTextVal && !emotionEmojiVal;
    if (isEmptyEntry) {
      const existing = await prisma.calendarEntry.findUnique({
        where: { userId_targetId_entryDate: { userId, targetId, entryDate: date } },
      });
      if (existing) {
        await prisma.calendarEntry.delete({ where: { id: existing.id } });
      }
      return res.status(200).json({ deleted: true });
    }

    const entry = await prisma.calendarEntry.upsert({
      where: {
        userId_targetId_entryDate: { userId, targetId, entryDate: date },
      },
      create: {
        user: { connect: { id: userId } },
        target: { connect: { id: targetId } },
        entryDate: date,
        status: statusVal,
        note: noteVal,
        emotionText: emotionTextVal,
        emotionEmoji: emotionEmojiVal,
      },
      update: {
        status: statusVal,
        note: noteVal,
        emotionText: emotionTextVal,
        emotionEmoji: emotionEmojiVal,
      },
      include: { target: { select: { id: true, displayName: true } } },
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export const deleteEntryValidation = [param('id').isUUID()];

export async function deleteEntry(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    const { id } = req.params;
    const entry = await prisma.calendarEntry.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await prisma.calendarEntry.delete({ where: { id } });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
}
