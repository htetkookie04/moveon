/**
 * Notice routes - user endpoints (auth required)
 */
import { Router } from 'express';
import {
  getNotices,
  getNoticesValidation,
  markNoticeRead,
  markReadValidation,
  markAllRead,
  getUnreadCount,
} from '../controllers/noticeController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/notices', getNoticesValidation, getNotices);
router.get('/notices/unread-count', getUnreadCount);
router.post('/notices/read-all', markAllRead);
router.post('/notices/:id/read', markReadValidation, markNoticeRead);

export default router;
