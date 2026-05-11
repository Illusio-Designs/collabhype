'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge, Card, Spinner } from '@/components/ui';
import { formatINR } from '@/lib/format';
import { DUMMY_ORDERS } from '@/lib/dummyData';

const ORDER_BADGE = {
  PENDING: { variant: 'warning', label: 'Pending payment' },
  PAID: { variant: 'success', label: 'Paid' },
  IN_PROGRESS: { variant: 'info', label: 'In progress' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  REFUNDED: { variant: 'default', label: 'Refunded' },
};

export default function AdminOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Platform admin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">All orders</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Every checkout across the platform with escrow status.
        </p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Order</th>
              <th className="px-6 py-3 text-left font-semibold">Brand</th>
              <th className="px-6 py-3 text-left font-semibold">Items</th>
              <th className="px-6 py-3 text-left font-semibold">Total</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Paid at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {DUMMY_ORDERS.map((o) => {
              const m = ORDER_BADGE[o.status] ?? { variant: 'default', label: o.status };
              return (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 font-mono text-xs font-semibold text-brand-700">
                    {o.orderNumber}
                  </td>
                  <td className="px-6 py-3 text-zinc-700">Acme Brand</td>
                  <td className="px-6 py-3 text-zinc-600">{o.items?.length ?? 0}</td>
                  <td className="px-6 py-3 font-semibold text-zinc-900">
                    {formatINR(o.total)}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={m.variant}>{m.label}</Badge>
                  </td>
                  <td className="px-6 py-3 text-zinc-500">
                    {o.paidAt ? new Date(o.paidAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
