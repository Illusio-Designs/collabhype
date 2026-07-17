import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { clearAuth, getToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err?.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(err);
  },
);

export function apiError(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const ax = err as AxiosError<{ message?: string }>;
    return ax.response?.data?.message || ax.message || 'Something went wrong';
  }
  return 'Something went wrong';
}
