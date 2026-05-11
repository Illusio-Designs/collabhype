import crypto from 'node:crypto';
import { env } from '../config/env.js';

// AES-256-GCM at-rest encryption for OAuth tokens stored in MySQL.
// Key is derived from JWT_SECRET so rotating JWT_SECRET invalidates stored tokens
// (acceptable — users just re-link socials). For prod, switch to a dedicated TOKEN_ENC_KEY.
const ALGO = 'aes-256-gcm';

function getKey() {
  return crypto.createHash('sha256').update(env.JWT_SECRET).digest();
}

export function encrypt(plaintext) {
  if (plaintext == null) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

export function decrypt(payload) {
  if (payload == null) return null;
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}
