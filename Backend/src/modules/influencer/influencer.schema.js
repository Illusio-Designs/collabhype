import { z } from 'zod';

const TIERS = ['NANO', 'MICRO', 'MACRO', 'MEGA'];
const PLATFORMS = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'X', 'FACEBOOK'];

// Creator-offerable deliverables only. UTM_LINK / VIDEO_DRIVE_LINK /
// PERFORMANCE_REPORT exist in the Prisma enum because the catalog packs
// include them, but creators don't individually price those — they're
// platform-provided artifacts that ship with certain Nano packs.
const DELIVERABLE_TYPES = [
  'IG_POST',
  'IG_REEL',
  'IG_STORY',
  'IG_CAROUSEL',
  'YT_VIDEO',
  'YT_SHORT',
  'UGC',
  'STORE_VISIT',
  'BLOG',
];

export const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(1000).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(3).optional(),
    languages: z.string().max(200).optional(), // comma-sep ISO codes
    gender: z.string().max(20).optional(),
    dob: z.string().datetime().optional(),
    baseRate: z.number().nonnegative().optional(),
    upiId: z.string().max(100).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const setNichesSchema = z.object({
  body: z.object({
    nicheSlugs: z.array(z.string().min(1)).min(1).max(10),
  }),
});

export const setRateCardsSchema = z.object({
  body: z.object({
    rates: z
      .array(
        z.object({
          deliverable: z.enum(DELIVERABLE_TYPES),
          price: z.number().nonnegative(),
        }),
      )
      .min(1)
      .max(20),
  }),
});

export const browseInfluencersQuery = z.object({
  tier: z.enum(TIERS).optional(),
  nicheSlug: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  minFollowers: z.coerce.number().int().min(0).optional(),
  maxFollowers: z.coerce.number().int().min(0).optional(),
  platform: z.enum(PLATFORMS).optional(),
  verified: z.coerce.boolean().optional(),
  q: z.string().min(1).max(100).optional(),
  sort: z.enum(['followers_desc', 'engagement_desc', 'newest']).default('followers_desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
