import * as service from './blog.service.js';
import {
  listPublishedQuery,
  adminListQuery,
  createPostSchema,
  updatePostSchema,
} from './blog.schema.js';

function meta(total, q) {
  return { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) || 1 };
}

// ---- Public ----

export async function publicList(req, res) {
  const q = listPublishedQuery.parse(req.query);
  const { items, total } = await service.listPublished(q);
  res.json({ posts: items, meta: meta(total, q) });
}

export async function publicGet(req, res) {
  const post = await service.getPublishedBySlug(req.params.slug);
  res.json({ post });
}

// ---- Admin ----

export async function adminList(req, res) {
  const q = adminListQuery.parse(req.query);
  const { items, total } = await service.adminList(q);
  res.json({ posts: items, meta: meta(total, q) });
}

export async function adminGet(req, res) {
  const post = await service.adminGet(req.params.id);
  res.json({ post });
}

export async function adminCreate(req, res) {
  const { body } = createPostSchema.parse({ body: req.body });
  const post = await service.create(body);
  res.status(201).json({ post });
}

export async function adminUpdate(req, res) {
  const { body } = updatePostSchema.parse({ body: req.body });
  const post = await service.update(req.params.id, body);
  res.json({ post });
}

export async function adminDelete(req, res) {
  const result = await service.remove(req.params.id);
  res.json(result);
}
