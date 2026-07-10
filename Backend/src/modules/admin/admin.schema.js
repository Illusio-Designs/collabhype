import { z } from 'zod';

const TIERS = ['NANO', 'MICRO', 'MACRO', 'MEGA'];
const ORDER_STATUSES = ['PENDING', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
const ROLES = ['BRAND', 'INFLUENCER', 'ADMIN'];

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

export const listOrdersQuery = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  q: z.string().min(1).max(100).optional(),
  ...pagination,
});

export const listUsersQuery = z.object({
  role: z.enum(ROLES).optional(),
  q: z.string().min(1).max(100).optional(),
  ...pagination,
});

export const listPackagesQuery = z.object({
  ...pagination,
});

export const updateUserSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

const packageBody = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  title: z.string().min(1).max(200),
  packName: z.string().max(120).optional(),
  subtitle: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  tier: z.enum(TIERS),
  nicheId: z.string().min(1).nullable().optional(),
  deliverables: z
    .array(z.object({ type: z.string().min(1), qty: z.number().int().min(1) }))
    .default([]),
  influencerCount: z.number().int().min(0).default(0),
  price: z.number().nonnegative(),
  mrp: z.number().nonnegative().nullable().optional(),
  pricePerInfluencer: z.number().nonnegative().nullable().optional(),
  estReach: z.number().int().min(0).nullable().optional(),
  estEngagement: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().default(true),
  isMostPopular: z.boolean().optional(),
  currency: z.string().max(8).default('INR'),
});

export const createPackageSchema = z.object({ body: packageBody });

// Update: everything optional, and the slug is immutable once created.
export const updatePackageSchema = z.object({
  body: packageBody.omit({ slug: true }).partial(),
});
