// Consent-gated analytics. No tracking fires until the user accepts cookies.
// Events are sent to our own backend (/api/v1/track) where they're persisted
// for the admin tracking dashboard. Optionally also forwarded to GA4/Plausible.

const CONSENT_KEY = 'ch_cookie_consent';
const CONSENT_DATE_KEY = 'ch_cookie_consent_at';
const SESSION_KEY = 'ch_session_id';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export type ConsentValue = 'accepted' | 'declined' | null;

export function getConsent(): ConsentValue {
  if (typeof window === 'undefined') return null;
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(CONSENT_DATE_KEY);
    } else {
      localStorage.setItem(CONSENT_KEY, value);
      localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    }
    window.dispatchEvent(new CustomEvent('ch:consent-change', { detail: value }));
  } catch {}
}

export function hasConsent(): boolean {
  return getConsent() === 'accepted';
}

// ---- helpers ---------------------------------------------------------------

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('ch_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

interface TrackPayload {
  eventName: string;
  pageUrl: string;
  referer: string | null;
  sessionId: string | null;
  properties?: Record<string, unknown>;
}

async function sendToBackend(payload: TrackPayload): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`${API_BASE}/api/v1/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Tracking must never break the app
  }
}

// ---- public tracking API ---------------------------------------------------

export function trackPageView(path: string): void {
  if (!hasConsent()) return;
  if (typeof window === 'undefined') return;

  sendToBackend({
    eventName: 'page_view',
    pageUrl: path,
    referer: document.referrer || null,
    sessionId: getSessionId(),
  });

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.info('[track] page_view', path);
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!hasConsent()) return;
  if (typeof window === 'undefined') return;

  sendToBackend({
    eventName: name,
    pageUrl: window.location.pathname + window.location.search,
    referer: document.referrer || null,
    sessionId: getSessionId(),
    properties: params,
  });

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.info('[track]', name, params);
  }
}
