import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const niches = await prisma.niche.findMany({ orderBy: { name: 'asc' } });
    res.json({ niches });
  }),
);

// Create a niche on the fly (e.g. a creator adds one not already listed).
// Any authenticated user can add; the slug is derived from the name and an
// existing niche with that slug is returned as-is (no duplicates).
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    if (name.length < 2 || name.length > 40) {
      throw ApiError.badRequest('Niche name must be 2–40 characters');
    }
    const slug = slugify(name);
    if (!slug) throw ApiError.badRequest('Enter a valid niche name');

    const niche = await prisma.niche.upsert({
      where: { slug },
      update: {},
      create: { slug, name },
    });
    res.status(201).json({ niche });
  }),
);

export default router;
