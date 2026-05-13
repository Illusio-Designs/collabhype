import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Stat } from '@/components/ui';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth';
import { formatINR } from '@/lib/format';
import { DUMMY_CAMPAIGNS_BRAND, DUMMY_ORDERS } from '@/lib/dummyData';

export default function BrandOverview() {
  const { user } = useAuth();
  const firstName = (user?.fullName || '').split(' ')[0];

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Brand dashboard"
          title={`Hi ${firstName} 👋`}
          subtitle="Track campaigns, orders and approvals in one place."
        />

        <View className="flex-row gap-3">
          <Stat label="Active" value="2" hint="campaigns" />
          <Stat label="This month" value={formatINR(100000)} hint="spend" />
        </View>
        <View className="mt-3 flex-row gap-3">
          <Stat label="Deliverables" value="9" hint="live" />
          <Stat label="Engagement" value="4.7%" hint="avg" />
        </View>

        <Text className="mb-3 mt-6 text-base font-semibold text-zinc-900">
          Recent campaigns
        </Text>
        <View className="gap-2.5">
          {DUMMY_CAMPAIGNS_BRAND.map((c) => (
            <Card key={c.id}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900">{c.title}</Text>
                  <Text className="mt-0.5 text-xs text-zinc-500">
                    {c.order?.orderNumber} · {c.deliverables.length} deliverables
                  </Text>
                </View>
                <StatusBadge status={c.status} />
              </View>
            </Card>
          ))}
        </View>

        <Text className="mb-3 mt-6 text-base font-semibold text-zinc-900">
          Recent orders
        </Text>
        <View className="gap-2.5">
          {DUMMY_ORDERS.map((o) => (
            <Card key={o.id}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-mono text-xs font-bold text-brand-700">
                    {o.orderNumber}
                  </Text>
                  <Text className="mt-0.5 text-base font-bold text-zinc-900">
                    {formatINR(o.total)}
                  </Text>
                </View>
                <StatusBadge status={o.status} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
