import { Router } from 'express';
import * as controller from './campaign.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// Role-aware: brand sees own, influencer sees campaigns they're assigned to
router.get('/', asyncHandler(controller.listMine));
router.get('/:id', asyncHandler(controller.getOne));

// Brand-only — edit brief
router.patch('/:id', requireRole('BRAND'), asyncHandler(controller.updateBrief));

export default router;
