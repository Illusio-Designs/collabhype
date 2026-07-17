// Real backend client for the Collabhype mobile app.
//
// Talks to the Node/Express API (same one the web Frontend uses). The base URL
// comes from EXPO_PUBLIC_API_BASE_URL (Expo inlines EXPO_PUBLIC_* at build
// time); we append the `/api/v1` prefix the backend mounts everything under.
//
// The JWT is kept in a module-level variable so the request interceptor can
// attach it synchronously. `AuthProvider` is the single source of truth: it
// restores the token from AsyncStorage on boot and calls `setAuthToken`.

import axios from 'axios';

const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:4000';

export const API_ROOT = `${RAW_BASE}/api/v1`;

export const api = axios.create({
  baseURL: API_ROOT,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

let authToken = null;
let onUnauthorized = null;

/** Set (or clear, with null) the bearer token used for every request. */
export function setAuthToken(token) {
  authToken = token || null;
}

/** Register a callback fired when the API returns 401 (expired/invalid token). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      authToken = null;
      onUnauthorized?.();
    }
    return Promise.reject(err);
  },
);

/** Best-effort human-readable message from an axios error. */
export function apiError(err) {
  const data = err?.response?.data;
  return (
    data?.message ||
    data?.error ||
    (Array.isArray(data?.errors) && data.errors[0]?.message) ||
    err?.message ||
    'Something went wrong'
  );
}
