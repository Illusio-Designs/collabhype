import { Router } from 'express';
import * as controller from './tracking.controller.js';
import { requireAuth, requireRole, optionalAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Public ingest — anyone (with cookies-accepted on the client) can POST events.
// optionalAuth attaches req.user when a valid token is present so logged-in
// events are attributed; anonymous events still go through. Never trusts a
// client-provided id.
export const publicRouter = Router();
publicRouter.post('/', optionalAuth, asyncHandler(controller.ingest));

// Admin query endpoints — paginated events feed + summary stats
export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/events', asyncHandler(controller.browse));
adminRouter.get('/summary', asyncHandler(controller.summary));
