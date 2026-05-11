import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { recomputeBadgeForInfluencer } from '../influencer/badge.service.js';

// --- listing ---

export async function listForBrand(userId, { status, page, limit }) {
  const where = { order: { brandUserId: userId } };
  if (status) where.status = status;
  const [total, items] = await prisma.$transaction([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      include: {
        order: {
          select: { id: true, orderNumber: true, total: true, status: true, paidAt: true },
        },
        _count: { select: { deliverables: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

export async function listForInfluencer(userId, { status, page, limit }) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');

  const where = { deliverables: { some: { influencerId: profile.id } } };
  if (status) where.status = status;

  const [total, items] = await prisma.$transaction([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            brand: {
              select: {
                fullName: true,
                brandProfile: { select: { companyName: true, logoUrl: true } },
              },
            },
          },
        },
        deliverables: { where: { influencerId: profile.id } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total };
}

export async function getForBrand(userId, campaignId) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, order: { brandUserId: userId } },
    include: {
      order: { select: { id: true, orderNumber: true, total: true, status: true, paidAt: true } },
      deliverables: {
        include: {
          influencer: {
            include: {
              user: { select: { id: true, fullName: true, avatarUrl: true } },
              socialAccounts: {
                select: { platform: true, handle: true, profileUrl: true, followers: true },
              },
            },
          },
        },
      },
    },
  });
  if (!campaign) throw ApiError.notFound('Campaign not found');
  return campaign;
}

export async function getForInfluencer(userId, campaignId) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Profile not found');

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, deliverables: { some: { influencerId: profile.id } } },
    include: {
      order: {
        select: {
          orderNumber: true,
          brand: {
            select: {
              fullName: true,
              brandProfile: { select: { companyName: true, logoUrl: true, about: true } },
            },
          },
        },
      },
      deliverables: { where: { influencerId: profile.id } },
    },
  });
  if (!campaign) throw ApiError.notFound('Campaign not found');
  return campaign;
}

export async function updateBrief(userId, campaignId, data) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, order: { brandUserId: userId } },
  });
  if (!campaign) throw ApiError.notFound('Campaign not found');
  if (['COMPLETED', 'CANCELLED'].includes(campaign.status)) {
    throw ApiError.badRequest('Campaign is closed');
  }
  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
}

// --- deliverable lookups (ownership-checked) ---

async function findDeliverableForInfluencer(userId, delivId) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Profile not found');
  const d = await prisma.campaignDeliverable.findFirst({
    where: { id: delivId, influencerId: profile.id },
    include: { campaign: true },
  });
  if (!d) throw ApiError.notFound('Deliverable not found');
  return d;
}

async function findDeliverableForBrand(userId, delivId) {
  const d = await prisma.campaignDeliverable.findFirst({
    where: { id: delivId, campaign: { order: { brandUserId: userId } } },
    include: { campaign: { include: { order: true } } },
  });
  if (!d) throw ApiError.notFound('Deliverable not found');
  return d;
}

// --- transitions ---

export async function submitDraft(userId, delivId, draftUrl) {
  const d = await findDeliverableForInfluencer(userId, delivId);
  if (!['PENDING', 'REVISION_REQUESTED'].includes(d.status)) {
    throw ApiError.badRequest(`Cannot submit draft from ${d.status}`);
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.campaignDeliverable.update({
      where: { id: delivId },
      data: { status: 'DRAFT_SUBMITTED', draftUrl, feedback: null },
    });
    await recomputeCampaignStatus(d.campaignId, tx);
    const brandUserId = await getCampaignBrandUserId(d.campaignId, tx);
    if (brandUserId) {
      await tx.notification.create({
        data: {
          userId: brandUserId,
          type: 'deliverable.draft',
          title: 'Draft submitted',
          body: 'An influencer submitted a draft for your approval.',
          link: `/dashboard/campaigns/${d.campaignId}`,
        },
      });
    }
    return updated;
  });
}

export async function approveDraft(userId, delivId) {
  const d = await findDeliverableForBrand(userId, delivId);
  if (d.status !== 'DRAFT_SUBMITTED') {
    throw ApiError.badRequest(`Cannot approve from ${d.status}`);
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.campaignDeliverable.update({
      where: { id: delivId },
      data: { status: 'APPROVED' },
    });
    await recomputeCampaignStatus(d.campaignId, tx);
    const infUserId = await getInfluencerUserId(d.influencerId, tx);
    if (infUserId) {
      await tx.notification.create({
        data: {
          userId: infUserId,
          type: 'deliverable.approved',
          title: 'Draft approved',
          body: 'Your draft was approved — go ahead and post it.',
          link: `/dashboard/campaigns/${d.campaignId}`,
        },
      });
    }
    return updated;
  });
}

export async function requestRevision(userId, delivId, feedback) {
  const d = await findDeliverableForBrand(userId, delivId);
  if (d.status !== 'DRAFT_SUBMITTED') {
    throw ApiError.badRequest(`Cannot request revision from ${d.status}`);
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.campaignDeliverable.update({
      where: { id: delivId },
      data: { status: 'REVISION_REQUESTED', feedback },
    });
    await tx.influencerProfile.update({
      where: { id: d.influencerId },
      data: { revisionsRequested: { increment: 1 } },
    });
    await recomputeCampaignStatus(d.campaignId, tx);
    const infUserId = await getInfluencerUserId(d.influencerId, tx);
    if (infUserId) {
      await tx.notification.create({
        data: {
          userId: infUserId,
          type: 'deliverable.revision',
          title: 'Revision requested',
          body: 'The brand has requested changes to your draft.',
          link: `/dashboard/campaigns/${d.campaignId}`,
        },
      });
    }
    return updated;
  });
}

export async function markPosted(userId, delivId, postedUrl) {
  const d = await findDeliverableForInfluencer(userId, delivId);
  if (d.status !== 'APPROVED') {
    throw ApiError.badRequest(`Cannot mark posted from ${d.status}`);
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.campaignDeliverable.update({
      where: { id: delivId },
      data: { status: 'POSTED', postedUrl },
    });
    await recomputeCampaignStatus(d.campaignId, tx);
    const brandUserId = await getCampaignBrandUserId(d.campaignId, tx);
    if (brandUserId) {
      await tx.notification.create({
        data: {
          userId: brandUserId,
          type: 'deliverable.posted',
          title: 'Influencer posted',
          body: 'The post is live — please review and release payment.',
          link: `/dashboard/campaigns/${d.campaignId}`,
        },
      });
    }
    return updated;
  });
}

export async function releasePayment(userId, delivId) {
  const d = await findDeliverableForBrand(userId, delivId);
  if (d.status !== 'POSTED') {
    throw ApiError.badRequest(`Can only release payment from POSTED (current: ${d.status})`);
  }
  // Creator gets creatorPayout (set at materialization); the brand-side
  // amountPayable - creatorPayout stays with the platform.
  const payoutAmount = Number(d.creatorPayout ?? d.amountPayable);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.campaignDeliverable.update({
      where: { id: delivId },
      data: { status: 'PAID' },
    });

    // Queue a payout record. Actual disbursal (Razorpay Route / Payouts API)
    // is processed out-of-band by an admin/cron in a later phase.
    await tx.payout.create({
      data: {
        influencerId: d.influencerId,
        amount: payoutAmount,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    // Update creator reputation stats — drives the CreatorBadge tier.
    await tx.influencerProfile.update({
      where: { id: d.influencerId },
      data: {
        successfulDeliverables: { increment: 1 },
        totalEarnings: { increment: payoutAmount },
      },
    });

    await recomputeCampaignStatus(d.campaignId, tx);
    await maybeReleaseEscrow(d.campaign.orderId, tx);
    const infUserId = await getInfluencerUserId(d.influencerId, tx);
    if (infUserId) {
      await tx.notification.create({
        data: {
          userId: infUserId,
          type: 'deliverable.paid',
          title: 'Payment released',
          body: `₹${payoutAmount.toFixed(2)} has been queued for payout.`,
          link: `/dashboard/payouts`,
        },
      });
    }
    return updated;
  }).then(async (result) => {
    // Recompute badge outside the transaction so a failure here doesn't roll
    // back the payment release.
    try {
      await recomputeBadgeForInfluencer(d.influencerId);
    } catch (err) {
      console.warn('Badge recompute failed', err);
    }
    return result;
  });
}

// --- helpers ---

async function recomputeCampaignStatus(campaignId, tx) {
  const ds = await tx.campaignDeliverable.findMany({
    where: { campaignId },
    select: { status: true, influencerId: true },
  });
  if (!ds.length) return; // leave DRAFT — admin still needs to assign
  let newStatus;
  if (ds.every((d) => d.status === 'PAID')) newStatus = 'COMPLETED';
  else if (ds.some((d) => d.status !== 'PENDING')) newStatus = 'IN_PROGRESS';
  else newStatus = 'BRIEF_SENT';
  const previous = await tx.campaign.findUnique({
    where: { id: campaignId },
    select: { status: true },
  });
  await tx.campaign.update({ where: { id: campaignId }, data: { status: newStatus } });

  // Bump completedCampaigns once per influencer the first time we transition
  // a campaign into COMPLETED.
  if (newStatus === 'COMPLETED' && previous?.status !== 'COMPLETED') {
    const ids = [...new Set(ds.map((d) => d.influencerId))];
    if (ids.length) {
      await tx.influencerProfile.updateMany({
        where: { id: { in: ids } },
        data: { completedCampaigns: { increment: 1 } },
      });
    }
  }
}

async function maybeReleaseEscrow(orderId, tx) {
  const ds = await tx.campaignDeliverable.findMany({
    where: { campaign: { orderId } },
    select: { status: true },
  });
  if (!ds.length) return;
  if (!ds.every((d) => d.status === 'PAID')) return;
  await tx.escrowHold.updateMany({
    where: { orderId, status: 'HELD' },
    data: { status: 'RELEASED', releasedAt: new Date() },
  });
  await tx.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
}

async function getCampaignBrandUserId(campaignId, tx) {
  const c = await tx.campaign.findUnique({
    where: { id: campaignId },
    select: { order: { select: { brandUserId: true } } },
  });
  return c?.order?.brandUserId ?? null;
}

async function getInfluencerUserId(influencerId, tx) {
  const i = await tx.influencerProfile.findUnique({
    where: { id: influencerId },
    select: { userId: true },
  });
  return i?.userId ?? null;
}
