import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { COLORS } from '@/lib/theme';

// Splash route — decides where to send the user based on auth state.
export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'BRAND') {
      router.replace('/(brand)');
    } else {
      router.replace('/(creator)');
    }
  }, [user, isLoading]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={COLORS.brand[700]} />
    </View>
  );
}
