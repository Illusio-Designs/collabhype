'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Avatar, Badge, Card, Select, Spinner, Stat, useToast } from '@/components/ui';

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export default function AdminTrackingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [days, setDays] = useState('30');
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([
        apiClient.get(`/api/v1/admin/tracking/summary?days=${days}`),
        apiClient.get('/api/v1/admin/tracking/events?limit=20'),
      ]);
      setSummary(s.data);
      setEvents(e.data?.events ?? []);
    } catch (err) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(err) });
    } finally {
      setLoading(false);
    }
  }, [days, toast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  if (isLoading || !user || user.role !== 'ADMIN' || loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Platform admin</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Platform tracking</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Events captured server-side from every page view and key action.
          </p>
        </div>
        <div className="w-44">
          <Select value={days} onChange={setDays} options={RANGE_OPTIONS} />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total events" value={summary?.totalEvents ?? 0} />
        <Stat label="Unique signed-in users" value={summary?.uniqueUsers ?? 0} />
        <Stat label="Distinct event types" value={summary?.byName?.length ?? 0} />
        <Stat label="Window" value={`${summary?.days ?? days}d`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top events */}
        <Card padding="lg">
          <h2 className="text-base font-semibold text-zinc-900">Top events</h2>
          <p className="mt-1 text-sm text-zinc-600">Most frequent event names in the window.</p>
          <div className="mt-4 space-y-2">
            {(summary?.byName ?? []).length === 0 && (
              <div className="rounded-lg bg-zinc-50 p-4 text-center text-sm text-zinc-500">
                No events yet.
              </div>
            )}
            {(summary?.byName ?? []).map((row) => {
              const max = summary.byName[0]?.count ?? 1;
              const pct = max ? (row.count / max) * 100 : 0;
              return (
                <div key={row.eventName} className="rounded-lg border border-zinc-100 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono font-medium text-zinc-900">{row.eventName}</span>
                    <span className="font-semibold text-zinc-700">{row.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top pages */}
        <Card padding="lg">
          <h2 className="text-base font-semibold text-zinc-900">Top pages</h2>
          <p className="mt-1 text-sm text-zinc-600">Most viewed URLs in the window.</p>
          <div className="mt-4 space-y-2">
            {(summary?.topPages ?? []).length === 0 && (
              <div className="rounded-lg bg-zinc-50 p-4 text-center text-sm text-zinc-500">
                No page views yet.
              </div>
            )}
            {(summary?.topPages ?? []).map((row) => {
              const max = summary.topPages[0]?.count ?? 1;
              const pct = max ? (row.count / max) * 100 : 0;
              return (
                <div key={row.pageUrl} className="rounded-lg border border-zinc-100 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-mono text-xs text-zinc-700">{row.pageUrl}</span>
                    <span className="ml-3 flex-shrink-0 font-semibold text-zinc-700">{row.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-pink-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Live event stream */}
      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Recent events</h2>
          <span className="text-xs text-zinc-500">{events.length} most recent</span>
        </div>
        {events.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-zinc-500">
            No events recorded yet. Accept cookies on the public site to start collecting.
          </div>
        ) : (
         <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Event</th>
                <th className="px-6 py-3 text-left font-semibold">User</th>
                <th className="px-6 py-3 text-left font-semibold">Page</th>
                <th className="px-6 py-3 text-left font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3">
                    <span className="font-mono text-xs font-semibold text-brand-700">
                      {e.eventName}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {e.user ? (
                      <div className="flex items-center gap-2.5">
                        <Avatar name={e.user.fullName} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-zinc-900">
                            {e.user.fullName}
                          </div>
                          <Badge size="sm" variant={e.user.role === 'BRAND' ? 'brand' : 'info'}>
                            {e.user.role}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">Anonymous</span>
                    )}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-zinc-600">
                    {e.pageUrl || '—'}
                  </td>
                  <td className="px-6 py-3 text-xs text-zinc-500">
                    {timeAgo(e.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
        )}
      </Card>
    </div>
  );
}

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
