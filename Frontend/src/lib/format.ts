import {
  PLATFORM_BRAND_FEE_RATE,
  PLATFORM_CREATOR_COMMISSION_RATE,
  type Deliverable,
  type Platform,
  type Tier,
} from './types';

// Brand pays this for a creator's listed rate (rate + 5% markup).
export function brandPriceFromCreatorRate(rate: number | string): number {
  return Number(rate) * (1 + PLATFORM_BRAND_FEE_RATE);
}

// Creator receives this from their listed rate (rate − 10% commission).
export function creatorPayoutFromRate(rate: number | string): number {
  return Number(rate) * (1 - PLATFORM_CREATOR_COMMISSION_RATE);
}

export function formatINR(amount: number | string | null | undefined): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCount(n: number | string | null | undefined): string {
  const num = Number(n);
  if (Number.isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(num));
}

export const TIER_LABEL: Record<Tier, string> = {
  NANO: 'Nano · 1K–10K',
  MICRO: 'Micro · 10K–100K',
  MACRO: 'Macro · 100K–1M',
  MEGA: 'Mega · 1M+',
};

export const DELIVERABLE_LABEL: Record<Deliverable, string> = {
  IG_POST: 'Instagram Post',
  IG_REEL: 'Reel (Tag/Collab)',
  IG_STORY: 'Story',
  IG_CAROUSEL: 'Instagram Carousel',
  YT_VIDEO: 'YouTube Video',
  YT_SHORT: 'YouTube Short',
  UGC: 'UGC Content',
  STORE_VISIT: 'Store Visit',
  BLOG: 'Blog Post',
  UTM_LINK: 'UTM Link',
  VIDEO_DRIVE_LINK: 'Video Drive Link',
  PERFORMANCE_REPORT: 'Performance Report',
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  X: 'X (Twitter)',
  FACEBOOK: 'Facebook',
};
