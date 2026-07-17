import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Button, Card, EmptyState, KpiStrip, Loader, SectionHead } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatDate, formatINR } from '@/lib/format';

export default function BrandOverview() {
  const { user } = useAuth();
  const firstName = (user?.fullName || '').split(' ')[0];

  const { data, loading, error, refetch } = useFetch(async () => {
    const [campaigns, orders, notifs] = await Promise.all([
      api.get('/campaigns', { params: { limit: 5 } }),
      api.get('/orders', { params: { limit: 5 } }),
      api.get('/notifications', { params: { limit: 1 } }),
    ]);
    return {
      campaigns: campaigns.data.campaigns ?? [],
      orders: orders.data.orders ?? [],
      unreadCount: notifs.data.unreadCount ?? 0,
    };
  }, []);

  const campaigns = data?.campaigns ?? [];
  const orders = data?.orders ?? [];
  const activeCount = campaigns.filter((c) =>
    ['BRIEF_SENT', 'IN_PROGRESS', 'REVIEW'].includes(c.status),
  ).length;
  const deliverableCount = campaigns.reduce((s, c) => s + (c._count?.deliverables ?? 0), 0);
  const spend = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader unreadCount={data?.unreadCount ?? 0} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
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
            { label: 'Active', value: String(activeCount) },
            { label: 'Deliverables', value: String(deliverableCount) },
            { label: 'Orders', value: String(orders.length) },
            { label: 'Spend', value: formatINR(spend) },
          ]}
        />

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <View className="mt-6">
            <EmptyState
              title="Couldn't load your dashboard"
              description={error}
              action={<Button onPress={refetch}>Retry</Button>}
            />
          </View>
        ) : (
          <>
            <View className="mt-6">
              <SectionHead
                title="Recent campaigns"
                onPressMore={() => router.push('/(brand)/campaigns')}
              />
              {campaigns.length === 0 ? (
                <Text className="text-sm text-zinc-500">
                  No campaigns yet — start one from a package or creator.
                </Text>
              ) : (
                <View className="gap-2.5">
                  {campaigns.slice(0, 3).map((c) => (
                    <Pressable key={c.id} onPress={() => router.push(`/campaign/${c.id}`)}>
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
                              {c._count?.deliverables ?? 0} deliverables
                            </Text>
                          </View>
                          <StatusBadge status={c.status} />
                        </View>
                      </Card>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View className="mt-6">
              <SectionHead
                title="Recent orders"
                onPressMore={() => router.push('/(brand)/orders')}
              />
              {orders.length === 0 ? (
                <Text className="text-sm text-zinc-500">No orders yet.</Text>
              ) : (
                <View className="gap-2.5">
                  {orders.slice(0, 3).map((o) => (
                    <Pressable key={o.id} onPress={() => router.push(`/order/${o.id}`)}>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
