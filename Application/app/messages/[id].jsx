import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Loader } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DELIVERABLE_LABEL, RATE_CARD_DELIVERABLES, formatINR } from '@/lib/format';

const OFFER_STATUS_LABEL = { PENDING: 'Pending', ACCEPTED: 'Accepted', DECLINED: 'Declined' };

// One conversation thread. Both sides send text; the creator can send a rate
// offer (deliverable + price) and the brand can accept it (→ their booking) or
// decline. The backend screens every message for contact details — a blocked
// message surfaces the strike warning, and a suspension bounces out.
export default function ChatThread() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const isBrand = user?.role === 'BRAND';

  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offer, setOffer] = useState({ deliverable: 'IG_REEL', price: '' });
  const [busyOffer, setBusyOffer] = useState(null);
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/conversations/${id}/messages`);
      setThread(data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const messages = thread?.messages ?? [];
  const convo = thread?.conversation;
  const otherName = isBrand
    ? convo?.influencer?.user?.fullName ?? 'Creator'
    : convo?.brand?.brandProfile?.companyName ?? convo?.brand?.fullName ?? 'Brand';

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(t);
  }, [messages.length]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      await api.post(`/chat/conversations/${id}/messages`, { body });
      setText('');
      await load();
    } catch (e) {
      const details = e?.response?.data?.details;
      if (details?.suspended) {
        Alert.alert(
          'Account suspended',
          'You shared contact details too many times. Please contact support.',
        );
        router.back();
      } else {
        Alert.alert('Message blocked', apiError(e));
      }
    } finally {
      setSending(false);
    }
  };

  const submitOffer = async () => {
    const price = Number(offer.price);
    if (!(price > 0)) {
      Alert.alert('Enter a valid price');
      return;
    }
    setSending(true);
    try {
      await api.post(`/chat/conversations/${id}/offers`, {
        deliverable: offer.deliverable,
        price,
      });
      setShowOffer(false);
      setOffer({ deliverable: 'IG_REEL', price: '' });
      await load();
    } catch (e) {
      Alert.alert('Error', apiError(e));
    } finally {
      setSending(false);
    }
  };

  const respondOffer = async (messageId, action) => {
    setBusyOffer(messageId);
    try {
      await api.post(`/chat/conversations/${id}/offers/${messageId}/${action}`);
      if (action === 'accept') {
        Alert.alert('Added to booking', 'Review it in your booking to check out.');
      }
      await load();
    } catch (e) {
      Alert.alert('Error', apiError(e));
    } finally {
      setBusyOffer(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Chat" />
        <Loader />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
        <BackHeader title="Chat" />
        <View className="p-5">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title={otherName} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 8 }}
        >
          <View className="mb-1 rounded-lg bg-amber-50 px-3 py-2">
            <Text className="text-[11px] text-amber-700">
              No contact sharing — keep the deal on Collabhype.
            </Text>
          </View>

          {messages.map((m) => {
            const mine = m.senderUserId === user?.id;
            if (m.type === 'RATE_OFFER') {
              return (
                <View
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl border border-brand-200 bg-white p-3 ${
                    mine ? 'self-end' : 'self-start'
                  }`}
                >
                  <Text className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                    Rate offer
                  </Text>
                  <Text className="mt-1 text-sm font-bold text-zinc-900">
                    {DELIVERABLE_LABEL[m.deliverable] ?? m.deliverable} — {formatINR(m.price)}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-zinc-500">
                    {OFFER_STATUS_LABEL[m.offerStatus] ?? m.offerStatus}
                  </Text>
                  {isBrand && m.offerStatus === 'PENDING' ? (
                    <View className="mt-2 flex-row gap-2">
                      <Button
                        size="sm"
                        loading={busyOffer === m.id}
                        onPress={() => respondOffer(m.id, 'accept')}
                      >
                        Accept &amp; add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={busyOffer === m.id}
                        onPress={() => respondOffer(m.id, 'decline')}
                      >
                        Decline
                      </Button>
                    </View>
                  ) : null}
                </View>
              );
            }
            return (
              <View
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  mine ? 'self-end bg-brand-700' : 'self-start border border-zinc-200 bg-white'
                }`}
              >
                <Text className={`text-sm ${mine ? 'text-white' : 'text-zinc-800'}`}>{m.body}</Text>
              </View>
            );
          })}
        </ScrollView>

        {!isBrand && showOffer ? (
          <View className="border-t border-zinc-100 bg-white p-3">
            <Text className="mb-2 text-xs font-semibold text-zinc-500">Deliverable</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {RATE_CARD_DELIVERABLES.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setOffer((o) => ({ ...o, deliverable: d }))}
                  className={`rounded-full px-3 py-1.5 ${
                    offer.deliverable === d ? 'bg-brand-700' : 'bg-zinc-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      offer.deliverable === d ? 'text-white' : 'text-zinc-700'
                    }`}
                  >
                    {DELIVERABLE_LABEL[d] ?? d}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View className="mt-3 flex-row items-center gap-2">
              <TextInput
                value={offer.price}
                onChangeText={(t) => setOffer((o) => ({ ...o, price: t.replace(/[^0-9]/g, '') }))}
                keyboardType="number-pad"
                placeholder="Your rate (₹)"
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
              />
              <Button size="sm" loading={sending} onPress={submitOffer}>
                Send offer
              </Button>
              <Button size="sm" variant="ghost" onPress={() => setShowOffer(false)}>
                Cancel
              </Button>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-2 border-t border-zinc-100 bg-white p-3">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message…"
              multiline
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
            />
            {!isBrand ? (
              <Button size="sm" variant="outline" onPress={() => setShowOffer(true)}>
                Offer
              </Button>
            ) : null}
            <Button size="sm" loading={sending} onPress={send}>
              Send
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
