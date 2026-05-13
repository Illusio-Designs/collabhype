import { Text, View } from 'react-native';

export default function Stat({ label, value, hint }) {
  return (
    <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </Text>
      <Text className="mt-1 text-2xl font-bold text-zinc-900">{value}</Text>
      {hint && <Text className="mt-0.5 text-[11px] text-zinc-500">{hint}</Text>}
    </View>
  );
}
