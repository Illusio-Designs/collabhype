import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { recomputeBadgeForInfluencer } from '../influencer/badge.service.js';

// --- listing ---

// Campaigns that are live work: brief is out but not yet signed off.
const ACTIVE_CAMPAIGN_STATUSES = ['BRIEF_SENT', 'IN_PROGRESS', 'REVIEW'];

// Dashboard KPIs are lifetime figures over every campaign the viewer can see,
// so the summary deliberately ignores both the `status` filter and the page
// window — the alternative is a headline number that only describes 20 rows.
async function campaignSummary(scopeWhere, deliverableWhere) {
  const [count, active, completed, deliverables] = await prisma.$transaction([
    prisma.campaign.count({ where: scopeWhere }),
    prisma.campaign.count({
      where: { ...scopeWhere, status: { in: ACTIVE_CAMPAIGN_STATUSES } },
    }),
    prisma.campaign.count({ where: { ...scopeWhere, status: 'COMPLETED' } }),
    prisma.campaignDeliverable.count({ where: deliverableWhere }),
  ]);
  return { count, active, completed, deliverables };
}

export async function listForBrand(userId, { status, page, limit }) {
  const scopeWhere = { order: { brandUserId: userId } };
  const where = { ...scopeWhere };
  if (status) where.status = status;
  const [total, items, summary] = await Promise.all([
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
    campaignSummary(scopeWhere, { campaign: scopeWhere }),
  ]);
  return { items, total, summary };
}

export async function listForInfluencer(userId, { status, page, limit }) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');

  const scopeWhere = { deliverables: { some: { influencerId: profile.id } } };
  const where = { ...scopeWhere };
  if (status) where.status = status;

  const [total, items, summary] = await Promise.all([
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
    // A creator's "deliverables" count is only their own rows on those
    // campaigns, never the brand's full slate.
    campaignSummary(scopeWhere, { influencerId: profile.id }),
  ]);
  return { items, total, summary };
}

export async function getForBrand(userId, campaignId) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, order: { brandUserId: userId } },
    include: {
      order: { select: { id: true, orderNumber: true, total: true, status: true, paidAt: true } },
      deliverables: {
        include: {
          influencer: {
            select: {
              id: true,
              tier: true,
              city: true,
              state: true,
              country: true,
              shippingAddress: true,
              pincode: true,
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

  // Delivery address is revealed to the brand only after the brief is sent.
  if (!campaign.briefSentAt) {
    for (const d of campaign.deliverables) {
      if (d.influencer) {
        d.influencer.shippingAddress = null;
        d.influencer.pincode = null;
      }
    }
  }
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
      productLink: data.productLink === '' ? null : data.productLink,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
}

// Brand "sends" the brief — requires a written brief, then reveals each
// assigned creator's delivery address so products can be shipped. Each assigned
// creator is notified with the brief message.
export async function sendBrief(userId, campaignId) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, order: { brandUserId: userId } },
    include: { deliverables: { select: { influencerId: true } } },
  });
  if (!campaign) throw ApiError.notFound('Campaign not found');
  if (['COMPLETED', 'CANCELLED'].includes(campaign.status)) {
    throw ApiError.badRequest('Campaign is closed');
  }
  if (!campaign.brief || !campaign.brief.trim()) {
    throw ApiError.badRequest('Add a brief before sending it');
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      briefSentAt: campaign.briefSentAt ?? new Date(),
      status: campaign.status === 'DRAFT' ? 'BRIEF_SENT' : campaign.status,
    },
  });

  // Notify each assigned creator with the brief message.
  const influencerIds = [...new Set(campaign.deliverables.map((d) => d.influencerId))];
  if (influencerIds.length) {
    const profiles = await prisma.influencerProfile.findMany({
      where: { id: { in: influencerIds } },
      select: { userId: true },
    });
    const snippet = campaign.brief.trim().slice(0, 160);
    await prisma.notification.createMany({
      data: profiles.map((p) => ({
        userId: p.userId,
        type: 'campaign.brief',
        title: `Brief for "${campaign.title}"`,
        body: snippet,
        link: `/dashboard/campaigns/${campaignId}`,
      })),
    });
  }
  return updated;
}

// --- Nano package tasks (recruiting) ---

// Open package tasks a Nano creator can accept: recruiting, still has slots,
// niche matches (or unspecified), and the creator hasn't already claimed it.
export async function listOpenTasks(userId) {
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId },
    include: { niches: { select: { nicheId: true } } },
  });
  if (!profile) throw ApiError.notFound('Profile not found');
  if (profile.tier !== 'NANO') return { tasks: [] };

  const nicheIds = profile.niches.map((n) => n.nicheId);
  const campaigns = await prisma.campaign.findMany({
    where: {
      isRecruiting: true,
      OR: [{ taskNicheId: null }, { taskNicheId: { in: nicheIds.length ? nicheIds : ['__none__'] } }],
      deliverables: { none: { influencerId: profile.id } },
    },
    select: {
      id: true,
      title: true,
      slotsTarget: true,
      slotsFilled: true,
      taskDeliverables: true,
      taskPayoutPerUnit: true,
      createdAt: true,
      order: {
        select: { brand: { select: { fullName: true, brandProfile: { select: { companyName: true } } } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return { tasks: campaigns };
}

// A Nano creator accepts a task → their deliverables are created and a slot is
// filled. When the target is met the campaign stops recruiting.
export async function claimTask(userId, campaignId) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Profile not found');
  if (profile.tier !== 'NANO') throw ApiError.badRequest('Only Nano creators can accept package tasks');
  if (!profile.isAvailable) throw ApiError.badRequest('Turn on availability to accept tasks');

  return prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || !campaign.isRecruiting) throw ApiError.badRequest('This task is no longer open');
    if ((campaign.slotsFilled ?? 0) >= (campaign.slotsTarget ?? 0)) {
      throw ApiError.badRequest('This task is already full');
    }
    const already = await tx.campaignDeliverable.findFirst({
      where: { campaignId, influencerId: profile.id },
      select: { id: true },
    });
    if (already) throw ApiError.badRequest('You already accepted this task');
    if (campaign.taskNicheId) {
      const has = await tx.influencerNiche.findFirst({
        where: { influencerId: profile.id, nicheId: campaign.taskNicheId },
        select: { nicheId: true },
      });
      if (!has) throw ApiError.badRequest('This task needs a different niche');
    }

    // Atomically claim one slot. The column-comparison guard in WHERE means
    // concurrent claims serialize on the row lock and can never push slotsFilled
    // past slotsTarget (a plain read-then-write let two claimers both pass the
    // check and overfill). isRecruiting is computed from the pre-increment value
    // first, then slotsFilled is incremented.
    const claimed = await tx.$executeRaw`
      UPDATE \`Campaign\`
         SET \`isRecruiting\` = (\`slotsFilled\` + 1 < \`slotsTarget\`),
             \`slotsFilled\` = \`slotsFilled\` + 1
       WHERE \`id\` = ${campaignId}
         AND \`isRecruiting\` = true
         AND \`slotsFilled\` < \`slotsTarget\``;
    if (!claimed) throw ApiError.badRequest('This task is already full');

    const dels = Array.isArray(campaign.taskDeliverables) ? campaign.taskDeliverables : [];
    const amount = Number(campaign.taskAmountPerUnit ?? 0);
    const payout = Number(campaign.taskPayoutPerUnit ?? 0);
    const rows = [];
    for (const d of dels) {
      for (let i = 0; i < (d.qty ?? 1); i++) {
        rows.push({
          campaignId,
          influencerId: profile.id,
          deliverable: d.type,
          qty: 1,
          amountPayable: amount,
          creatorPayout: payout,
          platformFee: amount - payout,
        });
      }
    }
    if (rows.length) await tx.campaignDeliverable.createMany({ data: rows });

    // Status stays DRAFT until the brand actually sends a brief (sendBrief sets
    // briefSentAt and reveals the creator's delivery address). Don't pre-flip to
    // BRIEF_SENT here — that made the status claim a brief was sent when it
    // wasn't, and kept briefSentAt null so the address never unlocked.
    const fresh = await tx.campaign.findUnique({
      where: { id: campaignId },
      select: { slotsFilled: true, slotsTarget: true },
    });
    const filled = fresh?.slotsFilled ?? (campaign.slotsFilled ?? 0) + 1;

    const order = await tx.order.findUnique({
      where: { id: campaign.orderId },
      select: { brandUserId: true },
    });
    if (order) {
      await tx.notification.create({
        data: {
          userId: order.brandUserId,
          type: 'task.claimed',
          title: 'A creator joined your campaign',
          body: `${filled}/${campaign.slotsTarget} creators have accepted.`,
          link: `/dashboard/campaigns/${campaignId}`,
        },
      });
    }
    return { ok: true, filled, target: campaign.slotsTarget };
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
  const previous = await tx.campaign.findUnique({
    where: { id: campaignId },
    select: { status: true, isRecruiting: true, slotsTarget: true, slotsFilled: true },
  });
  // A recruiting campaign that hasn't filled its paid slots must not COMPLETE —
  // the brand paid for slotsTarget creators, not only the ones who claimed. Cap
  // at IN_PROGRESS until the slots fill (isRecruiting flips false when full).
  const underFilled =
    Boolean(previous?.isRecruiting) ||
    (previous?.slotsTarget != null && (previous.slotsFilled ?? 0) < previous.slotsTarget);
  let newStatus;
  if (ds.every((d) => d.status === 'PAID')) newStatus = underFilled ? 'IN_PROGRESS' : 'COMPLETED';
  else if (ds.some((d) => d.status !== 'PENDING')) newStatus = 'IN_PROGRESS';
  else newStatus = 'BRIEF_SENT';
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
  // Never release while any campaign on the order is still recruiting (i.e. its
  // paid slots aren't filled). Otherwise a partially-claimed package (10 of 50)
  // would release the full escrow once those 10 finish.
  const stillRecruiting = await tx.campaign.findFirst({
    where: { orderId, isRecruiting: true },
    select: { id: true },
  });
  if (stillRecruiting) return;
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
