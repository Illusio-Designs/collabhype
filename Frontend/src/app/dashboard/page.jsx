'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, Badge, Button, Card, Stat } from '@/components/ui';
import { formatINR, formatCount } from '@/lib/format';
import {
  DUMMY_ADMIN_USERS_LIST,
  DUMMY_CAMPAIGNS_BRAND,
  DUMMY_CAMPAIGNS_INFLUENCER,
  DUMMY_INFLUENCERS,
  DUMMY_NOTIFICATIONS,
  DUMMY_ORDERS,
  DUMMY_PAYOUTS,
  DUMMY_PAYOUT_SUMMARY,
  DUMMY_PLATFORM_STATS,
} from '@/lib/dummyData';

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
        <Stat label="Active campaigns" value="2" change={50} />
        <Stat label="Live deliverables" value="9" change={12} />
        <Stat label="Spend this month" value={formatINR(100000)} change={18} />
        <Stat label="Avg engagement" value="4.7%" change={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <SectionHead title="Recent campaigns" link="/dashboard/campaigns" />
          <div className="mt-4 space-y-3">
            {DUMMY_CAMPAIGNS_BRAND.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/campaigns/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-zinc-900">{c.title}</div>
                  <div className="text-xs text-zinc-500">
                    {c.order?.orderNumber} · {c._count?.deliverables ?? 0} deliverables
                  </div>
                </div>
                <CampaignBadge status={c.status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <SectionHead title="Recent orders" link="/dashboard/orders" />
          <div className="mt-4 space-y-3">
            {DUMMY_ORDERS.map((o) => (
              <Link
                key={o.id}
                href={`/dashboard/orders/${o.id}`}
                className="block rounded-xl border border-zinc-100 p-3 transition hover:border-brand-200"
              >
                <div className="font-mono text-xs font-semibold text-brand-700">
                  {o.orderNumber}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm font-bold text-zinc-900">{formatINR(o.total)}</div>
                  <OrderBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <SectionHead title="Top creators in your campaigns" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DUMMY_INFLUENCERS.slice(0, 3).map((inf) => (
            <Link
              key={inf.id}
              href={`/influencers/${inf.id}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 transition hover:border-brand-200"
            >
              <Avatar name={inf.user.fullName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-900">
                  {inf.user.fullName}
                </div>
                <div className="truncate text-xs text-zinc-500">
                  {formatCount(inf.totalFollowers)} followers · {inf.tier}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Creator
// ============================================================================

function CreatorOverview({ user }) {
  const firstName = (user.fullName || '').split(' ')[0];
  const profile = user.influencerProfile ?? {};
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
        <Stat label="Total followers" value={formatCount(profile.totalFollowers ?? 0)} change={6} />
        <Stat
          label="Avg engagement"
          value={`${(profile.avgEngagementRate ?? 0).toFixed(1)}%`}
          change={4}
        />
        <Stat label="Earned this month" value={formatINR(DUMMY_PAYOUT_SUMMARY.paid)} change={12} />
        <Stat label="Pending payout" value={formatINR(DUMMY_PAYOUT_SUMMARY.pending)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <SectionHead title="Active campaigns" link="/dashboard/campaigns" />
          <div className="mt-4 space-y-3">
            {DUMMY_CAMPAIGNS_INFLUENCER.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/campaigns/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-zinc-900">{c.title}</div>
                  <div className="text-xs text-zinc-500">
                    {c.order?.brand?.brandProfile?.companyName} ·{' '}
                    {c.deliverables?.length ?? 0} deliverables
                  </div>
                </div>
                <CampaignBadge status={c.status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <SectionHead title="Recent payouts" link="/dashboard/payouts" />
          <div className="mt-4 space-y-3">
            {DUMMY_PAYOUTS.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 p-3"
              >
                <div>
                  <div className="text-sm font-bold text-zinc-900">{formatINR(p.amount)}</div>
                  <div className="text-xs text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <PayoutBadge status={p.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <NotificationsList />
    </div>
  );
}

// ============================================================================
// Admin
// ============================================================================

function AdminOverview({ user }) {
  const stats = DUMMY_PLATFORM_STATS;
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
        <Stat label="Total users" value={formatCount(stats.totalUsers)} change={8} />
        <Stat label="Brands" value={formatCount(stats.totalBrands)} change={12} />
        <Stat label="Creators" value={formatCount(stats.totalCreators)} change={7} />
        <Stat label="GMV (30d)" value={formatINR(stats.gmv30d)} change={22} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SmallKPI label="Active campaigns" value={stats.activeCampaigns} tone="brand" />
        <SmallKPI label="Signups this week" value={stats.signupsThisWeek} tone="success" />
        <SmallKPI label="Pending approvals" value={stats.pendingApprovals} tone="warning" />
        <SmallKPI label="Payouts queued" value={stats.payoutsQueued} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <SectionHead title="Recent signups" link="/dashboard/admin/users" />
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-100">
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
                {DUMMY_ADMIN_USERS_LIST.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.fullName} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-zinc-900">{u.fullName}</div>
                          <div className="truncate text-xs text-zinc-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
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
                    <td className="px-4 py-2.5 text-zinc-600">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={u.isActive ? 'success' : 'default'}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding="lg">
          <SectionHead title="Recent orders" link="/dashboard/admin/orders" />
          <div className="mt-4 space-y-3">
            {DUMMY_ORDERS.map((o) => (
              <div key={o.id} className="rounded-xl border border-zinc-100 p-3">
                <div className="font-mono text-xs font-semibold text-brand-700">
                  {o.orderNumber}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm font-bold text-zinc-900">{formatINR(o.total)}</div>
                  <OrderBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Shared
// ============================================================================

function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

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

function SmallKPI({ label, value, tone = 'brand' }) {
  const TONES = {
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-sky-50 text-sky-700',
  };
  return (
    <div className={`rounded-2xl ${TONES[tone]} p-4`}>
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
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

function NotificationsList() {
  return (
    <Card padding="lg">
      <SectionHead title="Latest activity" link="/dashboard/notifications" />
      <div className="mt-4 space-y-3">
        {DUMMY_NOTIFICATIONS.slice(0, 3).map((n) => (
          <Link
            key={n.id}
            href={n.link ?? '/dashboard/notifications'}
            className="flex items-start gap-3 rounded-xl border border-zinc-100 p-3 transition hover:border-brand-200"
          >
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-zinc-900">{n.title}</div>
              {n.body && <div className="mt-0.5 text-xs text-zinc-600">{n.body}</div>}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
