import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { computeTier } from '../../utils/tier.js';

export async function getMyProfile(userId) {
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, email: true, fullName: true, avatarUrl: true, phone: true },
      },
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
      niches: { include: { niche: true } },
      rateCards: true,
    },
  });
  if (!profile) throw ApiError.notFound('Influencer profile not found');
  return profile;
}

export async function updateMyProfile(userId, data) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Profile not found');

  return prisma.influencerProfile.update({
    where: { userId },
    data: {
      ...data,
      dob: data.dob ? new Date(data.dob) : undefined,
    },
  });
}

export async function setMyNiches(userId, nicheSlugs) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Profile not found');

  const niches = await prisma.niche.findMany({ where: { slug: { in: nicheSlugs } } });
  if (niches.length !== nicheSlugs.length) {
    const found = new Set(niches.map((n) => n.slug));
    const missing = nicheSlugs.filter((s) => !found.has(s));
    throw ApiError.badRequest('Unknown niches', { missing });
  }

  await prisma.$transaction([
    prisma.influencerNiche.deleteMany({ where: { influencerId: profile.id } }),
    prisma.influencerNiche.createMany({
      data: niches.map((n) => ({ influencerId: profile.id, nicheId: n.id })),
    }),
  ]);

  return prisma.influencerNiche.findMany({
    where: { influencerId: profile.id },
    include: { niche: true },
  });
}

export async function setMyRateCards(userId, rates) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Profile not found');

  // De-dupe by deliverable (last write wins)
  const map = new Map();
  for (const r of rates) map.set(r.deliverable, r);
  const dedup = [...map.values()];

  await prisma.$transaction([
    prisma.rateCard.deleteMany({ where: { influencerId: profile.id } }),
    prisma.rateCard.createMany({
      data: dedup.map((r) => ({
        influencerId: profile.id,
        deliverable: r.deliverable,
        price: r.price,
      })),
    }),
  ]);

  return prisma.rateCard.findMany({ where: { influencerId: profile.id } });
}

export async function getPublicInfluencer(id) {
  const profile = await prisma.influencerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
      socialAccounts: {
        select: {
          platform: true,
          handle: true,
          profileUrl: true,
          followers: true,
          engagementRate: true,
          isVerified: true,
        },
      },
      niches: { include: { niche: true } },
      rateCards: true,
    },
  });
  if (!profile) throw ApiError.notFound('Influencer not found');
  return profile;
}

const BROWSE_SORT = {
  followers_desc: { totalFollowers: 'desc' },
  engagement_desc: { avgEngagementRate: 'desc' },
  newest: { createdAt: 'desc' },
};

export async function browseInfluencers(params) {
  const {
    tier,
    nicheSlug,
    city,
    minFollowers,
    maxFollowers,
    platform,
    verified,
    q,
    sort,
    page,
    limit,
  } = params;

  const where = { isAvailable: true };
  if (tier) where.tier = tier;
  if (city) where.city = { contains: city };
  if (minFollowers != null || maxFollowers != null) {
    where.totalFollowers = {};
    if (minFollowers != null) where.totalFollowers.gte = minFollowers;
    if (maxFollowers != null) where.totalFollowers.lte = maxFollowers;
  }
  if (nicheSlug) {
    where.niches = { some: { niche: { slug: nicheSlug } } };
  }
  if (platform || verified) {
    where.socialAccounts = {
      some: {
        ...(platform && { platform }),
        ...(verified && { isVerified: true }),
      },
    };
  }
  if (q) {
    where.OR = [
      { user: { fullName: { contains: q } } },
      { socialAccounts: { some: { handle: { contains: q } } } },
    ];
  }

  const [total, items] = await prisma.$transaction([
    prisma.influencerProfile.count({ where }),
    prisma.influencerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        socialAccounts: {
          select: {
            platform: true,
            handle: true,
            profileUrl: true,
            followers: true,
            engagementRate: true,
            isVerified: true,
          },
        },
        niches: { include: { niche: true } },
        rateCards: true,
      },
      orderBy: BROWSE_SORT[sort] ?? BROWSE_SORT.followers_desc,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total };
}

// Recompute totalFollowers, tier, and avg engagement from connected socials.
// Called after any OAuth sync or disconnect.
export async function recomputeTier(influencerId) {
  const accounts = await prisma.socialAccount.findMany({ where: { influencerId } });
  const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);
  const tier = computeTier(totalFollowers);
  const avgEngagementRate = accounts.length
    ? accounts.reduce((s, a) => s + a.engagementRate, 0) / accounts.length
    : 0;
  return prisma.influencerProfile.update({
    where: { id: influencerId },
    data: { totalFollowers, tier, avgEngagementRate },
  });
}
