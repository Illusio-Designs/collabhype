import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import * as instagram from './instagram.service.js';
import * as youtube from './youtube.service.js';
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

function buildSocialsUrl(params) {
  const url = new URL('/dashboard/socials', env.FRONTEND_BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, String(v));
  });
  return url.toString();
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
    return res.redirect(buildSocialsUrl({ error: err.message ?? 'Instagram OAuth failed' }));
  }
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
    return res.redirect(buildSocialsUrl({ error: err.message ?? 'YouTube OAuth failed' }));
  }
}
