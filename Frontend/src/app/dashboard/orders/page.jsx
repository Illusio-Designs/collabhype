'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Badge, Card, EmptyState, Spinner, useToast } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { formatINR } from '@/lib/format';

const ORDER_BADGE = {
  PENDING: { variant: 'warning', label: 'Pending payment' },
  PAID: { variant: 'success', label: 'Paid' },
  IN_PROGRESS: { variant: 'info', label: 'In progress' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  REFUNDED: { variant: 'default', label: 'Refunded' },
};

function dateStr(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'BRAND') router.replace('/dashboard');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role !== 'BRAND') return;
    apiClient
      .get('/api/v1/orders')
      .then(({ data }) => setOrders(data.orders ?? []))
      .catch((e) => toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  // KPIs derived from the orders list
  const totalSpent = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const completed = orders.filter((o) => o.status === 'COMPLETED').length;
  const inFlight = orders.filter((o) => o.status === 'PAID' || o.status === 'IN_PROGRESS').length;
  const avg = orders.length ? totalSpent / orders.length : 0;
  const kpis = [
    { label: 'Total orders', value: String(orders.length) },
    { label: 'Lifetime spend', value: formatINR(totalSpent) },
    { label: 'Avg order', value: formatINR(avg) },
    { label: 'In flight', value: String(inFlight) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders' },
        ]}
        eyebrow="Billing"
        title="Orders"
        subtitle="Every checkout, with escrow + campaign status."
      />

      <KpiStrip kpis={kpis} />

      {orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No orders yet"
            description="Once you check out, orders will appear here."
            action={
              <Link href="/packages" className="btn-primary">
                Browse packages
              </Link>
            }
          />
        </div>
      ) : (
        <Card padding="none" className="overflow-hidden">
         <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Order</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Items</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Campaigns</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Total</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {orders.map((o) => {
                const meta = ORDER_BADGE[o.status] ?? { variant: 'default', label: o.status };
                return (
                  <tr
                    key={o.id}
                    className="cursor-pointer transition hover:bg-zinc-50"
                    onClick={() => router.push(`/dashboard/orders/${o.id}`)}
                  >
                    <td className="px-3 py-3 sm:px-6">
                      <Link
                        href={`/dashboard/orders/${o.id}`}
                        className="font-mono text-xs font-semibold text-brand-700 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3 sm:px-6 text-zinc-700">
                      {o.items?.length ?? 0} item{o.items?.length === 1 ? '' : 's'}
                    </td>
                    <td className="px-3 py-3 sm:px-6 text-zinc-700">{o._count?.campaigns ?? 0}</td>
                    <td className="px-3 py-3 sm:px-6 font-semibold text-zinc-900">{formatINR(o.total)}</td>
                    <td className="px-3 py-3 sm:px-6">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </td>
                    <td className="px-3 py-3 sm:px-6 text-zinc-500">{dateStr(o.paidAt ?? o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
         </ScrollTable>
        </Card>
      )}
    </div>
  );
}
