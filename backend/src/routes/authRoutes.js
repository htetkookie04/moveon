/**
 * Auth routes - register, login, logout, me
 */
import { Router } from 'express';
import {
  register,
  registerValidation,
  login,
  loginValidation,
  logout,
  me,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

export default router;
