import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

// Creates (or updates) the platform super-admin account. The app has a single
// elevated role — ADMIN — which unlocks every /api/v1/admin route, so the
// "super admin" is an ADMIN user.
//
// Idempotent: safe to run on every deploy. It never overwrites an existing
// password unless ADMIN_RESET_PASSWORD=true, so re-running won't lock you out.
//
// Credentials come from env (never hard-coded / committed):
//   ADMIN_EMAIL          default: admin@collabhype.in
//   ADMIN_NAME           default: Super Admin
//   ADMIN_PASSWORD       if unset on FIRST creation, a strong one is generated
//                        and printed once — copy it.
//   ADMIN_RESET_PASSWORD "true" to reset the password of an existing admin to
//                        ADMIN_PASSWORD (otherwise the existing hash is kept).
//
// Usage:  ADMIN_EMAIL=you@collabhype.in ADMIN_PASSWORD='S3cure!' npm run seed:admin
//
// Note: .env is picked up automatically — importing @prisma/client loads it,
// same as prisma/seed.js and prisma/purge-accounts.js rely on.

const prisma = new PrismaClient();

const ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@collabhype.in').trim().toLowerCase();
  const fullName = (process.env.ADMIN_NAME ?? 'Super Admin').trim();
  const resetPassword = String(process.env.ADMIN_RESET_PASSWORD ?? '').toLowerCase() === 'true';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const data = {
      role: 'ADMIN',
      fullName,
      isActive: true,
      emailVerified: true,
      // Clear any soft-delete state so the admin can always log in.
      deletedAt: null,
      purgedAt: null,
    };
    if (resetPassword) {
      const password = process.env.ADMIN_PASSWORD;
      if (!password) {
        throw new Error('ADMIN_RESET_PASSWORD=true but ADMIN_PASSWORD is not set.');
      }
      data.passwordHash = await bcrypt.hash(password, ROUNDS);
    }
    await prisma.user.update({ where: { email }, data });
    console.log(`✅ Super admin updated: ${email} (role ADMIN)`);
    if (resetPassword) console.log('   Password was reset from ADMIN_PASSWORD.');
    else console.log('   Password unchanged (set ADMIN_RESET_PASSWORD=true to reset it).');
    return;
  }

  // First-time creation.
  let password = process.env.ADMIN_PASSWORD;
  let generated = false;
  if (!password) {
    // 18 url-safe bytes → ~24 char password. Only shown this once.
    password = crypto.randomBytes(18).toString('base64url');
    generated = true;
  }
  const passwordHash = await bcrypt.hash(password, ROUNDS);

  await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Super admin created:');
  console.log(`   Email: ${email}`);
  console.log(`   Role:  ADMIN`);
  if (generated) {
    console.log(`   Password (shown once — save it now): ${password}`);
  } else {
    console.log('   Password: (from ADMIN_PASSWORD)');
  }
}

main()
  .catch((e) => {
    console.error('Failed to seed super admin:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
