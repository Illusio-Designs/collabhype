import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';
import { Button, Card, EmptyState, Loader } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useFetch } from '@/lib/useFetch';
import { DELIVERABLE_LABEL, formatINR } from '@/lib/format';

// Brand's booking (cart) — review and remove items before checkout. Payment
// itself runs on the web app for now (Razorpay), so this screen focuses on
// review + a clear hand-off.
export default function Booking() {
  const { user } = useAuth();
  const [busyId, setBusyId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/cart')).data.cart,
    [],
  );
  const cart = data ?? null;
  const items = cart?.items ?? [];

  // Escrow checkout: create the order, open the Razorpay sheet, then verify the
  // signature server-side. The native module only exists in a dev-client / EAS
  // build (not Expo Go), so a missing module is surfaced clearly.
  const checkout = useCallback(async () => {
    if (!items.length) return;
    setCheckingOut(true);
    try {
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        throw new Error('In-app payment needs the latest app build. Please update the app.');
      }
      const { data: order } = await api.post('/checkout/create-order');
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Collabhype',
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#6d28d9' },
      };

      let pay;
      try {
        pay = await RazorpayCheckout.open(options);
      } catch (rzpErr) {
        // Razorpay rejects with { code, description } on cancel/failure.
        const desc = rzpErr?.description || rzpErr?.error?.description;
        Alert.alert('Payment not completed', desc || 'You cancelled the payment.');
        return;
      }

      await api.post('/checkout/verify', {
        razorpay_order_id: pay.razorpay_order_id,
        razorpay_payment_id: pay.razorpay_payment_id,
        razorpay_signature: pay.razorpay_signature,
      });
      Alert.alert(
        'Payment successful',
        `Order ${order.orderNumber} is confirmed. Funds are held in escrow until deliverables are approved.`,
      );
      router.replace('/(brand)/orders');
    } catch (e) {
      Alert.alert('Checkout failed', apiError(e));
    } finally {
      setCheckingOut(false);
      refetch();
    }
  }, [items.length, user, refetch]);

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
              <Button
                className="mt-4"
                fullWidth
                loading={checkingOut}
                onPress={checkout}
              >
                Pay {formatINR(cart?.subtotal ?? 0)}
              </Button>
              <Text className="mt-2 text-center text-[11px] text-zinc-500">
                Secured by Razorpay · funds held in escrow until deliverables are approved.
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
