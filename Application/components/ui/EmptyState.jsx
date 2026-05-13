import { Text, View } from 'react-native';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-10">
      {icon && (
        <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          {icon}
        </View>
      )}
      <Text className="text-center text-base font-bold text-zinc-900">{title}</Text>
      {description && (
        <Text className="mt-1 max-w-xs text-center text-sm text-zinc-600">
          {description}
        </Text>
      )}
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}
