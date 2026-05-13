import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Instagram, Youtube } from 'lucide-react-native';
import { Badge, Button, Card } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { formatCount } from '@/lib/format';
import { DUMMY_SOCIALS } from '@/lib/dummyData';
import { COLORS } from '@/lib/theme';

const PLATFORMS = [
  { key: 'INSTAGRAM', label: 'Instagram', Icon: Instagram, hint: 'Pulls follower count, story, reel + post engagement.' },
  { key: 'YOUTUBE',   label: 'YouTube',   Icon: Youtube,   hint: 'Pulls subscriber count, average views, watch time.' },
];

export default function SocialsScreen() {
  const [accounts, setAccounts] = useState(DUMMY_SOCIALS);

  const connectedFor = (platform) => accounts.find((a) => a.platform === platform);

  const toggle = (platform) => {
    const existing = connectedFor(platform);
    if (existing) {
      setAccounts((a) => a.filter((s) => s.platform !== platform));
    } else {
      // Demo: simulate connecting with preset numbers.
      const preset = {
        INSTAGRAM: { handle: 'creator.demo', followers: 24800, engagementRate: 4.3 },
        YOUTUBE:   { handle: 'CreatorDemo',  followers: 6400,  engagementRate: 2.7 },
      }[platform];
      setAccounts((a) => [
        ...a,
        { platform, connected: true, ...preset },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Connect socials" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          Settings
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">Connect socials</Text>
        <Text className="mt-1 text-sm text-zinc-600">
          We pull real follower counts and engagement from your accounts — never self-reported.
        </Text>

        <View className="mt-6 gap-3">
          {PLATFORMS.map(({ key, label, Icon, hint }) => {
            const acc = connectedFor(key);
            const connected = !!acc;
            return (
              <Card key={key}>
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                    <Icon size={22} color={COLORS.brand[700]} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-zinc-900">{label}</Text>
                    {connected ? (
                      <Text className="text-xs text-zinc-500">
                        @{acc.handle} · {formatCount(acc.followers)} followers ·{' '}
                        {acc.engagementRate.toFixed(1)}% ER
                      </Text>
                    ) : (
                      <Text className="text-xs text-zinc-500">{hint}</Text>
                    )}
                  </View>
                  {connected && <Badge variant="success">Connected</Badge>}
                </View>
                <View className="mt-3">
                  <Button
                    variant={connected ? 'outline' : 'primary'}
                    onPress={() => toggle(key)}
                    fullWidth
                  >
                    {connected ? 'Disconnect' : `Connect ${label}`}
                  </Button>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
