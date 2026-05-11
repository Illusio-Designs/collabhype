import axios from 'axios';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { encrypt } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';
import { recomputeTier } from '../influencer/influencer.service.js';

const G_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const G_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YT_API = 'https://www.googleapis.com/youtube/v3';

function ensureConfigured() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    throw ApiError.badRequest('YouTube OAuth is not configured on the server');
  }
}

export function buildAuthUrl(state) {
  ensureConfigured();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `${G_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeAndSync(userId, code) {
  ensureConfigured();

  // 1. code → tokens
  const tokenRes = await axios.post(
    G_TOKEN_URL,
    new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  const { access_token, refresh_token, expires_in } = tokenRes.data;

  // 2. Channel snapshot
  const chRes = await axios.get(`${YT_API}/channels`, {
    params: { part: 'snippet,statistics', mine: 'true' },
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const ch = chRes.data?.items?.[0];
  if (!ch) throw ApiError.badRequest('No YouTube channel found for this Google account');

  const subs = parseInt(ch.statistics.subscriberCount ?? '0', 10);
  const videos = parseInt(ch.statistics.videoCount ?? '0', 10);

  // Engagement is left at 0 for v1 — per-video stats sync ships in a later phase.
  const engagementRate = 0;

  // 3. Persist
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');

  const handle = ch.snippet.customUrl || ch.snippet.title;

  const data = {
    handle,
    externalId: ch.id,
    profileUrl: `https://youtube.com/channel/${ch.id}`,
    followers: subs,
    posts: videos,
    engagementRate,
    accessToken: encrypt(access_token),
    refreshToken: refresh_token ? encrypt(refresh_token) : null,
    tokenExpiresAt: new Date(Date.now() + (expires_in ?? 3600) * 1000),
    lastSyncedAt: new Date(),
    isVerified: true,
  };

  const account = await prisma.socialAccount.upsert({
    where: { influencerId_platform: { influencerId: profile.id, platform: 'YOUTUBE' } },
    update: data,
    create: { influencerId: profile.id, platform: 'YOUTUBE', ...data },
  });

  await recomputeTier(profile.id);
  return account;
}
