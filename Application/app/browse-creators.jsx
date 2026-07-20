import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Avatar, Badge, Button, Card, EmptyState, Loader, Tabs } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useFetch } from '@/lib/useFetch';
import { formatCount, TIER_LABEL } from '@/lib/format';

const CHATTABLE_TIERS = ['MICRO', 'MACRO', 'MEGA'];

const TIER_FILTERS = [
  { label: 'All',   value: 'ALL' },
  { label: 'Nano',  value: 'NANO' },
  { label: 'Micro', value: 'MICRO' },
  { label: 'Macro', value: 'MACRO' },
];

function nicheNames(inf) {
  return (inf.niches ?? [])
    .map((n) => n.niche?.name)
    .filter(Boolean)
    .join(', ');
}

export default function BrowseCreators() {
  const { user } = useAuth();
  const isBrand = user?.role === 'BRAND';
  const [tier, setTier] = useState('ALL');
  const [startingId, setStartingId] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/influencers', { params: { limit: 100 } })).data.influencers ?? [],
    [],
  );
  const influencers = useMemo(() => data ?? [], [data]);

  // Brand → Micro+ creator: open (or reopen) a negotiation chat. A missing
  // consent bounces to the Messages screen where the gate is shown.
  const startChat = async (inf) => {
    setStartingId(inf.id);
    try {
      const { data: res } = await api.post('/chat/conversations', { influencerId: inf.id });
      router.push(`/messages/${res.conversation.id}`);
    } catch (e) {
      const msg = apiError(e);
      if (/chat rules|consent/i.test(msg)) router.push('/messages');
      else Alert.alert("Couldn't start chat", msg);
    } finally {
      setStartingId(null);
    }
  };

  const visible = useMemo(() => {
    if (tier === 'ALL') return influencers;
    return influencers.filter((i) => i.tier === tier);
  }, [tier, influencers]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Influencers" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          Marketplace
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">Influencers</Text>
        <Text className="mt-1 text-sm text-zinc-600">
          Filter by tier, niche, city or platform.
        </Text>

        <View className="my-5">
          <Tabs tabs={TIER_FILTERS} value={tier} onChange={setTier} />
        </View>

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <EmptyState
            title="Couldn't load creators"
            description={error}
            action={<Button onPress={refetch}>Retry</Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState title="No creators in this tier" description="Try a different filter." />
        ) : (
          <View className="gap-3">
            {visible.map((inf) => (
              <Card key={inf.id}>
                <View className="flex-row items-center gap-3">
                  <Avatar name={inf.user?.fullName} size="lg" />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-zinc-900">
                      {inf.user?.fullName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-zinc-500">
                      {[inf.city, nicheNames(inf)].filter(Boolean).join(' · ')}
                    </Text>
                    <View className="mt-1.5 flex-row items-center gap-2">
                      {inf.tier ? (
                        <Badge variant="brand">{TIER_LABEL[inf.tier] ?? inf.tier}</Badge>
                      ) : null}
                      <Text className="text-[11px] text-zinc-500">
                        {formatCount(inf.totalFollowers ?? 0)} followers ·{' '}
                        {(inf.avgEngagementRate ?? 0).toFixed(1)}% ER
                      </Text>
                    </View>
                  </View>
                </View>
                {isBrand && CHATTABLE_TIERS.includes(inf.tier) ? (
                  <View className="mt-3 border-t border-zinc-100 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={startingId === inf.id}
                      onPress={() => startChat(inf)}
                    >
                      Message / negotiate
                    </Button>
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
