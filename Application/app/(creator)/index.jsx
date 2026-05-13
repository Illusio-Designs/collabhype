import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, KpiStrip, SectionHead } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth';
import { formatCount, formatINR } from '@/lib/format';
import {
  DUMMY_CAMPAIGNS_INFLUENCER,
  DUMMY_NOTIFICATIONS,
  DUMMY_PAYOUTS,
  DUMMY_PAYOUT_SUMMARY,
} from '@/lib/dummyData';

export default function CreatorOverview() {
  const { user } = useAuth();
  const firstName = (user?.fullName || '').split(' ')[0];
  const profile = user?.influencerProfile ?? {};

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader unreadCount={2} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Creator dashboard"
          title={`Hey ${firstName} 👋`}
          subtitle="Your campaigns, earnings, and growth — all here."
        />

        <KpiStrip
          kpis={[
            { label: 'Followers', value: formatCount(profile.totalFollowers ?? 0) },
            { label: 'Engagement', value: `${(profile.avgEngagementRate ?? 0).toFixed(1)}%` },
            { label: 'Earned (mo)', value: formatINR(DUMMY_PAYOUT_SUMMARY.paid) },
            { label: 'Pending', value: formatINR(DUMMY_PAYOUT_SUMMARY.pending) },
          ]}
        />

        <View className="mt-6">
          <SectionHead
            title="Active campaigns"
            onPressMore={() => router.push('/(creator)/campaigns')}
          />
          <View className="gap-2.5">
            {DUMMY_CAMPAIGNS_INFLUENCER.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/campaign/${c.id}`)}
              >
                <Card className="border-zinc-100">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-[11px] text-zinc-500">
                        {c.order?.brand?.brandProfile?.companyName}
                      </Text>
                      <Text className="mt-0.5 text-sm font-bold text-zinc-900">
                        {c.title}
                      </Text>
                      <Text className="mt-1 text-xs text-zinc-500">
                        {c.deliverables.length} deliverables
                      </Text>
                    </View>
                    <StatusBadge status={c.status} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-6">
          <SectionHead
            title="Recent payouts"
            onPressMore={() => router.push('/(creator)/payouts')}
          />
          <View className="gap-2.5">
            {DUMMY_PAYOUTS.slice(0, 3).map((p) => (
              <Card key={p.id} className="border-zinc-100">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-bold text-zinc-900">
                      {formatINR(p.amount)}
                    </Text>
                    <Text className="mt-0.5 text-[11px] text-zinc-500">
                      {p.method} · {p.createdAt}
                    </Text>
                  </View>
                  <StatusBadge status={p.status} />
                </View>
              </Card>
            ))}
          </View>
        </View>

        <View className="mt-6">
          <SectionHead
            title="Latest activity"
            onPressMore={() => router.push('/(creator)/inbox')}
          />
          <View className="gap-2.5">
            {DUMMY_NOTIFICATIONS.slice(0, 2).map((n) => (
              <Card key={n.id} className="border-zinc-100">
                <View className="flex-row items-start gap-3">
                  <View className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-zinc-900">{n.title}</Text>
                    <Text className="mt-0.5 text-xs text-zinc-600">{n.body}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
