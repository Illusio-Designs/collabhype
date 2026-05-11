import { prisma } from '../../lib/prisma.js';

// Upwork-style ladder. Thresholds picked to be reachable without being a
// gimmick — tune these once we have real production data.
//
//   RISING_TALENT  : has shipped something, hasn't built a track record yet
//   TOP_RATED      : reliably ships clean work and replies fast
//   TOP_RATED_PLUS : TOP_RATED + significant revenue
//   EXPERT_VETTED  : admin-set only — never auto-assigned
//
// successRate is the % of deliverables approved without revision.
// responseRate / avgRating are placeholders until we ship reviews + messaging.
const RULES = [
  {
    badge: 'TOP_RATED_PLUS',
    test: (s) =>
      s.successfulDeliverables >= 50 &&
      s.successRate >= 95 &&
      s.responseRate >= 90 &&
      Number(s.totalEarnings) >= 500_000,
  },
  {
    badge: 'TOP_RATED',
    test: (s) =>
      s.successfulDeliverables >= 15 &&
      s.successRate >= 90 &&
      s.responseRate >= 85 &&
      Number(s.totalEarnings) >= 50_000,
  },
  {
    badge: 'RISING_TALENT',
    test: (s) =>
      s.successfulDeliverables >= 2 &&
      s.successRate >= 80 &&
      s.responseRate >= 70,
  },
];

function calcSuccessRate(profile) {
  const total = profile.successfulDeliverables + profile.failedDeliverables;
  if (!total) return profile.successRate ?? 0;
  // Each revision dings the score: a delivery that took 1 revision = 0.5,
  // 2 revisions = 0, capped at 0.
  const revisionPenalty = Math.min(
    profile.revisionsRequested * 0.5,
    profile.successfulDeliverables,
  );
  const clean = Math.max(0, profile.successfulDeliverables - revisionPenalty);
  return Math.round((clean / total) * 100);
}

export async function recomputeBadgeForInfluencer(influencerId) {
  const profile = await prisma.influencerProfile.findUnique({
    where: { id: influencerId },
  });
  if (!profile) return null;

  // EXPERT_VETTED is admin-only — never auto-changed.
  if (profile.badge === 'EXPERT_VETTED') return profile;

  const stats = {
    successfulDeliverables: profile.successfulDeliverables,
    failedDeliverables: profile.failedDeliverables,
    revisionsRequested: profile.revisionsRequested,
    totalEarnings: profile.totalEarnings,
    successRate: calcSuccessRate(profile),
    responseRate: profile.responseRate,
  };

  let nextBadge = 'NONE';
  for (const rule of RULES) {
    if (rule.test(stats)) {
      nextBadge = rule.badge;
      break;
    }
  }

  if (nextBadge === profile.badge && stats.successRate === profile.successRate) {
    return profile;
  }

  return prisma.influencerProfile.update({
    where: { id: influencerId },
    data: { badge: nextBadge, successRate: stats.successRate },
  });
}

// Admin bulk recompute (e.g. nightly cron / one-off CLI).
export async function recomputeAllBadges() {
  const ids = await prisma.influencerProfile.findMany({
    where: { badge: { not: 'EXPERT_VETTED' } },
    select: { id: true },
  });
  let updated = 0;
  for (const { id } of ids) {
    await recomputeBadgeForInfluencer(id);
    updated += 1;
  }
  return { processed: updated };
}

// Admin-only: set EXPERT_VETTED (or any badge) manually.
export async function setBadgeManual(influencerId, badge) {
  return prisma.influencerProfile.update({
    where: { id: influencerId },
    data: { badge },
  });
}
