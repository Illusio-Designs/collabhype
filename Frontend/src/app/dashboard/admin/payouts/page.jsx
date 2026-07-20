'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import { Avatar, Badge, Card, Pagination, Select, Spinner, useToast } from '@/components/ui';
import { useConfirm } from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { TablePageSkeleton, TableRowsSkeleton } from '@/components/dashboard/Skeletons';
import { formatINR } from '@/lib/format';

const PAGE_SIZE = 20;

const PAYOUT_BADGE = {
  PENDING: { variant: 'warning', label: 'Pending' },
  PROCESSING: { variant: 'info', label: 'Processing' },
  PAID: { variant: 'success', label: 'Paid' },
  FAILED: { variant: 'danger', label: 'Failed' },
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
];

const FILTER_OPTIONS = [{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS];

export default function AdminPayoutsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [payouts, setPayouts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(
    async ({ force = false } = {}) => {
      setLoading(true);
      try {
        const url =
          `/api/v1/admin/payouts?page=${page}&limit=${PAGE_SIZE}` +
          (statusFilter ? `&status=${statusFilter}` : '');
        const data = await dedupedGet(url, { force });
        setPayouts(data.payouts ?? []);
        setMeta(data.meta ?? { total: 0, page, totalPages: 1 });
      } catch (e) {
        toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, toast],
  );

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  async function changeStatus(payout, status) {
    if (status === payout.status) return;
    let failureReason;
    if (status === 'FAILED') {
      failureReason = prompt('Failure reason (optional):') || null;
    }
    if (
      status === 'PAID' &&
      !(await confirm({
        title: 'Mark payout as PAID?',
        body: 'This records the status only — it does NOT send money via Razorpay.',
        confirmText: 'Mark paid',
      }))
    ) {
      return;
    }
    setSavingId(payout.id);
    try {
      await apiClient.patch(`/api/v1/admin/payouts/${payout.id}`, { status, failureReason });
      setPayouts((rows) => rows.map((r) => (r.id === payout.id ? { ...r, status } : r)));
      invalidate('/api/v1/admin/payouts');
      invalidate('/api/v1/admin/stats');
      toast.push({ variant: 'success', title: 'Payout updated' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Update failed', body: apiError(e) });
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <TablePageSkeleton kpis={0} cols={6} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin' },
          { label: 'Payouts' },
        ]}
        eyebrow="Platform admin"
        title="Payouts"
        subtitle="Creator payouts across the platform. Status transitions are recorded here (Razorpay Payouts not yet wired)."
        action={
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={FILTER_OPTIONS}
            />
          </div>
        }
      />

      <Card padding="none" className="overflow-hidden">
        <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Creator</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Amount</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Created</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Paid at</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Set status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading && <TableRowsSkeleton rows={8} cols={6} pad="px-3 py-3 sm:px-6" />}
              {!loading && payouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No payouts found.
                  </td>
                </tr>
              )}
              {!loading &&
                payouts.map((p) => {
                  const m = PAYOUT_BADGE[p.status] ?? { variant: 'default', label: p.status };
                  const name = p.influencer?.user?.fullName ?? 'Creator';
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50">
                      <td className="px-3 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} size="sm" />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-zinc-900">{name}</div>
                            <div className="truncate text-xs text-zinc-500">
                              {p.influencer?.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 font-semibold text-zinc-900">
                        {formatINR(p.amount)}
                      </td>
                      <td className="px-3 py-3 sm:px-6">
                        <Badge variant={m.variant}>{m.label}</Badge>
                        {p.status === 'FAILED' && p.failureReason && (
                          <div className="mt-1 max-w-[10rem] truncate text-xs text-red-500">
                            {p.failureReason}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 sm:px-6 text-zinc-500">
                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-3 py-3 sm:px-6 text-zinc-500">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-3 py-3 sm:px-6">
                        <div className="w-40">
                          <Select
                            value={p.status}
                            onChange={(v) => changeStatus(p, v)}
                            options={STATUS_OPTIONS}
                            disabled={savingId === p.id}
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
          {meta.total ?? 0} payout{meta.total === 1 ? '' : 's'} · page {meta.page ?? page} of{' '}
          {meta.totalPages ?? 1}
        </p>
      </div>
    </div>
  );
}
