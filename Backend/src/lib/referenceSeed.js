// Canonical reference data the app needs to function: the niche taxonomy and
// the Nano package catalog. NO demo users/creators/socials — safe for
// production. Shared by the CLI seed (prisma/seed.reference.js) and the
// seed-if-empty routine that runs on server startup.

import bcrypt from 'bcryptjs';

export const NICHES = [
  { slug: 'beauty', name: 'Beauty & Skincare' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'fitness', name: 'Fitness' },
  { slug: 'food', name: 'Food & Beverage' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'tech', name: 'Tech & Gadgets' },
  { slug: 'travel', name: 'Travel' },
  { slug: 'parenting', name: 'Parenting' },
  { slug: 'health', name: 'Health & Wellness' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'education', name: 'Education' },
  { slug: 'gaming', name: 'Gaming' },
];

export const NANO_PACKS = [
  {
    slug: 'starter-pack',
    packName: 'Starter Pack',
    title: 'Starter Pack — 50 Nano Creators',
    description: 'Best for micro-campaigns.',
    subtitle: 'Best for micro-campaigns.',
    tier: 'NANO',
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_STORY', qty: 1 },
    ],
    influencerCount: 50,
    price: 20000,
    mrp: 25000,
    pricePerInfluencer: 400,
    nanoPayPerInfluencer: 200,
    benefits: ['Content Rights'],
    isMostPopular: false,
    estReach: 250000,
    estEngagement: 18000,
  },
  {
    slug: 'growth-plan',
    packName: 'Growth Plan',
    title: 'Growth Plan — 100 Nano Creators',
    description: 'Scale outreach with performance add-ons.',
    subtitle: 'Scale outreach with performance add-ons.',
    tier: 'NANO',
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_STORY', qty: 1 },
      { type: 'UTM_LINK', qty: 1 },
    ],
    influencerCount: 100,
    price: 30000,
    mrp: 35000,
    pricePerInfluencer: 300,
    nanoPayPerInfluencer: 180,
    benefits: ['Content Rights'],
    isMostPopular: true,
    estReach: 500000,
    estEngagement: 36000,
  },
  {
    slug: 'brand-booster',
    packName: 'Brand Booster',
    title: 'Brand Booster — 250 Nano Creators',
    description: 'For aggressive expansion.',
    subtitle: 'For aggressive expansion.',
    tier: 'NANO',
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_STORY', qty: 1 },
      { type: 'UTM_LINK', qty: 1 },
      { type: 'VIDEO_DRIVE_LINK', qty: 1 },
    ],
    influencerCount: 250,
    price: 62500,
    mrp: 75000,
    pricePerInfluencer: 250,
    nanoPayPerInfluencer: 160,
    benefits: ['Content Rights'],
    isMostPopular: false,
    estReach: 1250000,
    estEngagement: 90000,
  },
  {
    slug: 'viral-pro',
    packName: 'Viral Pro',
    title: 'Viral Pro — 500 Nano Creators',
    description: 'High-volume advanced rights.',
    subtitle: 'High-volume advanced rights.',
    tier: 'NANO',
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_STORY', qty: 1 },
      { type: 'UTM_LINK', qty: 1 },
      { type: 'VIDEO_DRIVE_LINK', qty: 1 },
      { type: 'PERFORMANCE_REPORT', qty: 1 },
    ],
    influencerCount: 500,
    price: 100000,
    mrp: 125000,
    pricePerInfluencer: 200,
    nanoPayPerInfluencer: 140,
    benefits: ['Content Rights'],
    isMostPopular: false,
    estReach: 2500000,
    estEngagement: 180000,
  },
];

// Default platform settings shown/edited in Admin → Platform settings. Only
// created when missing — an admin's edited value is never overwritten.
export const DEFAULT_SETTINGS = [
  { key: 'tier_nano_max', value: '1000', type: 'number' },
  { key: 'tier_micro_max', value: '100000', type: 'number' },
  { key: 'tier_macro_max', value: '1000000', type: 'number' },
];

// Upsert all reference data (idempotent). Returns counts written.
export async function seedReferenceData(prisma) {
  for (const n of NICHES) {
    await prisma.niche.upsert({ where: { slug: n.slug }, update: n, create: n });
  }
  for (const p of NANO_PACKS) {
    await prisma.package.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  for (const s of DEFAULT_SETTINGS) {
    await prisma.platformSettings.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  return { niches: NICHES.length, packages: NANO_PACKS.length, settings: DEFAULT_SETTINGS.length };
}

// Create the super-admin from env creds if one doesn't already exist. Only runs
// when both ADMIN_EMAIL and ADMIN_PASSWORD are provided. Never resets an
// existing admin's password (use `npm run seed:admin` with ADMIN_RESET_PASSWORD
// for that).
async function ensureAdmin(prisma) {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) return false;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return false;

  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
  await prisma.user.create({
    data: {
      email,
      fullName: (process.env.ADMIN_NAME || 'Super Admin').trim(),
      passwordHash: await bcrypt.hash(password, rounds),
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });
  return true;
}

// Seed-if-empty, called once on server startup. Cheap on normal boots (two
// count queries). Skips entirely when AUTO_SEED=false. Never throws — a seeding
// problem must not stop the server from booting.
export async function ensureSeedData(prisma) {
  if (String(process.env.AUTO_SEED ?? '').toLowerCase() === 'false') return;
  try {
    const [niches, packages, settings] = await Promise.all([
      prisma.niche.count(),
      prisma.package.count(),
      prisma.platformSettings.count(),
    ]);
    if (niches === 0 || packages === 0 || settings === 0) {
      const res = await seedReferenceData(prisma);
      console.log(
        `[seed] reference data seeded (${res.niches} niches, ${res.packages} packages, ${res.settings} settings)`,
      );
    }
    if (await ensureAdmin(prisma)) {
      console.log(`[seed] super-admin created from env (${process.env.ADMIN_EMAIL})`);
    }
  } catch (err) {
    console.error('[seed] ensureSeedData failed (continuing):', err.message);
  }
}
