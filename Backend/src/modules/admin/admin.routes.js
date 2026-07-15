import { Router } from 'express';
import * as ctrl from './admin.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Every route in this module is admin-only.
router.use(requireAuth, requireRole('ADMIN'));

// Aggregate KPIs — one call powers the KPI strips across all admin pages.
router.get('/stats', asyncHandler(ctrl.stats));

// Orders (platform-wide)
router.get('/orders', asyncHandler(ctrl.listOrders));
router.patch('/orders/:id', asyncHandler(ctrl.updateOrder));

// Users
router.get('/users', asyncHandler(ctrl.listUsers));
router.patch('/users/:id', asyncHandler(ctrl.updateUser));
router.delete('/users/:id', asyncHandler(ctrl.deleteUser));

// Payouts (platform-wide)
router.get('/payouts', asyncHandler(ctrl.listPayouts));
router.patch('/payouts/:id', asyncHandler(ctrl.updatePayout));

// Packages (full CRUD)
router.get('/packages', asyncHandler(ctrl.listPackages));
router.post('/packages', asyncHandler(ctrl.createPackage));
router.patch('/packages/:id', asyncHandler(ctrl.updatePackage));
router.delete('/packages/:id', asyncHandler(ctrl.deletePackage));

export default router;
