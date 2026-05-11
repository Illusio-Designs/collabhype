const TOKEN_KEY = 'cc_token';
const USER_KEY = 'cc_user';
const DEMO_KEY = 'cc_demo_mode';
const DEMO_ROLE_KEY = 'cc_demo_role';

export function isDemoMode() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_KEY) === '1';
}

export function setDemoMode(on, role) {
  if (typeof window === 'undefined') return;
  if (on) {
    localStorage.setItem(DEMO_KEY, '1');
    if (role) localStorage.setItem(DEMO_ROLE_KEY, role);
  } else {
    localStorage.removeItem(DEMO_KEY);
    localStorage.removeItem(DEMO_ROLE_KEY);
  }
}

export function getDemoRole() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEMO_ROLE_KEY);
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem(DEMO_ROLE_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
