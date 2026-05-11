import { Router } from 'express';
import * as controller from './checkout.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Brand-only — initiate + verify payment
router.post(
  '/create-order',
  requireAuth,
  requireRole('BRAND'),
  asyncHandler(controller.createOrder),
);
router.post('/verify', requireAuth, requireRole('BRAND'), asyncHandler(controller.verify));

// Public — Razorpay → us. Auth is the HMAC signature on the raw body.
router.post('/webhook', asyncHandler(controller.webhook));

export default router;
