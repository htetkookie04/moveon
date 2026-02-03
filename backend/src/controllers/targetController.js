/**
 * Target controller - CRUD for targets (people user is tracking no-contact with)
 */
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../prisma/client.js';

export const createTargetValidation = [
  body('displayName').trim().notEmpty().withMessage('Display name is required').isLength({ max: 100 }),
];

export async function createTarget(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { displayName } = req.body;
    const target = await prisma.target.create({
      data: { userId: req.user.id, displayName },
    });
    res.status(201).json(target);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Target with this name already exists' });
    }
    next(err);
  }
}

export async function getTargets(req, res, next) {
  try {
    const targets = await prisma.target.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(targets);
  } catch (err) {
    next(err);
  }
}

export const deleteTargetValidation = [param('id').isUUID()];

export async function deleteTarget(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid target ID' });
    }

    const { id } = req.params;
    const target = await prisma.target.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    await prisma.target.delete({ where: { id } });
    res.json({ message: 'Target deleted' });
  } catch (err) {
    next(err);
  }
}
