import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, EmptyState, Loader } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { DELIVERABLE_LABEL, formatINR } from '@/lib/format';

// Brand's booking (cart) — review and remove items before checkout. Payment
// itself runs on the web app for now (Razorpay), so this screen focuses on
// review + a clear hand-off.
export default function Booking() {
  const [busyId, setBusyId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/cart')).data.cart,
    [],
  );
  const cart = data ?? null;
  const items = cart?.items ?? [];

  const remove = useCallback(
    async (itemId) => {
      setBusyId(itemId);
      try {
        await api.delete(`/cart/items/${itemId}`);
        await refetch();
      } catch (e) {
        Alert.alert('Error', apiError(e));
      } finally {
        setBusyId(null);
      }
    },
    [refetch],
  );

  const clearAll = useCallback(async () => {
    if (!items.length) return;
    setClearing(true);
    try {
      await api.delete('/cart');
      await refetch();
    } catch (e) {
      Alert.alert('Error', apiError(e));
    } finally {
      setClearing(false);
    }
  }, [items.length, refetch]);

  const itemName = (i) =>
    i.itemType === 'PACKAGE'
      ? i.package?.title ?? 'Package'
      : i.influencer?.user?.fullName ?? 'Creator booking';

  const itemSub = (i) => {
    if (i.itemType === 'PACKAGE') return `${i.package?.influencerCount ?? ''} creators`.trim();
    const dels = Array.isArray(i.deliverables) ? i.deliverables : [];
    return dels
      .map((d) => `${d.qty > 1 ? `${d.qty}× ` : ''}${DELIVERABLE_LABEL[d.type] ?? d.type}`)
      .join(' · ');
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader
        title="Your booking"
        right={
          items.length ? (
            <Button size="sm" variant="ghost" loading={clearing} onPress={clearAll}>
              Clear
            </Button>
          ) : null
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        {loading && !data ? (
          <Loader />
        ) : error ? (
          <EmptyState
            title="Couldn't load your booking"
            description={error}
            action={<Button onPress={refetch}>Retry</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your booking is empty"
            description="Add a package or pick a few creators to get started."
            action={<Button onPress={() => router.push('/browse-packages')}>Browse packages</Button>}
          />
        ) : (
          <>
            <View className="gap-3">
              {items.map((i) => (
                <Card key={i.id}>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-zinc-900">{itemName(i)}</Text>
                      {itemSub(i) ? (
                        <Text className="mt-0.5 text-xs text-zinc-500">{itemSub(i)}</Text>
                      ) : null}
                      <Text className="mt-1 text-sm font-semibold text-zinc-900">
                        {formatINR(Number(i.price) * i.qty)}
                        {i.qty > 1 ? `  ·  ${i.qty} ×` : ''}
                      </Text>
                    </View>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={busyId === i.id}
                      onPress={() => remove(i.id)}
                    >
                      Remove
                    </Button>
                  </View>
                </Card>
              ))}
            </View>

            <Card className="mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-zinc-600">Subtotal</Text>
                <Text className="text-xl font-bold text-zinc-900">
                  {formatINR(cart?.subtotal ?? 0)}
                </Text>
              </View>
            </Card>

            <View className="mt-3 rounded-xl bg-brand-50 px-4 py-3">
              <Text className="text-xs leading-5 text-brand-800">
                Secure checkout with escrow-backed payment is available on the Collabhype web app.
                Sign in on the web to complete payment for this booking.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
