import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { DUMMY_USERS } from './dummyData';

// Demo auth — same pattern as the web Frontend. Persists the picked role
// to AsyncStorage so reopen-the-app lands the user back on their dashboard.
// Replace `loginDemo` with a real fetch once the Backend is wired.

const AUTH_KEY = 'ch_mobile_auth';

const AuthContext = createContext(null);

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

  const loginDemo = async (role) => {
    // role is 'BRAND' or 'INFLUENCER'.
    const u = role === 'BRAND' ? DUMMY_USERS.brand : DUMMY_USERS.creator;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
    router.replace(role === 'BRAND' ? '/(brand)' : '/(creator)');
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
