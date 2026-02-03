/**
 * Calendar routes - entries and stats
 */
import { Router } from 'express';
import {
  getEntries,
  getEntriesValidation,
  getEntriesHistory,
  getEntriesHistoryValidation,
  createEntry,
  createEntryValidation,
  deleteEntry,
  deleteEntryValidation,
} from '../controllers/calendarController.js';
import { getStats, getStatsValidation } from '../controllers/statsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/entries', getEntriesValidation, getEntries);
router.get('/entries/history', getEntriesHistoryValidation, getEntriesHistory);
router.post('/entries', createEntryValidation, createEntry);
router.delete('/entries/:id', deleteEntryValidation, deleteEntry);

router.get('/stats', getStatsValidation, getStats);

export default router;
