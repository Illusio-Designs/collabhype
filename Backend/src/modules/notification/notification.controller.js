import * as service from './notification.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function list(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const result = await service.listForUser(req.user.sub, { limit });
  res.json({ notifications: result.items, unreadCount: result.unreadCount });
}

export async function markRead(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  await service.markRead(req.user.sub, req.params.id);
  res.json({ ok: true });
}

export async function markAllRead(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const result = await service.markAllRead(req.user.sub);
  res.json(result);
}
