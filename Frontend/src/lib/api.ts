export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface ApiFetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { message?: string };
      detail = j.message || JSON.stringify(j);
    } catch {}
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return (await res.json()) as T;
}

// Server-safe with fallback — useful when the backend is down during dev so
// the marketing UI still renders.
export async function apiFetchSafe<T>(path: string, fallback: T | null = null): Promise<T | null> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[apiFetchSafe] ${path} failed:`, msg);
    }
    return fallback;
  }
}
