// Number / currency helpers — same conventions as the web Frontend so
// values render identically across web and mobile.

export function formatINR(amount) {
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCount(n) {
  const v = Number(n ?? 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

export const TIER_LABEL = {
  NANO: 'Nano',
  MICRO: 'Micro',
  MACRO: 'Macro',
  MEGA: 'Mega',
};

// Format an ISO date string as "12 May 2026". Returns '' for empty input.
export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Human labels for the backend DeliverableType enum.
export const DELIVERABLE_LABEL = {
  IG_POST: 'Instagram post',
  IG_REEL: 'Instagram reel',
  IG_STORY: 'Instagram story',
  IG_CAROUSEL: 'Instagram carousel',
  YT_VIDEO: 'YouTube video',
  YT_SHORT: 'YouTube short',
  UGC: 'UGC',
  STORE_VISIT: 'Store visit',
  BLOG: 'Blog',
  UTM_LINK: 'UTM link',
  VIDEO_DRIVE_LINK: 'Video drive link',
  PERFORMANCE_REPORT: 'Performance report',
};

// Badge label + variant for the backend DeliverableStatus enum.
export const DELIVERABLE_STATUS_META = {
  PENDING: { label: 'Pending', variant: 'default' },
  DRAFT_SUBMITTED: { label: 'Draft in review', variant: 'warning' },
  REVISION_REQUESTED: { label: 'Revision requested', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'info' },
  POSTED: { label: 'Posted', variant: 'info' },
  PAID: { label: 'Paid', variant: 'success' },
};

// Deliverable types a creator can price on their rate card (excludes the
// platform-only pack artifacts like UTM_LINK / PERFORMANCE_REPORT).
export const RATE_CARD_DELIVERABLES = [
  'IG_POST',
  'IG_REEL',
  'IG_STORY',
  'IG_CAROUSEL',
  'YT_VIDEO',
  'YT_SHORT',
  'UGC',
];
