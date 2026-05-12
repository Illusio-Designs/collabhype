import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';
import { getRazorpayClient } from '../../lib/razorpay.js';
import { generateOrderNumber } from '../../utils/orderNumber.js';
import {
  getCart,
  PLATFORM_BRAND_FEE_RATE,
  PLATFORM_CREATOR_COMMISSION_RATE,
} from '../cart/cart.service.js';

// --- create order ---------------------------------------------------------

export async function createOrder(userId) {
  const cart = await getCart(userId);
  if (!cart.items.length) throw ApiError.badRequest('Cart is empty');

  // Build per-item snapshots — exact pricing/deliverables frozen at order time.
  // creatorRate + platformFee are recorded so the breakdown is auditable from
  // the OrderItem alone, even if the creator updates their rate card later.
  const itemsSnapshot = cart.items.map((ci) => ({
    itemType: ci.itemType,
    packageId: ci.packageId,
    influencerId: ci.influencerId,
    qty: ci.qty,
    unitPrice: Number(ci.price),
    lineTotal: Number(ci.price) * ci.qty,
    deliverables: ci.deliverables ?? ci.package?.deliverables ?? null,
    packageTitle: ci.package?.title ?? null,
    creatorRate: ci.creatorRate != null ? Number(ci.creatorRate) : null,
    platformFee: ci.platformFee != null ? Number(ci.platformFee) : null,
  }));
  const subtotal = itemsSnapshot.reduce((s, i) => s + i.lineTotal, 0);
  const tax = 0; // GST handling deferred to a later phase
  const total = subtotal + tax;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      brandUserId: userId,
      subtotal,
      tax,
      total,
      currency: 'INR',
      status: 'PENDING',
      items: {
        create: itemsSnapshot.map((s) => ({
          itemType: s.itemType,
          packageId: s.packageId,
          influencerId: s.influencerId,
          snapshot: s,
          price: s.unitPrice,
          qty: s.qty,
        })),
      },
    },
  });

  const rzp = getRazorpayClient();
  const rzpOrder = await rzp.orders.create({
    amount: Math.round(total * 100), // paise
    currency: 'INR',
    receipt: orderNumber,
    notes: { orderId: order.id, brandUserId: userId },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpOrder.id },
  });

  return {
    orderId: order.id,
    orderNumber,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId: env.RAZORPAY_KEY_ID,
  };
}

// --- verify payment (client-side success callback) ------------------------

export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw ApiError.badRequest('Razorpay is not configured on the server');
  }
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expected !== razorpay_signature) {
    throw ApiError.badRequest('Invalid payment signature');
  }

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
    include: { items: true },
  });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.status === 'PAID') return order; // idempotent

  return finalizePaidOrder(order, razorpay_payment_id);
}

// --- webhook (async confirmation from Razorpay) ---------------------------

export async function handleWebhook(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw ApiError.badRequest('Razorpay webhook secret not configured');
  }
  if (!signature || !rawBody) throw ApiError.badRequest('Missing webhook signature or body');

  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  if (expected !== signature) throw ApiError.unauthorized('Invalid webhook signature');

  const payload = JSON.parse(rawBody.toString('utf8'));
  const event = payload.event;

  if (event !== 'payment.captured' && event !== 'order.paid') {
    return { handled: false, event };
  }

  const rzpOrderId =
    payload?.payload?.payment?.entity?.order_id ?? payload?.payload?.order?.entity?.id;
  const paymentId = payload?.payload?.payment?.entity?.id;
  if (!rzpOrderId) return { handled: false, reason: 'no order id in payload' };

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: rzpOrderId },
    include: { items: true },
  });
  if (!order) return { handled: false, reason: 'unknown order' };
  if (order.status === 'PAID') return { handled: true, idempotent: true };

  await finalizePaidOrder(order, paymentId);
  return { handled: true };
}

// --- shared: mark paid + escrow + materialize campaigns -------------------

async function finalizePaidOrder(order, paymentId) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        razorpayPaymentId: paymentId,
        paidAt: new Date(),
      },
    });

    await tx.escrowHold.create({
      data: { orderId: order.id, amount: order.total, status: 'HELD' },
    });

    await materializeCampaigns(tx, order);

    // Clear the brand's cart
    const cart = await tx.cart.findFirst({ where: { userId: order.brandUserId } });
    if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Notify brand
    await tx.notification.create({
      data: {
        userId: order.brandUserId,
        type: 'order.paid',
        title: `Order ${order.orderNumber} confirmed`,
        body: `Your payment was successful. Campaign(s) are being set up.`,
        link: `/dashboard/orders/${order.id}`,
      },
    });

    return updated;
  });
}

// One Campaign per OrderItem. For each influencer × deliverable × qty,
// create a CampaignDeliverable with an even per-unit payout share.
//
// Creator payout rules:
//   - INFLUENCER items: creator_rate = amountPayable / (1 + brand_fee);
//                       payout       = creator_rate × (1 − commission)
//                       (≈ 85.71% of the brand-side amountPayable)
//   - PACKAGE (Nano)  : flat per-influencer-per-deliverable payout taken from
//                       Package.nanoPayPerInfluencer (split across the pack's
//                       deliverable units so each unit is consistent).
async function materializeCampaigns(tx, order) {
  for (const item of order.items) {
    const snap = item.snapshot;
    const isPackage = item.itemType === 'PACKAGE';
    const deliverables = Array.isArray(snap?.deliverables) ? snap.deliverables : [];

    let influencerIds = [];
    let pkg = null;
    if (isPackage) {
      pkg = item.packageId
        ? await tx.package.findUnique({ where: { id: item.packageId } })
        : null;
      const rows = await tx.packageInfluencer.findMany({
        where: { packageId: item.packageId },
        select: { influencerId: true },
      });
      influencerIds = rows.map((r) => r.influencerId);
    } else if (item.influencerId) {
      influencerIds = [item.influencerId];
    }

    const lineTotal = Number(item.price) * item.qty;
    const perInfluencer = influencerIds.length ? lineTotal / influencerIds.length : 0;
    const totalDelivUnits = deliverables.reduce((s, d) => s + (d.qty ?? 1), 0) || 1;
    const perUnit = perInfluencer / totalDelivUnits;

    // Creator payout per unit
    let payoutPerUnit;
    if (isPackage) {
      const nanoPay = Number(pkg?.nanoPayPerInfluencer ?? 0);
      payoutPerUnit = nanoPay / totalDelivUnits;
    } else {
      // Back out creator rate from brand-side perUnit and apply the 10% commission.
      const creatorRatePerUnit = perUnit / (1 + PLATFORM_BRAND_FEE_RATE);
      payoutPerUnit = creatorRatePerUnit * (1 - PLATFORM_CREATOR_COMMISSION_RATE);
    }
    const platformFeePerUnit = perUnit - payoutPerUnit;

    const campaign = await tx.campaign.create({
      data: {
        orderId: order.id,
        title: isPackage ? snap?.packageTitle ?? 'Package campaign' : 'Custom influencer campaign',
        status: influencerIds.length ? 'BRIEF_SENT' : 'DRAFT',
      },
    });

    // If a package was bought but no influencers are assigned yet, leave the
    // campaign in DRAFT so an admin can assign and then generate deliverables.
    if (!influencerIds.length || !deliverables.length) continue;

    const rows = [];
    for (const infId of influencerIds) {
      for (const d of deliverables) {
        const unitsForThisDeliv = (d.qty ?? 1) * item.qty;
        for (let i = 0; i < unitsForThisDeliv; i++) {
          rows.push({
            campaignId: campaign.id,
            influencerId: infId,
            deliverable: d.type,
            qty: 1,
            amountPayable: perUnit,
            creatorPayout: payoutPerUnit,
            platformFee: platformFeePerUnit,
          });
        }
      }
    }
    if (rows.length) await tx.campaignDeliverable.createMany({ data: rows });

    // Notify each assigned influencer
    const users = await tx.influencerProfile.findMany({
      where: { id: { in: influencerIds } },
      select: { userId: true },
    });
    if (users.length) {
      await tx.notification.createMany({
        data: users.map((u) => ({
          userId: u.userId,
          type: 'campaign.assigned',
          title: 'New campaign assigned',
          body: `You have been assigned to a new campaign.`,
          link: `/dashboard/campaigns/${campaign.id}`,
        })),
      });
    }
  }
}
