import { z } from 'zod';

const slug = z.string().min(1).max(60).regex(/^[a-z0-9-]+$/i, 'slug must be lowercase letters/numbers/hyphens');

export const upsertContentSchema = z.object({
  body: z.object({
    slug: slug,
    title: z.string().max(200).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    ogImageUrl: z.string().url().optional().nullable().or(z.literal('')),
    body: z.string().max(50000).optional().nullable(),
    data: z.record(z.unknown()).optional().nullable(),
    isPublished: z.boolean().optional(),
  }),
});

export const updateContentSchema = z.object({
  body: z.object({
    title: z.string().max(200).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    ogImageUrl: z.string().url().optional().nullable().or(z.literal('')),
    body: z.string().max(50000).optional().nullable(),
    data: z.record(z.unknown()).optional().nullable(),
    isPublished: z.boolean().optional(),
  }),
});
