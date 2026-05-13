import { Text, View } from 'react-native';

// Compact 2x2 / 4-up KPI grid — mirrors the web `<KpiStrip>` look but
// stacks 2-per-row on mobile so values stay legible.

export default function KpiStrip({ kpis = [] }) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {kpis.map((k, i) => (
        <View
          key={k.label + i}
          className="flex-grow basis-[45%] rounded-2xl border border-zinc-200 bg-white p-3"
        >
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            {k.label}
          </Text>
          <Text className="mt-1 text-xl font-bold text-zinc-900">{k.value}</Text>
        </View>
      ))}
    </View>
  );
}
