import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, EmptyState, Loader } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatDate } from '@/lib/format';

export default function BrandInbox() {
  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/notifications')).data,
    [],
  );

  const [items, setItems] = useState([]);
  useEffect(() => {
    if (data?.notifications) setItems(data.notifications);
  }, [data]);

  const unread = items.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    setItems((arr) => arr.map((n) => ({ ...n, isRead: true })));
    try {
      await api.post('/notifications/read-all');
    } catch {
      // best-effort
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader unreadCount={unread} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ScreenHeader
          eyebrow="Inbox"
          title="Notifications"
          subtitle={unread > 0 ? `You have ${unread} unread.` : "You're all caught up."}
          right={
            unread > 0 ? (
              <Pressable onPress={markAllRead}>
                <Text className="text-xs font-semibold text-brand-700">Mark all read</Text>
              </Pressable>
            ) : null
          }
        />

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <EmptyState
            title="Couldn't load notifications"
            description={error}
            action={<Button onPress={refetch}>Retry</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Inbox zero"
            description="Approvals, drafts and payouts will appear here."
          />
        ) : (
          <View className="gap-2.5">
            {items.map((n) => (
              <Card key={n.id} className={!n.isRead ? 'border-brand-200' : ''}>
                <View className="flex-row items-start gap-3">
                  {!n.isRead && <View className="mt-2 h-2 w-2 rounded-full bg-brand-600" />}
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-bold text-zinc-900">{n.title}</Text>
                      <Text className="text-[10px] text-zinc-400">{formatDate(n.createdAt)}</Text>
                    </View>
                    {n.body ? (
                      <Text className="mt-0.5 text-xs leading-5 text-zinc-600">{n.body}</Text>
                    ) : null}
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
