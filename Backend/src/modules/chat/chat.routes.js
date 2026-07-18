import { Router } from 'express';
import * as controller from './chat.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// Consent to the no-contact-sharing chat rules.
router.get('/consent', asyncHandler(controller.getConsent));
router.post('/consent', asyncHandler(controller.acceptConsent));

// Conversations
router.get('/conversations', asyncHandler(controller.listConversations));
router.post('/conversations', asyncHandler(controller.startConversation));
router.get('/conversations/:id/messages', asyncHandler(controller.getMessages));
router.post('/conversations/:id/messages', asyncHandler(controller.sendMessage));

// Rate offers
router.post('/conversations/:id/offers', asyncHandler(controller.sendOffer));
router.post('/conversations/:id/offers/:messageId/accept', asyncHandler(controller.acceptOffer));
router.post('/conversations/:id/offers/:messageId/decline', asyncHandler(controller.declineOffer));

export default router;
