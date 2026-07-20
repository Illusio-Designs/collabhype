'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Avatar, Badge, Button, Card, Spinner, Stat } from '@/components/ui';
import ScrollTable from '@/components/dashboard/ScrollTable';
import PageHeader from '@/components/dashboard/PageHeader';
import { formatINR, formatCount } from '@/lib/format';

// Small client-side fetch helper: loading / error / data.
function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve(fetcher())
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((e) => active && setState({ data: null, loading: false, error: apiError(e) }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export default function DashboardHome() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === 'ADMIN') return <AdminOverview user={user} />;
  if (user.role === 'INFLUENCER') return <CreatorOverview user={user} />;
  return <BrandOverview user={user} />;
}

// ============================================================================
// Brand
// ============================================================================

function BrandOverview({ user }) {
  const firstName = (user.fullName || '').split(' ')[0];
  const { data, loading, error } = useApi(async () => {
    const [campaigns, orders] = await Promise.all([
      apiClient.get('/api/v1/campaigns', { params: { limit: 5 } }),
      apiClient.get('/api/v1/orders', { params: { limit: 5 } }),
    ]);
    return {
      campaigns: campaigns.data.campaigns ?? [],
      orders: orders.data.orders ?? [],
      // Lifetime totals from the API — never derived from the 5-row preview.
      campaignSummary: campaigns.data.summary ?? {},
      orderSummary: orders.data.summary ?? {},
    };
  });

  const campaigns = data?.campaigns ?? [];
  const orders = data?.orders ?? [];
  const campaignSummary = data?.campaignSummary ?? {};
  const orderSummary = data?.orderSummary ?? {};
  const activeCampaigns = campaignSummary.active ?? 0;
  const totalCampaigns = campaignSummary.count ?? 0;
  const totalOrders = orderSummary.count ?? 0;
  const spend = orderSummary.totalSpent ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Brand dashboard"
        title={`Good to see you, ${firstName}.`}
        subtitle="Track campaigns, orders and approvals in one place."
        action={
          <Link href="/packages">
            <Button size="md" className="!rounded-lg">
              + Start a campaign
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active campaigns" value={String(activeCampaigns)} />
        <Stat label="Total campaigns" value={String(totalCampaigns)} />
        <Stat label="Total orders" value={String(totalOrders)} />
        <Stat label="Total spend" value={formatINR(spend)} />
      </div>

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="lg" className="min-w-0 lg:col-span-2">
            <SectionHead title="Recent campaigns" link="/dashboard/campaigns" />
            <div className="mt-4 space-y-3">
              {campaigns.length === 0 ? (
                <Empty>No campaigns yet.</Empty>
              ) : (
                campaigns.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/campaigns/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-zinc-900">{c.title}</div>
                      <div className="truncate text-xs text-zinc-500">
                        {c.order?.orderNumber} · {c._count?.deliverables ?? 0} deliverables
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <CampaignBadge status={c.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card padding="lg" className="min-w-0">
            <SectionHead title="Recent orders" link="/dashboard/orders" />
            <div className="mt-4 space-y-3">
              {orders.length === 0 ? (
                <Empty>No orders yet.</Empty>
              ) : (
                orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/dashboard/orders/${o.id}`}
                    className="block rounded-xl border border-zinc-100 p-3 transition hover:border-brand-200"
                  >
                    <div className="truncate font-mono text-xs font-semibold text-brand-700">
                      {o.orderNumber}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-bold text-zinc-900">
                        {formatINR(o.total)}
                      </div>
                      <div className="flex-shrink-0">
                        <OrderBadge status={o.status} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Creator
// ============================================================================

function CreatorOverview({ user }) {
  const firstName = (user.fullName || '').split(' ')[0];
  const profile = user.influencerProfile ?? {};
  const { data, loading, error } = useApi(async () => {
    const [payouts, campaigns, notifs] = await Promise.all([
      apiClient.get('/api/v1/influencers/me/payouts'),
      apiClient.get('/api/v1/campaigns', { params: { limit: 5 } }),
      apiClient.get('/api/v1/notifications', { params: { limit: 3 } }),
    ]);
    return {
      summary: payouts.data.summary ?? {},
      payouts: payouts.data.payouts ?? [],
      campaigns: campaigns.data.campaigns ?? [],
      campaignSummary: campaigns.data.summary ?? {},
      notifications: notifs.data.notifications ?? [],
    };
  });

  const summary = data?.summary ?? {};
  const campaigns = data?.campaigns ?? [];
  const campaignSummary = data?.campaignSummary ?? {};
  const activeCampaigns = campaignSummary.active ?? 0;
  const payouts = data?.payouts ?? [];
  const notifications = data?.notifications ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Creator dashboard"
        title={`Hey ${firstName} 👋`}
        subtitle="Your campaigns, earnings, and growth — all here."
        action={
          <Link href="/dashboard/socials">
            <Button size="md" variant="outline" className="!rounded-lg">
              Connect more socials
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active campaigns" value={String(activeCampaigns)} />
        <Stat label="Total followers" value={formatCount(profile.totalFollowers ?? 0)} />
        <Stat label="Paid out" value={formatINR(summary.paid ?? 0)} />
        <Stat label="Pending payout" value={formatINR(summary.pending ?? 0)} />
      </div>

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card padding="lg" className="min-w-0 lg:col-span-2">
              <SectionHead title="Recent campaigns" link="/dashboard/campaigns" />
              <div className="mt-4 space-y-3">
                {campaigns.length === 0 ? (
                  <Empty>No campaigns yet.</Empty>
                ) : (
                  campaigns.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/campaigns/${c.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-zinc-900">{c.title}</div>
                        <div className="truncate text-xs text-zinc-500">
                          {c.order?.brand?.brandProfile?.companyName ?? c.order?.brand?.fullName} ·{' '}
                          {c.deliverables?.length ?? 0} deliverables
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <CampaignBadge status={c.status} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>

            <Card padding="lg" className="min-w-0">
              <SectionHead title="Recent payouts" link="/dashboard/payouts" />
              <div className="mt-4 space-y-3">
                {payouts.length === 0 ? (
                  <Empty>No payouts yet.</Empty>
                ) : (
                  payouts.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-zinc-100 p-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-zinc-900">
                          {formatINR(p.amount)}
                        </div>
                        <div className="truncate text-xs text-zinc-500">
                          {new Date(p.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <PayoutBadge status={p.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card padding="lg">
            <SectionHead title="Latest activity" link="/dashboard/notifications" />
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <Empty>You&apos;re all caught up.</Empty>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? '/dashboard/notifications'}
                    className="flex items-start gap-3 rounded-xl border border-zinc-100 p-3 transition hover:border-brand-200"
                  >
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-zinc-900">{n.title}</div>
                      {n.body && <div className="line-clamp-2 text-xs text-zinc-600">{n.body}</div>}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Admin
// ============================================================================

function AdminOverview() {
  const { data, loading, error } = useApi(async () => {
    const [stats, users, orders] = await Promise.all([
      apiClient.get('/api/v1/admin/stats'),
      apiClient.get('/api/v1/admin/users', { params: { limit: 8 } }),
      apiClient.get('/api/v1/admin/orders', { params: { limit: 5 } }),
    ]);
    return {
      stats: stats.data ?? {},
      users: users.data.users ?? [],
      orders: orders.data.orders ?? [],
    };
  });

  const stats = data?.stats ?? {};
  const users = data?.users ?? [];
  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform admin"
        title="Operations overview"
        subtitle="Activity across the whole Collabhype platform."
        action={
          <Link href="/dashboard/admin/packages">
            <Button size="md" className="!rounded-lg">
              + Add package
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={formatCount(stats.totalUsers ?? 0)} />
        <Stat label="Brands" value={formatCount(stats.totalBrands ?? 0)} />
        <Stat label="Creators" value={formatCount(stats.totalCreators ?? 0)} />
        <Stat label="GMV (30d)" value={formatINR(stats.gmv30d ?? 0)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SmallKPI label="Active campaigns" value={stats.activeCampaigns ?? 0} tone="brand" />
        <SmallKPI label="Signups this week" value={stats.signupsThisWeek ?? 0} tone="success" />
        <SmallKPI label="Pending approvals" value={stats.pendingApprovals ?? 0} tone="warning" />
        <SmallKPI label="Payouts queued" value={stats.payoutsQueued ?? 0} tone="info" />
      </div>

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <Card padding="lg" className="min-w-0 xl:col-span-2">
            <SectionHead title="Recent signups" link="/dashboard/admin/users" />
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-100">
              <ScrollTable hintLabel="Scroll">
                <table className="min-w-full">
                  <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">User</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Joined</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                          No users yet.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-50">
                          <td className="whitespace-nowrap px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={u.fullName} size="sm" />
                              <div className="min-w-0">
                                <div className="truncate font-medium text-zinc-900">
                                  {u.fullName}
                                </div>
                                <div className="truncate text-xs text-zinc-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5">
                            <Badge
                              variant={
                                u.role === 'BRAND'
                                  ? 'brand'
                                  : u.role === 'INFLUENCER'
                                    ? 'info'
                                    : 'dark'
                              }
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-zinc-600">
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5">
                            <Badge variant={u.isActive ? 'success' : 'default'}>
                              {u.isActive ? 'Active' : 'Suspended'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollTable>
            </div>
          </Card>

          <Card padding="lg" className="min-w-0">
            <SectionHead title="Recent orders" link="/dashboard/admin/orders" />
            <div className="mt-4 space-y-3">
              {orders.length === 0 ? (
                <Empty>No orders yet.</Empty>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="rounded-xl border border-zinc-100 p-3">
                    <div className="truncate font-mono text-xs font-semibold text-brand-700">
                      {o.orderNumber}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-bold text-zinc-900">
                        {formatINR(o.total)}
                      </div>
                      <div className="flex-shrink-0">
                        <OrderBadge status={o.status} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Shared
// ============================================================================

function SectionHead({ title, link }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      {link && (
        <Link href={link} className="text-xs font-medium text-brand-700 hover:underline">
          View all →
        </Link>
      )}
    </div>
  );
}

function LoadingCard() {
  return (
    <Card padding="lg">
      <div className="grid h-32 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    </Card>
  );
}

function ErrorCard({ message }) {
  return (
    <Card padding="lg">
      <div className="py-8 text-center">
        <p className="text-sm font-semibold text-zinc-900">Couldn&apos;t load your data</p>
        <p className="mt-1 text-xs text-zinc-600">{message}</p>
      </div>
    </Card>
  );
}

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">{children}</p>;
}

function SmallKPI({ label, value, tone = 'brand' }) {
  const TONES = {
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-sky-50 text-sky-700',
  };
  return (
    <div className={`rounded-2xl ${TONES[tone]} p-4`}>
      <div className="truncate text-[11px] font-semibold uppercase tracking-wider opacity-80 sm:text-xs">
        {label}
      </div>
      <div className="mt-1 truncate text-2xl font-bold sm:text-3xl">{value}</div>
    </div>
  );
}

function CampaignBadge({ status }) {
  const map = {
    DRAFT: { variant: 'default', label: 'Draft' },
    BRIEF_SENT: { variant: 'info', label: 'Brief sent' },
    IN_PROGRESS: { variant: 'warning', label: 'In progress' },
    REVIEW: { variant: 'warning', label: 'In review' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
  };
  const m = map[status] ?? { variant: 'default', label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function OrderBadge({ status }) {
  const map = {
    PENDING: { variant: 'warning', label: 'Pending' },
    PAID: { variant: 'success', label: 'Paid' },
    IN_PROGRESS: { variant: 'info', label: 'In progress' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    REFUNDED: { variant: 'default', label: 'Refunded' },
  };
  const m = map[status] ?? { variant: 'default', label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function PayoutBadge({ status }) {
  const map = {
    PENDING: { variant: 'warning', label: 'Pending' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    PAID: { variant: 'success', label: 'Paid' },
    FAILED: { variant: 'danger', label: 'Failed' },
  };
  const m = map[status] ?? { variant: 'default', label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
