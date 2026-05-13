import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Input, KpiStrip, Switch } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { formatINR } from '@/lib/format';
import { DELIVERABLE_LABEL, DUMMY_RATES } from '@/lib/dummyData';

export default function RatesScreen() {
  const [rows, setRows] = useState(DUMMY_RATES);
  const [busy, setBusy] = useState(false);

  const update = (deliverable, patch) =>
    setRows((r) =>
      r.map((row) => (row.deliverable === deliverable ? { ...row, ...patch } : row)),
    );

  const active = rows.filter((r) => r.active && r.price > 0);
  const min = active.length ? Math.min(...active.map((r) => r.price)) : 0;
  const max = active.length ? Math.max(...active.map((r) => r.price)) : 0;
  const sum = active.reduce((s, r) => s + r.price, 0);

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
                    value={String(row.price)}
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
          <Button
            fullWidth
            loading={busy}
            onPress={() => {
              setBusy(true);
              setTimeout(() => setBusy(false), 700);
            }}
          >
            Save rate card
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
