import { Router } from 'express';
import * as ctrl from './admin.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Every route in this module is admin-only.
router.use(requireAuth, requireRole('ADMIN'));

// Aggregate KPIs — one call powers the KPI strips across all admin pages.
router.get('/stats', asyncHandler(ctrl.stats));

// Orders (platform-wide, read-only)
router.get('/orders', asyncHandler(ctrl.listOrders));

// Users
router.get('/users', asyncHandler(ctrl.listUsers));
router.patch('/users/:id', asyncHandler(ctrl.updateUser));

// Packages (full CRUD)
router.get('/packages', asyncHandler(ctrl.listPackages));
router.post('/packages', asyncHandler(ctrl.createPackage));
router.patch('/packages/:id', asyncHandler(ctrl.updatePackage));
router.delete('/packages/:id', asyncHandler(ctrl.deletePackage));

export default router;
