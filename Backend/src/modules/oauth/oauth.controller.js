import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import * as instagram from './instagram.service.js';
import * as facebook from './facebook.service.js';
import * as youtube from './youtube.service.js';
import * as tiktok from './tiktok.service.js';
import { ApiError } from '../../utils/ApiError.js';

// State JWT carries the initiating userId across the OAuth round-trip
// (the callback URL is hit by Meta/Google, not the user's authenticated client).
function signState(userId, provider) {
  return jwt.sign({ sub: userId, provider, kind: 'oauth' }, env.JWT_SECRET, {
    expiresIn: '10m',
  });
}

function verifyState(state, expectedProvider) {
  const payload = jwt.verify(state, env.JWT_SECRET);
  if (payload.kind !== 'oauth' || payload.provider !== expectedProvider) {
    throw new Error('state/provider mismatch');
  }
  return payload.sub;
}

// Short-lived token handed to the frontend when a creator has 2+ Instagram
// accounts to choose from. Carries the selection id + user id.
function signSelection(selectionId, userId) {
  return jwt.sign({ sel: selectionId, sub: userId, kind: 'oauth-select' }, env.JWT_SECRET, {
    expiresIn: '10m',
  });
}

function verifySelection(token, userId) {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (payload.kind !== 'oauth-select' || payload.sub !== userId) {
    throw ApiError.badRequest('Invalid selection token');
  }
  return payload.sel;
}

function buildSocialsUrl(params) {
  const url = new URL('/dashboard/socials', env.FRONTEND_BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

// Pull the real provider error out of an axios/API failure. Meta and Google
// return { error: { message } }; OAuth token endpoints use error_description.
// Falls back to the generic message so we never show an empty error.
function providerError(err, provider) {
  const data = err?.response?.data;
  const detail =
    data?.error?.message ||
    data?.error_description ||
    (typeof data?.error === 'string' ? data.error : null) ||
    err?.message;
  // Log the full detail server-side for debugging (redacted tokens aside).
  console.error(`[oauth:${provider}] callback failed:`, detail || err);
  return detail ? `${provider} connection failed: ${detail}` : `${provider} OAuth failed`;
}

export async function startInstagram(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const state = signState(req.user.sub, 'instagram');
  res.json({ authUrl: instagram.buildAuthUrl(state) });
}

export async function callbackInstagram(req, res) {
  const { code, state, error, error_description } = req.query;
  if (error) {
    return res.redirect(buildSocialsUrl({ error: error_description || error }));
  }
  if (!code || !state) {
    return res.redirect(buildSocialsUrl({ error: 'Missing code or state' }));
  }
  try {
    const userId = verifyState(String(state), 'instagram');
    const account = await instagram.exchangeCodeAndSync(userId, String(code));
    return res.redirect(
      buildSocialsUrl({
        platform: 'instagram',
        handle: account.handle,
        followers: account.followers,
      }),
    );
  } catch (err) {
    return res.redirect(buildSocialsUrl({ error: providerError(err, 'Instagram') }));
  }
}

// Facebook Login → connect Instagram via the linked Facebook Page. Saves an
// INSTAGRAM social account, same as the direct-Instagram flow.
export async function startFacebook(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const state = signState(req.user.sub, 'facebook');
  res.json({ authUrl: facebook.buildAuthUrl(state) });
}

export async function callbackFacebook(req, res) {
  const { code, state, error, error_description } = req.query;
  if (error) {
    return res.redirect(buildSocialsUrl({ error: error_description || error }));
  }
  if (!code || !state) {
    return res.redirect(buildSocialsUrl({ error: 'Missing code or state' }));
  }
  try {
    const userId = verifyState(String(state), 'facebook');
    const { longToken, expiresIn } = await facebook.exchangeCode(String(code));
    const candidates = await facebook.listCandidates(longToken);

    if (candidates.length === 0) {
      return res.redirect(
        buildSocialsUrl({
          error: 'No Instagram Business/Creator account is linked to your Facebook Pages.',
        }),
      );
    }

    // Single account → connect it straight away.
    if (candidates.length === 1) {
      const account = await facebook.syncInstagram(
        userId,
        longToken,
        candidates[0].igUserId,
        expiresIn,
      );
      return res.redirect(
        buildSocialsUrl({
          platform: 'instagram',
          handle: account.handle,
          followers: account.followers,
        }),
      );
    }

    // Multiple accounts → let the creator pick on the socials page.
    const selectionId = facebook.putSelection(userId, longToken, expiresIn, candidates);
    return res.redirect(buildSocialsUrl({ select: signSelection(selectionId, userId) }));
  } catch (err) {
    return res.redirect(buildSocialsUrl({ error: providerError(err, 'Facebook') }));
  }
}

// Return the pending Instagram accounts for the creator to choose from.
export async function facebookCandidates(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const selectionId = verifySelection(String(req.query.token || ''), req.user.sub);
  const selection = facebook.getSelection(selectionId, req.user.sub);
  if (!selection) throw ApiError.badRequest('Selection expired — please reconnect.');
  const candidates = selection.candidates.map(({ igUserId, username, followers, avatarUrl, pageName }) => ({
    igUserId,
    username,
    followers,
    avatarUrl,
    pageName,
  }));
  res.json({ candidates });
}

// Finalize the connection with the account the creator picked.
export async function facebookSelect(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { token, igUserId } = req.body ?? {};
  const selectionId = verifySelection(String(token || ''), req.user.sub);
  const selection = facebook.getSelection(selectionId, req.user.sub);
  if (!selection) throw ApiError.badRequest('Selection expired — please reconnect.');
  const chosen = selection.candidates.find((c) => c.igUserId === String(igUserId));
  if (!chosen) throw ApiError.badRequest('That account is no longer available to select.');

  const account = await facebook.syncInstagram(
    req.user.sub,
    selection.longToken,
    chosen.igUserId,
    selection.expiresIn,
  );
  facebook.clearSelection(selectionId);
  res.json({ account: { handle: account.handle, followers: account.followers } });
}

export async function startYoutube(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const state = signState(req.user.sub, 'youtube');
  res.json({ authUrl: youtube.buildAuthUrl(state) });
}

export async function callbackYoutube(req, res) {
  const { code, state, error } = req.query;
  if (error) {
    return res.redirect(buildSocialsUrl({ error }));
  }
  if (!code || !state) {
    return res.redirect(buildSocialsUrl({ error: 'Missing code or state' }));
  }
  try {
    const userId = verifyState(String(state), 'youtube');
    const account = await youtube.exchangeCodeAndSync(userId, String(code));
    return res.redirect(
      buildSocialsUrl({
        platform: 'youtube',
        handle: account.handle,
        followers: account.followers,
      }),
    );
  } catch (err) {
    return res.redirect(buildSocialsUrl({ error: providerError(err, 'YouTube') }));
  }
}

export async function startTiktok(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const state = signState(req.user.sub, 'tiktok');
  res.json({ authUrl: tiktok.buildAuthUrl(state) });
}

export async function callbackTiktok(req, res) {
  const { code, state, error, error_description } = req.query;
  if (error) {
    return res.redirect(buildSocialsUrl({ error: error_description || error }));
  }
  if (!code || !state) {
    return res.redirect(buildSocialsUrl({ error: 'Missing code or state' }));
  }
  try {
    const userId = verifyState(String(state), 'tiktok');
    const account = await tiktok.exchangeCodeAndSync(userId, String(code));
    return res.redirect(
      buildSocialsUrl({
        platform: 'tiktok',
        handle: account.handle,
        followers: account.followers,
      }),
    );
  } catch (err) {
    return res.redirect(buildSocialsUrl({ error: providerError(err, 'TikTok') }));
  }
}
