import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as controller from './upload.controller.js';

const router = Router();

// Base64 images are larger than the global 1 MB JSON cap, so this router parses
// its own body with a higher limit. It is mounted before the global parser in
// app.js so that limit actually applies.
router.post(
  '/image',
  express.json({ limit: '8mb' }),
  requireAuth,
  asyncHandler(controller.uploadImage),
);

export default router;
