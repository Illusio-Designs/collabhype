import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';
import ScreenHeader from '@/components/ScreenHeader';
import StatusBadge from '@/components/StatusBadge';
import { DUMMY_CAMPAIGNS_INFLUENCER } from '@/lib/dummyData';

export default function CreatorCampaigns() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <ScreenHeader
          eyebrow="Creator"
          title="Campaigns"
          subtitle="Every brand campaign you're part of."
        />

        <View className="gap-3">
          {DUMMY_CAMPAIGNS_INFLUENCER.map((c) => (
            <Card key={c.id}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] text-zinc-500">
                    {c.order?.brand?.brandProfile?.companyName}
                  </Text>
                  <Text className="mt-0.5 text-base font-bold text-zinc-900">
                    {c.title}
                  </Text>
                  <Text className="mt-1 text-xs text-zinc-500">
                    {c.deliverables.length} deliverables
                  </Text>
                </View>
                <StatusBadge status={c.status} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
