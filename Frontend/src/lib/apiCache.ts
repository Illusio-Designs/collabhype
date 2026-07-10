import { apiClient } from './apiClient';

// =============================================================================
// Request de-duplication + short-lived cache.
//
// Two problems this solves:
//   1. Duplicate calls — React StrictMode double-mounts effects, and multiple
//      components can request the same resource on one render pass. Identical
//      in-flight GETs share a single network request instead of firing N times.
//   2. Rapid re-fetch — a tiny TTL cache returns the last response for the same
//      URL within `ttl` ms, so navigating away and back doesn't re-hit the API.
//
// This is opt-in: use `dedupedGet` for reads. ALWAYS call `invalidate(prefix)`
// after a mutation so the next read is fresh. Mutations themselves never go
// through here — they must always hit the server.
// =============================================================================

interface Entry {
  at: number;
  data: unknown;
}

const inflight = new Map<string, Promise<unknown>>();
const cache = new Map<string, Entry>();

const DEFAULT_TTL = 15_000; // 15s — long enough to absorb double-mounts + quick nav

export interface DedupOptions {
  /** Cache lifetime in ms. Pass 0 to dedupe concurrent calls but never cache. */
  ttl?: number;
  /** Skip the cache read and force a fresh request (still de-duplicated). */
  force?: boolean;
}

export async function dedupedGet<T = unknown>(
  url: string,
  { ttl = DEFAULT_TTL, force = false }: DedupOptions = {},
): Promise<T> {
  const now = Date.now();

  if (!force) {
    const hit = cache.get(url);
    if (hit && ttl > 0 && now - hit.at < ttl) {
      return hit.data as T;
    }
    const pending = inflight.get(url);
    if (pending) return pending as Promise<T>;
  }

  const req = apiClient
    .get(url)
    .then(({ data }) => {
      if (ttl > 0) cache.set(url, { at: Date.now(), data });
      inflight.delete(url);
      return data as T;
    })
    .catch((err) => {
      inflight.delete(url);
      throw err;
    });

  inflight.set(url, req);
  return req as Promise<T>;
}

/**
 * Drop cached responses. With no argument, clears everything. With a prefix,
 * clears every cached URL that starts with it — e.g. `invalidate('/api/v1/cart')`
 * after mutating the cart. Also drops any matching in-flight promise so a
 * refetch right after a mutation isn't served a stale shared request.
 */
export function invalidate(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    inflight.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}
