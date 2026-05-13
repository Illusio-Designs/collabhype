import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { COLORS } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

// Compact app bar that sits at the top of every dashboard tab screen — mirrors
// the web `TopBar` (brand mark + welcome + bell + avatar). On mobile we keep
// the bell as the right-side quick action since space is tight.

export default function AppHeader({ rightAction, unreadCount = 0 }) {
  const { user } = useAuth();
  const firstName = (user?.fullName || '').split(' ')[0];
  const inboxRoute =
    user?.role === 'BRAND' ? '/(brand)/inbox' : '/(creator)/inbox';

  return (
    <View className="flex-row items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-700">
        <Text className="text-base font-black text-white">C</Text>
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          {user?.role === 'BRAND' ? 'Brand' : 'Creator'}
        </Text>
        <Text className="text-sm font-bold text-zinc-900" numberOfLines={1}>
          {firstName ? `Welcome, ${firstName}` : 'Collabhype'}
        </Text>
      </View>

      {rightAction}

      <Pressable
        onPress={() => router.push(inboxRoute)}
        className="relative h-9 w-9 items-center justify-center rounded-full bg-zinc-100 active:bg-zinc-200"
        accessibilityLabel="Notifications"
      >
        <Bell size={16} color={COLORS.zinc[700]} />
        {unreadCount > 0 && (
          <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Pressable>
    </View>
  );
}
