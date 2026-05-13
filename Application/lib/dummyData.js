// Demo dataset — same shape as the web Frontend so screens render identically
// without the backend. Replace with real API calls when wiring auth + data.

export const DUMMY_USERS = {
  brand: {
    id: 'u_brand_1',
    email: 'brand@demo.in',
    fullName: 'Aanya Mehta',
    role: 'BRAND',
    brandProfile: { companyName: 'Bloom Skincare', industry: 'Beauty' },
  },
  creator: {
    id: 'u_creator_1',
    email: 'creator@demo.in',
    fullName: 'Rohan Iyer',
    role: 'INFLUENCER',
    influencerProfile: {
      totalFollowers: 48000,
      avgEngagementRate: 5.2,
      tier: 'MICRO',
      city: 'Mumbai',
    },
  },
};

export const DUMMY_CAMPAIGNS_BRAND = [
  {
    id: 'c_1',
    title: 'Bloom Q1 launch',
    status: 'IN_PROGRESS',
    order: { orderNumber: 'CH-1042' },
    deliverables: new Array(12),
  },
  {
    id: 'c_2',
    title: 'Summer skincare push',
    status: 'BRIEF_SENT',
    order: { orderNumber: 'CH-1051' },
    deliverables: new Array(8),
  },
  {
    id: 'c_3',
    title: 'Mother\'s Day collab',
    status: 'COMPLETED',
    order: { orderNumber: 'CH-1037' },
    deliverables: new Array(6),
  },
];

export const DUMMY_CAMPAIGNS_INFLUENCER = [
  {
    id: 'c_5',
    title: 'GoodFit apparel — winter line',
    status: 'IN_PROGRESS',
    order: { brand: { brandProfile: { companyName: 'GoodFit' } } },
    deliverables: new Array(3),
  },
  {
    id: 'c_6',
    title: 'Cafe Hopper city tour',
    status: 'BRIEF_SENT',
    order: { brand: { brandProfile: { companyName: 'Cafe Hopper' } } },
    deliverables: new Array(2),
  },
];

export const DUMMY_ORDERS = [
  { id: 'o_1', orderNumber: 'CH-1042', total: 145000, status: 'IN_PROGRESS' },
  { id: 'o_2', orderNumber: 'CH-1037', total: 65000, status: 'COMPLETED' },
  { id: 'o_3', orderNumber: 'CH-1051', total: 240000, status: 'PAID' },
];

export const DUMMY_PAYOUTS = [
  { id: 'p_1', amount: 12000, status: 'PAID',    createdAt: '2026-04-22' },
  { id: 'p_2', amount: 8500,  status: 'PAID',    createdAt: '2026-04-10' },
  { id: 'p_3', amount: 6000,  status: 'PENDING', createdAt: '2026-05-01' },
];

export const DUMMY_PAYOUT_SUMMARY = { paid: 65000, pending: 18500, total: 83500 };

export const DUMMY_NOTIFICATIONS = [
  { id: 'n_1', title: 'Draft submitted', body: 'Rohan posted a draft for Bloom Q1.', unread: true },
  { id: 'n_2', title: 'Payment released', body: 'Order CH-1037 closed. ₹65,000 settled.', unread: true },
  { id: 'n_3', title: 'New brief', body: 'GoodFit sent a brief for winter line.', unread: false },
];
