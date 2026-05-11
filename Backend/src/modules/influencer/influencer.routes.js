import { Router } from 'express';
import * as controller from './influencer.controller.js';
import * as badgeService from './badge.service.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();

// Public browse — list influencers with filters
router.get('/', asyncHandler(controller.browse));

// Admin: badge management
router.post(
  '/admin/badges/recompute',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    const result = await badgeService.recomputeAllBadges();
    res.json(result);
  }),
);
router.post(
  '/admin/badges/:influencerId',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { badge } = req.body ?? {};
    const allowed = ['NONE', 'RISING_TALENT', 'TOP_RATED', 'TOP_RATED_PLUS', 'EXPERT_VETTED'];
    if (!allowed.includes(badge)) {
      throw ApiError.badRequest(`badge must be one of: ${allowed.join(', ')}`);
    }
    const updated = await badgeService.setBadgeManual(req.params.influencerId, badge);
    res.json({ profile: updated });
  }),
);

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
