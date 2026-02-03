/**
 * Admin routes - user management + banner + notices (admin only)
 */
import { Router } from 'express';
import {
  createUser,
  createUserValidation,
  getUsers,
  toggleUserActive,
  toggleActiveValidation,
} from '../controllers/adminController.js';
import {
  uploadBanner as uploadBannerHandler,
  deleteBanner,
  deleteBannerValidation,
} from '../controllers/bannerController.js';
import {
  createNotice,
  createNoticeValidation,
  getAdminNotices,
  deleteNotice,
  deleteNoticeValidation,
} from '../controllers/noticeController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { uploadBanner } from '../middleware/upload.js';

const router = Router();

router.use(authMiddleware, adminOnly);

router.post('/users', createUserValidation, createUser);
router.get('/users', getUsers);
router.patch('/users/:id/active', toggleActiveValidation, toggleUserActive);

router.post('/banner', uploadBanner.single('image'), uploadBannerHandler);
router.delete('/banner/:id', deleteBannerValidation, deleteBanner);

router.post('/notices', createNoticeValidation, createNotice);
router.get('/notices', getAdminNotices);
router.delete('/notices/:id', deleteNoticeValidation, deleteNotice);

export default router;
