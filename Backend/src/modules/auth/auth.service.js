import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';

export async function register(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('Email already in use');

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      ...(input.role === 'INFLUENCER' && {
        influencerProfile: {
          create: { city: input.city },
        },
      }),
      ...(input.role === 'BRAND' && {
        brandProfile: {
          create: { companyName: input.companyName ?? input.fullName },
        },
      }),
    },
    include: { influencerProfile: true, brandProfile: true },
  });

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return { token, user: stripUser(user) };
}

export async function login(input) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { influencerProfile: true, brandProfile: true },
  });
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (!user.isActive) throw ApiError.forbidden('Account disabled');

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return { token, user: stripUser(user) };
}

export async function me(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      influencerProfile: { include: { socialAccounts: true, niches: { include: { niche: true } } } },
      brandProfile: true,
    },
  });
  if (!user) throw ApiError.notFound('User not found');
  return stripUser(user);
}

function stripUser(u) {
  const { passwordHash: _ph, ...safe } = u;
  return safe;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { ok: true };
}

export async function deleteAccount(userId, password) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw ApiError.badRequest('Password is incorrect');
  // Soft delete — preserves orders/campaigns/payouts for accounting + audit
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, email: `deleted-${userId}@collabhype.invalid` },
  });
  return { ok: true };
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always succeed to avoid revealing whether an email exists
  if (!user || !user.isActive) {
    return { ok: true };
  }
  const token = jwt.sign({ sub: user.id, kind: 'reset' }, env.JWT_SECRET, {
    expiresIn: '1h',
  });
  const resetUrl = `${env.FRONTEND_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  // TODO(email): wire transactional email; for now log so dev can copy the link
  console.log(`[forgot-password] Reset link for ${email}: ${resetUrl}`);
  return env.NODE_ENV === 'production' ? { ok: true } : { ok: true, devResetUrl: resetUrl };
}

export async function resetPassword(token, newPassword) {
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw ApiError.badRequest('Invalid or expired reset token');
  }
  if (payload?.kind !== 'reset' || !payload.sub) {
    throw ApiError.badRequest('Invalid reset token');
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw ApiError.notFound('Account not found');
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { ok: true };
}
