'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiError } from '@/lib/apiClient';
import { dedupedGet } from '@/lib/apiCache';
import { Badge, Card, EmptyState, Pagination, Spinner, Tabs, useToast } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import { formatINR } from '@/lib/format';

const PAGE_SIZE = 20;

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
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        `/api/v1/campaigns?page=${page}&limit=${PAGE_SIZE}` +
        (filter === 'ALL' ? '' : `&status=${filter}`);
      const data = await dedupedGet(url);
      setCampaigns(data.campaigns ?? []);
      setMeta(data.meta ?? { total: 0, page, totalPages: 1 });
      setSummary(data.summary ?? null);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [page, filter, toast]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // Switching tabs re-scopes the list, so page 3 of the old filter is
  // meaningless against the new one.
  function changeFilter(value) {
    setFilter(value);
    setPage(1);
  }

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

  // Server-side aggregate over every campaign, independent of tab + page.
  const kpis = [
    { label: 'Total campaigns', value: String(summary?.count ?? 0) },
    { label: 'In progress', value: String(summary?.active ?? 0) },
    { label: 'Completed', value: String(summary?.completed ?? 0) },
    { label: 'Deliverables', value: String(summary?.deliverables ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns' },
        ]}
        eyebrow={user?.role === 'BRAND' ? 'Your campaigns' : 'Assigned campaigns'}
        title="Campaigns"
        subtitle={
          user?.role === 'BRAND'
            ? 'Track briefs, drafts, and approvals across every order.'
            : 'Every brand campaign you’re part of, in one place.'
        }
      />

      <KpiStrip kpis={kpis} />

      <div>
        <Tabs
          variant="pills"
          tabs={tabs.map((t) => ({
            label: t.label,
            content: <CampaignsList campaigns={campaigns} role={user?.role} />,
          }))}
          onChange={(i) => changeFilter(tabs[i].value)}
        />
      </div>

      {meta.totalPages > 1 && (
        <Pagination page={page} pageCount={meta.totalPages} onChange={setPage} />
      )}
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
