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
