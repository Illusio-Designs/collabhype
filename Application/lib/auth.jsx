import { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { api, apiError, setAuthToken, setUnauthorizedHandler } from './api';

// Real auth against the Collabhype backend. The JWT + last-known user are
// cached in AsyncStorage so reopening the app lands you back on the right
// dashboard; on boot we refresh from /auth/me and drop the session on 401.

const TOKEN_KEY = 'ch_token';
const USER_KEY = 'ch_user';

const AuthContext = createContext(null);

function routeFor(role) {
  return role === 'BRAND' ? '/(brand)' : '/(creator)';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const persist = async (token, u) => {
    setAuthToken(token);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(u)],
    ]);
    setUser(u);
  };

  const clear = async () => {
    setAuthToken(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
  };

  // Bootstrap: restore the cached session, then refresh from the server.
  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const [[, token], [, rawUser]] = await AsyncStorage.multiGet([
          TOKEN_KEY,
          USER_KEY,
        ]);
        if (!token) return;
        setAuthToken(token);
        if (rawUser && mounted.current) {
          try {
            setUser(JSON.parse(rawUser));
          } catch {
            // ignore malformed cache
          }
        }
        const { data } = await api.get('/auth/me');
        if (mounted.current && data?.user) {
          setUser(data.user);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } catch (err) {
        if (err?.response?.status === 401) await clear();
      } finally {
        if (mounted.current) setIsLoading(false);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  // On any 401 the API layer clears the token — mirror that in React state and
  // bounce the user to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clear();
      router.replace('/login');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = async ({ email, password }) => {
    if (!email?.trim() || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      await persist(data.token, data.user);
      router.replace(routeFor(data.user.role));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: apiError(err) };
    }
  };

  const register = async ({ fullName, email, password, role }) => {
    if (!fullName?.trim() || !email?.trim() || !password) {
      return { ok: false, error: 'All fields are required.' };
    }
    if (password.length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters.' };
    }
    try {
      const { data } = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(role === 'BRAND' ? { companyName: fullName.trim() } : {}),
      });
      await persist(data.token, data.user);
      router.replace(routeFor(data.user.role));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: apiError(err) };
    }
  };

  // Re-fetch the current user (after a profile edit, etc.).
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data?.user) {
        setUser(data.user);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data?.user ?? null;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    await clear();
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
