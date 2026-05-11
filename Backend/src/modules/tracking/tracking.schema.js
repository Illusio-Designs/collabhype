import { z } from 'zod';

export const trackEventSchema = z.object({
  body: z.object({
    eventName: z.string().min(1).max(100),
    pageUrl: z.string().max(500).optional().nullable(),
    referer: z.string().max(500).optional().nullable(),
    sessionId: z.string().max(100).optional().nullable(),
    properties: z.record(z.unknown()).optional().nullable(),
  }),
});

export const browseEventsQuery = z.object({
  eventName: z.string().optional(),
  userId: z.string().optional(),
  since: z.string().datetime().optional(),
  until: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const summaryQuery = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
