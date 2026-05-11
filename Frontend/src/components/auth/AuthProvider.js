'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import {
  clearAuth,
  getStoredUser,
  getToken,
  isDemoMode,
  setDemoMode,
  setStoredUser,
  setToken,
} from '@/lib/auth';
import { DUMMY_ADMIN_USER, DUMMY_BRAND_USER, DUMMY_INFLUENCER_USER } from '@/lib/dummyData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore from localStorage on first mount; refresh from API in background
  useEffect(() => {
    const stored = getStoredUser();
    const token = getToken();
    if (stored && token) {
      setUser(stored);
      // In demo mode the apiClient short-circuits to dummy data — keep the user
      // refreshed but never clear auth on a failure.
      apiClient
        .get('/api/v1/auth/me')
        .then(({ data }) => {
          if (data?.user) {
            setUser(data.user);
            setStoredUser(data.user);
          }
        })
        .catch(() => {
          if (!isDemoMode()) {
            clearAuth();
            setUser(null);
          }
        });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await apiClient.post('/api/v1/auth/login', { email, password });
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await apiClient.post('/api/v1/auth/register', payload);
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  // Skip the API entirely and sign in as a demo brand or creator.
  // The apiClient interceptor will return dummy data for every dashboard fetch.
  const demoLogin = useCallback((role = 'BRAND') => {
    const demoUser =
      role === 'ADMIN'
        ? DUMMY_ADMIN_USER
        : role === 'INFLUENCER'
          ? DUMMY_INFLUENCER_USER
          : DUMMY_BRAND_USER;
    setToken(`demo-${role.toLowerCase()}-token`);
    setStoredUser(demoUser);
    setDemoMode(true, role);
    setUser(demoUser);
    return demoUser;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
