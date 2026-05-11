import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig, type Method } from 'axios';
import { clearAuth, getDemoRole, getToken, isDemoMode } from './auth';
import {
  DUMMY_ADMIN_USER,
  DUMMY_BRAND_USER,
  DUMMY_CAMPAIGN_DETAIL_BRAND,
  DUMMY_CAMPAIGN_DETAIL_INFLUENCER,
  DUMMY_CAMPAIGNS_BRAND,
  DUMMY_CAMPAIGNS_INFLUENCER,
  DUMMY_INFLUENCER_USER,
  DUMMY_INFLUENCERS,
  DUMMY_NICHES,
  DUMMY_NOTIFICATIONS,
  DUMMY_ORDER_DETAIL,
  DUMMY_ORDERS,
  DUMMY_PACKAGES,
  DUMMY_PAYOUT_SUMMARY,
  DUMMY_PAYOUTS,
} from './dummyData';
import { PLATFORM_BRAND_FEE_RATE, type Role, type User } from './types';

// =============================================================================
// In-memory demo cart — survives navigation within a single browser session.
// Reset on full page reload. Not persisted to localStorage on purpose so the
// demo always starts clean.
// =============================================================================
interface DemoCartItem {
  id: string;
  itemType: 'PACKAGE' | 'INFLUENCER';
  package?: unknown;
  influencer?: unknown;
  deliverables?: Array<{ type: string; qty: number }>;
  price: number;
  qty: number;
}

const demoCart: { id: string; items: DemoCartItem[]; currency: string } = {
  id: 'demo-cart',
  items: [],
  currency: 'INR',
};

function cartSubtotal() {
  return demoCart.items.reduce((s, it) => s + Number(it.price) * it.qty, 0);
}

function unitPriceForInfluencer(
  influencerId: string,
  deliverables: Array<{ type: string; qty: number }>,
) {
  const inf = DUMMY_INFLUENCERS.find((i) => i.id === influencerId);
  if (!inf) return 0;
  const creatorRate = (deliverables ?? []).reduce((sum, d) => {
    const rc = inf.rateCards.find((r) => r.deliverable === d.type);
    return sum + (rc ? Number(rc.price) * (d.qty ?? 1) : 0);
  }, 0);
  return creatorRate * (1 + PLATFORM_BRAND_FEE_RATE);
}

function userForRole(role: Role): User {
  if (role === 'ADMIN') return DUMMY_ADMIN_USER;
  if (role === 'INFLUENCER') return DUMMY_INFLUENCER_USER;
  return DUMMY_BRAND_USER;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------------------------------------------------------
// Demo mode — return dummy responses without making real HTTP calls.
// We swap config.adapter to short-circuit the request when in demo mode.
// -----------------------------------------------------------------------------
function dummyResponseFor(
  url: string,
  method: Method | string = 'get',
  body: unknown = null,
): unknown {
  const m = String(method || 'get').toLowerCase();
  const role = (getDemoRole() || 'BRAND') as Role;
  const data = (body && typeof body === 'object' ? (body as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  // Strip /api/v1 prefix for shorter matchers
  const path = url.replace(/^.*\/api\/v1/, '') || url;

  // === Auth ===
  if (path === '/auth/me') {
    return { user: userForRole(role) };
  }
  if (path === '/auth/change-password' && m === 'post') return { ok: true };
  if (path === '/auth/me' && m === 'delete') return { ok: true };

  // === Niches ===
  if (path === '/niches') return { niches: DUMMY_NICHES };

  // === Brand profile ===
  if (path === '/brands/me') return { profile: DUMMY_BRAND_USER.brandProfile };
  if (path === '/brands/me' && m === 'patch') return { profile: DUMMY_BRAND_USER.brandProfile };

  // === Influencer profile (self) ===
  if (path === '/influencers/me') return { profile: DUMMY_INFLUENCER_USER.influencerProfile };
  if (path === '/influencers/me' && m === 'patch') {
    return { profile: DUMMY_INFLUENCER_USER.influencerProfile };
  }
  if (path === '/influencers/me/niches' && m === 'put') {
    return DUMMY_INFLUENCER_USER.influencerProfile?.niches;
  }
  if (path === '/influencers/me/rate-cards' && m === 'put') {
    return DUMMY_INFLUENCER_USER.influencerProfile?.rateCards;
  }
  if (path === '/influencers/me/socials') {
    return { socials: DUMMY_INFLUENCER_USER.influencerProfile?.socialAccounts };
  }
  if (path.startsWith('/influencers/me/socials/') && m === 'delete') {
    return { status: 'disconnected' };
  }
  if (path === '/influencers/me/payouts') {
    return { payouts: DUMMY_PAYOUTS, summary: DUMMY_PAYOUT_SUMMARY };
  }

  // === OAuth ===
  if (path.startsWith('/oauth/') && path.endsWith('/start')) {
    return { authUrl: '#demo-no-oauth-in-demo-mode' };
  }

  // === Orders (brand) ===
  if (path === '/orders') {
    return { orders: DUMMY_ORDERS, meta: { total: DUMMY_ORDERS.length, page: 1, limit: 20, totalPages: 1 } };
  }
  if (path.startsWith('/orders/')) return { order: DUMMY_ORDER_DETAIL };

  // === Campaigns (role-aware) ===
  if (path === '/campaigns' || path.startsWith('/campaigns?')) {
    const items = role === 'BRAND' ? DUMMY_CAMPAIGNS_BRAND : DUMMY_CAMPAIGNS_INFLUENCER;
    return { campaigns: items, meta: { total: items.length, page: 1, limit: 20, totalPages: 1 } };
  }
  if (path.startsWith('/campaigns/')) {
    return {
      campaign: role === 'BRAND' ? DUMMY_CAMPAIGN_DETAIL_BRAND : DUMMY_CAMPAIGN_DETAIL_INFLUENCER,
    };
  }

  // === Deliverable actions — always succeed in demo ===
  if (path.startsWith('/deliverables/')) return { deliverable: { status: 'OK' } };

  // === Cart — in-memory demo store ===
  if (path === '/cart' && m === 'get') {
    return { cart: { ...demoCart, subtotal: cartSubtotal() } };
  }
  if (path === '/cart/items' && m === 'post') {
    const itemType = String(data.itemType ?? '');
    const id = `ci-${Math.random().toString(36).slice(2, 9)}`;
    const qty = Number(data.qty ?? 1) || 1;
    if (itemType === 'PACKAGE') {
      const pkg = DUMMY_PACKAGES.find((p) => p.id === data.packageId);
      if (pkg) {
        demoCart.items.push({
          id,
          itemType: 'PACKAGE',
          package: pkg,
          price: Number(pkg.price),
          qty,
        });
      }
    } else if (itemType === 'INFLUENCER') {
      const influencerId = String(data.influencerId ?? '');
      const inf = DUMMY_INFLUENCERS.find((i) => i.id === influencerId);
      const dels = Array.isArray(data.deliverables)
        ? (data.deliverables as Array<{ type: string; qty: number }>)
        : [];
      if (inf) {
        demoCart.items.push({
          id,
          itemType: 'INFLUENCER',
          influencer: inf,
          deliverables: dels,
          price: unitPriceForInfluencer(influencerId, dels),
          qty,
        });
      }
    }
    return { ok: true, item: { id }, cart: { ...demoCart, subtotal: cartSubtotal() } };
  }
  const cartItemMatch = path.match(/^\/cart\/items\/([^/?]+)/);
  if (cartItemMatch) {
    const itemId = cartItemMatch[1];
    if (m === 'delete') {
      const idx = demoCart.items.findIndex((it) => it.id === itemId);
      if (idx >= 0) demoCart.items.splice(idx, 1);
      return { ok: true, cart: { ...demoCart, subtotal: cartSubtotal() } };
    }
    if (m === 'patch') {
      const it = demoCart.items.find((x) => x.id === itemId);
      if (it && data.qty != null) it.qty = Math.max(1, Number(data.qty));
      return { ok: true, cart: { ...demoCart, subtotal: cartSubtotal() } };
    }
  }
  if (path.startsWith('/checkout/')) {
    return { error: 'Checkout disabled in demo mode — connect a real backend to enable Razorpay.' };
  }

  // === Notifications ===
  if (path === '/notifications') {
    return {
      notifications: DUMMY_NOTIFICATIONS,
      unreadCount: DUMMY_NOTIFICATIONS.filter((n) => !n.isRead).length,
    };
  }
  if (path.startsWith('/notifications/')) return { ok: true };

  // === Admin: content (SEO) ===
  if (path === '/admin/content' || path === '/admin/content/') {
    return {
      items: [
        {
          id: 'c-home',
          slug: 'home',
          title: "Collabhype — India's self-serve influencer marketplace",
          description:
            'Buy curated influencer packages or hand-pick creators one at a time.',
          ogImageUrl: null,
          body: null,
          data: null,
          isPublished: true,
          updatedAt: '2026-05-10T10:00:00Z',
          createdAt: '2026-04-01T10:00:00Z',
        },
        {
          id: 'c-about',
          slug: 'about',
          title: 'About — Collabhype',
          description: 'Why we built Collabhype: transparent, self-serve influencer marketing for India.',
          ogImageUrl: null,
          body: null,
          data: null,
          isPublished: true,
          updatedAt: '2026-05-08T10:00:00Z',
          createdAt: '2026-04-01T10:00:00Z',
        },
        {
          id: 'c-how',
          slug: 'how-it-works',
          title: 'How it works — Collabhype',
          description: 'From cart to campaign in four steps.',
          ogImageUrl: null,
          body: null,
          data: null,
          isPublished: true,
          updatedAt: '2026-05-05T10:00:00Z',
          createdAt: '2026-04-01T10:00:00Z',
        },
        {
          id: 'c-terms',
          slug: 'terms',
          title: 'Terms of Service — Collabhype',
          description: 'The terms under which you use Collabhype.',
          isPublished: true,
          updatedAt: '2026-04-15T10:00:00Z',
          createdAt: '2026-04-01T10:00:00Z',
        },
        {
          id: 'c-privacy',
          slug: 'privacy',
          title: 'Privacy Policy — Collabhype',
          description: 'How Collabhype collects, uses, and protects your data.',
          isPublished: true,
          updatedAt: '2026-04-15T10:00:00Z',
          createdAt: '2026-04-01T10:00:00Z',
        },
      ],
    };
  }
  if (path.startsWith('/admin/content/')) {
    if (m === 'delete') return { ok: true };
    return { content: { ok: true } };
  }
  if (path === '/content' || path.startsWith('/content/')) {
    return { content: { slug: path.split('/').pop() } };
  }

  // === Admin: tracking ===
  if (path.startsWith('/admin/tracking/summary')) {
    return {
      totalEvents: 4823,
      uniqueUsers: 217,
      days: 30,
      byName: [
        { eventName: 'page_view', count: 3204 },
        { eventName: 'package_view', count: 612 },
        { eventName: 'influencer_view', count: 524 },
        { eventName: 'add_to_cart', count: 187 },
        { eventName: 'checkout_started', count: 92 },
        { eventName: 'signup_complete', count: 47 },
        { eventName: 'campaign_created', count: 38 },
        { eventName: 'deliverable_approved', count: 119 },
      ],
      topPages: [
        { pageUrl: '/', count: 1402 },
        { pageUrl: '/packages', count: 587 },
        { pageUrl: '/influencers', count: 419 },
        { pageUrl: '/how-it-works', count: 246 },
        { pageUrl: '/login', count: 198 },
        { pageUrl: '/about', count: 153 },
      ],
      latest: [],
    };
  }
  if (path.startsWith('/admin/tracking/events')) {
    const now = Date.now();
    return {
      events: [
        {
          id: 't-1',
          eventName: 'page_view',
          pageUrl: '/packages',
          user: { fullName: 'Acme Brand', email: 'demo@brand.com', role: 'BRAND' },
          createdAt: new Date(now - 60_000).toISOString(),
        },
        {
          id: 't-2',
          eventName: 'add_to_cart',
          pageUrl: '/packages/growth-micro-5-fashion',
          user: { fullName: 'Acme Brand', email: 'demo@brand.com', role: 'BRAND' },
          createdAt: new Date(now - 5 * 60_000).toISOString(),
        },
        {
          id: 't-3',
          eventName: 'page_view',
          pageUrl: '/influencers',
          user: null,
          createdAt: new Date(now - 10 * 60_000).toISOString(),
        },
        {
          id: 't-4',
          eventName: 'signup_complete',
          pageUrl: '/register',
          user: { fullName: 'Aanya Mehta', email: 'aanya@example.com', role: 'INFLUENCER' },
          createdAt: new Date(now - 30 * 60_000).toISOString(),
        },
        {
          id: 't-5',
          eventName: 'page_view',
          pageUrl: '/',
          user: null,
          createdAt: new Date(now - 60 * 60_000).toISOString(),
        },
      ],
      meta: { total: 5, page: 1, limit: 20, totalPages: 1 },
    };
  }

  // === Public track endpoint — accept events silently in demo mode ===
  if (path === '/track') return { ok: true };

  // No demo match — return null and let the request fall through to real API.
  return null;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Demo short-circuit: swap the adapter so axios returns dummy data
  // without ever making a network call.
  if (isDemoMode()) {
    let body: unknown = config.data ?? null;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // leave as raw string
      }
    }
    const dummy = dummyResponseFor(config.url ?? '', config.method, body);
    if (dummy !== null) {
      config.adapter = () =>
        Promise.resolve({
          data: dummy,
          status: 200,
          statusText: 'OK (demo)',
          headers: {},
          config,
          request: {},
        });
    }
  }

  const token = getToken();
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err?.response?.status === 401 && !isDemoMode()) {
      clearAuth();
    }
    return Promise.reject(err);
  },
);

export function apiError(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const ax = err as AxiosError<{ message?: string }>;
    return ax.response?.data?.message || ax.message || 'Something went wrong';
  }
  return 'Something went wrong';
}
