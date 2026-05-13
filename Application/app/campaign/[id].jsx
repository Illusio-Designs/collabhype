import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth';
import { formatINR } from '@/lib/format';
import {
  DELIVERABLE_LABEL,
  DELIVERABLE_STATUS_META,
  DUMMY_CAMPAIGNS_BRAND,
  DUMMY_CAMPAIGNS_INFLUENCER,
} from '@/lib/dummyData';

function findCampaign(id, role) {
  const list = role === 'BRAND' ? DUMMY_CAMPAIGNS_BRAND : DUMMY_CAMPAIGNS_INFLUENCER;
  return (
    list.find((c) => c.id === id) ??
    DUMMY_CAMPAIGNS_BRAND.find((c) => c.id === id) ??
    DUMMY_CAMPAIGNS_INFLUENCER.find((c) => c.id === id)
  );
}

export default function CampaignDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const campaign = findCampaign(id, user?.role);

  if (!campaign) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Campaign" />
        <View className="p-5">
          <EmptyState
            title="Campaign not found"
            description="It may have been removed."
          />
        </View>
      </SafeAreaView>
    );
  }

  const isBrand = user?.role === 'BRAND';

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title={campaign.title} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Title row */}
        <View className="mb-5 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-mono text-[11px] text-zinc-500">
              {campaign.order?.orderNumber ??
                campaign.order?.brand?.brandProfile?.companyName}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-zinc-900">
              {campaign.title}
            </Text>
            <Text className="mt-1 text-xs text-zinc-500">
              Created {campaign.createdAt}
            </Text>
          </View>
          <StatusBadge status={campaign.status} />
        </View>

        {campaign.brief && (
          <Card>
            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Brief
            </Text>
            <Text className="mt-2 text-sm leading-6 text-zinc-700">
              {campaign.brief}
            </Text>
          </Card>
        )}

        {campaign.order?.total != null && (
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
        )}

        <Text className="mb-3 mt-6 text-base font-semibold text-zinc-900">
          Deliverables ({campaign.deliverables.length})
        </Text>

        <View className="gap-2.5">
          {campaign.deliverables.map((d) => {
            const meta =
              DELIVERABLE_STATUS_META[d.status] ?? { label: d.status, variant: 'default' };
            return (
              <Card key={d.id}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-zinc-900">
                      {DELIVERABLE_LABEL[d.type] ?? d.type}
                    </Text>
                    <Text className="mt-0.5 text-xs text-zinc-500">
                      {d.creator ? `${d.creator} · ` : ''}Due {d.dueAt}
                    </Text>
                  </View>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </View>
              </Card>
            );
          })}
        </View>

        <View className="mt-6 gap-2">
          {isBrand ? (
            <>
              <Button onPress={() => {}}>Approve all drafts</Button>
              <Button variant="outline" onPress={() => {}}>
                Request a revision
              </Button>
            </>
          ) : (
            <>
              <Button onPress={() => {}}>Upload draft</Button>
              <Button variant="outline" onPress={() => {}}>
                Message brand
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
