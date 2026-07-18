import crypto from 'node:crypto';
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
    throw ApiError.badRequest('Facebook OAuth is not configured on the server');
  }
}

// This flow's callback is /oauth/facebook/callback. Derive it from the same
// META_REDIRECT_URI origin so both providers share one env value.
function redirectUri() {
  try {
    const u = new URL(env.META_REDIRECT_URI);
    return `${u.origin}/api/v1/oauth/facebook/callback`;
  } catch {
    return env.META_REDIRECT_URI;
  }
}

export function buildAuthUrl(state) {
  ensureConfigured();
  const params = new URLSearchParams({
    client_id: env.META_APP_ID,
    redirect_uri: redirectUri(),
    scope: REQUIRED_SCOPES.join(','),
    response_type: 'code',
    state,
  });
  return `${FB_AUTH_URL}?${params.toString()}`;
}

// --- step 1: code → long-lived token ---
export async function exchangeCode(code) {
  ensureConfigured();
  const tokenRes = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
    params: {
      client_id: env.META_APP_ID,
      client_secret: env.META_APP_SECRET,
      redirect_uri: redirectUri(),
      code,
    },
  });
  const shortToken = tokenRes.data.access_token;

  const llRes = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: env.META_APP_ID,
      client_secret: env.META_APP_SECRET,
      fb_exchange_token: shortToken,
    },
  });
  return {
    longToken: llRes.data.access_token,
    expiresIn: llRes.data.expires_in ?? 60 * 24 * 3600,
  };
}

// --- step 2: list Instagram Business accounts linked to the user's Pages ---
export async function listCandidates(longToken) {
  const pagesRes = await axios.get(`${FB_GRAPH}/me/accounts`, {
    params: {
      access_token: longToken,
      fields: 'name,instagram_business_account{id,username,followers_count,profile_picture_url}',
    },
  });
  const pages = pagesRes.data?.data ?? [];
  return pages
    .filter((p) => p.instagram_business_account?.id)
    .map((p) => ({
      igUserId: p.instagram_business_account.id,
      username: p.instagram_business_account.username ?? '',
      followers: p.instagram_business_account.followers_count ?? 0,
      avatarUrl: p.instagram_business_account.profile_picture_url ?? null,
      pageName: p.name ?? '',
    }));
}

// --- step 3: sync a chosen Instagram account into the creator's profile ---
export async function syncInstagram(userId, longToken, igUserId, expiresIn = 60 * 24 * 3600) {
  const profileRes = await axios.get(`${FB_GRAPH}/${igUserId}`, {
    params: {
      fields: 'username,followers_count,follows_count,media_count,profile_picture_url',
      access_token: longToken,
    },
  });
  const ig = profileRes.data;

  const mediaRes = await axios.get(`${FB_GRAPH}/${igUserId}/media`, {
    params: { fields: 'like_count,comments_count', limit: 12, access_token: longToken },
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

  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');

  const data = {
    handle: ig.username,
    externalId: String(igUserId),
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

  // Use the Instagram profile photo as the creator's avatar so their public
  // profile shows a real picture. (Refreshed on every reconnect.)
  if (ig.profile_picture_url) {
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: ig.profile_picture_url },
    });
  }

  await recomputeTier(profile.id);
  return account;
}

// --- pending selections (creator has 2+ IG accounts to pick from) ---
// In-memory, short-lived. The selection completes within seconds of the OAuth
// redirect, so a process-local store with a TTL is sufficient.
const pendingSelections = new Map();
const SELECTION_TTL_MS = 10 * 60 * 1000;

export function putSelection(userId, longToken, expiresIn, candidates) {
  const id = crypto.randomBytes(16).toString('hex');
  pendingSelections.set(id, {
    userId,
    longToken,
    expiresIn,
    candidates,
    expiresAt: Date.now() + SELECTION_TTL_MS,
  });
  return id;
}

export function getSelection(id, userId) {
  const s = pendingSelections.get(id);
  if (!s || s.expiresAt < Date.now() || s.userId !== userId) return null;
  return s;
}

export function clearSelection(id) {
  pendingSelections.delete(id);
}
