import * as svc from './order.service.js';
import { browseOrdersQuery } from './order.schema.js';
import { ApiError } from '../../utils/ApiError.js';

export async function list(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const q = browseOrdersQuery.parse(req.query);
  const { items, total } = await svc.listForBrand(req.user.sub, q);
  res.json({
    orders: items,
    meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) || 1 },
  });
}

export async function getOne(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const order = await svc.getForBrand(req.user.sub, req.params.id);
  res.json({ order });
}
