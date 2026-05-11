import { Router } from 'express';
import * as controller from './cart.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Cart is brand-only
router.use(requireAuth, requireRole('BRAND'));

router.get('/', asyncHandler(controller.getCart));
router.post('/items', asyncHandler(controller.addItem));
router.patch('/items/:itemId', asyncHandler(controller.updateItem));
router.delete('/items/:itemId', asyncHandler(controller.removeItem));
router.delete('/', asyncHandler(controller.clear));

export default router;
