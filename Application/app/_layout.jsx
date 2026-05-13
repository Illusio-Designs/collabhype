import '@/global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/lib/auth';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(brand)" />
          <Stack.Screen name="(creator)" />
          {/* Pushable detail / settings routes — accessible from either group */}
          <Stack.Screen name="campaign/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="order/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
          <Stack.Screen name="support" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile-edit" options={{ presentation: 'card' }} />
          <Stack.Screen name="rates" options={{ presentation: 'card' }} />
          <Stack.Screen name="socials" options={{ presentation: 'card' }} />
          <Stack.Screen name="browse-packages" options={{ presentation: 'card' }} />
          <Stack.Screen name="browse-creators" options={{ presentation: 'card' }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
