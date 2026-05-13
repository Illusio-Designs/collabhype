import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, KpiStrip } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatINR } from '@/lib/format';
import { DUMMY_PAYOUTS, DUMMY_PAYOUT_SUMMARY } from '@/lib/dummyData';

export default function CreatorPayouts() {
  const failed = DUMMY_PAYOUTS.filter((p) => p.status === 'FAILED').reduce(
    (s, p) => s + p.amount,
    0,
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Earnings"
          title="Payouts"
          subtitle="Released to your UPI within 1–2 business days after a brand approves."
        />

        <KpiStrip
          kpis={[
            { label: 'Total earned', value: formatINR(DUMMY_PAYOUT_SUMMARY.total) },
            { label: 'Paid out', value: formatINR(DUMMY_PAYOUT_SUMMARY.paid) },
            { label: 'Pending', value: formatINR(DUMMY_PAYOUT_SUMMARY.pending) },
            { label: 'Failed', value: formatINR(failed) },
          ]}
        />

        <View className="mt-6">
          {DUMMY_PAYOUTS.length === 0 ? (
            <EmptyState
              title="No payouts yet"
              description="Earnings show up here once a brand approves a post."
            />
          ) : (
            <>
              <Text className="mb-3 text-base font-semibold text-zinc-900">
                History
              </Text>
              <View className="gap-2.5">
                {DUMMY_PAYOUTS.map((p) => (
                  <Card key={p.id}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-zinc-900">
                          {formatINR(p.amount)}
                        </Text>
                        <Text className="mt-0.5 text-[11px] text-zinc-500">
                          {p.method} · {p.createdAt}
                        </Text>
                        {p.utr && (
                          <Text className="mt-0.5 font-mono text-[10px] text-zinc-400">
                            {p.utr}
                          </Text>
                        )}
                      </View>
                      <StatusBadge status={p.status} />
                    </View>
                  </Card>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
