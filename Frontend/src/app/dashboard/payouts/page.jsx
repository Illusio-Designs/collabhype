'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Badge, Card, EmptyState, Spinner, useToast } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { formatINR } from '@/lib/format';

const STATUS_BADGE = {
  PENDING: { variant: 'warning', label: 'Pending' },
  PROCESSING: { variant: 'info', label: 'Processing' },
  PAID: { variant: 'success', label: 'Paid' },
  FAILED: { variant: 'danger', label: 'Failed' },
};

function dateStr(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

export default function PayoutsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ payouts: [], summary: null });

  useEffect(() => {
    if (!isLoading && user && user.role !== 'INFLUENCER') router.replace('/dashboard');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role !== 'INFLUENCER') return;
    apiClient
      .get('/api/v1/influencers/me/payouts')
      .then(({ data }) => setData(data))
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

  const summary = data.summary ?? {};
  const payouts = data.payouts ?? [];

  const kpis = [
    { label: 'Total earned', value: formatINR(summary.total ?? 0) },
    { label: 'Pending', value: formatINR(summary.pending ?? 0) },
    { label: 'Paid out', value: formatINR(summary.paid ?? 0) },
    { label: 'Failed', value: formatINR(summary.failed ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Earnings</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Payouts</h1>
        <p className="mt-2 text-zinc-600">
          Released to your UPI within 1–2 business days after a brand approves your post.
        </p>
      </header>

      <KpiStrip kpis={kpis} />

      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">History</h2>
          <span className="text-xs text-zinc-500">{payouts.length} total</span>
        </div>
        {payouts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No payouts yet"
              description="Complete a campaign deliverable to start earning."
            />
          </div>
        ) : (
         <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Date</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Amount</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Paid at</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {payouts.map((p) => {
                const meta = STATUS_BADGE[p.status] ?? { variant: 'default', label: p.status };
                return (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-3 sm:px-6 text-zinc-700">{dateStr(p.createdAt)}</td>
                    <td className="px-3 py-3 sm:px-6 font-semibold text-zinc-900">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-3 py-3 sm:px-6">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </td>
                    <td className="px-3 py-3 sm:px-6 text-zinc-700">{dateStr(p.paidAt)}</td>
                    <td className="px-3 py-3 sm:px-6 font-mono text-xs text-zinc-500">
                      {p.razorpayPayoutId ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
         </ScrollTable>
        )}
      </Card>
    </div>
  );
}
