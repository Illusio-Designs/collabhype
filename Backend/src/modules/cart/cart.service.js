import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

// Platform's 15% split into a brand-side markup and a creator-side commission.
// Keep in sync with Frontend/src/lib/types.ts.
export const PLATFORM_BRAND_FEE_RATE = 0.05;
export const PLATFORM_CREATOR_COMMISSION_RATE = 0.10;

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });
  return cart;
}

// Server-side pricing — never trust client prices.
async function priceItem(input) {
  if (input.itemType === 'PACKAGE') {
    const pkg = await prisma.package.findUnique({ where: { id: input.packageId } });
    if (!pkg || !pkg.isActive) throw ApiError.notFound('Package not found');
    return {
      unitPrice: Number(pkg.price),
      creatorRate: null,
      platformFee: null,
      deliverables: pkg.deliverables,
    };
  }
  // INFLUENCER — sum (rate × qty) across requested deliverables, then apply
  // the 5% brand-side markup so the brand sees the all-in price up front.
  const influencer = await prisma.influencerProfile.findUnique({
    where: { id: input.influencerId },
    include: { rateCards: true },
  });
  if (!influencer || !influencer.isAvailable) {
    throw ApiError.notFound('Influencer not found or unavailable');
  }
  const cardByDeliv = new Map(influencer.rateCards.map((r) => [r.deliverable, Number(r.price)]));
  let creatorRate = 0;
  for (const d of input.deliverables) {
    const rate = cardByDeliv.get(d.type);
    if (rate == null) {
      throw ApiError.badRequest(`Influencer has no rate card for ${d.type}`);
    }
    creatorRate += rate * d.qty;
  }
  const platformFee = creatorRate * PLATFORM_BRAND_FEE_RATE;
  const unitPrice = creatorRate + platformFee;
  return { unitPrice, creatorRate, platformFee, deliverables: input.deliverables };
}

export async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  const fresh = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
        include: { package: { include: { niche: true } } },
      },
    },
  });

  // Hydrate INFLUENCER items (no FK relation defined for cart-item → influencer)
  const influencerIds = fresh.items
    .filter((i) => i.itemType === 'INFLUENCER' && i.influencerId)
    .map((i) => i.influencerId);
  let infMap = new Map();
  if (influencerIds.length) {
    const infs = await prisma.influencerProfile.findMany({
      where: { id: { in: influencerIds } },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        socialAccounts: {
          select: { platform: true, handle: true, followers: true, engagementRate: true },
        },
      },
    });
    infMap = new Map(infs.map((i) => [i.id, i]));
  }

  const items = fresh.items.map((i) => ({
    ...i,
    influencer: i.influencerId ? infMap.get(i.influencerId) ?? null : null,
  }));
  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  return { id: fresh.id, userId: fresh.userId, items, subtotal, currency: 'INR' };
}

export async function addItem(userId, input) {
  const cart = await getOrCreateCart(userId);
  const { unitPrice, creatorRate, platformFee, deliverables } = await priceItem(input);
  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      itemType: input.itemType,
      packageId: input.itemType === 'PACKAGE' ? input.packageId : null,
      influencerId: input.itemType === 'INFLUENCER' ? input.influencerId : null,
      // Stash the requested deliverables for INFLUENCER items so checkout can
      // materialize them. PACKAGE items inherit deliverables from the Package row.
      deliverables: input.itemType === 'INFLUENCER' ? deliverables : null,
      qty: input.qty ?? 1,
      price: unitPrice,
      creatorRate,
      platformFee,
    },
  });
}

export async function updateItem(userId, itemId, qty) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== userId) throw ApiError.notFound('Cart item not found');
  return prisma.cartItem.update({ where: { id: itemId }, data: { qty } });
}

export async function removeItem(userId, itemId) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== userId) throw ApiError.notFound('Cart item not found');
  await prisma.cartItem.delete({ where: { id: itemId } });
  return { status: 'removed' };
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { status: 'cleared' };
}
