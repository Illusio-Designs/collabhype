import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

// =============================================================================
// 4 Nano packs — stepped ladder. Each pack adds one deliverable type over the
// previous. All packs include "Content Rights" as the single flat benefit.
// nanoPayPerInfluencer is what the platform pays each nano creator (flat).
// =============================================================================
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

// Demo creators — used by admin to preview the platform and by brands during
// the early days when the roster is being seeded.
const DEMO_CREATORS = [
  {
    email: 'aanya@example.com',
    fullName: 'Aanya Mehta',
    bio: 'Beauty + skincare creator from Mumbai. Honest reviews only.',
    city: 'Mumbai',
    state: 'Maharashtra',
    tier: 'MICRO',
    totalFollowers: 47000,
    avgEngagementRate: 4.7,
    badge: 'TOP_RATED',
    completedCampaigns: 24,
    successfulDeliverables: 47,
    revisionsRequested: 3,
    totalEarnings: 184000,
    successRate: 94,
    responseRate: 98,
    avgRating: 4.8,
    socials: [
      { platform: 'INSTAGRAM', handle: 'aanyamehta', followers: 47000, engagementRate: 4.7, isVerified: true },
      { platform: 'YOUTUBE',   handle: 'AanyaBeauty', followers: 12000, engagementRate: 2.1, isVerified: true },
    ],
    niches: ['beauty', 'lifestyle'],
    rateCards: [
      { deliverable: 'IG_REEL',  price: 8500 },
      { deliverable: 'IG_POST',  price: 5000 },
      { deliverable: 'IG_STORY', price: 2000 },
    ],
  },
  {
    email: 'rohan@example.com',
    fullName: 'Rohan Iyer',
    bio: 'Lifestyle + tech reviews. Based in Bangalore.',
    city: 'Bangalore',
    state: 'Karnataka',
    tier: 'MICRO',
    totalFollowers: 62000,
    avgEngagementRate: 5.2,
    badge: 'RISING_TALENT',
    completedCampaigns: 6,
    successfulDeliverables: 11,
    revisionsRequested: 1,
    totalEarnings: 42000,
    successRate: 88,
    responseRate: 92,
    avgRating: 4.6,
    socials: [
      { platform: 'INSTAGRAM', handle: 'rohaniyer', followers: 62000, engagementRate: 5.2, isVerified: true },
    ],
    niches: ['lifestyle', 'tech'],
    rateCards: [
      { deliverable: 'IG_REEL',  price: 10000 },
      { deliverable: 'IG_STORY', price: 2500 },
    ],
  },
  {
    email: 'priya@example.com',
    fullName: 'Priya Sharma',
    bio: 'Fitness & nutrition coach. Trained 100+ clients.',
    city: 'Delhi',
    state: 'Delhi',
    tier: 'MACRO',
    totalFollowers: 240000,
    avgEngagementRate: 3.8,
    badge: 'TOP_RATED_PLUS',
    completedCampaigns: 58,
    successfulDeliverables: 112,
    revisionsRequested: 4,
    totalEarnings: 920000,
    successRate: 97,
    responseRate: 95,
    avgRating: 4.9,
    socials: [
      { platform: 'INSTAGRAM', handle: 'priyafit',  followers: 240000, engagementRate: 3.8, isVerified: true },
      { platform: 'YOUTUBE',   handle: 'PriyaFit',  followers: 85000,  engagementRate: 2.9, isVerified: true },
    ],
    niches: ['fitness', 'health'],
    rateCards: [
      { deliverable: 'IG_REEL',  price: 35000 },
      { deliverable: 'YT_VIDEO', price: 80000 },
    ],
  },
  {
    email: 'vikram@example.com',
    fullName: 'Vikram Singh',
    bio: 'Street food explorer. Vlogger across 18 cities.',
    city: 'Indore',
    state: 'Madhya Pradesh',
    tier: 'MICRO',
    totalFollowers: 85000,
    avgEngagementRate: 6.1,
    badge: 'TOP_RATED',
    completedCampaigns: 19,
    successfulDeliverables: 36,
    revisionsRequested: 2,
    totalEarnings: 240000,
    successRate: 93,
    responseRate: 97,
    avgRating: 4.7,
    socials: [
      { platform: 'INSTAGRAM', handle: 'vikramfoodie', followers: 85000, engagementRate: 6.1, isVerified: true },
    ],
    niches: ['food', 'travel'],
    rateCards: [
      { deliverable: 'IG_REEL',     price: 12000 },
      { deliverable: 'STORE_VISIT', price: 18000 },
    ],
  },
  {
    email: 'naina@example.com',
    fullName: 'Naina Kapoor',
    bio: 'Parenting + kids fashion. Mom of two.',
    city: 'Pune',
    state: 'Maharashtra',
    tier: 'NANO',
    totalFollowers: 8500,
    avgEngagementRate: 7.4,
    badge: 'RISING_TALENT',
    completedCampaigns: 3,
    successfulDeliverables: 5,
    revisionsRequested: 0,
    totalEarnings: 12500,
    successRate: 100,
    responseRate: 100,
    avgRating: 4.9,
    socials: [
      { platform: 'INSTAGRAM', handle: 'naina_mom', followers: 8500, engagementRate: 7.4, isVerified: true },
    ],
    niches: ['parenting', 'fashion'],
    rateCards: [
      { deliverable: 'IG_REEL', price: 3500 },
      { deliverable: 'IG_POST', price: 2000 },
    ],
  },
  {
    email: 'karan@example.com',
    fullName: 'Karan Desai',
    bio: 'Gaming + tech YouTuber. PC builds, reviews, esports.',
    city: 'Hyderabad',
    state: 'Telangana',
    tier: 'MEGA',
    totalFollowers: 1200000,
    avgEngagementRate: 4.5,
    badge: 'EXPERT_VETTED',
    completedCampaigns: 120,
    successfulDeliverables: 240,
    revisionsRequested: 5,
    totalEarnings: 4800000,
    successRate: 98,
    responseRate: 96,
    avgRating: 5.0,
    socials: [
      { platform: 'YOUTUBE',   handle: 'KaranGames',  followers: 1200000, engagementRate: 4.5, isVerified: true },
      { platform: 'INSTAGRAM', handle: 'karan_games', followers: 320000,  engagementRate: 3.2, isVerified: true },
    ],
    niches: ['gaming', 'tech'],
    rateCards: [
      { deliverable: 'YT_VIDEO', price: 250000 },
      { deliverable: 'YT_SHORT', price: 50000 },
    ],
  },
];

async function main() {
  // ---------- Niches ----------
  for (const n of NICHES) {
    await prisma.niche.upsert({
      where: { slug: n.slug },
      update: { name: n.name },
      create: n,
    });
  }
  console.log(`Seeded ${NICHES.length} niches`);

  // ---------- Nano Packages ----------
  for (const p of NANO_PACKS) {
    await prisma.package.upsert({
      where: { slug: p.slug },
      update: {
        packName: p.packName,
        title: p.title,
        description: p.description,
        subtitle: p.subtitle,
        deliverables: p.deliverables,
        influencerCount: p.influencerCount,
        price: p.price,
        mrp: p.mrp,
        pricePerInfluencer: p.pricePerInfluencer,
        nanoPayPerInfluencer: p.nanoPayPerInfluencer,
        benefits: p.benefits,
        isMostPopular: p.isMostPopular,
        estReach: p.estReach,
        estEngagement: p.estEngagement,
        isActive: true,
      },
      create: p,
    });
  }
  console.log(`Seeded ${NANO_PACKS.length} Nano packs`);

  // ---------- Demo creators ----------
  const passwordHash = await bcrypt.hash('demo-password', 10);
  const nichesBySlug = Object.fromEntries(
    (await prisma.niche.findMany()).map((n) => [n.slug, n]),
  );

  for (const c of DEMO_CREATORS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { fullName: c.fullName, role: 'INFLUENCER' },
      create: {
        email: c.email,
        fullName: c.fullName,
        passwordHash,
        role: 'INFLUENCER',
        emailVerified: true,
      },
    });

    const profile = await prisma.influencerProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: c.bio,
        city: c.city,
        state: c.state,
        tier: c.tier,
        totalFollowers: c.totalFollowers,
        avgEngagementRate: c.avgEngagementRate,
        badge: c.badge,
        completedCampaigns: c.completedCampaigns,
        successfulDeliverables: c.successfulDeliverables,
        revisionsRequested: c.revisionsRequested,
        totalEarnings: c.totalEarnings,
        successRate: c.successRate,
        responseRate: c.responseRate,
        avgRating: c.avgRating,
      },
      create: {
        userId: user.id,
        bio: c.bio,
        city: c.city,
        state: c.state,
        tier: c.tier,
        totalFollowers: c.totalFollowers,
        avgEngagementRate: c.avgEngagementRate,
        badge: c.badge,
        completedCampaigns: c.completedCampaigns,
        successfulDeliverables: c.successfulDeliverables,
        revisionsRequested: c.revisionsRequested,
        totalEarnings: c.totalEarnings,
        successRate: c.successRate,
        responseRate: c.responseRate,
        avgRating: c.avgRating,
      },
    });

    // Socials
    for (const s of c.socials) {
      await prisma.socialAccount.upsert({
        where: { influencerId_platform: { influencerId: profile.id, platform: s.platform } },
        update: {
          handle: s.handle,
          followers: s.followers,
          engagementRate: s.engagementRate,
          isVerified: s.isVerified ?? false,
        },
        create: {
          influencerId: profile.id,
          platform: s.platform,
          handle: s.handle,
          followers: s.followers,
          engagementRate: s.engagementRate,
          isVerified: s.isVerified ?? false,
        },
      });
    }

    // Niches
    for (const slug of c.niches) {
      const n = nichesBySlug[slug];
      if (!n) continue;
      await prisma.influencerNiche.upsert({
        where: { influencerId_nicheId: { influencerId: profile.id, nicheId: n.id } },
        update: {},
        create: { influencerId: profile.id, nicheId: n.id },
      });
    }

    // Rate cards
    for (const rc of c.rateCards) {
      await prisma.rateCard.upsert({
        where: {
          influencerId_deliverable: { influencerId: profile.id, deliverable: rc.deliverable },
        },
        update: { price: rc.price },
        create: { influencerId: profile.id, deliverable: rc.deliverable, price: rc.price },
      });
    }
  }
  console.log(`Seeded ${DEMO_CREATORS.length} demo creators with badges`);

  // ---------- SiteContent (SEO) ----------
  const contents = [
    {
      slug: 'home',
      title: "Collabhype — India's self-serve influencer marketplace",
      description:
        'Buy Nano creator packs in bulk or hand-pick Micro/Macro/Mega creators. Escrow-backed payouts, 5% platform fee, transparent pricing.',
      ogImageUrl: null,
      data: {
        heroEyebrow: 'India\'s self-serve influencer marketplace',
        heroHeadline: 'Bulk-buy Nano packs, hand-pick the rest.',
        heroSubhead:
          'Pick a Nano pack of 50, 100, 250 or 500 creators — or browse Micro/Macro/Mega and add multiple creators to your cart at once. Pay once, brief in-app, release escrow when posts go live.',
      },
      isPublished: true,
    },
    {
      slug: 'about',
      title: 'About — Collabhype',
      description: 'Why we built Collabhype: transparent, self-serve influencer marketing for India.',
      data: null,
      isPublished: true,
    },
    {
      slug: 'how-it-works',
      title: 'How it works — Collabhype',
      description: 'From cart to campaign in four steps. Self-serve influencer marketing with escrow.',
      data: null,
      isPublished: true,
    },
    {
      slug: 'contact',
      title: 'Contact — Collabhype',
      description: "Questions, partnerships, or press — we'll reply within one business day.",
      data: null,
      isPublished: true,
    },
    {
      slug: 'terms',
      title: 'Terms of Service — Collabhype',
      description: 'The terms under which you use Collabhype.',
      data: null,
      isPublished: true,
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy — Collabhype',
      description: 'How Collabhype collects, uses, and protects your data.',
      data: null,
      isPublished: true,
    },
  ];
  for (const c of contents) {
    await prisma.siteContent.upsert({
      where: { slug: c.slug },
      update: { title: c.title, description: c.description },
      create: c,
    });
  }
  console.log(`Seeded ${contents.length} site content entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
