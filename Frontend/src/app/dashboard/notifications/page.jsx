'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  IndianRupee,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  MessageSquare,
  PenLine,
  RotateCcw,
  Tag,
  ThumbsUp,
  UserCheck,
  Zap,
} from 'lucide-react';
import { Badge, Button, Card, EmptyState, useToast } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import { NotificationsPageSkeleton } from '@/components/dashboard/Skeletons';

// 100 is the backend's max limit — this endpoint has no page param, so this is
// the whole list, not a window into it.
const NOTIFICATIONS_URL = '/api/v1/notifications?limit=100';

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

// Flat Lucide icons per notification type (no emoji / 3D glyphs), each with a
// tone matching its meaning. Falls back to a bell.
const TYPE_ICON = {
  'order.paid': { Icon: CheckCircle2, tone: 'bg-green-50 text-green-600' },
  'campaign.assigned': { Icon: ClipboardList, tone: 'bg-brand-50 text-brand-600' },
  'campaign.brief': { Icon: FileText, tone: 'bg-brand-50 text-brand-600' },
  'task.available': { Icon: Zap, tone: 'bg-amber-50 text-amber-600' },
  'task.claimed': { Icon: UserCheck, tone: 'bg-green-50 text-green-600' },
  'chat.message': { Icon: MessageSquare, tone: 'bg-sky-50 text-sky-600' },
  'chat.offer': { Icon: Tag, tone: 'bg-purple-50 text-purple-600' },
  'support.opened': { Icon: LifeBuoy, tone: 'bg-sky-50 text-sky-600' },
  'support.replied': { Icon: MessageCircle, tone: 'bg-sky-50 text-sky-600' },
  'deliverable.draft': { Icon: PenLine, tone: 'bg-sky-50 text-sky-600' },
  'deliverable.approved': { Icon: ThumbsUp, tone: 'bg-green-50 text-green-600' },
  'deliverable.revision': { Icon: RotateCcw, tone: 'bg-amber-50 text-amber-600' },
  'deliverable.posted': { Icon: Megaphone, tone: 'bg-purple-50 text-purple-600' },
  'deliverable.paid': { Icon: IndianRupee, tone: 'bg-green-50 text-green-600' },
};

const DEFAULT_ICON = { Icon: Bell, tone: 'bg-zinc-100 text-zinc-500' };

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dedupedGet(NOTIFICATIONS_URL);
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
      // State is updated in place above; drop the cache so navigating away and
      // back inside the TTL doesn't resurrect the unread badge.
      invalidate(NOTIFICATIONS_URL);
      // Refresh the sidebar/topbar badge immediately.
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('ch:notifications-updated'));
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
      invalidate(NOTIFICATIONS_URL);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('ch:notifications-updated'));
      toast.push({ variant: 'success', title: 'All caught up' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <NotificationsPageSkeleton />;
  }

  const oneDayMs = 1000 * 60 * 60 * 24;
  const last24h = items.filter((n) => Date.now() - new Date(n.createdAt).getTime() < oneDayMs).length;
  const last7d = items.filter((n) => Date.now() - new Date(n.createdAt).getTime() < oneDayMs * 7).length;
  const read = items.filter((n) => n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notifications' },
        ]}
        eyebrow="Inbox"
        title="Notifications"
        subtitle={unread > 0 ? `You have ${unread} unread.` : "You're all caught up."}
        action={
          unread > 0 && (
            <Button variant="outline" onClick={markAllRead} loading={busy}>
              Mark all read
            </Button>
          )
        }
      />

      <KpiStrip
        kpis={[
          { label: 'Unread', value: String(unread) },
          { label: 'Read', value: String(read) },
          { label: 'Last 24h', value: String(last24h) },
          { label: 'Last 7d', value: String(last7d) },
        ]}
      />

      <div>
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
                  {(() => {
                    const { Icon, tone } = TYPE_ICON[n.type] ?? DEFAULT_ICON;
                    return (
                      <div
                        className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full ${tone}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    );
                  })()}
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
