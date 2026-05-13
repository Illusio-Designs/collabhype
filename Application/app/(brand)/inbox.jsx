import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';
import ScreenHeader from '@/components/ScreenHeader';
import { DUMMY_NOTIFICATIONS } from '@/lib/dummyData';

export default function BrandInbox() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Inbox"
          title="Notifications"
          subtitle="Drafts, approvals and payment updates."
        />

        <View className="gap-2.5">
          {DUMMY_NOTIFICATIONS.map((n) => (
            <Card key={n.id}>
              <View className="flex-row items-start gap-3">
                {n.unread && (
                  <View className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                )}
                <View className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900">{n.title}</Text>
                  <Text className="mt-0.5 text-xs leading-5 text-zinc-600">
                    {n.body}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
