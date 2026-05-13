import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { DUMMY_USERS } from './dummyData';

// Demo auth — same pattern as the web Frontend. Persists the logged-in user
// to AsyncStorage so reopening the app lands you back on the right dashboard.
// `login` / `register` accept real form values but always resolve via the
// demo dataset (real OAuth + Backend hookup comes in the next phase).

const AUTH_KEY = 'ch_mobile_auth';

const AuthContext = createContext(null);

function routeFor(role) {
  return role === 'BRAND' ? '/(brand)' : '/(creator)';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Quick role-pick used by the demo buttons.
  const loginDemo = async (role) => {
    const u = role === 'BRAND' ? DUMMY_USERS.brand : DUMMY_USERS.creator;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
    router.replace(routeFor(role));
  };

  // Email + password form — currently demo mode. We map an email starting
  // with "brand@" to a BRAND session; anything else becomes a creator.
  // Returns { ok, error } so the form can show inline error text.
  const login = async ({ email, password }) => {
    if (!email?.trim() || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    // Pretend network latency.
    await new Promise((r) => setTimeout(r, 400));
    const role = email.trim().toLowerCase().startsWith('brand@')
      ? 'BRAND'
      : 'INFLUENCER';
    const base = role === 'BRAND' ? DUMMY_USERS.brand : DUMMY_USERS.creator;
    const u = { ...base, email: email.trim() };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
    router.replace(routeFor(role));
    return { ok: true };
  };

  // Registration creates a fresh "user" derived from the chosen role and
  // signs them in immediately.
  const register = async ({ fullName, email, password, role }) => {
    if (!fullName?.trim() || !email?.trim() || !password) {
      return { ok: false, error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }
    await new Promise((r) => setTimeout(r, 500));
    const base =
      role === 'BRAND' ? DUMMY_USERS.brand : DUMMY_USERS.creator;
    const u = {
      ...base,
      id: `u_new_${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      role,
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
    router.replace(routeFor(role));
    return { ok: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, loginDemo, logout }}
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
