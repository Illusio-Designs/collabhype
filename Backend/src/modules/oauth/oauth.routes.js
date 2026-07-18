import { Router } from 'express';
import * as controller from './oauth.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Start: authenticated influencer requests an authorize URL
router.get(
  '/instagram/start',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.startInstagram),
);
router.get(
  '/youtube/start',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.startYoutube),
);
router.get(
  '/tiktok/start',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.startTiktok),
);
router.get(
  '/facebook/start',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.startFacebook),
);

// Instagram account picker (creator has 2+ linked accounts). Authenticated —
// called by the app after the Facebook callback redirects with ?select=…
router.get(
  '/facebook/candidates',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.facebookCandidates),
);
router.post(
  '/facebook/select',
  requireAuth,
  requireRole('INFLUENCER'),
  asyncHandler(controller.facebookSelect),
);

// Callback: hit by Meta/Google/TikTok — auth is carried in the signed `state` JWT
router.get('/instagram/callback', asyncHandler(controller.callbackInstagram));
router.get('/youtube/callback', asyncHandler(controller.callbackYoutube));
router.get('/tiktok/callback', asyncHandler(controller.callbackTiktok));
router.get('/facebook/callback', asyncHandler(controller.callbackFacebook));

export default router;
