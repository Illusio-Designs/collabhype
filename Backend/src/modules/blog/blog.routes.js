import { Router } from 'express';
import * as controller from './blog.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Public — anyone can read published posts.
export const publicRouter = Router();
publicRouter.get('/', asyncHandler(controller.publicList));
publicRouter.get('/:slug', asyncHandler(controller.publicGet));

// Admin — full CRUD.
export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/', asyncHandler(controller.adminList));
adminRouter.post('/', asyncHandler(controller.adminCreate));
adminRouter.get('/:id', asyncHandler(controller.adminGet));
adminRouter.patch('/:id', asyncHandler(controller.adminUpdate));
adminRouter.delete('/:id', asyncHandler(controller.adminDelete));

export default publicRouter;
