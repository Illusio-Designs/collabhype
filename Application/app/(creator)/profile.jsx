import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronRight,
  LifeBuoy,
  Link as LinkIcon,
  LogOut,
  Settings,
  User,
  Wallet,
} from 'lucide-react-native';
import { Avatar, Badge, Card, ListRow } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import BrandWatermark from '@/components/BrandWatermark';
import ScreenHeader from '@/components/ScreenHeader';
import { useAuth } from '@/lib/auth';
import { TIER_LABEL, formatCount } from '@/lib/format';
import { COLORS } from '@/lib/theme';

export default function CreatorProfile() {
  const { user, logout } = useAuth();
  const profile = user?.influencerProfile ?? {};

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
              <Text className="text-lg font-bold text-zinc-900">
                {user?.fullName}
              </Text>
              <Text className="text-sm text-zinc-500">{user?.email}</Text>
              <View className="mt-1.5 flex-row items-center gap-2">
                <Badge variant="brand">{TIER_LABEL[profile.tier] ?? profile.tier}</Badge>
                <Text className="text-[11px] text-zinc-500">· {profile.city}</Text>
              </View>
            </View>
          </View>
          <View className="mt-4 flex-row gap-3 border-t border-zinc-100 pt-4">
            <Stat label="Followers" value={formatCount(profile.totalFollowers ?? 0)} />
            <Stat
              label="Engagement"
              value={`${(profile.avgEngagementRate ?? 0).toFixed(1)}%`}
            />
            <Stat
              label="Available"
              value={profile.isAvailable !== false ? 'Yes' : 'No'}
            />
          </View>
        </Card>

        <Text className="mb-2 ml-1 mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Creator setup
        </Text>
        <Card className="!p-0 overflow-hidden">
          <ListRow
            icon={<User size={18} color={COLORS.brand[700]} />}
            title="Edit profile"
            subtitle="Bio, niches, availability"
            onPress={() => router.push('/profile-edit')}
          />
          <View className="h-px bg-zinc-100" />
          <ListRow
            icon={<LinkIcon size={18} color={COLORS.brand[700]} />}
            title="Connect socials"
            subtitle="Instagram, YouTube — real numbers"
            onPress={() => router.push('/socials')}
          />
          <View className="h-px bg-zinc-100" />
          <ListRow
            icon={<Wallet size={18} color={COLORS.brand[700]} />}
            title="Rate card"
            subtitle="Set your price per deliverable"
            onPress={() => router.push('/rates')}
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

function Stat({ label, value }) {
  return (
    <View className="flex-1">
      <Text className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </Text>
      <Text className="mt-0.5 text-sm font-bold text-zinc-900">{value}</Text>
    </View>
  );
}
