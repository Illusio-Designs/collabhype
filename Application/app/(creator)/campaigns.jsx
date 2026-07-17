import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, EmptyState, KpiStrip, Loader, Tabs } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatDate } from '@/lib/format';

const FILTERS = [
  { label: 'All',         value: 'ALL' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Brief sent',  value: 'BRIEF_SENT' },
  { label: 'Completed',   value: 'COMPLETED' },
];

export default function CreatorCampaigns() {
  const [filter, setFilter] = useState('ALL');

  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/campaigns', { params: { limit: 100 } })).data.campaigns ?? [],
    [],
  );
  const campaigns = useMemo(() => data ?? [], [data]);

  const visible = useMemo(() => {
    if (filter === 'ALL') return campaigns;
    return campaigns.filter((c) => c.status === filter);
  }, [filter, campaigns]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ScreenHeader
          eyebrow="Assigned campaigns"
          title="Campaigns"
          subtitle="Every brand campaign you're part of, in one place."
        />

        <KpiStrip
          kpis={[
            { label: 'Total', value: String(campaigns.length) },
            { label: 'Active', value: String(campaigns.filter((c) => c.status === 'IN_PROGRESS').length) },
            { label: 'Pending', value: String(campaigns.filter((c) => c.status === 'BRIEF_SENT').length) },
            { label: 'Deliverables', value: String(campaigns.reduce((s, c) => s + (c.deliverables?.length ?? 0), 0)) },
          ]}
        />

        <View className="my-5">
          <Tabs tabs={FILTERS} value={filter} onChange={setFilter} />
        </View>

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <EmptyState
            title="Couldn't load campaigns"
            description={error}
            action={<Button onPress={refetch}>Retry</Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No campaigns here"
            description="Once a brand books you and pays, the campaign appears here."
          />
        ) : (
          <View className="gap-3">
            {visible.map((c) => (
              <Pressable key={c.id} onPress={() => router.push(`/campaign/${c.id}`)}>
                <Card>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-[11px] text-zinc-500">
                        {c.order?.brand?.brandProfile?.companyName ?? c.order?.brand?.fullName}
                      </Text>
                      <Text className="mt-0.5 text-base font-bold text-zinc-900">
                        {c.title}
                      </Text>
                      <Text className="mt-1 text-xs text-zinc-500">
                        {c.deliverables?.length ?? 0} deliverables · {formatDate(c.createdAt)}
                      </Text>
                    </View>
                    <StatusBadge status={c.status} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
