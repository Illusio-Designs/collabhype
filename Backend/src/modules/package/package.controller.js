import { browsePackagesQuery } from './package.schema.js';
import * as service from './package.service.js';

export async function browse(req, res) {
  const q = browsePackagesQuery.parse(req.query);
  const { items, total } = await service.browse(q);
  res.json({
    packages: items,
    meta: {
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit) || 1,
    },
  });
}

export async function getOne(req, res) {
  const pkg = await service.getBySlug(req.params.slug);
  res.json({ package: pkg });
}
