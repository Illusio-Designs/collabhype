import { Router } from 'express';
import * as controller from './brand.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/me', requireAuth, requireRole('BRAND'), asyncHandler(controller.getMe));
router.patch('/me', requireAuth, requireRole('BRAND'), asyncHandler(controller.updateMe));

export default router;
