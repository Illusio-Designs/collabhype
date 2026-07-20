import { Router } from 'express';
import * as controller from './campaign.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// Open Nano package tasks a creator can accept (must precede '/:id').
router.get('/tasks', requireRole('INFLUENCER'), asyncHandler(controller.listOpenTasks));

// Role-aware: brand sees own, influencer sees campaigns they're assigned to
router.get('/', asyncHandler(controller.listMine));
router.get('/:id', asyncHandler(controller.getOne));

// Brand-only — edit brief
router.patch('/:id', requireRole('BRAND'), asyncHandler(controller.updateBrief));
router.post('/:id/send-brief', requireRole('BRAND'), asyncHandler(controller.sendBrief));

// Creator accepts a Nano package task.
router.post('/:id/claim', requireRole('INFLUENCER'), asyncHandler(controller.claimTask));

export default router;
