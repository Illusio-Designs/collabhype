// Demo dataset — same shape as the web Frontend so screens render identically
// without the backend. Replace with real API calls when wiring auth + data.

export const DUMMY_USERS = {
  brand: {
    id: 'u_brand_1',
    email: 'brand@demo.in',
    fullName: 'Aanya Mehta',
    role: 'BRAND',
    brandProfile: {
      companyName: 'Bloom Skincare',
      industry: 'Beauty & Skincare',
      website: 'https://bloomskincare.in',
      gstin: '24AAAAA0000A1Z5',
      city: 'Mumbai',
    },
  },
  creator: {
    id: 'u_creator_1',
    email: 'creator@demo.in',
    fullName: 'Rohan Iyer',
    role: 'INFLUENCER',
    influencerProfile: {
      bio: 'Lifestyle + tech reviews. Honest takes, no scripts.',
      totalFollowers: 48000,
      avgEngagementRate: 5.2,
      tier: 'MICRO',
      city: 'Mumbai',
      isAvailable: true,
    },
  },
};

// ---------- Campaigns ----------

export const DUMMY_DELIVERABLES = [
  { id: 'd_1', type: 'INSTAGRAM_REEL',  status: 'POSTED',    creator: 'Aanya M', dueAt: '2026-05-04' },
  { id: 'd_2', type: 'INSTAGRAM_STORY', status: 'APPROVED',  creator: 'Aanya M', dueAt: '2026-05-06' },
  { id: 'd_3', type: 'YOUTUBE_SHORT',   status: 'REVIEW',    creator: 'Rohan I', dueAt: '2026-05-10' },
  { id: 'd_4', type: 'INSTAGRAM_REEL',  status: 'DRAFT',     creator: 'Naina K', dueAt: '2026-05-12' },
];

export const DUMMY_CAMPAIGNS_BRAND = [
  {
    id: 'c_1',
    title: 'Bloom Q1 launch',
    brief: 'Position the new vitamin-C serum to skincare-conscious 22-35y women. 12 deliverables across 3 creators. Use hashtag #BloomGlow.',
    status: 'IN_PROGRESS',
    order: { orderNumber: 'CH-1042', total: 145000 },
    deliverables: DUMMY_DELIVERABLES.slice(0, 4),
    createdAt: '2026-04-21',
  },
  {
    id: 'c_2',
    title: 'Summer skincare push',
    brief: 'Pre-launch hype for our SPF range. 8 stories + 2 reels.',
    status: 'BRIEF_SENT',
    order: { orderNumber: 'CH-1051', total: 240000 },
    deliverables: DUMMY_DELIVERABLES.slice(0, 2),
    createdAt: '2026-05-02',
  },
  {
    id: 'c_3',
    title: "Mother's Day collab",
    brief: 'Gifting-focused campaign with 6 micro creators.',
    status: 'COMPLETED',
    order: { orderNumber: 'CH-1037', total: 65000 },
    deliverables: DUMMY_DELIVERABLES.slice(0, 3),
    createdAt: '2026-04-12',
  },
];

export const DUMMY_CAMPAIGNS_INFLUENCER = [
  {
    id: 'c_5',
    title: 'GoodFit apparel — winter line',
    brief: 'Showcase the new fleece collection. 1 reel + 2 stories. Honest review tone — don\'t over-sell.',
    status: 'IN_PROGRESS',
    order: { brand: { brandProfile: { companyName: 'GoodFit' } } },
    deliverables: [
      { id: 'd_a', type: 'INSTAGRAM_REEL',  status: 'APPROVED', dueAt: '2026-05-15' },
      { id: 'd_b', type: 'INSTAGRAM_STORY', status: 'REVIEW',   dueAt: '2026-05-16' },
      { id: 'd_c', type: 'INSTAGRAM_STORY', status: 'DRAFT',    dueAt: '2026-05-18' },
    ],
    createdAt: '2026-04-29',
  },
  {
    id: 'c_6',
    title: 'Cafe Hopper city tour',
    brief: 'Visit 3 cafes, post a reel + story each. We\'ll cover transport + tabs.',
    status: 'BRIEF_SENT',
    order: { brand: { brandProfile: { companyName: 'Cafe Hopper' } } },
    deliverables: [
      { id: 'd_d', type: 'INSTAGRAM_REEL',  status: 'DRAFT', dueAt: '2026-05-20' },
      { id: 'd_e', type: 'INSTAGRAM_STORY', status: 'DRAFT', dueAt: '2026-05-22' },
    ],
    createdAt: '2026-05-05',
  },
];

// ---------- Orders ----------

export const DUMMY_ORDERS = [
  {
    id: 'o_1',
    orderNumber: 'CH-1042',
    total: 145000,
    status: 'IN_PROGRESS',
    placedAt: '2026-04-21',
    itemCount: 3,
    items: [
      { id: 'oi_1', title: 'Micro pack ×3 — Beauty', qty: 1, price: 95000 },
      { id: 'oi_2', title: 'Add-on UTM tracking',     qty: 1, price: 5000  },
      { id: 'oi_3', title: 'Aanya Mehta · Reel + Story', qty: 1, price: 45000 },
    ],
  },
  {
    id: 'o_2',
    orderNumber: 'CH-1037',
    total: 65000,
    status: 'COMPLETED',
    placedAt: '2026-04-09',
    itemCount: 1,
    items: [{ id: 'oi_4', title: 'Nano starter pack ×10', qty: 1, price: 65000 }],
  },
  {
    id: 'o_3',
    orderNumber: 'CH-1051',
    total: 240000,
    status: 'PAID',
    placedAt: '2026-05-02',
    itemCount: 2,
    items: [
      { id: 'oi_5', title: 'Macro pack ×2 — Fashion',  qty: 1, price: 220000 },
      { id: 'oi_6', title: 'Performance report',       qty: 1, price: 20000  },
    ],
  },
];

// ---------- Payouts ----------

export const DUMMY_PAYOUTS = [
  { id: 'p_1', amount: 12000, status: 'PAID',    method: 'UPI', utr: 'UTR4239021', createdAt: '2026-04-22' },
  { id: 'p_2', amount: 8500,  status: 'PAID',    method: 'UPI', utr: 'UTR4181244', createdAt: '2026-04-10' },
  { id: 'p_3', amount: 6000,  status: 'PROCESSING', method: 'UPI', createdAt: '2026-05-01' },
  { id: 'p_4', amount: 18000, status: 'PENDING', method: 'UPI', createdAt: '2026-05-03' },
];

export const DUMMY_PAYOUT_SUMMARY = { paid: 65000, pending: 24000, total: 89000 };

// ---------- Notifications ----------

export const DUMMY_NOTIFICATIONS = [
  { id: 'n_1', title: 'Draft submitted', body: 'Rohan posted a draft for Bloom Q1 — review it.', unread: true,  createdAt: '2026-05-12 14:02' },
  { id: 'n_2', title: 'Payment released', body: 'Order CH-1037 closed. ₹65,000 settled.',         unread: true,  createdAt: '2026-05-11 09:11' },
  { id: 'n_3', title: 'New brief',        body: 'GoodFit sent a brief for the winter line.',     unread: false, createdAt: '2026-05-09 18:34' },
  { id: 'n_4', title: 'Profile incomplete', body: 'Add your rate card to be listed.',            unread: false, createdAt: '2026-05-04 11:00' },
];

// ---------- Packages (brand browse) ----------

export const DUMMY_PACKAGES = [
  {
    id: 'pk_1', slug: 'nano-starter-10',
    title: 'Nano Starter ×10', tier: 'NANO',
    price: 65000, influencerCount: 10,
    description: '10 nano creators, 1 reel + 2 stories each. Best for awareness.',
  },
  {
    id: 'pk_2', slug: 'micro-pack-3-beauty',
    title: 'Micro Beauty ×3', tier: 'MICRO',
    price: 145000, influencerCount: 3,
    description: '3 micro creators in beauty. Higher engagement, niche-aligned.',
  },
  {
    id: 'pk_3', slug: 'macro-pack-2-fashion',
    title: 'Macro Fashion ×2', tier: 'MACRO',
    price: 240000, influencerCount: 2,
    description: '2 macro creators in fashion. Hero campaign reach.',
  },
];

// ---------- Influencers (brand browse) ----------

export const DUMMY_INFLUENCERS = [
  {
    id: 'inf_1', user: { fullName: 'Aanya Mehta' },
    tier: 'MICRO', totalFollowers: 87000, avgEngagementRate: 5.8,
    city: 'Mumbai', niches: ['Beauty', 'Lifestyle'],
  },
  {
    id: 'inf_2', user: { fullName: 'Rohan Iyer' },
    tier: 'MICRO', totalFollowers: 48000, avgEngagementRate: 5.2,
    city: 'Mumbai', niches: ['Tech', 'Lifestyle'],
  },
  {
    id: 'inf_3', user: { fullName: 'Vikram Sharma' },
    tier: 'MACRO', totalFollowers: 320000, avgEngagementRate: 3.4,
    city: 'Delhi', niches: ['Fitness', 'Wellness'],
  },
  {
    id: 'inf_4', user: { fullName: 'Naina Kapoor' },
    tier: 'NANO', totalFollowers: 7600, avgEngagementRate: 7.1,
    city: 'Indore', niches: ['Food', 'Travel'],
  },
];

// ---------- Rate-card deliverables (creator) ----------

export const DELIVERABLE_LABEL = {
  INSTAGRAM_POST:   'Instagram post',
  INSTAGRAM_REEL:   'Instagram reel',
  INSTAGRAM_STORY:  'Instagram story',
  YOUTUBE_SHORT:    'YouTube short',
  YOUTUBE_LONG:     'YouTube long-form',
  YOUTUBE_INTEGRATION: 'YouTube integration',
};

export const DUMMY_RATES = [
  { deliverable: 'INSTAGRAM_REEL',  price: 18000, active: true  },
  { deliverable: 'INSTAGRAM_STORY', price: 4000,  active: true  },
  { deliverable: 'INSTAGRAM_POST',  price: 9000,  active: true  },
  { deliverable: 'YOUTUBE_SHORT',   price: 12000, active: false },
  { deliverable: 'YOUTUBE_LONG',    price: 45000, active: false },
];

// ---------- Connected socials (creator) ----------

export const DUMMY_SOCIALS = [
  { platform: 'INSTAGRAM', handle: 'rohan.iyer',   followers: 42000, engagementRate: 5.4, connected: true  },
  { platform: 'YOUTUBE',   handle: 'RohanIyer',     followers: 6000,  engagementRate: 2.7, connected: true  },
];

// ---------- Support tickets ----------

export const DUMMY_TICKETS = [
  { id: 't_1', subject: 'Payment delayed by 3 days', status: 'IN_PROGRESS', category: 'PAYMENT', createdAt: '2026-05-08' },
  { id: 't_2', subject: 'Creator didn\'t deliver on time', status: 'OPEN',  category: 'DISPUTE', createdAt: '2026-05-10' },
];

// ---------- Deliverable status meta ----------

export const DELIVERABLE_STATUS_META = {
  DRAFT:    { label: 'Draft',    variant: 'default' },
  REVIEW:   { label: 'In review', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'info' },
  POSTED:   { label: 'Posted',   variant: 'success' },
  REVISION: { label: 'Revision', variant: 'warning' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};
