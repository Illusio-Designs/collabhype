import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Building2,
  ChevronRight,
  LifeBuoy,
  LogOut,
  Settings,
  ShoppingBag,
  Sparkles,
} from 'lucide-react-native';
import { Avatar, Card, ListRow } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import BrandWatermark from '@/components/BrandWatermark';
import ScreenHeader from '@/components/ScreenHeader';
import { useAuth } from '@/lib/auth';
import { COLORS } from '@/lib/theme';

export default function BrandProfile() {
  const { user, logout } = useAuth();
  const company = user?.brandProfile?.companyName ?? '—';

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader eyebrow="Account" title="Profile" />

        <Card>
          <View className="flex-row items-center gap-3">
            <Avatar name={user?.fullName} size="xl" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-zinc-900">{user?.fullName}</Text>
              <Text className="text-sm text-zinc-500">{user?.email}</Text>
              <Text className="mt-1 text-xs font-semibold text-brand-700">
                Brand · {company}
              </Text>
            </View>
          </View>
        </Card>

        <Text className="mb-2 ml-1 mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Browse
        </Text>
        <Card className="!p-0 overflow-hidden">
          <ListRow
            icon={<ShoppingBag size={18} color={COLORS.brand[700]} />}
            title="Packages"
            subtitle="Curated bundles of creators"
            onPress={() => router.push('/browse-packages')}
          />
          <View className="h-px bg-zinc-100" />
          <ListRow
            icon={<Sparkles size={18} color={COLORS.brand[700]} />}
            title="Influencers"
            subtitle="Hand-pick creators by tier, niche, city"
            onPress={() => router.push('/browse-creators')}
          />
        </Card>

        <Text className="mb-2 ml-1 mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Setup
        </Text>
        <Card className="!p-0 overflow-hidden">
          <ListRow
            icon={<Building2 size={18} color={COLORS.brand[700]} />}
            title="Brand profile"
            subtitle="Company info, GSTIN, logo"
            onPress={() => router.push('/profile-edit')}
          />
        </Card>

        <Text className="mb-2 ml-1 mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Support
        </Text>
        <Card className="!p-0 overflow-hidden">
          <ListRow
            icon={<LifeBuoy size={18} color={COLORS.brand[700]} />}
            title="Help & disputes"
            subtitle="Open a ticket, see status"
            onPress={() => router.push('/support')}
          />
          <View className="h-px bg-zinc-100" />
          <ListRow
            icon={<Settings size={18} color={COLORS.brand[700]} />}
            title="Settings"
            subtitle="Password, notifications"
            onPress={() => router.push('/settings')}
          />
        </Card>

        <Card className="mt-6 !p-0 overflow-hidden">
          <ListRow
            icon={<LogOut size={18} color="#dc2626" />}
            title="Sign out"
            danger
            onPress={logout}
            right={<ChevronRight size={16} color={COLORS.zinc[400]} />}
          />
        </Card>

        <Text className="mt-6 text-center text-[11px] text-zinc-400">
          Managed by Finvera Solution LLP
        </Text>

        <View className="mt-8">
          <BrandWatermark />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
