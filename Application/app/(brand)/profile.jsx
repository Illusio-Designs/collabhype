import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Card } from '@/components/ui';
import ScreenHeader from '@/components/ScreenHeader';
import { useAuth } from '@/lib/auth';

export default function BrandProfile() {
  const { user, logout } = useAuth();

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
              <Text className="mt-1 text-xs text-brand-700">Brand account</Text>
            </View>
          </View>
        </Card>

        <Card className="mt-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Company
          </Text>
          <Text className="mt-2 text-base font-bold text-zinc-900">
            {user?.brandProfile?.companyName ?? '—'}
          </Text>
          <Text className="mt-1 text-sm text-zinc-500">
            Industry: {user?.brandProfile?.industry ?? '—'}
          </Text>
        </Card>

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
