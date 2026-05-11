import { z } from 'zod';

export const updateBrandSchema = z.object({
  body: z.object({
    companyName: z.string().min(1).max(200).optional(),
    website: z.string().url().optional().or(z.literal('')),
    industry: z.string().max(100).optional(),
    gstin: z.string().max(20).optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    about: z.string().max(2000).optional(),
  }),
});
