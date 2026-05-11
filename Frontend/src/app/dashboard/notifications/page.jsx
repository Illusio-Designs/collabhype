'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, apiError } from '@/lib/apiClient';
import { Badge, Button, Card, EmptyState, Spinner, useToast } from '@/components/ui';

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const TYPE_ICON = {
  'order.paid': '✅',
  'campaign.assigned': '📋',
  'deliverable.draft': '📝',
  'deliverable.revision': '↩️',
  'deliverable.approved': '👍',
  'deliverable.posted': '📣',
  'deliverable.paid': '💰',
};

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/notifications?limit=100');
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id) {
    try {
      await apiClient.post(`/api/v1/notifications/${id}/read`);
      setItems((arr) => arr.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    }
  }

  async function markAllRead() {
    setBusy(true);
    try {
      await apiClient.post('/api/v1/notifications/read-all');
      setItems((arr) => arr.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      toast.push({ variant: 'success', title: 'All caught up' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Notifications</h1>
          <p className="mt-2 text-zinc-600">
            {unread > 0 ? `You have ${unread} unread` : 'You\'re all caught up'}.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllRead} loading={busy}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="Activity from your campaigns and orders will show up here."
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <ul className="divide-y divide-zinc-100">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-4 px-6 py-4 transition ${
                    n.isRead ? 'bg-white' : 'bg-brand-50/40'
                  }`}
                >
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-zinc-100 text-lg">
                    {TYPE_ICON[n.type] ?? '🔔'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-900">{n.title}</h3>
                      {!n.isRead && <Badge variant="brand" size="sm" dot>New</Badge>}
                      <span className="ml-auto text-xs text-zinc-500">{timeAgo(n.createdAt)}</span>
                    </div>
                    {n.body && <p className="mt-1 text-sm text-zinc-600">{n.body}</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      {n.link && (
                        <Link href={n.link} className="font-medium text-brand-700 hover:underline">
                          View →
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="font-medium text-zinc-500 hover:text-zinc-900"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
