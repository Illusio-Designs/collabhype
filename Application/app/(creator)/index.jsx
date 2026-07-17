import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, EmptyState, KpiStrip, Loader, SectionHead } from '@/components/ui';
import AppHeader from '@/components/AppHeader';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatCount, formatDate, formatINR } from '@/lib/format';

export default function CreatorOverview() {
  const { user } = useAuth();
  const firstName = (user?.fullName || '').split(' ')[0];
  const profile = user?.influencerProfile ?? {};

  const { data, loading, error, refetch } = useFetch(async () => {
    const [payouts, campaigns, notifs] = await Promise.all([
      api.get('/influencers/me/payouts'),
      api.get('/campaigns', { params: { limit: 5 } }),
      api.get('/notifications', { params: { limit: 5 } }),
    ]);
    return {
      summary: payouts.data.summary ?? {},
      campaigns: campaigns.data.campaigns ?? [],
      notifications: notifs.data.notifications ?? [],
      unreadCount: notifs.data.unreadCount ?? 0,
    };
  }, []);

  const summary = data?.summary ?? {};

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <AppHeader unreadCount={data?.unreadCount ?? 0} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ScreenHeader
          eyebrow="Creator dashboard"
          title={`Hey ${firstName} 👋`}
          subtitle="Your campaigns, earnings, and growth — all here."
        />

        <KpiStrip
          kpis={[
            { label: 'Followers', value: formatCount(profile.totalFollowers ?? 0) },
            { label: 'Engagement', value: `${(profile.avgEngagementRate ?? 0).toFixed(1)}%` },
            { label: 'Paid out', value: formatINR(summary.paid ?? 0) },
            { label: 'Pending', value: formatINR(summary.pending ?? 0) },
          ]}
        />

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <View className="mt-6">
            <EmptyState
              title="Couldn't load your dashboard"
              description={error}
              action={<Button onPress={refetch}>Retry</Button>}
            />
          </View>
        ) : (
          <>
            <View className="mt-6">
              <SectionHead
                title="Active campaigns"
                onPressMore={() => router.push('/(creator)/campaigns')}
              />
              {data.campaigns.length === 0 ? (
                <Text className="text-sm text-zinc-500">
                  No campaigns yet — brands will book you here.
                </Text>
              ) : (
                <View className="gap-2.5">
                  {data.campaigns.map((c) => (
                    <Pressable key={c.id} onPress={() => router.push(`/campaign/${c.id}`)}>
                      <Card className="border-zinc-100">
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <Text className="text-[11px] text-zinc-500">
                              {c.order?.brand?.brandProfile?.companyName ??
                                c.order?.brand?.fullName}
                            </Text>
                            <Text className="mt-0.5 text-sm font-bold text-zinc-900">
                              {c.title}
                            </Text>
                            <Text className="mt-1 text-xs text-zinc-500">
                              {c.deliverables?.length ?? 0} deliverables
                            </Text>
                          </View>
                          <StatusBadge status={c.status} />
                        </View>
                      </Card>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View className="mt-6">
              <SectionHead
                title="Recent activity"
                onPressMore={() => router.push('/(creator)/inbox')}
              />
              {data.notifications.length === 0 ? (
                <Text className="text-sm text-zinc-500">{"You're all caught up."}</Text>
              ) : (
                <View className="gap-2.5">
                  {data.notifications.slice(0, 3).map((n) => (
                    <Card key={n.id} className="border-zinc-100">
                      <View className="flex-row items-start gap-3">
                        {!n.isRead && (
                          <View className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                        )}
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between gap-2">
                            <Text className="text-sm font-bold text-zinc-900">
                              {n.title}
                            </Text>
                            <Text className="text-[10px] text-zinc-400">
                              {formatDate(n.createdAt)}
                            </Text>
                          </View>
                          {n.body ? (
                            <Text className="mt-0.5 text-xs text-zinc-600">{n.body}</Text>
                          ) : null}
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
