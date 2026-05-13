import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, Card, EmptyState, Tabs } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { formatCount, TIER_LABEL } from '@/lib/format';
import { DUMMY_INFLUENCERS } from '@/lib/dummyData';

const TIER_FILTERS = [
  { label: 'All',   value: 'ALL' },
  { label: 'Nano',  value: 'NANO' },
  { label: 'Micro', value: 'MICRO' },
  { label: 'Macro', value: 'MACRO' },
];

export default function BrowseCreators() {
  const [tier, setTier] = useState('ALL');

  const visible = useMemo(() => {
    if (tier === 'ALL') return DUMMY_INFLUENCERS;
    return DUMMY_INFLUENCERS.filter((i) => i.tier === tier);
  }, [tier]);

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
          Filter by tier, niche, city or platform. Add to cart in one tap.
        </Text>

        <View className="my-5">
          <Tabs tabs={TIER_FILTERS} value={tier} onChange={setTier} />
        </View>

        {visible.length === 0 ? (
          <EmptyState
            title="No creators in this tier"
            description="Try a different filter."
          />
        ) : (
          <View className="gap-3">
            {visible.map((inf) => (
              <Card key={inf.id}>
                <View className="flex-row items-center gap-3">
                  <Avatar name={inf.user.fullName} size="lg" />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-zinc-900">
                      {inf.user.fullName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-zinc-500">
                      {inf.city} · {inf.niches.join(', ')}
                    </Text>
                    <View className="mt-1.5 flex-row items-center gap-2">
                      <Badge variant="brand">
                        {TIER_LABEL[inf.tier] ?? inf.tier}
                      </Badge>
                      <Text className="text-[11px] text-zinc-500">
                        {formatCount(inf.totalFollowers)} followers ·{' '}
                        {inf.avgEngagementRate.toFixed(1)}% ER
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="mt-3">
                  <Button size="sm" variant="outline" fullWidth onPress={() => {}}>
                    View profile
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
