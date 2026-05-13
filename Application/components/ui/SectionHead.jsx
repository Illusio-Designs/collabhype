import { Pressable, Text, View } from 'react-native';

// "Recent campaigns ... View all →" header used to top section cards on
// the dashboards. Optional `onPressMore` switches the right link into a
// pressable.

export default function SectionHead({ title, onPressMore, moreLabel = 'View all' }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-base font-semibold text-zinc-900">{title}</Text>
      {onPressMore && (
        <Pressable onPress={onPressMore}>
          <Text className="text-xs font-semibold text-brand-700">
            {moreLabel} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}
