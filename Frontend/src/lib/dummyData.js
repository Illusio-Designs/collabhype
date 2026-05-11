// Dummy data for the marketing UI — used when the backend is down or when
// previewing the design. Shape mirrors what the API returns.

export const DUMMY_NICHES = [
  { id: 'n-1', slug: 'beauty', name: 'Beauty & Skincare' },
  { id: 'n-2', slug: 'fashion', name: 'Fashion' },
  { id: 'n-3', slug: 'fitness', name: 'Fitness' },
  { id: 'n-4', slug: 'food', name: 'Food & Beverage' },
  { id: 'n-5', slug: 'lifestyle', name: 'Lifestyle' },
  { id: 'n-6', slug: 'tech', name: 'Tech & Gadgets' },
  { id: 'n-7', slug: 'travel', name: 'Travel' },
  { id: 'n-8', slug: 'parenting', name: 'Parenting' },
  { id: 'n-9', slug: 'health', name: 'Health & Wellness' },
  { id: 'n-10', slug: 'finance', name: 'Finance' },
  { id: 'n-11', slug: 'education', name: 'Education' },
  { id: 'n-12', slug: 'gaming', name: 'Gaming' },
];

const NICHE_BY_SLUG = Object.fromEntries(DUMMY_NICHES.map((n) => [n.slug, n]));

export const DUMMY_PACKAGES = [
  {
    id: 'pkg-1',
    slug: 'starter-nano-10-beauty',
    title: 'Starter Pack — 10 Nano Beauty Creators',
    description:
      'Perfect for new brands launching skincare or makeup. 10 highly-engaged nano creators post a Reel + Story each.',
    tier: 'NANO',
    niche: NICHE_BY_SLUG.beauty,
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_STORY', qty: 1 },
    ],
    influencerCount: 10,
    price: 25000,
    estReach: 50000,
    estEngagement: 4000,
    isActive: true,
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'pkg-2',
    slug: 'growth-micro-5-fashion',
    title: 'Growth Pack — 5 Micro Fashion Influencers',
    description:
      'Stack credibility for your fashion brand. 5 micro influencers (10K–100K) deliver one Reel + two Stories each.',
    tier: 'MICRO',
    niche: NICHE_BY_SLUG.fashion,
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_STORY', qty: 2 },
    ],
    influencerCount: 5,
    price: 75000,
    estReach: 250000,
    estEngagement: 15000,
    isActive: true,
    createdAt: '2026-04-28T10:00:00Z',
  },
  {
    id: 'pkg-3',
    slug: 'fitness-micro-pack',
    title: 'Fitness Launch Pack — 8 Micro Creators',
    description:
      'Built for activewear & supplement brands. 8 fitness micro creators post Reels + UGC photos.',
    tier: 'MICRO',
    niche: NICHE_BY_SLUG.fitness,
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'UGC', qty: 3 },
    ],
    influencerCount: 8,
    price: 120000,
    estReach: 400000,
    estEngagement: 24000,
    isActive: true,
    createdAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'pkg-4',
    slug: 'food-nano-tier3',
    title: 'Tier-3 Food Pack — 20 Nano Creators',
    description:
      'Hit smaller cities where engagement is highest. 20 nano food creators across 6 Tier-2/Tier-3 cities.',
    tier: 'NANO',
    niche: NICHE_BY_SLUG.food,
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_STORY', qty: 2 },
      { type: 'STORE_VISIT', qty: 1 },
    ],
    influencerCount: 20,
    price: 65000,
    estReach: 180000,
    estEngagement: 14000,
    isActive: true,
    createdAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'pkg-5',
    slug: 'tech-macro-pack',
    title: 'Tech Launch — 3 Macro Reviewers',
    description:
      'Hero campaign for tech launches. 3 macro YouTubers (100K+) deliver a full review video plus Shorts.',
    tier: 'MACRO',
    niche: NICHE_BY_SLUG.tech,
    deliverables: [
      { type: 'YT_VIDEO', qty: 1 },
      { type: 'YT_SHORT', qty: 2 },
    ],
    influencerCount: 3,
    price: 350000,
    estReach: 1200000,
    estEngagement: 60000,
    isActive: true,
    createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'pkg-6',
    slug: 'lifestyle-mix',
    title: 'Lifestyle Mix — 12 Creators',
    description:
      'A blended pack of 8 nano + 4 micro lifestyle creators. Great for D2C lifestyle product launches.',
    tier: 'MICRO',
    niche: NICHE_BY_SLUG.lifestyle,
    deliverables: [
      { type: 'IG_REEL', qty: 1 },
      { type: 'IG_POST', qty: 1 },
      { type: 'IG_STORY', qty: 2 },
    ],
    influencerCount: 12,
    price: 95000,
    estReach: 320000,
    estEngagement: 19000,
    isActive: true,
    createdAt: '2026-04-05T10:00:00Z',
  },
];

export const DUMMY_INFLUENCERS = [
  {
    id: 'inf-1',
    user: { id: 'u-1', fullName: 'Aanya Mehta', avatarUrl: null },
    bio: 'Beauty + skincare creator from Mumbai. Honest reviews only.',
    city: 'Mumbai',
    state: 'Maharashtra',
    tier: 'MICRO',
    totalFollowers: 47000,
    avgEngagementRate: 4.7,
    isAvailable: true,
    socialAccounts: [
      { platform: 'INSTAGRAM', handle: 'aanyamehta', followers: 47000, engagementRate: 4.7, profileUrl: '#', isVerified: true },
      { platform: 'YOUTUBE', handle: 'AanyaBeauty', followers: 12000, engagementRate: 2.1, profileUrl: '#', isVerified: true },
    ],
    niches: [{ niche: NICHE_BY_SLUG.beauty }, { niche: NICHE_BY_SLUG.lifestyle }],
    rateCards: [
      { id: 'rc-1', deliverable: 'IG_REEL', price: 8500 },
      { id: 'rc-2', deliverable: 'IG_POST', price: 5000 },
      { id: 'rc-3', deliverable: 'IG_STORY', price: 2000 },
    ],
  },
  {
    id: 'inf-2',
    user: { id: 'u-2', fullName: 'Rohan Iyer', avatarUrl: null },
    bio: 'Lifestyle + tech reviews. Based in Bangalore.',
    city: 'Bangalore',
    state: 'Karnataka',
    tier: 'MICRO',
    totalFollowers: 62000,
    avgEngagementRate: 5.2,
    isAvailable: true,
    socialAccounts: [
      { platform: 'INSTAGRAM', handle: 'rohaniyer', followers: 62000, engagementRate: 5.2, profileUrl: '#', isVerified: true },
    ],
    niches: [{ niche: NICHE_BY_SLUG.lifestyle }, { niche: NICHE_BY_SLUG.tech }],
    rateCards: [
      { id: 'rc-4', deliverable: 'IG_REEL', price: 10000 },
      { id: 'rc-5', deliverable: 'IG_STORY', price: 2500 },
    ],
  },
  {
    id: 'inf-3',
    user: { id: 'u-3', fullName: 'Priya Sharma', avatarUrl: null },
    bio: 'Fitness & nutrition coach. Trained 100+ clients.',
    city: 'Delhi',
    state: 'Delhi',
    tier: 'MACRO',
    totalFollowers: 240000,
    avgEngagementRate: 3.8,
    isAvailable: true,
    socialAccounts: [
      { platform: 'INSTAGRAM', handle: 'priyafit', followers: 240000, engagementRate: 3.8, profileUrl: '#', isVerified: true },
      { platform: 'YOUTUBE', handle: 'PriyaFit', followers: 85000, engagementRate: 2.9, profileUrl: '#', isVerified: true },
    ],
    niches: [{ niche: NICHE_BY_SLUG.fitness }, { niche: NICHE_BY_SLUG.health }],
    rateCards: [
      { id: 'rc-6', deliverable: 'IG_REEL', price: 35000 },
      { id: 'rc-7', deliverable: 'YT_VIDEO', price: 80000 },
    ],
  },
  {
    id: 'inf-4',
    user: { id: 'u-4', fullName: 'Vikram Singh', avatarUrl: null },
    bio: 'Street food explorer. Vlogger across 18 cities.',
    city: 'Indore',
    state: 'Madhya Pradesh',
    tier: 'MICRO',
    totalFollowers: 85000,
    avgEngagementRate: 6.1,
    isAvailable: true,
    socialAccounts: [
      { platform: 'INSTAGRAM', handle: 'vikramfoodie', followers: 85000, engagementRate: 6.1, profileUrl: '#', isVerified: true },
    ],
    niches: [{ niche: NICHE_BY_SLUG.food }, { niche: NICHE_BY_SLUG.travel }],
    rateCards: [
      { id: 'rc-8', deliverable: 'IG_REEL', price: 12000 },
      { id: 'rc-9', deliverable: 'STORE_VISIT', price: 18000 },
    ],
  },
  {
    id: 'inf-5',
    user: { id: 'u-5', fullName: 'Naina Kapoor', avatarUrl: null },
    bio: 'Parenting + kids fashion. Mom of two.',
    city: 'Pune',
    state: 'Maharashtra',
    tier: 'NANO',
    totalFollowers: 8500,
    avgEngagementRate: 7.4,
    isAvailable: true,
    socialAccounts: [
      { platform: 'INSTAGRAM', handle: 'naina_mom', followers: 8500, engagementRate: 7.4, profileUrl: '#', isVerified: true },
    ],
    niches: [{ niche: NICHE_BY_SLUG.parenting }, { niche: NICHE_BY_SLUG.fashion }],
    rateCards: [
      { id: 'rc-10', deliverable: 'IG_REEL', price: 3500 },
      { id: 'rc-11', deliverable: 'IG_POST', price: 2000 },
    ],
  },
  {
    id: 'inf-6',
    user: { id: 'u-6', fullName: 'Karan Desai', avatarUrl: null },
    bio: 'Gaming + tech YouTuber. PC builds, reviews, esports.',
    city: 'Hyderabad',
    state: 'Telangana',
    tier: 'MACRO',
    totalFollowers: 420000,
    avgEngagementRate: 4.5,
    isAvailable: true,
    socialAccounts: [
      { platform: 'YOUTUBE', handle: 'KaranGames', followers: 420000, engagementRate: 4.5, profileUrl: '#', isVerified: true },
      { platform: 'INSTAGRAM', handle: 'karan_games', followers: 120000, engagementRate: 3.2, profileUrl: '#', isVerified: true },
    ],
    niches: [{ niche: NICHE_BY_SLUG.gaming }, { niche: NICHE_BY_SLUG.tech }],
    rateCards: [
      { id: 'rc-12', deliverable: 'YT_VIDEO', price: 120000 },
      { id: 'rc-13', deliverable: 'YT_SHORT', price: 25000 },
    ],
  },
];

export const DUMMY_BRANDS = [
  'NOVA',
  'SUTRA',
  'BLOOM',
  'PLUM',
  'VITA',
  'ZEN',
  'ATLAS',
  'AURA',
  'KAVI',
  'LUMEN',
  'SAGE',
  'OLIVE',
];

export function dummyOrEmpty(value, dummy) {
  if (!value) return dummy;
  if (Array.isArray(value) && value.length === 0) return dummy;
  return value;
}

// =============================================================================
// Demo dashboard data — used in demo mode when the backend isn't running.
// =============================================================================

export const DUMMY_ADMIN_USER = {
  id: 'demo-admin-1',
  email: 'admin@collabcreator.in',
  fullName: 'Riya Verma',
  role: 'ADMIN',
  phone: null,
  avatarUrl: null,
  isActive: true,
  emailVerified: true,
  phoneVerified: false,
  createdAt: '2026-01-01T10:00:00Z',
};

export const DUMMY_PLATFORM_STATS = {
  totalUsers: 1247,
  totalBrands: 184,
  totalCreators: 1063,
  activeCampaigns: 38,
  gmv30d: 4_872_500,
  signupsThisWeek: 47,
  pendingApprovals: 12,
  payoutsQueued: 23,
};

export const DUMMY_ADMIN_USERS_LIST = [
  { id: 'u-a-1', fullName: 'Aanya Mehta', email: 'aanya@example.com', role: 'INFLUENCER', isActive: true, createdAt: '2026-05-10T10:00:00Z' },
  { id: 'u-a-2', fullName: 'Acme Brand', email: 'hello@acme.com', role: 'BRAND', isActive: true, createdAt: '2026-05-09T10:00:00Z' },
  { id: 'u-a-3', fullName: 'Rohan Iyer', email: 'rohan@example.com', role: 'INFLUENCER', isActive: true, createdAt: '2026-05-08T10:00:00Z' },
  { id: 'u-a-4', fullName: 'Bloom Skincare', email: 'team@bloom.com', role: 'BRAND', isActive: true, createdAt: '2026-05-07T10:00:00Z' },
  { id: 'u-a-5', fullName: 'Priya Sharma', email: 'priya@example.com', role: 'INFLUENCER', isActive: true, createdAt: '2026-05-06T10:00:00Z' },
  { id: 'u-a-6', fullName: 'Karan Desai', email: 'karan@example.com', role: 'INFLUENCER', isActive: false, createdAt: '2026-05-05T10:00:00Z' },
];

export const DUMMY_BRAND_USER = {
  id: 'demo-brand-1',
  email: 'demo@brand.com',
  fullName: 'Acme Brand',
  role: 'BRAND',
  phone: '+919812345678',
  avatarUrl: null,
  isActive: true,
  emailVerified: true,
  phoneVerified: true,
  createdAt: '2026-04-01T10:00:00Z',
  brandProfile: {
    id: 'bp-demo',
    userId: 'demo-brand-1',
    companyName: 'Acme Brand',
    website: 'https://acme.example.com',
    industry: 'Beauty & Skincare',
    gstin: '',
    logoUrl: '',
    about: 'A demo brand running influencer campaigns on Collabcreator.',
  },
};

export const DUMMY_INFLUENCER_USER = {
  id: 'demo-inf-1',
  email: 'demo@creator.com',
  fullName: 'Aanya Mehta',
  role: 'INFLUENCER',
  phone: '+919812345679',
  avatarUrl: null,
  isActive: true,
  emailVerified: true,
  phoneVerified: false,
  createdAt: '2026-03-15T10:00:00Z',
  influencerProfile: {
    id: 'inf-demo',
    userId: 'demo-inf-1',
    bio: 'Beauty + skincare creator from Mumbai. Honest reviews only.',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'IN',
    languages: 'en,hi',
    gender: 'female',
    dob: '1996-04-15T00:00:00Z',
    tier: 'MICRO',
    totalFollowers: 59000,
    avgEngagementRate: 4.4,
    isAvailable: true,
    baseRate: 8500,
    upiId: 'demo@upi',
    socialAccounts: [
      {
        id: 'sa-demo-1',
        platform: 'INSTAGRAM',
        handle: 'aanyamehta',
        profileUrl: 'https://instagram.com/aanyamehta',
        followers: 47000,
        following: 320,
        posts: 280,
        avgLikes: 1900,
        avgComments: 60,
        engagementRate: 4.7,
        isVerified: true,
        lastSyncedAt: '2026-05-10T10:00:00Z',
      },
      {
        id: 'sa-demo-2',
        platform: 'YOUTUBE',
        handle: 'AanyaBeauty',
        profileUrl: 'https://youtube.com/@AanyaBeauty',
        followers: 12000,
        posts: 42,
        engagementRate: 2.1,
        isVerified: true,
        lastSyncedAt: '2026-05-10T10:00:00Z',
      },
    ],
    niches: [
      { influencerId: 'inf-demo', nicheId: 'n-1', niche: NICHE_BY_SLUG.beauty },
      { influencerId: 'inf-demo', nicheId: 'n-5', niche: NICHE_BY_SLUG.lifestyle },
    ],
    rateCards: [
      { id: 'rc-demo-1', deliverable: 'IG_REEL', price: 8500 },
      { id: 'rc-demo-2', deliverable: 'IG_POST', price: 5000 },
      { id: 'rc-demo-3', deliverable: 'IG_STORY', price: 2000 },
      { id: 'rc-demo-4', deliverable: 'YT_VIDEO', price: 35000 },
    ],
  },
};

export const DUMMY_ORDERS = [
  {
    id: 'ord-1',
    orderNumber: 'CC-XKLM-A1B2',
    brandUserId: 'demo-brand-1',
    subtotal: 75000,
    tax: 0,
    total: 75000,
    currency: 'INR',
    status: 'IN_PROGRESS',
    paidAt: '2026-05-08T14:30:00Z',
    createdAt: '2026-05-08T14:25:00Z',
    items: [
      {
        id: 'oi-1',
        itemType: 'PACKAGE',
        snapshot: {
          packageTitle: 'Growth Pack — 5 Micro Fashion Influencers',
          deliverables: [
            { type: 'IG_REEL', qty: 1 },
            { type: 'IG_STORY', qty: 2 },
          ],
        },
        price: 75000,
        qty: 1,
      },
    ],
    _count: { campaigns: 1 },
  },
  {
    id: 'ord-2',
    orderNumber: 'CC-WJPM-Z9X8',
    brandUserId: 'demo-brand-1',
    subtotal: 25000,
    tax: 0,
    total: 25000,
    currency: 'INR',
    status: 'COMPLETED',
    paidAt: '2026-04-22T11:10:00Z',
    createdAt: '2026-04-22T11:00:00Z',
    items: [
      {
        id: 'oi-2',
        itemType: 'PACKAGE',
        snapshot: {
          packageTitle: 'Starter Pack — 10 Nano Beauty Creators',
          deliverables: [
            { type: 'IG_REEL', qty: 1 },
            { type: 'IG_STORY', qty: 1 },
          ],
        },
        price: 25000,
        qty: 1,
      },
    ],
    _count: { campaigns: 1 },
  },
];

export const DUMMY_ORDER_DETAIL = {
  ...DUMMY_ORDERS[0],
  escrows: [
    {
      id: 'esc-1',
      amount: 75000,
      status: 'HELD',
      createdAt: '2026-05-08T14:30:00Z',
      releasedAt: null,
    },
  ],
  campaigns: [
    {
      id: 'camp-1',
      title: 'Growth Pack — 5 Micro Fashion Influencers',
      status: 'IN_PROGRESS',
      deliverables: [
        { id: 'd-1', status: 'PAID', deliverable: 'IG_REEL', amountPayable: 8000 },
        { id: 'd-2', status: 'APPROVED', deliverable: 'IG_STORY', amountPayable: 1500 },
        { id: 'd-3', status: 'DRAFT_SUBMITTED', deliverable: 'IG_STORY', amountPayable: 1500 },
      ],
    },
  ],
};

export const DUMMY_CAMPAIGNS_BRAND = [
  {
    id: 'camp-1',
    title: 'Growth Pack — 5 Micro Fashion Influencers',
    status: 'IN_PROGRESS',
    createdAt: '2026-05-08T14:30:00Z',
    order: {
      id: 'ord-1',
      orderNumber: 'CC-XKLM-A1B2',
      total: 75000,
      status: 'IN_PROGRESS',
      paidAt: '2026-05-08T14:30:00Z',
    },
    _count: { deliverables: 15 },
  },
  {
    id: 'camp-2',
    title: 'Starter Pack — 10 Nano Beauty Creators',
    status: 'COMPLETED',
    createdAt: '2026-04-22T11:00:00Z',
    order: {
      id: 'ord-2',
      orderNumber: 'CC-WJPM-Z9X8',
      total: 25000,
      status: 'COMPLETED',
      paidAt: '2026-04-22T11:10:00Z',
    },
    _count: { deliverables: 20 },
  },
];

export const DUMMY_CAMPAIGNS_INFLUENCER = [
  {
    id: 'camp-3',
    title: 'Bloom Skincare — Spring launch',
    status: 'IN_PROGRESS',
    createdAt: '2026-05-05T10:00:00Z',
    order: {
      orderNumber: 'CC-LMNO-P3Q4',
      brand: {
        fullName: 'Bloom',
        brandProfile: { companyName: 'Bloom Skincare', logoUrl: null },
      },
    },
    deliverables: [
      { id: 'd-10', deliverable: 'IG_REEL', status: 'DRAFT_SUBMITTED', amountPayable: 8500 },
      { id: 'd-11', deliverable: 'IG_STORY', status: 'PENDING', amountPayable: 2000 },
    ],
  },
  {
    id: 'camp-4',
    title: 'Sutra Foods — Tier-2 vlog',
    status: 'COMPLETED',
    createdAt: '2026-04-10T10:00:00Z',
    order: {
      orderNumber: 'CC-VWXY-R5S6',
      brand: {
        fullName: 'Sutra',
        brandProfile: { companyName: 'Sutra Foods', logoUrl: null },
      },
    },
    deliverables: [
      { id: 'd-20', deliverable: 'IG_REEL', status: 'PAID', amountPayable: 8500 },
    ],
  },
];

export const DUMMY_CAMPAIGN_DETAIL_BRAND = {
  id: 'camp-1',
  title: 'Growth Pack — 5 Micro Fashion Influencers',
  brief:
    'Spring collection campaign. Natural lighting, warm tones, lifestyle shots. Tag @acmebrand in the first 3 seconds.',
  hashtags: '#acmespring #acmestyle',
  doList: 'Use the brand handle in the first 3 seconds.\nShow the product fit honestly.',
  dontList: "Don't compare to competitor brands.\nAvoid filters that distort fabric color.",
  startDate: '2026-05-10T00:00:00Z',
  endDate: '2026-05-30T00:00:00Z',
  status: 'IN_PROGRESS',
  createdAt: '2026-05-08T14:30:00Z',
  order: {
    id: 'ord-1',
    orderNumber: 'CC-XKLM-A1B2',
    total: 75000,
    status: 'IN_PROGRESS',
    paidAt: '2026-05-08T14:30:00Z',
  },
  deliverables: [
    {
      id: 'd-1',
      deliverable: 'IG_REEL',
      status: 'DRAFT_SUBMITTED',
      amountPayable: 8000,
      draftUrl: 'https://example.com/draft-1',
      qty: 1,
      influencerId: 'inf-2',
      influencer: DUMMY_INFLUENCERS[1],
    },
    {
      id: 'd-2',
      deliverable: 'IG_REEL',
      status: 'POSTED',
      amountPayable: 8000,
      postedUrl: 'https://instagram.com/p/abc123',
      qty: 1,
      influencerId: 'inf-3',
      influencer: DUMMY_INFLUENCERS[2],
    },
    {
      id: 'd-3',
      deliverable: 'IG_STORY',
      status: 'PAID',
      amountPayable: 1500,
      qty: 1,
      influencerId: 'inf-4',
      influencer: DUMMY_INFLUENCERS[3],
    },
  ],
};

export const DUMMY_CAMPAIGN_DETAIL_INFLUENCER = {
  id: 'camp-3',
  title: 'Bloom Skincare — Spring launch',
  brief:
    'Spring skincare routine. 60-second Reel showing the morning routine with our serum + moisturizer.',
  hashtags: '#bloomroutine #springglow',
  doList: 'Mention the brand in the first 5 seconds.\nShow the texture of the product.',
  dontList: "Don't show your own skincare brands in the same video.",
  startDate: '2026-05-10T00:00:00Z',
  endDate: '2026-05-25T00:00:00Z',
  status: 'IN_PROGRESS',
  createdAt: '2026-05-05T10:00:00Z',
  order: {
    orderNumber: 'CC-LMNO-P3Q4',
    brand: {
      fullName: 'Bloom',
      brandProfile: {
        companyName: 'Bloom Skincare',
        logoUrl: null,
        about: 'D2C skincare for sensitive skin.',
      },
    },
  },
  deliverables: [
    {
      id: 'd-10',
      deliverable: 'IG_REEL',
      status: 'DRAFT_SUBMITTED',
      amountPayable: 8500,
      draftUrl: 'https://example.com/draft',
      qty: 1,
      influencerId: 'inf-demo',
    },
    {
      id: 'd-11',
      deliverable: 'IG_STORY',
      status: 'PENDING',
      amountPayable: 2000,
      qty: 1,
      influencerId: 'inf-demo',
    },
  ],
};

export const DUMMY_PAYOUTS = [
  {
    id: 'p-1',
    influencerId: 'inf-demo',
    amount: 8500,
    currency: 'INR',
    status: 'PAID',
    razorpayPayoutId: 'pout_demoXYZ',
    paidAt: '2026-04-22T15:00:00Z',
    createdAt: '2026-04-22T11:30:00Z',
  },
  {
    id: 'p-2',
    influencerId: 'inf-demo',
    amount: 2000,
    currency: 'INR',
    status: 'PENDING',
    razorpayPayoutId: null,
    paidAt: null,
    createdAt: '2026-05-10T09:00:00Z',
  },
  {
    id: 'p-3',
    influencerId: 'inf-demo',
    amount: 5000,
    currency: 'INR',
    status: 'PROCESSING',
    razorpayPayoutId: 'pout_demoABC',
    paidAt: null,
    createdAt: '2026-05-08T10:00:00Z',
  },
];

export const DUMMY_PAYOUT_SUMMARY = {
  total: 15500,
  pending: 7000,
  paid: 8500,
  failed: 0,
  currency: 'INR',
};

export const DUMMY_NOTIFICATIONS = [
  {
    id: 'nt-1',
    type: 'deliverable.draft',
    title: 'New draft to review',
    body: 'A creator submitted a draft for "Growth Pack" campaign.',
    link: '/dashboard/campaigns/camp-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'nt-2',
    type: 'order.paid',
    title: 'Order CC-XKLM-A1B2 confirmed',
    body: 'Payment of ₹75,000 was received. Campaign briefs dispatched.',
    link: '/dashboard/orders/ord-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'nt-3',
    type: 'deliverable.posted',
    title: 'Creator posted live',
    body: '@vikramfoodie marked their Reel as posted.',
    link: '/dashboard/campaigns/camp-1',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
