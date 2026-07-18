import { Router } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as controller from './upload.controller.js';

const router = Router();

// This router is mounted before the global /api limiter, so give uploads their
// own cap: 30 images per 5 min per IP.
const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Too many uploads. Try again later.' },
});

// Base64 images are larger than the global 1 MB JSON cap, so this router parses
// its own body with a higher limit. It is mounted before the global parser in
// app.js so that limit actually applies.
router.post(
  '/image',
  uploadLimiter,
  express.json({ limit: '8mb' }),
  requireAuth,
  asyncHandler(controller.uploadImage),
);

export default router;
