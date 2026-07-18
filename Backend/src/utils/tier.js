// Followers → Tier mapping. Boundaries are admin-configurable (Platform
// settings → tier_nano_max / tier_micro_max / tier_macro_max); these are the
// defaults when nothing is set.
//   NANO   1        – (nanoMax − 1)     default < 1,000
//   MICRO  nanoMax  – (microMax − 1)    default 1,000 – 99,999
//   MACRO  microMax – (macroMax − 1)    default 100,000 – 999,999
//   MEGA   >= macroMax                  default 1,000,000+
export const DEFAULT_TIER_THRESHOLDS = {
  nanoMax: 1000,
  microMax: 100000,
  macroMax: 1000000,
};

export function computeTier(totalFollowers, thresholds = DEFAULT_TIER_THRESHOLDS) {
  const t = { ...DEFAULT_TIER_THRESHOLDS, ...(thresholds || {}) };
  if (totalFollowers >= t.macroMax) return 'MEGA';
  if (totalFollowers >= t.microMax) return 'MACRO';
  if (totalFollowers >= t.nanoMax) return 'MICRO';
  if (totalFollowers >= 1) return 'NANO';
  return null;
}
