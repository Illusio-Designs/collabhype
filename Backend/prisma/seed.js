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

async function main() {
  for (const n of NICHES) {
    await prisma.niche.upsert({
      where: { slug: n.slug },
      update: { name: n.name },
      create: n,
    });
  }
  console.log(`Seeded ${NICHES.length} niches`);

  const beauty = await prisma.niche.findUnique({ where: { slug: 'beauty' } });
  const samples = [
    {
      slug: 'starter-nano-10',
      title: 'Starter Pack — 10 Nano Beauty Influencers',
      description: 'Perfect for new brands. 10 nano influencers (1K–10K) post a Reel + Story each.',
      tier: 'NANO',
      deliverables: [
        { type: 'IG_REEL', qty: 1 },
        { type: 'IG_STORY', qty: 1 },
      ],
      influencerCount: 10,
      price: 25000,
      estReach: 50000,
      estEngagement: 4000,
    },
    {
      slug: 'growth-micro-5',
      title: 'Growth Pack — 5 Micro Beauty Influencers',
      description: '5 micro influencers (10K–100K), 1 Reel + 2 Stories each.',
      tier: 'MICRO',
      deliverables: [
        { type: 'IG_REEL', qty: 1 },
        { type: 'IG_STORY', qty: 2 },
      ],
      influencerCount: 5,
      price: 75000,
      estReach: 250000,
      estEngagement: 15000,
    },
  ];
  for (const p of samples) {
    await prisma.package.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, nicheId: beauty?.id ?? null },
    });
  }
  console.log(`Seeded ${samples.length} sample packages`);

  // ---------- SiteContent defaults (SEO + page bodies) ----------
  const contents = [
    {
      slug: 'home',
      title: 'Collabcreator — India\'s self-serve influencer marketplace',
      description:
        'Buy curated influencer packages or hand-pick creators one at a time. Pay once, brief in-app, release escrow when posts go live.',
      ogImageUrl: null,
      data: {
        heroEyebrow: 'Best influencer marketplace in India',
        heroHeadline: 'Personalized influencer campaigns for better brands.',
        heroSubhead:
          'Buy curated packs of vetted creators or hand-pick influencers one at a time. Pay once, brief in-app, release escrow when posts go live.',
      },
      isPublished: true,
    },
    {
      slug: 'about',
      title: 'About — Collabcreator',
      description:
        'Why we built Collabcreator: transparent, self-serve influencer marketing for India.',
      data: null,
      isPublished: true,
    },
    {
      slug: 'how-it-works',
      title: 'How it works — Collabcreator',
      description: 'From cart to campaign in four steps. Self-serve influencer marketing with escrow.',
      data: null,
      isPublished: true,
    },
    {
      slug: 'contact',
      title: 'Contact — Collabcreator',
      description: "Questions, partnerships, or press — we'll reply within one business day.",
      data: null,
      isPublished: true,
    },
    {
      slug: 'terms',
      title: 'Terms of Service — Collabcreator',
      description: 'The terms under which you use Collabcreator.',
      data: null,
      isPublished: true,
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy — Collabcreator',
      description: 'How Collabcreator collects, uses, and protects your data.',
      data: null,
      isPublished: true,
    },
  ];
  for (const c of contents) {
    await prisma.siteContent.upsert({
      where: { slug: c.slug },
      update: {},
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
