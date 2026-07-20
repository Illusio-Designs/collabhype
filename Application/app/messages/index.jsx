import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Avatar, Badge, Button, Card, EmptyState, Loader } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/format';

// Conversations list + the one-time chat consent gate. Mirrors the web
// /dashboard/messages screen: brands and creators negotiate rates here, and the
// no-contact-sharing rules must be accepted before the first message.
export default function MessagesList() {
  const { user } = useAuth();
  const isBrand = user?.role === 'BRAND';
  const [consented, setConsented] = useState(null); // null = loading
  const [accepting, setAccepting] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConsent = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/consent');
      setConsented(!!data.consented);
    } catch {
      setConsented(false);
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations ?? []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConsent();
  }, [loadConsent]);

  useEffect(() => {
    if (consented) loadList();
  }, [consented, loadList]);

  const accept = async () => {
    setAccepting(true);
    try {
      await api.post('/chat/consent');
      setConsented(true);
    } catch (e) {
      Alert.alert('Error', apiError(e));
    } finally {
      setAccepting(false);
    }
  };

  const other = (c) =>
    isBrand
      ? { name: c.influencer?.user?.fullName ?? 'Creator', tier: c.influencer?.tier }
      : { name: c.brand?.brandProfile?.companyName ?? c.brand?.fullName ?? 'Brand', tier: null };

  if (consented === null) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Messages" />
        <Loader />
      </SafeAreaView>
    );
  }

  if (!consented) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Messages" />
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Card>
            <Text className="text-lg font-bold text-zinc-900">Before you start chatting</Text>
            <Text className="mt-2 text-sm leading-6 text-zinc-600">
              Negotiate rates here — but keep everything on Collabhype. Sharing phone numbers,
              emails, or off-platform links is not allowed, and repeated attempts suspend your
              account. All payments run through Collabhype with escrow protection.
            </Text>
            <Button className="mt-4" fullWidth loading={accepting} onPress={accept}>
              I agree — start chatting
            </Button>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Messages" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadList} />}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          Negotiate
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">Messages</Text>
        <Text className="mt-1 text-sm text-zinc-600">
          Never share personal contact details — it&apos;s against policy.
        </Text>

        <View className="mt-5 gap-3">
          {loading && !conversations.length ? (
            <Loader />
          ) : error ? (
            <EmptyState
              title="Couldn't load"
              description={error}
              action={<Button onPress={loadList}>Retry</Button>}
            />
          ) : conversations.length === 0 ? (
            <EmptyState
              title="No conversations yet"
              description={
                isBrand
                  ? 'Start one from a creator in Browse creators.'
                  : 'Brands will reach out to negotiate your rates.'
              }
              action={
                isBrand ? (
                  <Button onPress={() => router.push('/browse-creators')}>Browse creators</Button>
                ) : null
              }
            />
          ) : (
            conversations.map((c) => {
              const o = other(c);
              return (
                <Pressable key={c.id} onPress={() => router.push(`/messages/${c.id}`)}>
                  <Card>
                    <View className="flex-row items-center gap-3">
                      <Avatar name={o.name} size="md" />
                      <View className="flex-1">
                        <Text className="text-base font-bold text-zinc-900" numberOfLines={1}>
                          {o.name}
                        </Text>
                        <Text className="mt-0.5 text-xs text-zinc-500">
                          {c.lastMessageAt ? formatDate(c.lastMessageAt) : 'Tap to open'}
                        </Text>
                      </View>
                      {o.tier ? <Badge variant="brand">{o.tier}</Badge> : null}
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
