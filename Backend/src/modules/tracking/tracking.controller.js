import * as service from './tracking.service.js';
import { browseEventsQuery, summaryQuery, trackEventSchema } from './tracking.schema.js';

export async function ingest(req, res) {
  const { body } = trackEventSchema.parse({ body: req.body });
  // userId is taken from the authenticated user — never trust client-provided id
  const userId = req.user?.sub ?? null;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  // Fire-and-forget; ack quickly so the client doesn't block on tracking
  service
    .ingest({
      ...body,
      userId,
      ip,
      userAgent,
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[tracking ingest] failed', err);
    });

  res.status(202).json({ ok: true });
}

export async function browse(req, res) {
  const q = browseEventsQuery.parse(req.query);
  const { items, total } = await service.browse(q);
  res.json({
    events: items,
    meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) || 1 },
  });
}

export async function summary(req, res) {
  const q = summaryQuery.parse(req.query);
  const data = await service.summary(q);
  res.json(data);
}
