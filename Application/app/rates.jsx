import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, EmptyState, Input, KpiStrip, Loader, Switch } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { DELIVERABLE_LABEL, formatINR, RATE_CARD_DELIVERABLES } from '@/lib/format';

// Build one editable row per priceable deliverable, pre-filled from any rate
// card the creator already has.
function buildRows(rateCards = []) {
  const byType = new Map(rateCards.map((r) => [r.deliverable, Number(r.price)]));
  return RATE_CARD_DELIVERABLES.map((deliverable) => ({
    deliverable,
    price: byType.get(deliverable) ?? 0,
    active: byType.has(deliverable),
  }));
}

export default function RatesScreen() {
  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/influencers/me')).data.profile,
    [],
  );

  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setRows(buildRows(data.rateCards));
  }, [data]);

  const update = (deliverable, patch) =>
    setRows((r) =>
      r.map((row) => (row.deliverable === deliverable ? { ...row, ...patch } : row)),
    );

  const active = rows.filter((r) => r.active && r.price > 0);
  const min = active.length ? Math.min(...active.map((r) => r.price)) : 0;
  const max = active.length ? Math.max(...active.map((r) => r.price)) : 0;
  const sum = active.reduce((s, r) => s + r.price, 0);

  const save = async () => {
    if (active.length === 0) {
      Alert.alert('Add a rate', 'Turn on at least one deliverable and set a price.');
      return;
    }
    setBusy(true);
    try {
      await api.put('/influencers/me/rate-cards', {
        rates: active.map((r) => ({ deliverable: r.deliverable, price: r.price })),
      });
      Alert.alert('Saved', 'Your rate card is updated.');
      await refetch();
    } catch (e) {
      Alert.alert("Couldn't save", apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Rate card" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          Pricing
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">Rate card</Text>
        <Text className="mt-1 text-sm text-zinc-600">
          Set your price per deliverable. Brands see this when booking you.
        </Text>

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <View className="mt-6">
            <EmptyState
              title="Couldn't load your rate card"
              description={error}
              action={<Button onPress={refetch}>Retry</Button>}
            />
          </View>
        ) : (
          <>
            <View className="mt-5">
              <KpiStrip
                kpis={[
                  { label: 'Active', value: `${active.length}/${rows.length}` },
                  { label: 'Cheapest', value: active.length ? formatINR(min) : '—' },
                  { label: 'Priciest', value: active.length ? formatINR(max) : '—' },
                  { label: 'Sum of all', value: formatINR(sum) },
                ]}
              />
            </View>

            <View className="mt-6 gap-3">
              {rows.map((row) => (
                <Card key={row.deliverable}>
                  <Switch
                    label={DELIVERABLE_LABEL[row.deliverable] ?? row.deliverable}
                    description={row.active ? 'Visible to brands' : 'Hidden — not bookable'}
                    value={row.active}
                    onValueChange={(v) => update(row.deliverable, { active: v })}
                  />
                  {row.active && (
                    <View className="mt-3">
                      <Input
                        label="Price (INR)"
                        value={row.price ? String(row.price) : ''}
                        onChangeText={(v) =>
                          update(row.deliverable, { price: Number(v) || 0 })
                        }
                        keyboardType="numeric"
                        placeholder="e.g. 12000"
                      />
                    </View>
                  )}
                </Card>
              ))}
            </View>

            <View className="mt-6">
              <Button fullWidth loading={busy} onPress={save}>
                Save rate card
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
