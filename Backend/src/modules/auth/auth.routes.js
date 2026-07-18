import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './auth.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// Tight limiter on credential endpoints to blunt brute-force / enumeration.
// 10 attempts per 15 min per IP; successful requests don't count toward it.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'TooManyRequests', message: 'Too many attempts. Try again later.' },
});

router.post('/register', authLimiter, asyncHandler(controller.register));
router.post('/login', authLimiter, asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

router.post('/change-password', requireAuth, asyncHandler(controller.changePassword));
router.delete('/me', requireAuth, asyncHandler(controller.deleteMe));

router.post('/forgot-password', authLimiter, asyncHandler(controller.forgotPassword));
router.post('/reset-password', authLimiter, asyncHandler(controller.resetPassword));

export default router;
