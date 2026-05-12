import * as svc from './support.service.js';
import {
  addMessageSchema,
  adminUpdateSchema,
  createTicketSchema,
  listQuery,
} from './support.schema.js';
import { ApiError } from '../../utils/ApiError.js';

function meta(total, q) {
  return {
    total,
    page: q.page,
    limit: q.limit,
    totalPages: Math.ceil(total / q.limit) || 1,
  };
}

export async function create(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const parsed = createTicketSchema.parse({ body: req.body });
  const ticket = await svc.createTicket(req.user.sub, req.user.role, parsed.body);
  res.status(201).json({ ticket });
}

export async function list(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const q = listQuery.parse(req.query);
  const { items, total } = await svc.listForUser(req.user.sub, q);
  res.json({ tickets: items, meta: meta(total, q) });
}

export async function adminList(req, res) {
  const q = listQuery.parse(req.query);
  const { items, total } = await svc.listAll(q);
  res.json({ tickets: items, meta: meta(total, q) });
}

export async function getOne(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const ticket = await svc.getOne(req.user.sub, req.user.role, req.params.id);
  res.json({ ticket });
}

export async function postMessage(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const parsed = addMessageSchema.parse({ body: req.body });
  const message = await svc.addMessage(
    req.user.sub,
    req.user.role,
    req.params.id,
    parsed.body.body,
    parsed.body.attachmentUrl,
  );
  res.status(201).json({ message });
}

export async function adminUpdate(req, res) {
  const parsed = adminUpdateSchema.parse({ body: req.body });
  const ticket = await svc.adminUpdate(req.params.id, parsed.body);
  res.json({ ticket });
}

export async function adminStats(_req, res) {
  const stats = await svc.adminStats();
  res.json(stats);
}
