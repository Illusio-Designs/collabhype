// Shared domain types for the Collabhype frontend. These mirror the shapes
// returned by the backend API and the in-app dummy data.

// =============================================================================
// Platform fee constants
// -----------------------------------------------------------------------------
// Collabhype's 15% take splits as:
//   - 5% markup added to the brand bill
//   - 10% commission deducted from the creator's payout
// These apply only to hand-picked (Micro/Macro/Mega) cart items. Nano packs are
// flat-priced — the platform margin is already baked into the pack price.
// =============================================================================
export const PLATFORM_BRAND_FEE_RATE = 0.05;
export const PLATFORM_CREATOR_COMMISSION_RATE = 0.10;

export type Role = 'BRAND' | 'INFLUENCER' | 'ADMIN';
export type Tier = 'NANO' | 'MICRO' | 'MACRO' | 'MEGA';
export type Platform = 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'X' | 'FACEBOOK';

// Upwork-style creator badges, auto-derived (except EXPERT_VETTED which is
// admin-assigned). Default NONE.
export type CreatorBadge =
  | 'NONE'
  | 'RISING_TALENT'
  | 'TOP_RATED'
  | 'TOP_RATED_PLUS'
  | 'EXPERT_VETTED';
export type Deliverable =
  | 'IG_POST'
  | 'IG_REEL'
  | 'IG_STORY'
  | 'IG_CAROUSEL'
  | 'YT_VIDEO'
  | 'YT_SHORT'
  | 'UGC'
  | 'STORE_VISIT'
  | 'BLOG'
  | 'UTM_LINK'
  | 'VIDEO_DRIVE_LINK'
  | 'PERFORMANCE_REPORT';

export interface Niche {
  id: string;
  slug: string;
  name: string;
}

export interface DeliverableSpec {
  type: Deliverable;
  qty: number;
}

export interface Package {
  id: string;
  slug: string;
  packName: string;                // e.g. "Starter Pack", "Growth Plan"
  title: string;
  description: string;
  subtitle?: string;               // e.g. "Best for micro-campaigns."
  tier: Tier;
  niche?: Niche;
  deliverables: DeliverableSpec[];
  influencerCount: number;
  price: number;                   // total brand pays
  mrp?: number;                    // strike-through "₹500"
  pricePerInfluencer?: number;     // "₹400" big number on the card
  benefits?: string[];             // ["Content Rights"]
  isMostPopular?: boolean;
  estReach: number;
  estEngagement: number;
  isActive: boolean;
  createdAt: string;
}

export interface SocialAccount {
  id?: string;
  platform: Platform;
  handle: string;
  profileUrl?: string;
  followers: number;
  following?: number;
  posts?: number;
  avgLikes?: number;
  avgComments?: number;
  engagementRate: number;
  isVerified?: boolean;
  lastSyncedAt?: string;
}

export interface RateCard {
  id: string;
  deliverable: Deliverable;
  price: number;
}

export interface InfluencerNiche {
  influencerId?: string;
  nicheId?: string;
  niche: Niche;
}

export interface InfluencerProfile {
  id: string;
  userId?: string;
  bio: string;
  city: string;
  state: string;
  country?: string;
  languages?: string;
  gender?: string;
  dob?: string;
  tier: Tier;
  totalFollowers: number;
  avgEngagementRate: number;
  isAvailable: boolean;
  baseRate?: number;
  upiId?: string;
  socialAccounts: SocialAccount[];
  niches: InfluencerNiche[];
  rateCards: RateCard[];
}

export interface Influencer {
  id: string;
  user: { id: string; fullName: string; avatarUrl: string | null };
  bio: string;
  city: string;
  state: string;
  tier: Tier;
  totalFollowers: number;
  avgEngagementRate: number;
  isAvailable: boolean;
  socialAccounts: SocialAccount[];
  niches: InfluencerNiche[];
  rateCards: RateCard[];
  badge?: CreatorBadge;
  completedCampaigns?: number;
  successRate?: number;          // 0..100
  responseRate?: number;         // 0..100
  avgRating?: number;            // 0..5
  totalEarnings?: number;
}

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  website: string;
  industry: string;
  gstin: string;
  logoUrl: string;
  about: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  brandProfile?: BrandProfile;
  influencerProfile?: InfluencerProfile;
}

export interface OrderItemSnapshot {
  packageTitle: string;
  deliverables: DeliverableSpec[];
}

export interface OrderItem {
  id: string;
  itemType: 'PACKAGE' | 'INFLUENCER';
  snapshot: OrderItemSnapshot;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  brandUserId: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
  _count?: { campaigns: number };
}

export interface CampaignDeliverable {
  id: string;
  deliverable: Deliverable;
  status:
    | 'PENDING'
    | 'DRAFT_SUBMITTED'
    | 'APPROVED'
    | 'POSTED'
    | 'PAID'
    | 'DRAFT';
  amountPayable: number;
  draftUrl?: string;
  postedUrl?: string;
  qty?: number;
  influencerId?: string;
  influencer?: Influencer;
}

export interface Campaign {
  id: string;
  title: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  brief?: string;
  hashtags?: string;
  doList?: string;
  dontList?: string;
  startDate?: string;
  endDate?: string;
  order?: Partial<Order> & { brand?: { fullName: string; brandProfile?: Partial<BrandProfile> } };
  deliverables?: CampaignDeliverable[];
  _count?: { deliverables: number };
}

export interface Payout {
  id: string;
  influencerId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  razorpayPayoutId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PayoutSummary {
  total: number;
  pending: number;
  paid: number;
  failed: number;
  currency: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export type SupportCategory =
  | 'DISPUTE'
  | 'PAYOUT'
  | 'BILLING'
  | 'CAMPAIGN'
  | 'TECHNICAL'
  | 'OTHER';

export type SupportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type SupportStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'AWAITING_USER'
  | 'RESOLVED'
  | 'CLOSED';

export interface SupportMessage {
  id: string;
  ticketId: string;
  authorId: string | null;
  authorRole: Role;
  body: string;
  attachmentUrl?: string | null;
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
    role: Role;
    avatarUrl: string | null;
  } | null;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  orderId?: string | null;
  campaignId?: string | null;
  deliverableId?: string | null;
  resolution?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; fullName: string; email: string; role: Role; avatarUrl: string | null };
  assignedTo?: { id: string; fullName: string; email: string } | null;
  order?: { id: string; orderNumber: string; total: number; status: string } | null;
  campaign?: { id: string; title: string; status: string } | null;
  deliverable?: { id: string; deliverable: string; status: string; amountPayable: number } | null;
  messages?: SupportMessage[];
  _count?: { messages: number };
}

export interface PlatformStats {
  totalUsers: number;
  totalBrands: number;
  totalCreators: number;
  activeCampaigns: number;
  gmv30d: number;
  signupsThisWeek: number;
  pendingApprovals: number;
  payoutsQueued: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
