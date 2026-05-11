import { z } from 'zod';

const TIERS = ['NANO', 'MICRO', 'MACRO', 'MEGA'];

export const browsePackagesQuery = z.object({
  tier: z.enum(TIERS).optional(),
  nicheSlug: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  q: z.string().min(1).max(100).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'reach_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
