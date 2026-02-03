/**
 * Stats controller - Day Counter Widget data
 * Returns current streak, longest streak, total no-contact days
 */
import { query, validationResult } from 'express-validator';
import { prisma } from '../prisma/client.js';

export const getStatsValidation = [query('targetId').isUUID().withMessage('Target ID required')];

export async function getStats(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Target ID required' });
    }

    const { targetId } = req.query;
    const userId = req.user.id;

    const target = await prisma.target.findFirst({
      where: { id: targetId, userId },
    });
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    const entries = await prisma.calendarEntry.findMany({
      where: { userId, targetId },
      orderBy: { entryDate: 'asc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build date -> status map
    const byDate = new Map();
    for (const e of entries) {
      const d = new Date(e.entryDate);
      d.setHours(0, 0, 0, 0);
      byDate.set(d.getTime(), e.status);
    }

    // Find last CONTACT date
    let lastContactDate = null;
    const contactEntries = entries.filter((e) => e.status === 'CONTACT');
    if (contactEntries.length > 0) {
      lastContactDate = contactEntries
        .map((e) => new Date(e.entryDate))
        .sort((a, b) => b - a)[0];
    }

    // Compute streaks: walk backwards from today
    let currentStreakDays = 0;
    let streakStartDate = null;
    let longestStreakDays = 0;
    let totalNoContactDays = 0;

    const noContactRanges = [];
    let rangeStart = null;
    let rangeEnd = null;

    // Get all unique dates and sort
    const allDates = [...new Set(entries.map((e) => new Date(e.entryDate).setHours(0, 0, 0, 0)))].sort(
      (a, b) => a - b
    );

    for (const ts of allDates) {
      const status = byDate.get(ts);
      if (status === 'NO_CONTACT') {
        totalNoContactDays++;
        if (rangeStart === null) rangeStart = ts;
        rangeEnd = ts;
      } else {
        if (rangeStart !== null && rangeEnd !== null) {
          noContactRanges.push({ start: rangeStart, end: rangeEnd });
        }
        rangeStart = null;
        rangeEnd = null;
      }
    }
    if (rangeStart !== null && rangeEnd !== null) {
      noContactRanges.push({ start: rangeStart, end: rangeEnd });
    }

    // Longest streak
    for (const r of noContactRanges) {
      const days = Math.floor((r.end - r.start) / (24 * 60 * 60 * 1000)) + 1;
      if (days > longestStreakDays) longestStreakDays = days;
    }

    // Current streak: from today backwards
    const todayTs = today.getTime();
    if (byDate.get(todayTs) === 'NO_CONTACT') {
      let d = todayTs;
      while (byDate.get(d) === 'NO_CONTACT') {
        currentStreakDays++;
        streakStartDate = d;
        d -= 24 * 60 * 60 * 1000;
      }
    } else if (byDate.get(todayTs) === 'CONTACT' || byDate.get(todayTs) === 'RESET') {
      currentStreakDays = 0;
    }
    // If today not marked, current streak = 0 (or we could count up to yesterday)
    if (streakStartDate !== null) {
      streakStartDate = new Date(streakStartDate).toISOString().split('T')[0];
    }

    const todayMarked = byDate.has(todayTs);

    res.json({
      currentStreakDays,
      longestStreakDays,
      totalNoContactDays,
      lastContactDate: lastContactDate ? lastContactDate.toISOString().split('T')[0] : null,
      streakStartDate,
      todayMarked,
    });
  } catch (err) {
    next(err);
  }
}
