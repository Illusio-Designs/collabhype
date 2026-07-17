import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, EmptyState, Loader } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth';
import { api, apiError } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { DELIVERABLE_LABEL, DELIVERABLE_STATUS_META, formatDate, formatINR } from '@/lib/format';

export default function CampaignDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const isBrand = user?.role === 'BRAND';
  const [busyId, setBusyId] = useState(null);

  const { data: campaign, loading, error, refetch } = useFetch(
    async () => (await api.get(`/campaigns/${id}`)).data.campaign,
    [id],
  );

  const act = async (delivId, action) => {
    setBusyId(delivId + action);
    try {
      await api.post(`/deliverables/${delivId}/${action}`);
      await refetch();
    } catch (e) {
      Alert.alert('Action failed', apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !campaign) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Campaign" />
        <Loader />
      </SafeAreaView>
    );
  }

  if (error || !campaign) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Campaign" />
        <View className="p-5">
          <EmptyState
            title="Campaign not found"
            description={error || 'It may have been removed.'}
            action={<Button onPress={refetch}>Retry</Button>}
          />
        </View>
      </SafeAreaView>
    );
  }

  const deliverables = campaign.deliverables ?? [];

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title={campaign.title} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="mb-5 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-mono text-[11px] text-zinc-500">
              {campaign.order?.orderNumber ??
                campaign.order?.brand?.brandProfile?.companyName ??
                campaign.order?.brand?.fullName}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-zinc-900">{campaign.title}</Text>
            <Text className="mt-1 text-xs text-zinc-500">
              Created {formatDate(campaign.createdAt)}
            </Text>
          </View>
          <StatusBadge status={campaign.status} />
        </View>

        {campaign.brief ? (
          <Card>
            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Brief
            </Text>
            <Text className="mt-2 text-sm leading-6 text-zinc-700">{campaign.brief}</Text>
          </Card>
        ) : null}

        {campaign.order?.total != null ? (
          <Card className="mt-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Order value
                </Text>
                <Text className="mt-1 text-xl font-bold text-zinc-900">
                  {formatINR(campaign.order.total)}
                </Text>
              </View>
              <Badge variant="brand">Escrow held</Badge>
            </View>
          </Card>
        ) : null}

        <Text className="mb-3 mt-6 text-base font-semibold text-zinc-900">
          Deliverables ({deliverables.length})
        </Text>

        <View className="gap-2.5">
          {deliverables.map((d) => {
            const meta =
              DELIVERABLE_STATUS_META[d.status] ?? { label: d.status, variant: 'default' };
            const creatorName = d.influencer?.user?.fullName;
            return (
              <Card key={d.id}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-zinc-900">
                      {DELIVERABLE_LABEL[d.deliverable] ?? d.deliverable}
                      {d.qty > 1 ? ` ×${d.qty}` : ''}
                    </Text>
                    <Text className="mt-0.5 text-xs text-zinc-500">
                      {creatorName ? `${creatorName} · ` : ''}
                      {d.dueDate ? `Due ${formatDate(d.dueDate)}` : formatINR(d.amountPayable)}
                    </Text>
                  </View>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </View>

                {isBrand && d.status === 'DRAFT_SUBMITTED' ? (
                  <View className="mt-3">
                    <Button
                      size="sm"
                      loading={busyId === d.id + 'approve'}
                      onPress={() => act(d.id, 'approve')}
                    >
                      Approve draft
                    </Button>
                  </View>
                ) : null}

                {isBrand && d.status === 'POSTED' ? (
                  <View className="mt-3">
                    <Button
                      size="sm"
                      loading={busyId === d.id + 'release-payment'}
                      onPress={() => act(d.id, 'release-payment')}
                    >
                      Release payment
                    </Button>
                  </View>
                ) : null}
              </Card>
            );
          })}
          {deliverables.length === 0 ? (
            <Text className="text-sm text-zinc-500">
              Deliverables appear once the campaign brief is dispatched.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
