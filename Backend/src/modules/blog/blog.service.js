import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

// Ensure a unique slug by appending -2, -3, … if needed (ignoring `exceptId`).
async function uniqueSlug(base, exceptId) {
  const root = slugify(base) || 'post';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing || existing.id === exceptId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

// The BlogPost model may be missing from a stale Prisma client (generated
// before the model was added). List methods degrade to an empty list; the
// single-record + write methods can't return meaningful data, so they surface
// a clean 404/503 instead of a cryptic "cannot read properties of undefined".
function ensureBlogModel({ write = false } = {}) {
  if (prisma.blogPost) return;
  if (write) throw ApiError.serviceUnavailable('Blog is temporarily unavailable. Please try again shortly.');
  throw ApiError.notFound('Post not found');
}

const LIST_FIELDS = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  tags: true,
  status: true,
  authorName: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
};

// ---- Public ----

export async function listPublished({ page = 1, limit = 12, tag } = {}) {
  if (!prisma.blogPost) return { items: [], total: 0 }; // client not yet regenerated
  const where = { status: 'PUBLISHED' };
  if (tag) where.tags = { contains: tag };
  try {
    const [total, items] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        select: LIST_FIELDS,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total };
  } catch (e) {
    if (e?.code === 'P2021') return { items: [], total: 0 }; // table not migrated yet
    throw e;
  }
}

export async function getPublishedBySlug(slug) {
  ensureBlogModel();
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== 'PUBLISHED') throw ApiError.notFound('Post not found');
  return post;
}

// ---- Admin ----

export async function adminList({ page = 1, limit = 20, status } = {}) {
  if (!prisma.blogPost) return { items: [], total: 0 }; // client not yet regenerated
  const where = {};
  if (status) where.status = status;
  try {
    const [total, items] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        select: LIST_FIELDS,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total };
  } catch (e) {
    if (e?.code === 'P2021') return { items: [], total: 0 };
    throw e;
  }
}

export async function adminGet(id) {
  ensureBlogModel();
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw ApiError.notFound('Post not found');
  return post;
}

function publishedAtFor(status, current) {
  if (status === 'PUBLISHED') return current ?? new Date();
  return null; // drafts have no publish date
}

export async function create(input) {
  ensureBlogModel({ write: true });
  const slug = await uniqueSlug(input.slug || input.title);
  const status = input.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  return prisma.blogPost.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content || null,
      coverImageUrl: input.coverImageUrl || null,
      tags: input.tags || null,
      status,
      authorName: input.authorName || null,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt: publishedAtFor(status, null),
    },
  });
}

export async function update(id, input) {
  ensureBlogModel({ write: true });
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Post not found');

  const data = {};
  for (const k of [
    'title',
    'excerpt',
    'content',
    'coverImageUrl',
    'tags',
    'authorName',
    'seoTitle',
    'seoDescription',
  ]) {
    if (input[k] !== undefined) data[k] = input[k] === '' ? null : input[k];
  }
  if (input.slug !== undefined && input.slug !== existing.slug) {
    data.slug = await uniqueSlug(input.slug, id);
  }
  if (input.status !== undefined) {
    data.status = input.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    data.publishedAt = publishedAtFor(data.status, existing.publishedAt);
  }
  return prisma.blogPost.update({ where: { id }, data });
}

export async function remove(id) {
  ensureBlogModel({ write: true });
  await prisma.blogPost.deleteMany({ where: { id } });
  return { ok: true };
}
