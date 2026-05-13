import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Card, KpiStrip, SectionHead } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
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
      <AppHeader unreadCount={2} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Brand dashboard"
          title={`Hi ${firstName} 👋`}
          subtitle="Track campaigns, orders and approvals in one place."
          right={
            <Pressable
              onPress={() => router.push('/browse-packages')}
              className="flex-row items-center gap-1 rounded-xl bg-brand-700 px-3 py-2.5"
            >
              <Plus size={14} color="#ffffff" />
              <Text className="text-xs font-semibold text-white">Start</Text>
            </Pressable>
          }
        />

        <KpiStrip
          kpis={[
            { label: 'Active', value: '2' },
            { label: 'Deliverables', value: '9' },
            { label: 'Spend (mo)', value: formatINR(100000) },
            { label: 'Avg engagement', value: '4.7%' },
          ]}
        />

        <View className="mt-6">
          <SectionHead
            title="Recent campaigns"
            onPressMore={() => router.push('/(brand)/campaigns')}
          />
          <View className="gap-2.5">
            {DUMMY_CAMPAIGNS_BRAND.slice(0, 3).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/campaign/${c.id}`)}
              >
                <Card className="border-zinc-100">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-mono text-[11px] text-zinc-500">
                        {c.order?.orderNumber}
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
            title="Recent orders"
            onPressMore={() => router.push('/(brand)/orders')}
          />
          <View className="gap-2.5">
            {DUMMY_ORDERS.slice(0, 3).map((o) => (
              <Pressable
                key={o.id}
                onPress={() => router.push(`/order/${o.id}`)}
              >
                <Card className="border-zinc-100">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-mono text-[11px] font-bold text-brand-700">
                        {o.orderNumber}
                      </Text>
                      <Text className="mt-0.5 text-base font-bold text-zinc-900">
                        {formatINR(o.total)}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-zinc-500">
                        {o.itemCount} item{o.itemCount === 1 ? '' : 's'} · {o.placedAt}
                      </Text>
                    </View>
                    <StatusBadge status={o.status} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
