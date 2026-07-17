'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import {
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '@/lib/auth';

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
      // Refresh from the API in the background; drop the session if the token
      // is no longer valid.
      apiClient
        .get('/api/v1/auth/me')
        .then(({ data }) => {
          if (data?.user) {
            setUser(data.user);
            setStoredUser(data.user);
          }
        })
        .catch(() => {
          clearAuth();
          setUser(null);
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

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
