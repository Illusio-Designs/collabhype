import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

// Keys that must NEVER be returned over the API, even to an admin — exposing
// the JWT signing secret or a payment secret to any browser session enables
// token forgery / payment tampering if that response is ever logged or
// exfiltrated (XSS, shared screen, proxy).
const SECRET_KEYS = new Set([
  'jwt_secret',
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'meta_app_secret',
  'google_client_secret',
]);

class PlatformSettingsService {
  // In-memory cache (5 min TTL)
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Get setting from cache or database
  async getSetting(key) {
    // Check cache first
    if (this.cache.has(key) && this.cacheExpiry.get(key) > Date.now()) {
      return this.cache.get(key);
    }

    // Fallback to .env for critical secrets
    const envValue = this._getEnvValue(key);
    if (envValue) {
      this._setCacheValue(key, envValue);
      return envValue;
    }

    // Query database
    const setting = await prisma.platformSettings.findUnique({
      where: { key },
    });

    if (!setting || !setting.isActive) {
      return null;
    }

    const value = this._parseValue(setting.value, setting.type);
    this._setCacheValue(key, value);
    return value;
  }

  // True for keys that map to a hard secret (denylist above).
  isSecretKey(key) {
    return SECRET_KEYS.has(String(key ?? '').toLowerCase());
  }

  // API-safe read: refuses secret keys (denylist) AND any DB setting flagged
  // isSecret, returning null so the route can 404 without revealing existence.
  async getPublicSetting(key) {
    if (this.isSecretKey(key)) return null;
    const setting = await prisma.platformSettings.findUnique({ where: { key } });
    if (setting?.isSecret) return null;
    return this.getSetting(key);
  }

  // Set setting in database
  async setSetting(key, value, type = 'string', isSecret = false) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const setting = await prisma.platformSettings.upsert({
      where: { key },
      update: {
        value: stringValue,
        type,
        isSecret,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: stringValue,
        type,
        isSecret,
      },
    });

    // Invalidate cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);

    return this._parseValue(setting.value, setting.type);
  }

  // Get all active settings (excluding secrets)
  async getAllSettings(includeSecrets = false) {
    const settings = await prisma.platformSettings.findMany({
      where: { isActive: true },
    });

    const result = {};
    for (const setting of settings) {
      if (!setting.isSecret || includeSecrets) {
        result[setting.key] = this._parseValue(setting.value, setting.type);
      }
    }
    return result;
  }

  // Delete setting
  async deleteSetting(key) {
    await prisma.platformSettings.update({
      where: { key },
      data: { isActive: false },
    });
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  // Invalidate cache
  invalidateCache(key = null) {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  // ---- Private helpers ----

  _setCacheValue(key, value) {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.cacheTTL);
  }

  _parseValue(value, type) {
    if (type === 'json') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    if (type === 'number') return Number(value);
    if (type === 'boolean') return value === 'true' || value === '1';
    return value;
  }

  _getEnvValue(key) {
    // Map common keys to env variables
    const envMap = {
      jwt_secret: env.JWT_SECRET,
      jwt_expires_in: env.JWT_EXPIRES_IN,
      razorpay_key_id: env.RAZORPAY_KEY_ID,
      razorpay_key_secret: env.RAZORPAY_KEY_SECRET,
      razorpay_webhook_secret: env.RAZORPAY_WEBHOOK_SECRET,
      meta_app_id: env.META_APP_ID,
      meta_app_secret: env.META_APP_SECRET,
      google_client_id: env.GOOGLE_CLIENT_ID,
      google_client_secret: env.GOOGLE_CLIENT_SECRET,
    };

    return envMap[key.toLowerCase()] || null;
  }
}

export const platformSettings = new PlatformSettingsService();
