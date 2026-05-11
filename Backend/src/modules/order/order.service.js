import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

export async function listForBrand(userId, { status, page, limit }) {
  const where = { brandUserId: userId };
  if (status) where.status = status;
  const [total, items] = await prisma.$transaction([
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
  ]);
  return { items, total };
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
