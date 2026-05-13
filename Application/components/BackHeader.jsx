import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS } from '@/lib/theme';

// Top header for pushed (stack-style) screens. Renders an iOS-style back
// button + title. Used at the top of pages like Campaign Detail, Settings,
// Browse Packages — anywhere we push onto the tab navigator.

export default function BackHeader({ title, right }) {
  return (
    <View className="flex-row items-center gap-2 border-b border-zinc-100 bg-white px-2 py-2">
      <Pressable
        onPress={() => router.back()}
        className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-100"
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={22} color={COLORS.zinc[700]} />
      </Pressable>
      <Text className="flex-1 text-base font-semibold text-zinc-900" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
