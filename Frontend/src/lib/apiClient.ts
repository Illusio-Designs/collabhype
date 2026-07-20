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

// Read a File into a base64 data URL (used for image uploads).
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Upload an image file to the backend and return its hosted URL.
export async function uploadImage(file: File, folder = 'misc'): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const { data } = await apiClient.post('/api/v1/uploads/image', { dataUrl, folder });
  return data.url as string;
}

export function apiError(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const ax = err as AxiosError<{ message?: string }>;
    return ax.response?.data?.message || ax.message || 'Something went wrong';
  }
  return 'Something went wrong';
}
