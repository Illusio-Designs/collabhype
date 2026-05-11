import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getMyBrandProfile(userId) {
  const profile = await prisma.brandProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, email: true, fullName: true, avatarUrl: true, phone: true },
      },
    },
  });
  if (!profile) throw ApiError.notFound('Brand profile not found');
  return profile;
}

export async function updateMyBrandProfile(userId, data) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Brand profile not found');

  // Coerce empty strings to null for nullable url columns
  const clean = { ...data };
  if (clean.website === '') clean.website = null;
  if (clean.logoUrl === '') clean.logoUrl = null;

  return prisma.brandProfile.update({
    where: { userId },
    data: clean,
  });
}
