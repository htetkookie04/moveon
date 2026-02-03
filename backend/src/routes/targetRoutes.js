/**
 * Target routes - CRUD for targets
 */
import { Router } from 'express';
import {
  createTarget,
  createTargetValidation,
  getTargets,
  deleteTarget,
  deleteTargetValidation,
} from '../controllers/targetController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createTargetValidation, createTarget);
router.get('/', getTargets);
router.delete('/:id', deleteTargetValidation, deleteTarget);

export default router;
