'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Badge, Card, EmptyState, Spinner, Tabs, useToast } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import { formatINR } from '@/lib/format';

const STATUS_BADGE = {
  DRAFT: { variant: 'default', label: 'Draft' },
  BRIEF_SENT: { variant: 'info', label: 'Brief sent' },
  IN_PROGRESS: { variant: 'warning', label: 'In progress' },
  REVIEW: { variant: 'warning', label: 'In review' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
};

function dateStr(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CampaignsListPage() {
  const { user, isLoading } = useAuth();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!user) return;
    const status = filter === 'ALL' ? '' : `?status=${filter}`;
    apiClient
      .get(`/api/v1/campaigns${status}`)
      .then(({ data }) => setCampaigns(data.campaigns ?? []))
      .catch((e) => toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  if (isLoading || loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'In progress', value: 'IN_PROGRESS' },
    { label: 'Brief sent', value: 'BRIEF_SENT' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  // KPIs derived from the current campaign list
  const totalCampaigns = campaigns.length;
  const inProgress = campaigns.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'BRIEF_SENT').length;
  const completed = campaigns.filter((c) => c.status === 'COMPLETED').length;
  const totalDeliverables = campaigns.reduce(
    (s, c) => s + (c._count?.deliverables ?? c.deliverables?.length ?? 0),
    0,
  );
  const kpis = [
    { label: 'Total campaigns', value: String(totalCampaigns) },
    { label: 'In progress', value: String(inProgress) },
    { label: 'Completed', value: String(completed) },
    { label: 'Deliverables', value: String(totalDeliverables) },
  ];

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">{user?.role === 'BRAND' ? 'Your campaigns' : 'Assigned campaigns'}</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Campaigns</h1>
        <p className="mt-2 text-zinc-600">
          {user?.role === 'BRAND'
            ? 'Track briefs, drafts, and approvals across every order.'
            : 'Every brand campaign you’re part of, in one place.'}
        </p>
      </header>

      <KpiStrip kpis={kpis} />

      <div>
        <Tabs
          variant="pills"
          tabs={tabs.map((t) => ({
            label: t.label,
            content: <CampaignsList campaigns={campaigns} role={user?.role} />,
          }))}
          onChange={(i) => setFilter(tabs[i].value)}
        />
      </div>
    </div>
  );
}

function CampaignsList({ campaigns, role }) {
  if (!campaigns.length) {
    return (
      <EmptyState
        title="No campaigns yet"
        description={
          role === 'BRAND'
            ? 'Once you check out a package or build a custom mix, campaigns appear here.'
            : 'Once a brand books you and pays, the campaign will appear here.'
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {campaigns.map((c) => (
        <Link key={c.id} href={`/dashboard/campaigns/${c.id}`} className="block">
          <Card hover className="h-full">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-zinc-500">
                  {c.order?.orderNumber && <span className="font-mono">{c.order.orderNumber}</span>}
                  {role === 'INFLUENCER' && c.order?.brand?.brandProfile?.companyName && (
                    <span> · {c.order.brand.brandProfile.companyName}</span>
                  )}
                </div>
                <h3 className="mt-1 truncate text-lg font-semibold text-zinc-900">{c.title}</h3>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm">
              <div className="flex gap-4 text-xs text-zinc-500">
                <span>{c._count?.deliverables ?? c.deliverables?.length ?? 0} deliverables</span>
                {c.order?.total != null && (
                  <span className="font-medium text-zinc-900">{formatINR(c.order.total)}</span>
                )}
              </div>
              <span className="text-xs text-zinc-500">{dateStr(c.createdAt)}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_BADGE[status] ?? { variant: 'default', label: status };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
