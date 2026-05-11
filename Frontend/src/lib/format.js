export function formatINR(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCount(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(num));
}

export const TIER_LABEL = {
  NANO: 'Nano · 1K–10K',
  MICRO: 'Micro · 10K–100K',
  MACRO: 'Macro · 100K–1M',
  MEGA: 'Mega · 1M+',
};

export const DELIVERABLE_LABEL = {
  IG_POST: 'Instagram Post',
  IG_REEL: 'Instagram Reel',
  IG_STORY: 'Instagram Story',
  IG_CAROUSEL: 'Instagram Carousel',
  YT_VIDEO: 'YouTube Video',
  YT_SHORT: 'YouTube Short',
  UGC: 'UGC Content',
  STORE_VISIT: 'Store Visit',
  BLOG: 'Blog Post',
};

export const PLATFORM_LABEL = {
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  X: 'X (Twitter)',
  FACEBOOK: 'Facebook',
};
