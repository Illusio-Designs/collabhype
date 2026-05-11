import { z } from 'zod';

const CAMPAIGN_STATUSES = [
  'DRAFT',
  'BRIEF_SENT',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
  'CANCELLED',
];

export const browseCampaignsQuery = z.object({
  status: z.enum(CAMPAIGN_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    brief: z.string().max(5000).optional(),
    hashtags: z.string().max(500).optional(),
    doList: z.string().max(2000).optional(),
    dontList: z.string().max(2000).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const submitDraftSchema = z.object({
  body: z.object({
    draftUrl: z.string().url(),
  }),
});

export const markPostedSchema = z.object({
  body: z.object({
    postedUrl: z.string().url(),
  }),
});

export const requestRevisionSchema = z.object({
  body: z.object({
    feedback: z.string().min(1).max(2000),
  }),
});
