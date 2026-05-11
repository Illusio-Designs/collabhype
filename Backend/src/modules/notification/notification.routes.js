import { Router } from 'express';
import * as controller from './notification.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(controller.list));
router.post('/:id/read', asyncHandler(controller.markRead));
router.post('/read-all', asyncHandler(controller.markAllRead));

export default router;
