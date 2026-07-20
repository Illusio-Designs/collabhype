import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  User,
} from 'lucide-react-native';
import { COLORS } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

export default function BrandTabsLayout() {
  const { user, isLoading } = useAuth();

  // Login-gated, like the web dashboard: no session → login; wrong role →
  // bounce to the matching group so a creator can't land in brand tabs.
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.brand[700]} />
      </View>
    );
  }
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'BRAND') return <Redirect href="/(creator)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.brand[700],
        tabBarInactiveTintColor: COLORS.zinc[400],
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: COLORS.zinc[100], paddingTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: 'Campaigns',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
