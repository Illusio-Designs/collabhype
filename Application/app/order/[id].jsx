import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Card, EmptyState } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatINR } from '@/lib/format';
import { DUMMY_ORDERS } from '@/lib/dummyData';

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const order = DUMMY_ORDERS.find((o) => o.id === id);

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Order" />
        <View className="p-5">
          <EmptyState title="Order not found" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title={order.orderNumber} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="mb-5 flex-row items-start justify-between gap-3">
          <View>
            <Text className="font-mono text-xs font-bold text-brand-700">
              {order.orderNumber}
            </Text>
            <Text className="mt-1 text-3xl font-bold text-zinc-900">
              {formatINR(order.total)}
            </Text>
            <Text className="mt-1 text-xs text-zinc-500">
              Placed {order.placedAt}
            </Text>
          </View>
          <StatusBadge status={order.status} />
        </View>

        <Card>
          <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Escrow timeline
          </Text>
          <View className="mt-3 gap-2">
            <TimelineRow done label="Order placed" />
            <TimelineRow done label="Payment captured" />
            <TimelineRow
              done={order.status !== 'PAID' && order.status !== 'PENDING'}
              label="Campaign briefs dispatched"
            />
            <TimelineRow
              done={order.status === 'COMPLETED'}
              label="Final approvals & payouts"
            />
          </View>
        </Card>

        <Text className="mb-3 mt-6 text-base font-semibold text-zinc-900">
          Line items ({order.items?.length ?? 0})
        </Text>
        <View className="gap-2.5">
          {order.items?.map((it) => (
            <Card key={it.id}>
              <View className="flex-row items-start justify-between gap-3">
                <Text className="flex-1 text-sm font-semibold text-zinc-900">
                  {it.title}
                </Text>
                <Text className="text-sm font-bold text-zinc-900">
                  {formatINR(it.price)}
                </Text>
              </View>
              <Text className="mt-1 text-[11px] text-zinc-500">Qty {it.qty}</Text>
            </Card>
          ))}
        </View>

        <Card className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-zinc-700">Total</Text>
            <Text className="text-lg font-bold text-zinc-900">
              {formatINR(order.total)}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineRow({ done, label }) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className={`h-2.5 w-2.5 rounded-full ${
          done ? 'bg-brand-700' : 'bg-zinc-300'
        }`}
      />
      <Text
        className={`text-sm ${done ? 'text-zinc-900' : 'text-zinc-500'}`}
      >
        {label}
      </Text>
    </View>
  );
}
