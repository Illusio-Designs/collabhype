import { z } from 'zod';

const CATEGORIES = ['DISPUTE', 'PAYOUT', 'BILLING', 'CAMPAIGN', 'TECHNICAL', 'OTHER'];
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'AWAITING_USER', 'RESOLVED', 'CLOSED'];

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(3).max(200),
    body: z.string().min(10).max(8000),
    category: z.enum(CATEGORIES),
    priority: z.enum(PRIORITIES).optional(),
    orderId: z.string().min(1).optional(),
    campaignId: z.string().min(1).optional(),
    deliverableId: z.string().min(1).optional(),
  }),
});

export const addMessageSchema = z.object({
  body: z.object({
    body: z.string().min(1).max(8000),
    attachmentUrl: z.string().url().optional(),
  }),
});

export const adminUpdateSchema = z.object({
  body: z.object({
    status: z.enum(STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    assignedToId: z.string().nullable().optional(),
    resolution: z.string().max(8000).optional(),
  }),
});

export const listQuery = z.object({
  status: z.enum(STATUSES).optional(),
  category: z.enum(CATEGORIES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
