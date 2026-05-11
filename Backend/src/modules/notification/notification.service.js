import { prisma } from '../../lib/prisma.js';

export async function listForUser(userId, { limit = 50 } = {}) {
  const [items, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, unreadCount };
}

export async function markRead(userId, id) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
  return { ok: true };
}

export async function markAllRead(userId) {
  const { count } = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { ok: true, count };
}
