import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Stat } from '@/components/ui';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth';
import { formatCount, formatINR } from '@/lib/format';
import { DUMMY_CAMPAIGNS_INFLUENCER, DUMMY_PAYOUT_SUMMARY } from '@/lib/dummyData';

export default function CreatorOverview() {
  const { user } = useAuth();
  const firstName = (user?.fullName || '').split(' ')[0];
  const profile = user?.influencerProfile ?? {};

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Creator dashboard"
          title={`Hey ${firstName} 👋`}
          subtitle="Your campaigns, earnings, and growth — all here."
        />

        <View className="flex-row gap-3">
          <Stat
            label="Followers"
            value={formatCount(profile.totalFollowers ?? 0)}
            hint="total"
          />
          <Stat
            label="Engagement"
            value={`${(profile.avgEngagementRate ?? 0).toFixed(1)}%`}
            hint="avg"
          />
        </View>
        <View className="mt-3 flex-row gap-3">
          <Stat label="This month" value={formatINR(DUMMY_PAYOUT_SUMMARY.paid)} hint="earned" />
          <Stat label="Pending" value={formatINR(DUMMY_PAYOUT_SUMMARY.pending)} hint="payouts" />
        </View>

        <Text className="mb-3 mt-6 text-base font-semibold text-zinc-900">
          Active campaigns
        </Text>
        <View className="gap-2.5">
          {DUMMY_CAMPAIGNS_INFLUENCER.map((c) => (
            <Card key={c.id}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900">{c.title}</Text>
                  <Text className="mt-0.5 text-xs text-zinc-500">
                    {c.order?.brand?.brandProfile?.companyName} ·{' '}
                    {c.deliverables.length} deliverables
                  </Text>
                </View>
                <StatusBadge status={c.status} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
