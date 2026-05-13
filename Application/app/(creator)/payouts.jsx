import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Stat } from '@/components/ui';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatINR } from '@/lib/format';
import { DUMMY_PAYOUTS, DUMMY_PAYOUT_SUMMARY } from '@/lib/dummyData';

export default function CreatorPayouts() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Earnings"
          title="Payouts"
          subtitle="Released to your UPI within 1–2 business days."
        />

        <View className="flex-row gap-3">
          <Stat label="Total earned" value={formatINR(DUMMY_PAYOUT_SUMMARY.total)} />
          <Stat label="Pending" value={formatINR(DUMMY_PAYOUT_SUMMARY.pending)} />
        </View>

        <Text className="mb-3 mt-6 text-base font-semibold text-zinc-900">
          History
        </Text>
        <View className="gap-2.5">
          {DUMMY_PAYOUTS.map((p) => (
            <Card key={p.id}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-bold text-zinc-900">
                    {formatINR(p.amount)}
                  </Text>
                  <Text className="mt-0.5 text-xs text-zinc-500">{p.createdAt}</Text>
                </View>
                <StatusBadge status={p.status} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
