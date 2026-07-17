import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

// Statuses that mean "paid for, work still running".
const IN_FLIGHT_STATUSES = ['PAID', 'IN_PROGRESS'];

export async function listForBrand(userId, { status, page, limit }) {
  const where = { brandUserId: userId };
  if (status) where.status = status;

  // The summary intentionally ignores `status` and the page window: the
  // dashboard KPIs are lifetime figures across every order the brand has,
  // not a description of the rows currently on screen.
  const summaryWhere = { brandUserId: userId };

  const [total, items, agg, completed, inFlight] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: true,
        _count: { select: { campaigns: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.aggregate({
      where: summaryWhere,
      _sum: { total: true },
      _avg: { total: true },
      _count: { _all: true },
    }),
    prisma.order.count({ where: { ...summaryWhere, status: 'COMPLETED' } }),
    prisma.order.count({ where: { ...summaryWhere, status: { in: IN_FLIGHT_STATUSES } } }),
  ]);

  const summary = {
    count: agg._count._all,
    totalSpent: Number(agg._sum.total ?? 0),
    avgOrder: Number(agg._avg.total ?? 0),
    completed,
    inFlight,
  };

  return { items, total, summary };
}

export async function getForBrand(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, brandUserId: userId },
    include: {
      items: true,
      escrows: true,
      campaigns: {
        include: {
          _count: { select: { deliverables: true } },
          deliverables: {
            select: { id: true, status: true, deliverable: true, amountPayable: true },
          },
        },
      },
    },
  });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}
