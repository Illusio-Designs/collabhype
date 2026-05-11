import { Router } from 'express';
import * as controller from './tracking.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Public ingest — anyone (with cookies-accepted on the client) can POST events.
// The userId is read from the auth header if present; never trusted from the body.
export const publicRouter = Router();
publicRouter.post('/', asyncHandler(controller.ingest));

// Admin query endpoints — paginated events feed + summary stats
export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/events', asyncHandler(controller.browse));
adminRouter.get('/summary', asyncHandler(controller.summary));
