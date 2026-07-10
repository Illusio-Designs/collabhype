import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true,
};

// ---------- Orders (platform-wide) ---------------------------------------

export async function listOrders({ status, q, page, limit }) {
  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { brand: { fullName: { contains: q } } },
      { brand: { email: { contains: q } } },
    ];
  }
  const [total, items] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        brand: { select: { id: true, fullName: true, email: true } },
        _count: { select: { items: true, campaigns: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

// ---------- Users --------------------------------------------------------

export async function listUsers({ role, q, page, limit }) {
  const where = {};
  if (role) where.role = role;
  if (q) where.OR = [{ fullName: { contains: q } }, { email: { contains: q } }];
  const [total, items] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

export async function setUserActive(userId, isActive) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'ADMIN') {
    throw ApiError.badRequest('Cannot change the status of an admin account');
  }
  return prisma.user.update({ where: { id: userId }, data: { isActive }, select: userSelect });
}

// ---------- Packages (CRUD) ----------------------------------------------

export async function listPackages({ page, limit }) {
  const [total, items] = await prisma.$transaction([
    prisma.package.count(),
    prisma.package.findMany({
      include: { niche: true, _count: { select: { influencers: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

export async function createPackage(input) {
  const existing = await prisma.package.findUnique({ where: { slug: input.slug } });
  if (existing) throw ApiError.badRequest(`A package with slug "${input.slug}" already exists`);
  return prisma.package.create({ data: input, include: { niche: true } });
}

export async function updatePackage(id, patch) {
  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) throw ApiError.notFound('Package not found');
  return prisma.package.update({ where: { id }, data: patch, include: { niche: true } });
}

export async function deletePackage(id) {
  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) throw ApiError.notFound('Package not found');
  // CartItem holds an FK to Package; clear those first. PackageInfluencer rows
  // cascade on package delete. OrderItem.packageId is a plain string (no FK),
  // so historical orders are preserved.
  await prisma.cartItem.deleteMany({ where: { packageId: id } });
  await prisma.package.delete({ where: { id } });
  return { ok: true };
}

// ---------- Platform stats (one call powers every admin KPI strip) --------

export async function platformStats() {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    gmvAgg,
    activeCampaigns,
    pendingApprovals,
    payoutsQueued,
    totalUsers,
    totalBrands,
    totalCreators,
    signupsThisWeek,
    totalPackages,
    activePackages,
    slotAgg,
    priceAgg,
  ] = await prisma.$transaction([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'IN_PROGRESS', 'COMPLETED'] }, paidAt: { gte: d30 } },
    }),
    prisma.campaign.count({ where: { status: { in: ['BRIEF_SENT', 'IN_PROGRESS', 'REVIEW'] } } }),
    prisma.campaignDeliverable.count({ where: { status: { in: ['DRAFT_SUBMITTED', 'POSTED'] } } }),
    prisma.payout.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'BRAND' } }),
    prisma.user.count({ where: { role: 'INFLUENCER' } }),
    prisma.user.count({ where: { createdAt: { gte: d7 } } }),
    prisma.package.count(),
    prisma.package.count({ where: { isActive: true } }),
    prisma.package.aggregate({ _sum: { influencerCount: true } }),
    prisma.package.aggregate({ _avg: { price: true } }),
  ]);

  return {
    gmv30d: Number(gmvAgg._sum.total ?? 0),
    activeCampaigns,
    pendingApprovals,
    payoutsQueued,
    totalUsers,
    totalBrands,
    totalCreators,
    signupsThisWeek,
    totalPackages,
    activePackages,
    totalSlots: slotAgg._sum.influencerCount ?? 0,
    avgPackagePrice: Number(priceAgg._avg.price ?? 0),
  };
}
