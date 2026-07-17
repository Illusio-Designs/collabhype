import axios from 'axios';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { encrypt } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';
import { recomputeTier } from '../influencer/influencer.service.js';

// TikTok Login Kit (v2). Docs: https://developers.tiktok.com/doc/login-kit-web
const TT_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TT_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TT_USER_URL = 'https://open.tiktokapis.com/v2/user/info/';

// basic → display_name + avatar; stats → follower/following/likes/video counts.
const REQUIRED_SCOPES = ['user.info.basic', 'user.info.stats'];

function ensureConfigured() {
  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET || !env.TIKTOK_REDIRECT_URI) {
    throw ApiError.badRequest('TikTok OAuth is not configured on the server');
  }
}

export function buildAuthUrl(state) {
  ensureConfigured();
  const params = new URLSearchParams({
    client_key: env.TIKTOK_CLIENT_KEY,
    redirect_uri: env.TIKTOK_REDIRECT_URI,
    response_type: 'code',
    scope: REQUIRED_SCOPES.join(','),
    state,
  });
  return `${TT_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeAndSync(userId, code) {
  ensureConfigured();

  // 1. code → tokens (v2 returns the fields at the top level)
  const tokenRes = await axios.post(
    TT_TOKEN_URL,
    new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.TIKTOK_REDIRECT_URI,
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  const { access_token, refresh_token, expires_in } = tokenRes.data ?? {};
  if (!access_token) {
    throw ApiError.badRequest(tokenRes.data?.error_description || 'TikTok token exchange failed');
  }

  // 2. Profile + stats
  const fields = [
    'open_id',
    'display_name',
    'avatar_url',
    'profile_deep_link',
    'follower_count',
    'following_count',
    'likes_count',
    'video_count',
  ].join(',');
  const infoRes = await axios.get(TT_USER_URL, {
    params: { fields },
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const user = infoRes.data?.data?.user;
  if (!user) {
    const msg = infoRes.data?.error?.message || 'Could not read TikTok profile';
    throw ApiError.badRequest(msg);
  }

  const followers = user.follower_count ?? 0;
  const videos = user.video_count ?? 0;
  const totalLikes = user.likes_count ?? 0;

  // Approximate engagement from lifetime stats (avg likes per video ÷ followers).
  // Per-video engagement sync ships in a later phase, matching YouTube.
  const avgLikes = videos ? Math.round(totalLikes / videos) : 0;
  const engagementRate = followers ? (avgLikes / followers) * 100 : 0;

  // 3. Persist
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');

  const data = {
    handle: user.display_name || user.open_id,
    externalId: user.open_id,
    profileUrl: user.profile_deep_link ?? null,
    followers,
    following: user.following_count ?? 0,
    posts: videos,
    avgLikes,
    engagementRate,
    accessToken: encrypt(access_token),
    refreshToken: refresh_token ? encrypt(refresh_token) : null,
    tokenExpiresAt: new Date(Date.now() + (expires_in ?? 86400) * 1000),
    lastSyncedAt: new Date(),
    isVerified: true,
  };

  const account = await prisma.socialAccount.upsert({
    where: { influencerId_platform: { influencerId: profile.id, platform: 'TIKTOK' } },
    update: data,
    create: { influencerId: profile.id, platform: 'TIKTOK', ...data },
  });

  await recomputeTier(profile.id);
  return account;
}
