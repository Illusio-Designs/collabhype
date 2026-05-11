import { z } from 'zod';

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

const packageItemSchema = z.object({
  itemType: z.literal('PACKAGE'),
  packageId: z.string().min(1),
  qty: z.number().int().min(1).max(50).default(1),
});

const influencerItemSchema = z.object({
  itemType: z.literal('INFLUENCER'),
  influencerId: z.string().min(1),
  qty: z.number().int().min(1).max(50).default(1),
  deliverables: z
    .array(
      z.object({
        type: z.enum(DELIVERABLE_TYPES),
        qty: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(20),
});

export const addCartItemSchema = z.object({
  body: z.discriminatedUnion('itemType', [packageItemSchema, influencerItemSchema]),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    qty: z.number().int().min(1).max(50),
  }),
});
