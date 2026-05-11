import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';

// Privacy: hash IPs with the JWT secret as salt so they're not personally
// identifiable but still allow per-IP uniqueness counting.
function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(`${env.JWT_SECRET}|${ip}`).digest('hex').slice(0, 32);
}

function truncate(str, max) {
  if (!str) return null;
  return str.length > max ? str.slice(0, max) : str;
}

export async function ingest({ eventName, pageUrl, referer, sessionId, properties, userId, ip, userAgent }) {
  return prisma.trackingEvent.create({
    data: {
      eventName: truncate(eventName, 100),
      userId: userId || null,
      sessionId: truncate(sessionId, 100),
      pageUrl: truncate(pageUrl, 500),
      referer: truncate(referer, 500),
      userAgent: truncate(userAgent, 500),
      ipHash: hashIp(ip),
      properties: properties ?? null,
    },
  });
}

export async function browse({ eventName, userId, since, until, page, limit }) {
  const where = {};
  if (eventName) where.eventName = eventName;
  if (userId) where.userId = userId;
  if (since || until) {
    where.createdAt = {};
    if (since) where.createdAt.gte = new Date(since);
    if (until) where.createdAt.lte = new Date(until);
  }

  const [total, items] = await prisma.$transaction([
    prisma.trackingEvent.count({ where }),
    prisma.trackingEvent.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

export async function summary({ days = 30 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalEvents, uniqueUserIds, byName, topPages, latest] = await Promise.all([
    prisma.trackingEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.trackingEvent.findMany({
      where: { createdAt: { gte: since }, userId: { not: null } },
      distinct: ['userId'],
      select: { userId: true },
    }),
    prisma.trackingEvent.groupBy({
      by: ['eventName'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { eventName: 'desc' } },
      take: 10,
    }),
    prisma.trackingEvent.groupBy({
      by: ['pageUrl'],
      where: { createdAt: { gte: since }, pageUrl: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { pageUrl: 'desc' } },
      take: 10,
    }),
    prisma.trackingEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { fullName: true, email: true } } },
    }),
  ]);

  return {
    totalEvents,
    uniqueUsers: uniqueUserIds.length,
    days,
    byName: byName.map((r) => ({ eventName: r.eventName, count: r._count._all })),
    topPages: topPages.map((r) => ({ pageUrl: r.pageUrl, count: r._count._all })),
    latest,
  };
}
