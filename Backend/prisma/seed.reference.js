// =============================================================================
// Reference-only seed — safe to run against PRODUCTION.
//
// Seeds ONLY the catalog reference data the app needs to function:
//   - Niches (drive the profile niche selector + browse filters)
//   - Nano packages (the marketplace catalog)
//
// It creates NO demo users, creators, socials, or site content — so running it
// on live never pollutes the platform with fake accounts.
//
// Idempotent: every write is an upsert keyed on slug, so re-running is safe.
//
//   node prisma/seed.reference.js
// =============================================================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NICHES = [
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

const NANO_PACKS = [
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

async function main() {
  for (const n of NICHES) {
    await prisma.niche.upsert({ where: { slug: n.slug }, update: n, create: n });
  }
  console.log(`✓ Seeded ${NICHES.length} niches`);

  for (const p of NANO_PACKS) {
    await prisma.package.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  console.log(`✓ Seeded ${NANO_PACKS.length} Nano packs`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('Reference seed failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
