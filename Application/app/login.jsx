import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, Sparkles } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { COLORS } from '@/lib/theme';

export default function LoginScreen() {
  const { loginDemo } = useAuth();
  const [busy, setBusy] = useState(null);

  const pick = async (role) => {
    setBusy(role);
    await loginDemo(role);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center py-10">
          <View className="mb-12 items-center">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-brand-700">
              <Text className="text-3xl font-black text-white">C</Text>
            </View>
            <Text className="text-3xl font-bold text-zinc-900">Collabhype</Text>
            <Text className="mt-2 text-center text-zinc-600">
              India&apos;s self-serve influencer marketplace
            </Text>
          </View>

          <Text className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Demo mode · Pick a role to explore
          </Text>

          <View className="gap-3">
            <RoleCard
              icon={<Building2 size={22} color={COLORS.brand[700]} />}
              title="Continue as Brand"
              subtitle="Book creators, brief campaigns, approve drafts"
              busy={busy === 'BRAND'}
              onPress={() => pick('BRAND')}
            />
            <RoleCard
              icon={<Sparkles size={22} color={COLORS.brand[700]} />}
              title="Continue as Creator"
              subtitle="Pick up campaigns, upload drafts, track payouts"
              busy={busy === 'INFLUENCER'}
              onPress={() => pick('INFLUENCER')}
            />
          </View>

          <Text className="mt-10 text-center text-[11px] text-zinc-400">
            Managed by Finvera Solution LLP
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoleCard({ icon, title, subtitle, busy, onPress }) {
  return (
    <View className="rounded-2xl border border-zinc-200 bg-white p-4">
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-zinc-900">{title}</Text>
          <Text className="text-xs text-zinc-600">{subtitle}</Text>
        </View>
      </View>
      <Button onPress={onPress} loading={busy} fullWidth>
        Continue
      </Button>
    </View>
  );
}
