import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

function clean(data) {
  const out = { ...data };
  if (out.ogImageUrl === '') out.ogImageUrl = null;
  return out;
}

export async function getPublic(slug) {
  const entry = await prisma.siteContent.findUnique({ where: { slug } });
  if (!entry || !entry.isPublished) throw ApiError.notFound('Content not found');
  return entry;
}

export async function listAll() {
  return prisma.siteContent.findMany({ orderBy: { slug: 'asc' } });
}

export async function getOne(slug) {
  const entry = await prisma.siteContent.findUnique({ where: { slug } });
  if (!entry) throw ApiError.notFound('Content not found');
  return entry;
}

export async function upsert(payload) {
  const data = clean(payload);
  return prisma.siteContent.upsert({
    where: { slug: data.slug },
    create: data,
    update: data,
  });
}

export async function update(slug, payload) {
  const exists = await prisma.siteContent.findUnique({ where: { slug } });
  if (!exists) throw ApiError.notFound('Content not found');
  return prisma.siteContent.update({ where: { slug }, data: clean(payload) });
}

export async function remove(slug) {
  await prisma.siteContent.deleteMany({ where: { slug } });
  return { ok: true };
}
