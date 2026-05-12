import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

// Short, readable ticket numbers — CH-T-XXXX-XXXX.
function newTicketNumber() {
  const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CH-T-${part()}-${part()}`;
}

const ticketInclude = {
  user: { select: { id: true, fullName: true, email: true, role: true, avatarUrl: true } },
  assignedTo: { select: { id: true, fullName: true, email: true } },
  order: { select: { id: true, orderNumber: true, total: true, status: true } },
  campaign: { select: { id: true, title: true, status: true } },
  deliverable: { select: { id: true, deliverable: true, status: true, amountPayable: true } },
  _count: { select: { messages: true } },
};

// ---------- create -------------------------------------------------------

export async function createTicket(userId, role, input) {
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: newTicketNumber(),
      userId,
      subject: input.subject,
      category: input.category,
      priority: input.priority ?? 'NORMAL',
      orderId: input.orderId ?? null,
      campaignId: input.campaignId ?? null,
      deliverableId: input.deliverableId ?? null,
      messages: {
        create: {
          authorId: userId,
          authorRole: role,
          body: input.body,
        },
      },
    },
    include: ticketInclude,
  });

  // Notify all admins (the simplest fan-out — replace with a queue when volume grows).
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: 'support.opened',
        title: `New ${input.category.toLowerCase()} ticket`,
        body: `${ticket.ticketNumber}: ${input.subject}`,
        link: `/dashboard/admin/support/${ticket.id}`,
      })),
    });
  }
  return ticket;
}

// ---------- list ---------------------------------------------------------

export async function listForUser(userId, { status, page, limit }) {
  const where = { userId };
  if (status) where.status = status;
  const [total, items] = await prisma.$transaction([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      include: ticketInclude,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

export async function listAll({ status, category, priority, page, limit }) {
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;
  const [total, items] = await prisma.$transaction([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      include: ticketInclude,
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

// ---------- get one (with messages) --------------------------------------

export async function getOne(userId, role, ticketId) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      ...ticketInclude,
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!ticket) throw ApiError.notFound('Ticket not found');
  if (role !== 'ADMIN' && ticket.userId !== userId) {
    throw ApiError.forbidden('Not your ticket');
  }
  return ticket;
}

// ---------- append message -----------------------------------------------

export async function addMessage(userId, role, ticketId, body, attachmentUrl = null) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw ApiError.notFound('Ticket not found');
  if (role !== 'ADMIN' && ticket.userId !== userId) {
    throw ApiError.forbidden('Not your ticket');
  }
  if (ticket.status === 'CLOSED') {
    throw ApiError.badRequest('Ticket is closed — open a new one if you need help');
  }

  const msg = await prisma.supportMessage.create({
    data: {
      ticketId,
      authorId: userId,
      authorRole: role,
      body,
      attachmentUrl,
    },
  });

  // Status transitions: user-side reply takes ticket back to OPEN (so admin
  // sees a fresh thing to look at); admin reply moves to AWAITING_USER.
  let nextStatus = ticket.status;
  if (role === 'ADMIN') nextStatus = 'AWAITING_USER';
  else if (ticket.status === 'AWAITING_USER') nextStatus = 'OPEN';

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: nextStatus, updatedAt: new Date() },
  });

  // Cross-notify the other side
  const notifyUserId = role === 'ADMIN' ? ticket.userId : null;
  if (notifyUserId) {
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'support.replied',
        title: `Support replied on ${ticket.ticketNumber}`,
        body: body.slice(0, 140),
        link: `/dashboard/support/${ticket.id}`,
      },
    });
  } else {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: 'support.replied',
          title: `User replied on ${ticket.ticketNumber}`,
          body: body.slice(0, 140),
          link: `/dashboard/admin/support/${ticket.id}`,
        })),
      });
    }
  }

  return msg;
}

// ---------- admin: update status / assignment / resolution ---------------

export async function adminUpdate(ticketId, patch) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const data = {};
  if (patch.status) data.status = patch.status;
  if (patch.priority) data.priority = patch.priority;
  if (patch.assignedToId !== undefined) data.assignedToId = patch.assignedToId;
  if (patch.resolution !== undefined) data.resolution = patch.resolution;

  if (patch.status === 'RESOLVED' && !ticket.resolvedAt) data.resolvedAt = new Date();
  if (patch.status === 'CLOSED' && !ticket.closedAt) data.closedAt = new Date();

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data,
    include: ticketInclude,
  });

  // Notify user on status transitions worth noticing
  if (
    patch.status &&
    ['RESOLVED', 'CLOSED', 'AWAITING_USER'].includes(patch.status) &&
    patch.status !== ticket.status
  ) {
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        type: `support.${patch.status.toLowerCase()}`,
        title: `Ticket ${ticket.ticketNumber} ${patch.status.toLowerCase()}`,
        body: patch.resolution || `Your ticket is now ${patch.status.toLowerCase()}.`,
        link: `/dashboard/support/${ticket.id}`,
      },
    });
  }
  return updated;
}

// ---------- admin: stats for the support dashboard -----------------------

export async function adminStats() {
  const [open, inProgress, awaitingUser, resolved, totalDisputes, openDisputes] =
    await prisma.$transaction([
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'AWAITING_USER' } }),
      prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      prisma.supportTicket.count({ where: { category: 'DISPUTE' } }),
      prisma.supportTicket.count({
        where: { category: 'DISPUTE', status: { in: ['OPEN', 'IN_PROGRESS', 'AWAITING_USER'] } },
      }),
    ]);
  return { open, inProgress, awaitingUser, resolved, totalDisputes, openDisputes };
}
