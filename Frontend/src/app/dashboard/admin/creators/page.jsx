'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Pagination,
  Select,
  useToast,
} from '@/components/ui';
import { useConfirm } from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { TablePageSkeleton, TableRowsSkeleton } from '@/components/dashboard/Skeletons';
import { TIER_LABEL, formatCount } from '@/lib/format';

const PAGE_SIZE = 20;

const BADGE_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'RISING_TALENT', label: 'Rising talent' },
  { value: 'TOP_RATED', label: 'Top rated' },
  { value: 'TOP_RATED_PLUS', label: 'Top rated+' },
  { value: 'EXPERT_VETTED', label: 'Expert vetted' },
];

const BADGE_VARIANT = {
  RISING_TALENT: 'info',
  TOP_RATED: 'success',
  TOP_RATED_PLUS: 'success',
  EXPERT_VETTED: 'brand',
};

export default function AdminCreatorsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [influencers, setInfluencers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(''); // raw input
  const [query, setQuery] = useState(''); // debounced, used for fetch
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  // Debounce the search box, and snap back to page 1 whenever the query changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const buildUrl = useCallback(
    (p) =>
      `/api/v1/influencers?page=${p}&limit=${PAGE_SIZE}` +
      (query ? `&q=${encodeURIComponent(query)}` : ''),
    [query],
  );

  const load = useCallback(
    async ({ force = false } = {}) => {
      setLoading(true);
      try {
        const data = await dedupedGet(buildUrl(page), { force });
        setInfluencers(data.influencers ?? []);
        setMeta(data.meta ?? { total: 0, page, totalPages: 1 });
      } catch (e) {
        toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, page, toast],
  );

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  async function recomputeAll() {
    if (!(await confirm({ title: 'Recompute badges?', body: 'Recompute badges for all creators? This may take a moment.', confirmText: 'Recompute' }))) return;
    setRecomputing(true);
    try {
      const { data } = await apiClient.post('/api/v1/influencers/admin/badges/recompute');
      const n = data?.updated ?? data?.count ?? null;
      toast.push({
        variant: 'success',
        title: 'Badges recomputed',
        body: n != null ? `${n} creator${n === 1 ? '' : 's'} updated.` : undefined,
      });
      invalidate('/api/v1/influencers');
      await load({ force: true });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Recompute failed', body: apiError(e) });
    } finally {
      setRecomputing(false);
    }
  }

  async function setBadge(inf, badge) {
    if (badge === (inf.badge ?? 'NONE')) return;
    setSavingId(inf.id);
    try {
      await apiClient.post(`/api/v1/influencers/admin/badges/${inf.id}`, { badge });
      // Update just this row locally, then drop the browse cache so the next
      // full load is fresh — no need to refetch the whole page right now.
      setInfluencers((rows) => rows.map((r) => (r.id === inf.id ? { ...r, badge } : r)));
      invalidate('/api/v1/influencers');
      toast.push({ variant: 'success', title: 'Badge updated' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Update failed', body: apiError(e) });
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <TablePageSkeleton kpis={0} cols={5} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin' },
          { label: 'Creators & badges' },
        ]}
        eyebrow="Platform admin"
        title="Creators & badges"
        subtitle="Browse creators and assign trust badges. Paginated straight from the API."
        action={
          <Button onClick={recomputeAll} loading={recomputing} variant="outline">
            Recompute all badges
          </Button>
        }
      />

      <div className="max-w-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or handle…"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Creator</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Tier</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Followers</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Badge</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Set badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading && <TableRowsSkeleton rows={8} cols={5} pad="px-3 py-3 sm:px-6" />}
              {!loading && influencers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No creators match this search.
                  </td>
                </tr>
              )}
              {!loading &&
                influencers.map((inf) => {
                  const badge = inf.badge ?? 'NONE';
                  const badgeLabel =
                    BADGE_OPTIONS.find((b) => b.value === badge)?.label ?? badge;
                  return (
                    <tr key={inf.id} className="hover:bg-zinc-50">
                      <td className="px-3 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={inf.user?.fullName} src={inf.user?.avatarUrl} size="sm" />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-zinc-900">
                              {inf.user?.fullName ?? 'Creator'}
                            </div>
                            {inf.socialAccounts?.[0]?.handle && (
                              <div className="truncate text-xs text-zinc-500">
                                @{inf.socialAccounts[0].handle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 text-zinc-700">
                        {TIER_LABEL[inf.tier] ?? inf.tier ?? '—'}
                      </td>
                      <td className="px-3 py-3 sm:px-6 text-zinc-700">
                        {formatCount(inf.totalFollowers ?? 0)}
                      </td>
                      <td className="px-3 py-3 sm:px-6">
                        {badge === 'NONE' ? (
                          <span className="text-xs text-zinc-400">—</span>
                        ) : (
                          <Badge variant={BADGE_VARIANT[badge] ?? 'default'}>{badgeLabel}</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 sm:px-6">
                        <div className="w-44">
                          <Select
                            value={badge}
                            onChange={(v) => setBadge(inf, v)}
                            options={BADGE_OPTIONS}
                            disabled={savingId === inf.id}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </ScrollTable>
      </Card>

      <div className="flex flex-col items-center gap-2">
        <Pagination page={page} pageCount={meta.totalPages ?? 1} onChange={setPage} />
        <p className="text-xs text-zinc-500">
          {meta.total ?? 0} creator{meta.total === 1 ? '' : 's'} · page {meta.page ?? page} of{' '}
          {meta.totalPages ?? 1}
        </p>
      </div>
    </div>
  );
}
