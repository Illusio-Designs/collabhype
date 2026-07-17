import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, EmptyState, KpiStrip, Loader } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatDate, formatINR } from '@/lib/format';

export default function BrandOrders() {
  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/orders', { params: { limit: 100 } })).data.orders ?? [],
    [],
  );
  const orders = data ?? [];

  const totalSpend = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const inFlight = orders.filter((o) => ['PAID', 'IN_PROGRESS'].includes(o.status)).length;
  const avg = orders.length ? Math.round(totalSpend / orders.length) : 0;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ScreenHeader
          eyebrow="Billing"
          title="Orders"
          subtitle="Every checkout, with escrow + campaign status."
        />

        <KpiStrip
          kpis={[
            { label: 'Total orders', value: String(orders.length) },
            { label: 'Lifetime spend', value: formatINR(totalSpend) },
            { label: 'Avg order', value: formatINR(avg) },
            { label: 'In flight', value: String(inFlight) },
          ]}
        />

        <View className="mt-6">
          {loading && !data ? (
            <Loader />
          ) : error ? (
            <EmptyState
              title="Couldn't load orders"
              description={error}
              action={<Button onPress={refetch}>Retry</Button>}
            />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Once you check out, orders will appear here."
            />
          ) : (
            <View className="gap-3">
              {orders.map((o) => (
                <Pressable key={o.id} onPress={() => router.push(`/order/${o.id}`)}>
                  <Card>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-mono text-[11px] font-bold text-brand-700">
                          {o.orderNumber}
                        </Text>
                        <Text className="mt-0.5 text-base font-bold text-zinc-900">
                          {formatINR(o.total)}
                        </Text>
                        <Text className="mt-1 text-xs text-zinc-500">
                          {o.items?.length ?? 0} item{(o.items?.length ?? 0) === 1 ? '' : 's'} ·{' '}
                          {formatDate(o.createdAt)}
                        </Text>
                      </View>
                      <StatusBadge status={o.status} />
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
