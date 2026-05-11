import * as service from './content.service.js';
import { upsertContentSchema, updateContentSchema } from './content.schema.js';

export async function publicGet(req, res) {
  const entry = await service.getPublic(req.params.slug);
  res.json({ content: entry });
}

export async function adminList(_req, res) {
  const items = await service.listAll();
  res.json({ items });
}

export async function adminGet(req, res) {
  const entry = await service.getOne(req.params.slug);
  res.json({ content: entry });
}

export async function adminUpsert(req, res) {
  const { body } = upsertContentSchema.parse({ body: req.body });
  const entry = await service.upsert(body);
  res.status(201).json({ content: entry });
}

export async function adminUpdate(req, res) {
  const { body } = updateContentSchema.parse({ body: req.body });
  const entry = await service.update(req.params.slug, body);
  res.json({ content: entry });
}

export async function adminDelete(req, res) {
  await service.remove(req.params.slug);
  res.json({ ok: true });
}
