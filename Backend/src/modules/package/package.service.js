import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const SORT = {
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  newest: { createdAt: 'desc' },
  reach_desc: { estReach: 'desc' },
};

export async function browse(params) {
  const { tier, nicheSlug, minPrice, maxPrice, q, sort, page, limit } = params;

  const where = { isActive: true };
  if (tier) where.tier = tier;
  if (nicheSlug) where.niche = { slug: nicheSlug };
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price.gte = minPrice;
    if (maxPrice != null) where.price.lte = maxPrice;
  }
  if (q) where.title = { contains: q };

  const [total, items] = await prisma.$transaction([
    prisma.package.count({ where }),
    prisma.package.findMany({
      where,
      include: {
        niche: true,
        _count: { select: { influencers: true } },
      },
      orderBy: SORT[sort] ?? SORT.newest,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total };
}

export async function getBySlug(slug) {
  const pkg = await prisma.package.findUnique({
    where: { slug },
    include: {
      niche: true,
      influencers: {
        include: {
          influencer: {
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
            },
          },
        },
      },
    },
  });
  if (!pkg || !pkg.isActive) throw ApiError.notFound('Package not found');
  return pkg;
}
