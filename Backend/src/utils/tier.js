// Followers → Tier mapping (Creasip-style)
//   NANO   1     – 9,999
//   MICRO  10K   – 99,999
//   MACRO  100K  – 999,999
//   MEGA   1M+
export function computeTier(totalFollowers) {
  if (totalFollowers >= 1_000_000) return 'MEGA';
  if (totalFollowers >= 100_000) return 'MACRO';
  if (totalFollowers >= 10_000) return 'MICRO';
  if (totalFollowers >= 1) return 'NANO';
  return null;
}
