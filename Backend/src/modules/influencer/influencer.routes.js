import { Router } from 'express';
import * as controller from './influencer.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Public browse — list influencers with filters
router.get('/', asyncHandler(controller.browse));

// Self-management (INFLUENCER only)
router.get('/me', requireAuth, requireRole('INFLUENCER'), asyncHandler(controller.getMe));
router.patch('/me', requireAuth, requireRole('INFLUENCER'), asyncHandler(controller.updateMe));
router.put(
  '/me/niches',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.setNiches),
);
router.put(
  '/me/rate-cards',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.setRateCards),
);
router.get(
  '/me/socials',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.listMySocials),
);
router.delete(
  '/me/socials/:platform',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.disconnectSocial),
);
router.get(
  '/me/payouts',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.listMyPayouts),
);

// Public profile view
router.get('/:id', asyncHandler(controller.getPublic));

export default router;
