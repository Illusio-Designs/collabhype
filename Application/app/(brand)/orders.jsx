import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, EmptyState, KpiStrip } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatINR } from '@/lib/format';
import { DUMMY_ORDERS } from '@/lib/dummyData';

export default function BrandOrders() {
  const totalSpend = DUMMY_ORDERS.reduce((s, o) => s + o.total, 0);
  const completed = DUMMY_ORDERS.filter((o) => o.status === 'COMPLETED').length;
  const inFlight = DUMMY_ORDERS.filter((o) =>
    ['PAID', 'IN_PROGRESS'].includes(o.status),
  ).length;
  const avg = DUMMY_ORDERS.length ? Math.round(totalSpend / DUMMY_ORDERS.length) : 0;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Billing"
          title="Orders"
          subtitle="Every checkout, with escrow + campaign status."
        />

        <KpiStrip
          kpis={[
            { label: 'Total orders', value: String(DUMMY_ORDERS.length) },
            { label: 'Lifetime spend', value: formatINR(totalSpend) },
            { label: 'Avg order', value: formatINR(avg) },
            { label: 'In flight', value: String(inFlight) },
          ]}
        />

        <View className="mt-6">
          {DUMMY_ORDERS.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Once you check out, orders will appear here."
            />
          ) : (
            <View className="gap-3">
              {DUMMY_ORDERS.map((o) => (
                <Pressable
                  key={o.id}
                  onPress={() => router.push(`/order/${o.id}`)}
                >
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
                          {o.itemCount} item{o.itemCount === 1 ? '' : 's'} ·{' '}
                          {o.placedAt}
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
