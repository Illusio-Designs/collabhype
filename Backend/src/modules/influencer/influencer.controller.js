import {
  updateProfileSchema,
  setNichesSchema,
  setRateCardsSchema,
  browseInfluencersQuery,
} from './influencer.schema.js';
import * as service from './influencer.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { prisma } from '../../lib/prisma.js';

const SUPPORTED_PLATFORMS = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'X', 'FACEBOOK'];

export async function getMe(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await service.getMyProfile(req.user.sub);
  res.json({ profile });
}

export async function updateMe(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = updateProfileSchema.parse({ body: req.body });
  const profile = await service.updateMyProfile(req.user.sub, body);
  res.json({ profile });
}

export async function setNiches(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = setNichesSchema.parse({ body: req.body });
  const niches = await service.setMyNiches(req.user.sub, body.nicheSlugs);
  res.json({ niches });
}

export async function setRateCards(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = setRateCardsSchema.parse({ body: req.body });
  const rateCards = await service.setMyRateCards(req.user.sub, body.rates);
  res.json({ rateCards });
}

export async function listMySocials(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: req.user.sub },
    include: {
      socialAccounts: {
        select: {
          id: true,
          platform: true,
          handle: true,
          profileUrl: true,
          followers: true,
          following: true,
          posts: true,
          avgLikes: true,
          avgComments: true,
          engagementRate: true,
          lastSyncedAt: true,
          isVerified: true,
        },
      },
    },
  });
  if (!profile) throw ApiError.notFound('Profile not found');
  res.json({ socials: profile.socialAccounts });
}

export async function disconnectSocial(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const platform = String(req.params.platform || '').toUpperCase();
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    throw ApiError.badRequest('Unsupported platform');
  }
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: req.user.sub },
  });
  if (!profile) throw ApiError.notFound('Profile not found');

  await prisma.socialAccount.deleteMany({
    where: { influencerId: profile.id, platform },
  });
  await service.recomputeTier(profile.id);
  res.json({ status: 'disconnected', platform });
}

export async function getPublic(req, res) {
  const profile = await service.getPublicInfluencer(req.params.id);
  res.json({ profile });
}

export async function listMyPayouts(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: req.user.sub },
  });
  if (!profile) throw ApiError.notFound('Profile not found');
  const payouts = await prisma.payout.findMany({
    where: { influencerId: profile.id },
    orderBy: { createdAt: 'desc' },
  });
  const sum = (rows) => rows.reduce((s, p) => s + Number(p.amount), 0);
  const summary = {
    total: sum(payouts),
    pending: sum(payouts.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')),
    paid: sum(payouts.filter((p) => p.status === 'PAID')),
    failed: sum(payouts.filter((p) => p.status === 'FAILED')),
    currency: 'INR',
  };
  res.json({ payouts, summary });
}

export async function browse(req, res) {
  const q = browseInfluencersQuery.parse(req.query);
  const { items, total } = await service.browseInfluencers(q);
  res.json({
    influencers: items,
    meta: {
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit) || 1,
    },
  });
}
