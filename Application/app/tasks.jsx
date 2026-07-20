import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Badge, Button, Card, EmptyState, Loader } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { DELIVERABLE_LABEL, formatDate, formatINR } from '@/lib/format';

// Open Nano package tasks a creator can claim. Each claim fills one paid slot
// (POST /campaigns/:id/claim); when the target is met the task closes.
export default function Tasks() {
  const [claimingId, setClaimingId] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/campaigns/tasks')).data.tasks ?? [],
    [],
  );
  const tasks = data ?? [];

  const claim = useCallback(
    async (task) => {
      setClaimingId(task.id);
      try {
        const { data: res } = await api.post(`/campaigns/${task.id}/claim`);
        Alert.alert(
          'Task accepted',
          `You're in! ${res.filled ?? ''}${res.target ? `/${res.target}` : ''} slots filled. The brand will send a brief with the details.`,
        );
        await refetch();
      } catch (e) {
        Alert.alert("Couldn't accept task", apiError(e));
      } finally {
        setClaimingId(null);
      }
    },
    [refetch],
  );

  const brandName = (t) =>
    t.order?.brand?.brandProfile?.companyName ?? t.order?.brand?.fullName ?? 'A brand';

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Paid tasks" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          For Nano creators
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">Open tasks</Text>
        <Text className="mt-1 text-sm text-zinc-600">
          Accept a task to join a brand&apos;s campaign and get paid per deliverable.
        </Text>

        <View className="mt-5 gap-3">
          {loading && !data ? (
            <Loader />
          ) : error ? (
            <EmptyState
              title="Couldn't load tasks"
              description={error}
              action={<Button onPress={refetch}>Retry</Button>}
            />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No open tasks right now"
              description="New tasks matching your niches show up here. Check back soon."
            />
          ) : (
            tasks.map((t) => {
              const dels = Array.isArray(t.taskDeliverables) ? t.taskDeliverables : [];
              const filled = t.slotsFilled ?? 0;
              const target = t.slotsTarget ?? 0;
              return (
                <Card key={t.id}>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-[11px] text-zinc-500">{brandName(t)}</Text>
                      <Text className="mt-0.5 text-base font-bold text-zinc-900">{t.title}</Text>
                    </View>
                    {t.taskPayoutPerUnit != null ? (
                      <Badge variant="success">{formatINR(t.taskPayoutPerUnit)} / unit</Badge>
                    ) : null}
                  </View>

                  {dels.length ? (
                    <Text className="mt-2 text-xs text-zinc-600">
                      {dels
                        .map((d) => `${d.qty > 1 ? `${d.qty}× ` : ''}${DELIVERABLE_LABEL[d.type] ?? d.type}`)
                        .join(' · ')}
                    </Text>
                  ) : null}

                  <View className="mt-3 flex-row items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                    <Text className="text-xs text-zinc-500">
                      {filled}/{target} slots filled · {formatDate(t.createdAt)}
                    </Text>
                    <Button
                      size="sm"
                      loading={claimingId === t.id}
                      onPress={() => claim(t)}
                    >
                      Accept task
                    </Button>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
