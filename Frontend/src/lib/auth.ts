import type { Role, User } from './types';

const TOKEN_KEY = 'ch_token';
const USER_KEY = 'ch_user';
const DEMO_KEY = 'ch_demo_mode';
const DEMO_ROLE_KEY = 'ch_demo_role';

// Vercel deploys without a backend, so default to demo mode unless the user
// has explicitly opted out (or a backend URL is configured to disable it).
const FORCE_DEMO =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_API_BASE_URL;

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return FORCE_DEMO;
  const stored = localStorage.getItem(DEMO_KEY);
  if (stored === '0') return false;
  if (stored === '1') return true;
  return FORCE_DEMO;
}

export function setDemoMode(on: boolean, role?: Role): void {
  if (typeof window === 'undefined') return;
  if (on) {
    localStorage.setItem(DEMO_KEY, '1');
    if (role) localStorage.setItem(DEMO_ROLE_KEY, role);
  } else {
    localStorage.setItem(DEMO_KEY, '0');
    localStorage.removeItem(DEMO_ROLE_KEY);
  }
}

export function getDemoRole(): Role | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEMO_ROLE_KEY) as Role | null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem(DEMO_ROLE_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
