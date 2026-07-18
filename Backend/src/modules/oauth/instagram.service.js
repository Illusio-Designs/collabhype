import axios from 'axios';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { encrypt } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';
import { recomputeTier } from '../influencer/influencer.service.js';

// Instagram API with Instagram Login (Business/Creator accounts, no Facebook
// Page required). Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
const IG_AUTH_URL = 'https://www.instagram.com/oauth/authorize';
const IG_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const IG_GRAPH = 'https://graph.instagram.com';

// Business scopes: basic profile (username, followers, media) + insights.
const REQUIRED_SCOPES = ['instagram_business_basic', 'instagram_business_manage_insights'];

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
    response_type: 'code',
    scope: REQUIRED_SCOPES.join(','),
    state,
  });
  return `${IG_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeAndSync(userId, code) {
  ensureConfigured();

  // 1. code → short-lived token (form-encoded). Returns { access_token, user_id }.
  const tokenRes = await axios.post(
    IG_TOKEN_URL,
    new URLSearchParams({
      client_id: env.META_APP_ID,
      client_secret: env.META_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: env.META_REDIRECT_URI,
      code,
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  // Some API versions nest the result under `data: [ ... ]`.
  const tokenData = Array.isArray(tokenRes.data?.data) ? tokenRes.data.data[0] : tokenRes.data;
  const shortToken = tokenData?.access_token;
  if (!shortToken) throw ApiError.badRequest('Instagram token exchange failed');

  // 2. short → long-lived (~60 days)
  const llRes = await axios.get(`${IG_GRAPH}/access_token`, {
    params: {
      grant_type: 'ig_exchange_token',
      client_secret: env.META_APP_SECRET,
      access_token: shortToken,
    },
  });
  const longToken = llRes.data?.access_token ?? shortToken;
  const expiresIn = llRes.data?.expires_in ?? 60 * 24 * 3600;

  // 3. Profile — followers/follows/media come with instagram_business_basic.
  const meRes = await axios.get(`${IG_GRAPH}/me`, {
    params: {
      fields: 'user_id,username,account_type,followers_count,follows_count,media_count',
      access_token: longToken,
    },
  });
  const ig = meRes.data;
  if (!ig?.username) throw ApiError.badRequest('Could not read Instagram profile');

  // 4. Recent media → engagement
  let avgLikes = 0;
  let avgComments = 0;
  try {
    const mediaRes = await axios.get(`${IG_GRAPH}/me/media`, {
      params: { fields: 'like_count,comments_count', limit: 12, access_token: longToken },
    });
    const media = mediaRes.data?.data ?? [];
    if (media.length) {
      avgLikes = Math.round(media.reduce((s, m) => s + (m.like_count || 0), 0) / media.length);
      avgComments = Math.round(media.reduce((s, m) => s + (m.comments_count || 0), 0) / media.length);
    }
  } catch {
    // Media insights are best-effort; keep the connection even if this fails.
  }
  const followers = ig.followers_count ?? 0;
  const engagementRate = followers ? ((avgLikes + avgComments) / followers) * 100 : 0;

  // 5. Persist
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');

  const data = {
    handle: ig.username,
    externalId: String(ig.user_id ?? ig.id ?? ''),
    profileUrl: `https://instagram.com/${ig.username}`,
    followers,
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
