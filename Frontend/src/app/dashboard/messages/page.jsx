'use client';

import { PageSkeleton, CardListSkeleton, ChatThreadSkeleton } from '@/components/dashboard/Skeletons';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Avatar, Badge, Button, Card, Input, Select, Spinner, useToast } from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import ChatConsentGate from '@/components/chat/ChatConsentGate';
import { DELIVERABLE_LABEL, formatINR } from '@/lib/format';

const OFFER_DELIVERABLES = [
  'IG_REEL',
  'IG_POST',
  'IG_STORY',
  'IG_CAROUSEL',
  'YT_VIDEO',
  'YT_SHORT',
  'UGC',
].map((v) => ({ value: v, label: DELIVERABLE_LABEL[v] ?? v }));

function MessagesInner() {
  const { user } = useAuth();
  const toast = useToast();
  const sp = useSearchParams();
  const isBrand = user?.role === 'BRAND';

  const [consented, setConsented] = useState(null); // null = loading
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(sp.get('c'));
  const [thread, setThread] = useState(null); // { conversation, messages }
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef(null);

  // Consent status
  useEffect(() => {
    if (!user) return;
    apiClient
      .get('/api/v1/chat/consent')
      .then((r) => setConsented(!!r.data.consented))
      .catch(() => setConsented(false));
  }, [user]);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await apiClient.get('/api/v1/chat/conversations');
      setConversations(data.conversations ?? []);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoadingList(false);
    }
  }, [toast]);

  useEffect(() => {
    if (consented) loadList();
  }, [consented, loadList]);

  const loadThread = useCallback(
    async (id) => {
      if (!id) return;
      setLoadingThread(true);
      try {
        const { data } = await apiClient.get(`/api/v1/chat/conversations/${id}/messages`);
        setThread(data);
      } catch (e) {
        toast.push({ variant: 'danger', title: 'Failed to load chat', body: apiError(e) });
      } finally {
        setLoadingThread(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (activeId && consented) loadThread(activeId);
  }, [activeId, consented, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages?.length]);

  if (!user) return null;

  if (consented === null) {
    return <PageSkeleton kpis={0} cards={1} />;
  }

  if (!consented) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Messages" title="Negotiate rates" subtitle="Chat directly with creators or brands." />
        <ChatConsentGate onAccepted={() => setConsented(true)} />
      </div>
    );
  }

  const other = (c) =>
    isBrand
      ? { name: c.influencer?.user?.fullName ?? 'Creator', avatar: c.influencer?.user?.avatarUrl }
      : {
          name: c.brand?.brandProfile?.companyName ?? c.brand?.fullName ?? 'Brand',
          avatar: c.brand?.brandProfile?.logoUrl ?? c.brand?.avatarUrl,
        };

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Messages" title="Negotiate rates" subtitle="Never share personal contact details — it's against policy." />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Conversation list */}
        <Card padding="none" className={`overflow-hidden ${activeId ? 'hidden lg:block' : ''}`}>
          <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">
            Conversations
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loadingList ? (
              <CardListSkeleton items={6} className="p-2" />
            ) : conversations.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">
                No conversations yet.{' '}
                {isBrand && (
                  <>
                    Start one from an{' '}
                    <Link href="/influencers" className="font-medium text-brand-700 hover:underline">
                      influencer profile
                    </Link>
                    .
                  </>
                )}
              </p>
            ) : (
              conversations.map((c) => {
                const o = other(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 border-b border-zinc-50 px-4 py-3 text-left transition hover:bg-zinc-50 ${
                      activeId === c.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    <Avatar src={o.avatar} name={o.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-900">{o.name}</div>
                      <div className="truncate text-xs text-zinc-500">
                        {isBrand && c.influencer?.tier ? c.influencer.tier : 'Tap to open'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Thread */}
        <div className={`lg:col-span-2 ${activeId ? '' : 'hidden lg:block'}`}>
          {!activeId ? (
            <Card padding="lg" className="grid h-[70vh] place-items-center text-sm text-zinc-500">
              Select a conversation to start chatting.
            </Card>
          ) : (
            <ChatThread
              key={activeId}
              userId={user.id}
              isBrand={isBrand}
              loading={loadingThread}
              thread={thread}
              onBack={() => setActiveId(null)}
              onChanged={() => {
                loadThread(activeId);
                loadList();
              }}
              onConsentLost={() => setConsented(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ChatThread({ userId, isBrand, loading, thread, onBack, onChanged, onConsentLost }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offer, setOffer] = useState({ deliverable: 'IG_REEL', price: '' });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [thread?.messages?.length]);

  const convo = thread?.conversation;
  const otherName = isBrand
    ? convo?.influencer?.user?.fullName ?? 'Creator'
    : convo?.brand?.brandProfile?.companyName ?? convo?.brand?.fullName ?? 'Brand';

  async function send() {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      await apiClient.post(`/api/v1/chat/conversations/${convo.id}/messages`, { body });
      setText('');
      onChanged();
    } catch (e) {
      const suspended = e?.response?.data?.details?.suspended;
      toast.push({ variant: 'danger', title: suspended ? 'Account suspended' : 'Blocked', body: apiError(e) });
      if (suspended) onConsentLost();
    } finally {
      setSending(false);
    }
  }

  async function sendOffer() {
    if (!offer.price || Number(offer.price) <= 0) {
      toast.push({ variant: 'danger', title: 'Enter a valid price' });
      return;
    }
    setSending(true);
    try {
      await apiClient.post(`/api/v1/chat/conversations/${convo.id}/offers`, {
        deliverable: offer.deliverable,
        price: Number(offer.price),
      });
      setShowOffer(false);
      setOffer({ deliverable: 'IG_REEL', price: '' });
      onChanged();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    } finally {
      setSending(false);
    }
  }

  async function actOnOffer(messageId, action) {
    try {
      await apiClient.post(`/api/v1/chat/conversations/${convo.id}/offers/${messageId}/${action}`);
      if (action === 'accept') toast.push({ variant: 'success', title: 'Added to cart', body: 'Review it in your cart.' });
      onChanged();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    }
  }

  return (
    <Card padding="none" className="flex h-[70vh] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
        <button onClick={onBack} className="text-sm text-brand-700 lg:hidden">←</button>
        <div className="text-sm font-semibold text-zinc-900">{otherName}</div>
        <span className="ml-auto text-xs text-zinc-400">No contact sharing</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50/50 p-4">
        {loading && !thread ? (
          <ChatThreadSkeleton bubbles={6} />
        ) : (
          (thread?.messages ?? []).map((m) => (
            <MessageBubble
              key={m.id}
              m={m}
              mine={m.senderUserId === userId}
              isBrand={isBrand}
              onAccept={() => actOnOffer(m.id, 'accept')}
              onDecline={() => actOnOffer(m.id, 'decline')}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {showOffer ? (
        <div className="space-y-3 border-t border-zinc-100 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={offer.deliverable}
              onChange={(v) => setOffer((o) => ({ ...o, deliverable: v }))}
              options={OFFER_DELIVERABLES}
            />
            <Input
              type="number"
              min="1"
              placeholder="Rate (INR)"
              value={offer.price}
              onChange={(e) => setOffer((o) => ({ ...o, price: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowOffer(false)}>Cancel</Button>
            <Button size="sm" onClick={sendOffer} loading={sending}>Send offer</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-t border-zinc-100 p-3">
          {!isBrand && (
            <Button variant="outline" size="sm" onClick={() => setShowOffer(true)}>
              Send rate
            </Button>
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Type a message…"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <Button size="sm" onClick={send} loading={sending} disabled={!text.trim()}>
            Send
          </Button>
        </div>
      )}
    </Card>
  );
}

function MessageBubble({ m, mine, isBrand, onAccept, onDecline }) {
  if (m.type === 'SYSTEM') {
    return <div className="text-center text-xs text-zinc-400">{m.body}</div>;
  }
  if (m.type === 'RATE_OFFER') {
    const status = m.offerStatus;
    return (
      <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[85%] rounded-2xl border border-brand-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">Rate offer</div>
          <div className="mt-1 text-sm font-medium text-zinc-900">
            {DELIVERABLE_LABEL[m.deliverable] ?? m.deliverable}
          </div>
          <div className="text-lg font-bold text-zinc-900">{formatINR(m.price)}</div>
          {status === 'PENDING' && isBrand && (
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={onAccept}>Accept & add to cart</Button>
              <Button size="sm" variant="ghost" onClick={onDecline}>Decline</Button>
            </div>
          )}
          {status !== 'PENDING' && (
            <Badge
              className="mt-2"
              variant={status === 'ACCEPTED' ? 'success' : 'default'}
            >
              {status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
            </Badge>
          )}
          {status === 'PENDING' && !isBrand && (
            <Badge className="mt-2" variant="warning">Awaiting brand</Badge>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
          mine ? 'bg-brand-600 text-white' : 'bg-white text-zinc-800 shadow-sm'
        }`}
      >
        {m.body}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageSkeleton kpis={0} cards={1} />}>
      <MessagesInner />
    </Suspense>
  );
}
