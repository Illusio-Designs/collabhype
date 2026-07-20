import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { scanForContact } from '../../utils/contactGuard.js';
import { addNegotiatedItem } from '../cart/cart.service.js';
import { DELIVERABLE_TYPES } from '../cart/cart.schema.js';

const VALID_DELIVERABLES = new Set(DELIVERABLE_TYPES);

// Sharing contact details this many times auto-suspends the account.
const STRIKE_LIMIT = 3;

// Only Micro/Macro/Mega creators negotiate 1:1 — Nano is package-only.
const CHATTABLE_TIERS = ['MICRO', 'MACRO', 'MEGA'];

// ---- Consent ----

export async function getConsent(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { chatConsentAt: true, chatStrikes: true },
  });
  return { consented: !!user?.chatConsentAt, chatStrikes: user?.chatStrikes ?? 0 };
}

export async function acceptConsent(userId) {
  await prisma.user.update({ where: { id: userId }, data: { chatConsentAt: new Date() } });
  return { ok: true };
}

async function requireConsent(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { chatConsentAt: true, isActive: true },
  });
  if (!user?.isActive) throw ApiError.forbidden('Account is not active');
  if (!user?.chatConsentAt) {
    throw ApiError.forbidden('Please accept the chat rules before messaging');
  }
}

// ---- Conversations ----

// Which conversations belong to this user (brand or creator side).
function scopeForUser(user) {
  return user.role === 'BRAND'
    ? { brandUserId: user.sub }
    : { creatorUserId: user.sub };
}

const CONVO_INCLUDE = {
  influencer: {
    select: {
      id: true,
      tier: true,
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  },
  brand: {
    select: { id: true, fullName: true, avatarUrl: true, brandProfile: { select: { companyName: true, logoUrl: true } } },
  },
};

export async function listConversations(user) {
  const convos = await prisma.conversation.findMany({
    where: scopeForUser(user),
    include: CONVO_INCLUDE,
    orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
  });
  return convos;
}

// Brand starts (or reopens) a conversation with a creator.
export async function startConversation(user, influencerId) {
  if (user.role !== 'BRAND') throw ApiError.forbidden('Only brands can start a chat');
  await requireConsent(user.sub);

  const influencer = await prisma.influencerProfile.findUnique({
    where: { id: influencerId },
    select: { id: true, tier: true, userId: true, user: { select: { isActive: true } } },
  });
  if (!influencer || !influencer.user?.isActive) throw ApiError.notFound('Creator not found');
  if (!CHATTABLE_TIERS.includes(influencer.tier)) {
    throw ApiError.badRequest('This creator is not available for direct negotiation');
  }

  const existing = await prisma.conversation.findUnique({
    where: { brandUserId_influencerId: { brandUserId: user.sub, influencerId } },
  });
  if (existing) return prisma.conversation.findUnique({ where: { id: existing.id }, include: CONVO_INCLUDE });

  return prisma.conversation.create({
    data: {
      brandUserId: user.sub,
      influencerId,
      creatorUserId: influencer.userId,
    },
    include: CONVO_INCLUDE,
  });
}

async function loadConversationFor(user, conversationId) {
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) throw ApiError.notFound('Conversation not found');
  const owns =
    (user.role === 'BRAND' && convo.brandUserId === user.sub) ||
    (user.role === 'INFLUENCER' && convo.creatorUserId === user.sub);
  if (!owns) throw ApiError.forbidden('Not your conversation');
  return convo;
}

export async function getMessages(user, conversationId) {
  const convo = await loadConversationFor(user, conversationId);
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: convo.id },
    orderBy: { createdAt: 'asc' },
  });
  const full = await prisma.conversation.findUnique({
    where: { id: convo.id },
    include: CONVO_INCLUDE,
  });
  return { conversation: full, messages };
}

// Record a contact-sharing violation and suspend past the strike limit.
async function registerViolation(userId) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { chatStrikes: { increment: 1 } },
    select: { chatStrikes: true },
  });
  const remaining = Math.max(0, STRIKE_LIMIT - updated.chatStrikes);
  if (updated.chatStrikes >= STRIKE_LIMIT) {
    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }
  return { strikes: updated.chatStrikes, remaining, suspended: updated.chatStrikes >= STRIKE_LIMIT };
}

export async function sendMessage(user, conversationId, body) {
  const convo = await loadConversationFor(user, conversationId);
  await requireConsent(user.sub);
  const text = String(body ?? '').trim();
  if (!text) throw ApiError.badRequest('Message is empty');
  if (text.length > 4000) throw ApiError.badRequest('Message is too long');

  // Contact-sharing guard: block the message, strike the sender, suspend on 3.
  const scan = scanForContact(text);
  if (scan.blocked) {
    const result = await registerViolation(user.sub);
    throw new ApiError(
      403,
      result.suspended
        ? 'Your account has been suspended for repeatedly sharing contact details.'
        : `Sharing contact details isn't allowed. Warning ${result.strikes}/${STRIKE_LIMIT} — ${result.remaining} left before suspension.`,
      { code: 'ContactBlocked', reasons: scan.reasons, ...result },
    );
  }

  const message = await prisma.chatMessage.create({
    data: { conversationId: convo.id, senderUserId: user.sub, type: 'TEXT', body: text },
  });
  await prisma.conversation.update({
    where: { id: convo.id },
    data: { lastMessageAt: new Date() },
  });
  const recipientId = user.sub === convo.brandUserId ? convo.creatorUserId : convo.brandUserId;
  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: 'chat.message',
      title: 'New message',
      body: text.slice(0, 120),
      link: `/dashboard/messages?c=${convo.id}`,
    },
  });
  return message;
}

// Creator proposes a rate for a deliverable.
export async function sendOffer(user, conversationId, { deliverable, price }) {
  if (user.role !== 'INFLUENCER') throw ApiError.forbidden('Only creators can send a rate offer');
  const convo = await loadConversationFor(user, conversationId);
  await requireConsent(user.sub);
  const amount = Number(price);
  if (!(amount > 0)) throw ApiError.badRequest('Enter a valid price');
  if (!deliverable) throw ApiError.badRequest('Choose a deliverable');
  // Validate against the DeliverableType enum here — otherwise a bad value is
  // stored on the offer, accepted into the cart, and only blows up inside the
  // post-payment createMany transaction, stranding an already-paid order.
  if (!VALID_DELIVERABLES.has(deliverable)) throw ApiError.badRequest('Choose a valid deliverable');

  const message = await prisma.chatMessage.create({
    data: {
      conversationId: convo.id,
      senderUserId: user.sub,
      type: 'RATE_OFFER',
      deliverable,
      price: amount,
      offerStatus: 'PENDING',
    },
  });
  await prisma.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
  await prisma.notification.create({
    data: {
      userId: convo.brandUserId,
      type: 'chat.offer',
      title: 'New rate offer',
      body: `${deliverable} — ₹${amount}`,
      link: `/dashboard/messages?c=${convo.id}`,
    },
  });
  return message;
}

// Brand accepts an offer → the item lands in their cart at the agreed rate.
export async function acceptOffer(user, conversationId, messageId) {
  if (user.role !== 'BRAND') throw ApiError.forbidden('Only the brand can accept an offer');
  const convo = await loadConversationFor(user, conversationId);
  const offer = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!offer || offer.conversationId !== convo.id || offer.type !== 'RATE_OFFER') {
    throw ApiError.notFound('Offer not found');
  }
  if (offer.offerStatus !== 'PENDING') throw ApiError.badRequest('Offer is no longer pending');

  await addNegotiatedItem(user.sub, {
    influencerId: convo.influencerId,
    deliverable: offer.deliverable,
    price: Number(offer.price),
  });
  const updated = await prisma.chatMessage.update({
    where: { id: offer.id },
    data: { offerStatus: 'ACCEPTED' },
  });
  await prisma.chatMessage.create({
    data: {
      conversationId: convo.id,
      senderUserId: user.sub,
      type: 'SYSTEM',
      body: 'Offer accepted and added to cart.',
    },
  });
  await prisma.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
  await prisma.notification.create({
    data: {
      userId: convo.creatorUserId,
      type: 'chat.offer_accepted',
      title: 'Rate offer accepted',
      body: 'The brand accepted your rate and added it to their cart.',
      link: `/dashboard/messages?c=${convo.id}`,
    },
  });
  return updated;
}

export async function declineOffer(user, conversationId, messageId) {
  const convo = await loadConversationFor(user, conversationId);
  const offer = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!offer || offer.conversationId !== convo.id || offer.type !== 'RATE_OFFER') {
    throw ApiError.notFound('Offer not found');
  }
  if (offer.offerStatus !== 'PENDING') throw ApiError.badRequest('Offer is no longer pending');
  return prisma.chatMessage.update({ where: { id: offer.id }, data: { offerStatus: 'DECLINED' } });
}
