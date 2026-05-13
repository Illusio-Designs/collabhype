import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import ScreenHeader from '@/components/ScreenHeader';
import { useAuth } from '@/lib/auth';
import { TIER_LABEL, formatCount } from '@/lib/format';

export default function CreatorProfile() {
  const { user, logout } = useAuth();
  const profile = user?.influencerProfile ?? {};

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
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
                <Text className="text-xs text-zinc-500">· {profile.city}</Text>
              </View>
            </View>
          </View>
        </Card>

        <View className="mt-3 flex-row gap-3">
          <Card className="flex-1">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Followers
            </Text>
            <Text className="mt-1 text-xl font-bold text-zinc-900">
              {formatCount(profile.totalFollowers ?? 0)}
            </Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Engagement
            </Text>
            <Text className="mt-1 text-xl font-bold text-zinc-900">
              {(profile.avgEngagementRate ?? 0).toFixed(1)}%
            </Text>
          </Card>
        </View>

        <View className="mt-6">
          <Button variant="outline" onPress={logout} fullWidth>
            Sign out
          </Button>
        </View>

        <Text className="mt-6 text-center text-[11px] text-zinc-400">
          Managed by Finvera Solution LLP
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
