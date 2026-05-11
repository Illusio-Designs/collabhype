import { Router } from 'express';
import * as controller from './auth.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

router.post('/change-password', requireAuth, asyncHandler(controller.changePassword));
router.delete('/me', requireAuth, asyncHandler(controller.deleteMe));

router.post('/forgot-password', asyncHandler(controller.forgotPassword));
router.post('/reset-password', asyncHandler(controller.resetPassword));

export default router;
