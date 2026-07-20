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

// Default SEO / page content so the site has real metadata out of the box.
export const DEFAULT_SITE_CONTENT = [
  {
    slug: 'home',
    title: "Collabhype — India's self-serve influencer marketplace",
    description:
      'Buy Nano creator packs in bulk or hand-pick Micro/Macro/Mega creators. Escrow-backed payouts, transparent pricing.',
  },
  {
    slug: 'about',
    title: 'About — Collabhype',
    description: 'Why we built Collabhype: transparent, self-serve influencer marketing for India.',
  },
  {
    slug: 'how-it-works',
    title: 'How it works — Collabhype',
    description: 'From cart to campaign in four steps. Self-serve influencer marketing with escrow.',
  },
  {
    slug: 'contact',
    title: 'Contact — Collabhype',
    description: "Questions, partnerships, or press — we'll reply within one business day.",
  },
  {
    slug: 'terms',
    title: 'Terms of Service — Collabhype',
    description: 'The terms under which you use Collabhype.',
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy — Collabhype',
    description: 'How Collabhype collects, uses, and protects your data.',
  },
  {
    slug: 'blog',
    title: 'Blog — Collabhype',
    description: 'Guides, tips, and updates on influencer marketing in India.',
  },
  {
    slug: 'packages',
    title: 'Packages — Collabhype',
    description:
      'Bulk Nano influencer packs for high-volume campaigns. Micro / Macro / Mega creators are hand-picked.',
  },
  {
    slug: 'influencers',
    title: 'Browse influencers — Collabhype',
    description: 'Find vetted influencers by tier, niche, city, and platform.',
  },
];

// A starter published blog post so the /blog page and the homepage blog rail
// aren't empty on a fresh install. Upserted by slug and never overwrites an
// admin edit (update: {}), so editing it in the dashboard sticks.
export const DEFAULT_BLOG_POSTS = [
  {
    slug: 'nano-vs-micro-influencers',
    title: 'Nano vs Micro influencers: which tier fits your budget?',
    excerpt:
      'Nano and Micro creators cost a fraction of celebrity deals but often out-convert them. Here is how to pick the right tier for your next campaign.',
    coverImageUrl: '/blog/nano-vs-micro-influencers.svg',
    tags: 'strategy,creators,budget',
    authorName: 'Team Collabhype',
    status: 'PUBLISHED',
    seoTitle: 'Nano vs Micro influencers in India — which tier should you pick?',
    seoDescription:
      'A practical breakdown of Nano (under 1K) and Micro (1K–100K) creators: cost, reach, engagement, and when to use each on Collabhype.',
    content: `
<p>Not every campaign needs a million-follower celebrity. In India's creator economy, the fastest-growing brands are winning with <strong>Nano</strong> and <strong>Micro</strong> influencers — creators who cost a fraction of a big-name deal and often drive higher engagement and conversions.</p>
<h2>The tiers at a glance</h2>
<ul>
  <li><strong>Nano — under 1K followers.</strong> Highly engaged, hyper-local audiences. Perfect for early-stage brand testing and authentic word-of-mouth.</li>
  <li><strong>Micro — 1K to 100K followers.</strong> Trusted niche voices and the sweet spot for most campaigns: strong reach without losing that personal, credible feel.</li>
  <li><strong>Macro — 100K to 1M followers.</strong> Broad reach with credibility, great for launches and awareness.</li>
  <li><strong>Mega — 1M+ followers.</strong> Mass reach and cultural moments, reserved for hero campaigns.</li>
</ul>
<h2>When to go Nano</h2>
<p>Buy a bulk Nano pack when you want volume — dozens of authentic posts across a niche, at a low per-influencer cost. On Collabhype, package purchases automatically invite matching Nano creators, and each accepted task is delivered against the pack you paid for.</p>
<h2>When to go Micro</h2>
<p>Hand-pick Micro creators when a specific voice matters. Browse the roster, negotiate rates directly in chat, and check out with escrow-backed payments — funds are only released once deliverables are approved.</p>
<h2>The bottom line</h2>
<p>Start Nano to test, layer in Micro for reach, and reserve Macro/Mega for the moments that deserve them. Mix tiers in a single campaign and let the data tell you where to double down.</p>
`.trim(),
  },
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
  for (const c of DEFAULT_SITE_CONTENT) {
    await prisma.siteContent.upsert({
      where: { slug: c.slug },
      update: {}, // never overwrite admin-edited SEO
      create: c,
    });
  }
  return {
    niches: NICHES.length,
    packages: NANO_PACKS.length,
    settings: DEFAULT_SETTINGS.length,
    content: DEFAULT_SITE_CONTENT.length,
  };
}

// Ensure the starter blog post exists. Idempotent (upsert by slug) and guarded
// against a stale Prisma client that predates the BlogPost model. Runs on every
// boot so an already-seeded install still gets the post, but never clobbers an
// admin edit.
export async function ensureDefaultBlog(prisma) {
  if (!prisma.blogPost) return 0;
  let created = 0;
  for (const post of DEFAULT_BLOG_POSTS) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug }, select: { id: true } });
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {}, // never overwrite an admin edit
      create: { ...post, publishedAt: post.status === 'PUBLISHED' ? new Date() : null },
    });
    if (!existing) created += 1;
  }
  return created;
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
    const [niches, packages, settings, content] = await Promise.all([
      prisma.niche.count(),
      prisma.package.count(),
      prisma.platformSettings.count(),
      prisma.siteContent.count(),
    ]);
    if (niches === 0 || packages === 0 || settings === 0 || content === 0) {
      const res = await seedReferenceData(prisma);
      console.log(
        `[seed] reference data seeded (${res.niches} niches, ${res.packages} packages, ${res.settings} settings, ${res.content} content)`,
      );
    }
    if (await ensureAdmin(prisma)) {
      console.log(`[seed] super-admin created from env (${process.env.ADMIN_EMAIL})`);
    }
    // Note: the starter blog post is NOT auto-seeded — it's published manually
    // from Admin → Blog. (ensureDefaultBlog remains available if you ever want to
    // seed it, but is intentionally not called here.)
  } catch (err) {
    console.error('[seed] ensureSeedData failed (continuing):', err.message);
  }
}
