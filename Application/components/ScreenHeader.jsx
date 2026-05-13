import { Text, View } from 'react-native';

export default function ScreenHeader({ eyebrow, title, subtitle, right }) {
  return (
    <View className="mb-5 flex-row items-end justify-between gap-3">
      <View className="flex-1">
        {eyebrow && (
          <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
            {eyebrow}
          </Text>
        )}
        <Text className="mt-1 text-2xl font-bold text-zinc-900">{title}</Text>
        {subtitle && <Text className="mt-1 text-sm text-zinc-600">{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
