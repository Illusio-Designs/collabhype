import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import { DUMMY_NOTIFICATIONS } from '@/lib/dummyData';

export default function CreatorInbox() {
  const [items, setItems] = useState(DUMMY_NOTIFICATIONS);
  const unread = items.filter((n) => n.unread).length;

  const markAllRead = () => setItems((arr) => arr.map((n) => ({ ...n, unread: false })));

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader unreadCount={unread} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Inbox"
          title="Notifications"
          subtitle={
            unread > 0
              ? `You have ${unread} unread.`
              : "You're all caught up."
          }
          right={
            unread > 0 ? (
              <Pressable onPress={markAllRead}>
                <Text className="text-xs font-semibold text-brand-700">
                  Mark all read
                </Text>
              </Pressable>
            ) : null
          }
        />

        {items.length === 0 ? (
          <EmptyState
            title="Inbox zero"
            description="Briefs and payout updates will appear here."
          />
        ) : (
          <View className="gap-2.5">
            {items.map((n) => (
              <Card key={n.id} className={n.unread ? 'border-brand-200' : ''}>
                <View className="flex-row items-start gap-3">
                  {n.unread && (
                    <View className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-bold text-zinc-900">{n.title}</Text>
                      <Text className="text-[10px] text-zinc-400">{n.createdAt}</Text>
                    </View>
                    <Text className="mt-0.5 text-xs leading-5 text-zinc-600">
                      {n.body}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
