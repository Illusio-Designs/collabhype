import { Router } from 'express';
import * as controller from './campaign.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// Influencer transitions
router.post(
  '/:delivId/draft',
  requireRole('INFLUENCER'),
  asyncHandler(controller.submitDraft),
);
router.post(
  '/:delivId/posted',
  requireRole('INFLUENCER'),
  asyncHandler(controller.markPosted),
);

// Brand transitions
router.post(
  '/:delivId/approve',
  requireRole('BRAND'),
  asyncHandler(controller.approveDraft),
);
router.post(
  '/:delivId/revise',
  requireRole('BRAND'),
  asyncHandler(controller.requestRevision),
);
router.post(
  '/:delivId/release-payment',
  requireRole('BRAND'),
  asyncHandler(controller.releasePayment),
);

export default router;
