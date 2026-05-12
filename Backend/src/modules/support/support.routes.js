import { Router } from 'express';
import * as ctrl from './support.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// ----- user-facing (any logged-in role) -----
router.post('/tickets', asyncHandler(ctrl.create));
router.get('/tickets', asyncHandler(ctrl.list));
router.get('/tickets/:id', asyncHandler(ctrl.getOne));
router.post('/tickets/:id/messages', asyncHandler(ctrl.postMessage));

// ----- admin -----
router.get('/admin/tickets', requireRole('ADMIN'), asyncHandler(ctrl.adminList));
router.patch('/admin/tickets/:id', requireRole('ADMIN'), asyncHandler(ctrl.adminUpdate));
router.get('/admin/stats', requireRole('ADMIN'), asyncHandler(ctrl.adminStats));

export default router;
