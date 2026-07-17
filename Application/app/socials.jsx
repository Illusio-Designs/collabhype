import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Instagram, Youtube } from 'lucide-react-native';
import { Badge, Button, Card, EmptyState, Loader } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatCount } from '@/lib/format';
import { COLORS } from '@/lib/theme';

const PLATFORMS = [
  {
    key: 'INSTAGRAM',
    provider: 'instagram',
    label: 'Instagram',
    Icon: Instagram,
    hint: 'Pulls follower count, story, reel + post engagement.',
  },
  {
    key: 'YOUTUBE',
    provider: 'youtube',
    label: 'YouTube',
    Icon: Youtube,
    hint: 'Pulls subscriber count, average views, watch time.',
  },
];

export default function SocialsScreen() {
  const { data, loading, error, refetch } = useFetch(
    async () => (await api.get('/influencers/me/socials')).data.socials ?? [],
    [],
  );
  const accounts = data ?? [];
  const [busyKey, setBusyKey] = useState(null);

  const connectedFor = (platform) => accounts.find((a) => a.platform === platform);

  const connect = async (provider) => {
    setBusyKey(provider);
    try {
      const { data: startData } = await api.get(`/oauth/${provider}/start`);
      if (!startData?.authUrl) throw new Error('No authorization URL returned');
      await WebBrowser.openAuthSessionAsync(startData.authUrl);
      await refetch();
    } catch (e) {
      Alert.alert("Couldn't connect", apiError(e));
    } finally {
      setBusyKey(null);
    }
  };

  const disconnect = async (platform) => {
    setBusyKey(platform);
    try {
      await api.delete(`/influencers/me/socials/${platform}`);
      await refetch();
    } catch (e) {
      Alert.alert("Couldn't disconnect", apiError(e));
    } finally {
      setBusyKey(null);
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

        {loading && !data ? (
          <Loader />
        ) : error ? (
          <View className="mt-6">
            <EmptyState
              title="Couldn't load your socials"
              description={error}
              action={<Button onPress={refetch}>Retry</Button>}
            />
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {PLATFORMS.map(({ key, provider, label, Icon, hint }) => {
              const acc = connectedFor(key);
              const connected = !!acc;
              const busy = busyKey === provider || busyKey === key;
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
                          {(acc.engagementRate ?? 0).toFixed(1)}% ER
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
                      loading={busy}
                      onPress={() => (connected ? disconnect(key) : connect(provider))}
                      fullWidth
                    >
                      {connected ? 'Disconnect' : `Connect ${label}`}
                    </Button>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
