import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, EmptyState, Loader, Tabs } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatINR, TIER_LABEL } from '@/lib/format';

const TIER_FILTERS = [
  { label: 'All',   value: 'ALL' },
  { label: 'Nano',  value: 'NANO' },
  { label: 'Micro', value: 'MICRO' },
  { label: 'Macro', value: 'MACRO' },
  { label: 'Mega',  value: 'MEGA' },
];

export default function BrowsePackages() {
  const [tier, setTier] = useState('ALL');
  const [addingId, setAddingId] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/packages', { params: { limit: 100 } })).data.packages ?? [],
    [],
  );
  const packages = useMemo(() => data ?? [], [data]);

  const visible = useMemo(() => {
    if (tier === 'ALL') return packages;
    return packages.filter((p) => p.tier === tier);
  }, [tier, packages]);

  const addToCart = async (pkg) => {
    setAddingId(pkg.id);
    try {
      await api.post('/cart/items', { itemType: 'PACKAGE', packageId: pkg.id, qty: 1 });
      Alert.alert('Added to cart', `${pkg.title} was added to your cart.`);
    } catch (e) {
      Alert.alert("Couldn't add to cart", apiError(e));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Packages" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          Bulk packs
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">Pick a pack and go live</Text>
        <Text className="mt-1 text-sm text-zinc-600">
          Pre-built bundles of vetted creators. Higher volume, lower per-influencer cost.
        </Text>

        <View className="my-5">
          <Tabs tabs={TIER_FILTERS} value={tier} onChange={setTier} />
        </View>

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <EmptyState
            title="Couldn't load packages"
            description={error}
            action={<Button onPress={refetch}>Retry</Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No packs in this tier"
            description="Try a different tier or check back later."
          />
        ) : (
          <View className="gap-3">
            {visible.map((p) => (
              <Card key={p.id}>
                <View className="flex-row items-start justify-between gap-2">
                  <Badge variant="brand">{TIER_LABEL[p.tier] ?? p.tier}</Badge>
                  <Text className="text-lg font-bold text-zinc-900">{formatINR(p.price)}</Text>
                </View>
                <Text className="mt-3 text-base font-bold text-zinc-900">{p.title}</Text>
                {p.description ? (
                  <Text className="mt-1 text-xs leading-5 text-zinc-600">{p.description}</Text>
                ) : null}
                <View className="mt-3 flex-row items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                  <Text className="text-xs text-zinc-500">{p.influencerCount} creators</Text>
                  <Button
                    size="sm"
                    loading={addingId === p.id}
                    onPress={() => addToCart(p)}
                  >
                    Add to cart
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
