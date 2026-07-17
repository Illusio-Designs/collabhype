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

// Callback: hit by Meta/Google/TikTok — auth is carried in the signed `state` JWT
router.get('/instagram/callback', asyncHandler(controller.callbackInstagram));
router.get('/youtube/callback', asyncHandler(controller.callbackYoutube));
router.get('/tiktok/callback', asyncHandler(controller.callbackTiktok));

export default router;
