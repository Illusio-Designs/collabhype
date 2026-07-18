import { z } from 'zod';

const STATUS = ['DRAFT', 'PUBLISHED'];

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
};

export const listPublishedQuery = z.object({
  ...pagination,
  tag: z.string().min(1).max(60).optional(),
});

export const adminListQuery = z.object({
  ...pagination,
  status: z.enum(STATUS).optional(),
});

const postBody = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]*$/, 'Slug must be lowercase letters, numbers, and hyphens')
    .optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().max(200000).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.string().max(200).optional(),
  status: z.enum(STATUS).optional(),
  authorName: z.string().max(120).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
});

export const createPostSchema = z.object({ body: postBody });
export const updatePostSchema = z.object({ body: postBody.partial() });
