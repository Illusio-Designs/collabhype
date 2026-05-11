export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = j.message || JSON.stringify(j);
    } catch {}
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json();
}

// Server-safe with fallback — useful when the backend is down during dev so
// the marketing UI still renders.
export async function apiFetchSafe(path, fallback = null) {
  try {
    return await apiFetch(path);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[apiFetchSafe] ${path} failed:`, err.message);
    }
    return fallback;
  }
}
