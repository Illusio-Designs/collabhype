import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, EmptyState, KpiStrip, Loader } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatDate, formatINR } from '@/lib/format';

export default function CreatorPayouts() {
  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/influencers/me/payouts')).data,
    [],
  );

  const payouts = data?.payouts ?? [];
  const summary = data?.summary ?? {};

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ScreenHeader
          eyebrow="Earnings"
          title="Payouts"
          subtitle="Released to your UPI within 1–2 business days after a brand approves."
        />

        <KpiStrip
          kpis={[
            { label: 'Total earned', value: formatINR(summary.total ?? 0) },
            { label: 'Paid out', value: formatINR(summary.paid ?? 0) },
            { label: 'Pending', value: formatINR(summary.pending ?? 0) },
            { label: 'Failed', value: formatINR(summary.failed ?? 0) },
          ]}
        />

        <View className="mt-6">
          {loading && !data ? (
            <Loader />
          ) : error ? (
            <EmptyState
              title="Couldn't load payouts"
              description={error}
              action={<Button onPress={refetch}>Retry</Button>}
            />
          ) : payouts.length === 0 ? (
            <EmptyState
              title="No payouts yet"
              description="Earnings show up here once a brand approves a post."
            />
          ) : (
            <>
              <Text className="mb-3 text-base font-semibold text-zinc-900">History</Text>
              <View className="gap-2.5">
                {payouts.map((p) => (
                  <Card key={p.id}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-zinc-900">
                          {formatINR(p.amount)}
                        </Text>
                        <Text className="mt-0.5 text-[11px] text-zinc-500">
                          {formatDate(p.paidAt ?? p.createdAt)}
                        </Text>
                        {p.razorpayPayoutId ? (
                          <Text className="mt-0.5 font-mono text-[10px] text-zinc-400">
                            {p.razorpayPayoutId}
                          </Text>
                        ) : null}
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
