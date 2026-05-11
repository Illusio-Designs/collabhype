import { Router } from 'express';
import * as controller from './order.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth, requireRole('BRAND'));

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));

export default router;
