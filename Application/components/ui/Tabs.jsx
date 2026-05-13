import { Pressable, ScrollView, Text, View } from 'react-native';

// Horizontal pill tabs for filtering lists. Matches the web `<Tabs variant="pills">`
// API: pass `tabs` (array of { label, value }) and `value`/`onChange` to track
// the active tab. Auto-scrolls horizontally so it never wraps.

export default function Tabs({ tabs = [], value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 8 }}
    >
      <View className="flex-row gap-2">
        {tabs.map((t) => {
          const isActive = value === t.value;
          return (
            <Pressable
              key={String(t.value)}
              onPress={() => onChange?.(t.value)}
              className={`rounded-full px-4 py-2 ${
                isActive ? 'bg-brand-700' : 'bg-white border border-zinc-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? 'text-white' : 'text-zinc-700'
                }`}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
