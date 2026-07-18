import axios from 'axios';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { encrypt } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';
import { recomputeTier } from '../influencer/influencer.service.js';

const FB_AUTH_URL = 'https://www.facebook.com/v21.0/dialog/oauth';
const FB_GRAPH = 'https://graph.facebook.com/v21.0';

const REQUIRED_SCOPES = [
  'instagram_basic',
  'pages_show_list',
  'business_management',
  'instagram_manage_insights',
];

function ensureConfigured() {
  if (!env.META_APP_ID || !env.META_APP_SECRET || !env.META_REDIRECT_URI) {
    throw ApiError.badRequest('Instagram OAuth is not configured on the server');
  }
}

export function buildAuthUrl(state) {
  ensureConfigured();
  const params = new URLSearchParams({
    client_id: env.META_APP_ID,
    redirect_uri: env.META_REDIRECT_URI,
    scope: REQUIRED_SCOPES.join(','),
    response_type: 'code',
    state,
  });
  return `${FB_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeAndSync(userId, code) {
  ensureConfigured();

  // 1. code → short-lived user token
  const tokenRes = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
    params: {
      client_id: env.META_APP_ID,
      client_secret: env.META_APP_SECRET,
      redirect_uri: env.META_REDIRECT_URI,
      code,
    },
  });
  const shortToken = tokenRes.data.access_token;

  // 2. short → long-lived (~60 days)
  const llRes = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: env.META_APP_ID,
      client_secret: env.META_APP_SECRET,
      fb_exchange_token: shortToken,
    },
  });
  const longToken = llRes.data.access_token;
  const expiresIn = llRes.data.expires_in ?? 60 * 24 * 3600;

  // 3. user's FB pages — find one linked to an IG Business/Creator account
  const pagesRes = await axios.get(`${FB_GRAPH}/me/accounts`, {
    params: {
      access_token: longToken,
      fields: 'id,name,instagram_business_account',
    },
  });
  const pages = pagesRes.data?.data ?? [];
  const pageWithIG = pages.find((p) => p.instagram_business_account?.id);
  if (!pageWithIG) {
    throw ApiError.badRequest(
      'No Instagram Business/Creator account is linked to your Facebook Pages',
    );
  }
  const igUserId = pageWithIG.instagram_business_account.id;

  // 4. IG profile
  const profileRes = await axios.get(`${FB_GRAPH}/${igUserId}`, {
    params: {
      fields: 'username,followers_count,follows_count,media_count,profile_picture_url',
      access_token: longToken,
    },
  });
  const ig = profileRes.data;

  // 5. Recent media → engagement
  const mediaRes = await axios.get(`${FB_GRAPH}/${igUserId}/media`, {
    params: {
      fields: 'like_count,comments_count',
      limit: 12,
      access_token: longToken,
    },
  });
  const media = mediaRes.data?.data ?? [];
  const avgLikes = media.length
    ? Math.round(media.reduce((s, m) => s + (m.like_count || 0), 0) / media.length)
    : 0;
  const avgComments = media.length
    ? Math.round(media.reduce((s, m) => s + (m.comments_count || 0), 0) / media.length)
    : 0;
  const engagementRate = ig.followers_count
    ? ((avgLikes + avgComments) / ig.followers_count) * 100
    : 0;

  // 6. Persist
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');

  const data = {
    handle: ig.username,
    externalId: igUserId,
    profileUrl: `https://instagram.com/${ig.username}`,
    followers: ig.followers_count ?? 0,
    following: ig.follows_count ?? 0,
    posts: ig.media_count ?? 0,
    avgLikes,
    avgComments,
    engagementRate,
    accessToken: encrypt(longToken),
    tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    lastSyncedAt: new Date(),
    isVerified: true,
  };

  const account = await prisma.socialAccount.upsert({
    where: { influencerId_platform: { influencerId: profile.id, platform: 'INSTAGRAM' } },
    update: data,
    create: { influencerId: profile.id, platform: 'INSTAGRAM', ...data },
  });

  await recomputeTier(profile.id);
  return account;
}
