import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
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
  const [briefText, setBriefText] = useState('');
  const [sendingBrief, setSendingBrief] = useState(false);

  const { data: campaign, loading, error, refetch } = useFetch(
    async () => (await api.get(`/campaigns/${id}`)).data.campaign,
    [id],
  );

  // Prefill the brief box with any saved draft (before it's sent).
  useEffect(() => {
    if (campaign && !campaign.briefSentAt && campaign.brief) setBriefText(campaign.brief);
  }, [campaign?.id]);

  const sendBrief = async () => {
    const text = briefText.trim();
    if (!text) {
      Alert.alert('Add a brief first');
      return;
    }
    setSendingBrief(true);
    try {
      await api.patch(`/campaigns/${id}`, { brief: text });
      await api.post(`/campaigns/${id}/send-brief`);
      Alert.alert('Brief sent', 'Creators were notified. Their delivery address is now visible.');
      await refetch();
    } catch (e) {
      Alert.alert("Couldn't send brief", apiError(e));
    } finally {
      setSendingBrief(false);
    }
  };

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

        {campaign.briefSentAt ? (
          campaign.brief ? (
            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Brief
              </Text>
              <Text className="mt-2 text-sm leading-6 text-zinc-700">{campaign.brief}</Text>
            </Card>
          ) : null
        ) : isBrand ? (
          <Card>
            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Send the brief
            </Text>
            <Text className="mt-1 text-xs text-zinc-500">
              Describe the campaign and any product to ship. Sending it notifies the creators and
              unlocks their delivery address.
            </Text>
            <TextInput
              value={briefText}
              onChangeText={setBriefText}
              placeholder="What should creators make? Include product, key messages, do's and don'ts…"
              multiline
              className="mt-3 min-h-[96px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
              textAlignVertical="top"
            />
            <Button className="mt-3" fullWidth loading={sendingBrief} onPress={sendBrief}>
              Send brief
            </Button>
          </Card>
        ) : (
          <Card>
            <Text className="text-sm text-zinc-600">
              Waiting for the brand to send the campaign brief.
            </Text>
          </Card>
        )}

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
                    {isBrand && d.influencer?.shippingAddress ? (
                      <Text className="mt-1 text-[11px] text-zinc-500">
                        Ship to: {d.influencer.shippingAddress}
                        {d.influencer.pincode ? ` – ${d.influencer.pincode}` : ''}
                      </Text>
                    ) : null}
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
