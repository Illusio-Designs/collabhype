import { Router } from 'express';
import * as controller from './content.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Public routes — anyone can read published content
export const publicRouter = Router();
publicRouter.get('/:slug', asyncHandler(controller.publicGet));

// Admin routes — full CRUD
export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/', asyncHandler(controller.adminList));
adminRouter.post('/', asyncHandler(controller.adminUpsert));
adminRouter.get('/:slug', asyncHandler(controller.adminGet));
adminRouter.patch('/:slug', asyncHandler(controller.adminUpdate));
adminRouter.delete('/:slug', asyncHandler(controller.adminDelete));
