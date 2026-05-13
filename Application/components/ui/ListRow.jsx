import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/lib/theme';

// Settings/profile-style row. Renders inside a Card or a list.
// Props: icon, title, subtitle, onPress, right (optional override).

export default function ListRow({ icon, title, subtitle, onPress, right, danger }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-zinc-50"
    >
      {icon && (
        <View
          className={`h-9 w-9 items-center justify-center rounded-xl ${
            danger ? 'bg-red-50' : 'bg-brand-50'
          }`}
        >
          {icon}
        </View>
      )}
      <View className="flex-1">
        <Text
          className={`text-sm font-semibold ${
            danger ? 'text-red-600' : 'text-zinc-900'
          }`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="mt-0.5 text-xs text-zinc-500">{subtitle}</Text>
        )}
      </View>
      {right ?? <ChevronRight size={16} color={COLORS.zinc[400]} />}
    </Pressable>
  );
}
