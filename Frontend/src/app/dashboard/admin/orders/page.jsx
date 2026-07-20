'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import { Badge, Card, Pagination, Select, Spinner, useToast } from '@/components/ui';
import { useConfirm } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { TablePageSkeleton } from '@/components/dashboard/Skeletons';
import { formatINR } from '@/lib/format';

const PAGE_SIZE = 20;
const STATS_URL = '/api/v1/admin/stats';

const ORDER_BADGE = {
  PENDING: { variant: 'warning', label: 'Pending payment' },
  PAID: { variant: 'success', label: 'Paid' },
  IN_PROGRESS: { variant: 'info', label: 'In progress' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  REFUNDED: { variant: 'default', label: 'Refunded' },
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];

export default function AdminOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Stats is shared across admin pages — dedupedGet reuses it within its TTL.
      const [ordersData, statsData] = await Promise.all([
        dedupedGet(`/api/v1/admin/orders?page=${page}&limit=${PAGE_SIZE}`),
        dedupedGet(STATS_URL),
      ]);
      setOrders(ordersData.orders ?? []);
      setMeta(ordersData.meta ?? { total: 0, page, totalPages: 1 });
      setStats(statsData ?? null);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  async function changeStatus(order, status) {
    if (status === order.status) return;
    if (
      (status === 'CANCELLED' || status === 'REFUNDED') &&
      !(await confirm({
        title: `Mark ${status.toLowerCase()}?`,
        body: `Mark order ${order.orderNumber} as ${status}? This records the status only — it does NOT trigger a Razorpay refund.`,
        variant: 'danger',
        confirmText: 'Confirm',
      }))
    ) {
      return;
    }
    setSavingId(order.id);
    try {
      await apiClient.patch(`/api/v1/admin/orders/${order.id}`, { status });
      setOrders((rows) => rows.map((r) => (r.id === order.id ? { ...r, status } : r)));
      invalidate('/api/v1/admin/orders');
      invalidate('/api/v1/admin/stats');
      toast.push({ variant: 'success', title: 'Order updated' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Update failed', body: apiError(e) });
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <TablePageSkeleton kpis={4} cols={7} />;
  }

  const kpis = [
    { label: 'GMV (30d)', value: formatINR(stats?.gmv30d ?? 0) },
    { label: 'Active campaigns', value: String(stats?.activeCampaigns ?? 0) },
    { label: 'Pending approvals', value: String(stats?.pendingApprovals ?? 0) },
    { label: 'Payouts queued', value: String(stats?.payoutsQueued ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin' },
          { label: 'All orders' },
        ]}
        eyebrow="Platform admin"
        title="All orders"
        subtitle="Every checkout across the platform with escrow status."
      />

      <KpiStrip kpis={kpis} />

      <Card padding="none" className="overflow-hidden">
        <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Order</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Brand</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Items</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Total</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Paid at</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Set status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Spinner />
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No orders yet.
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((o) => {
                  const m = ORDER_BADGE[o.status] ?? { variant: 'default', label: o.status };
                  return (
                    <tr key={o.id} className="hover:bg-zinc-50">
                      <td className="px-3 py-3 sm:px-6 font-mono text-xs font-semibold text-brand-700">
                        {o.orderNumber}
                      </td>
                      <td className="px-3 py-3 sm:px-6 text-zinc-700">
                        <div className="font-medium text-zinc-900">{o.brand?.fullName ?? '—'}</div>
                        <div className="text-xs text-zinc-500">{o.brand?.email}</div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 text-zinc-600">{o._count?.items ?? 0}</td>
                      <td className="px-3 py-3 sm:px-6 font-semibold text-zinc-900">
                        {formatINR(o.total)}
                      </td>
                      <td className="px-3 py-3 sm:px-6">
                        <Badge variant={m.variant}>{m.label}</Badge>
                      </td>
                      <td className="px-3 py-3 sm:px-6 text-zinc-500">
                        {o.paidAt ? new Date(o.paidAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-3 py-3 sm:px-6">
                        <div className="w-44">
                          <Select
                            value={o.status}
                            onChange={(v) => changeStatus(o, v)}
                            options={STATUS_OPTIONS}
                            disabled={savingId === o.id}
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
          {meta.total ?? 0} order{meta.total === 1 ? '' : 's'} · page {meta.page ?? page} of{' '}
          {meta.totalPages ?? 1}
        </p>
      </div>
    </div>
  );
}
