'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Badge,
  Breadcrumb,
  Card,
  EmptyState,
  Spinner,
  Stat,
  useToast,
} from '@/components/ui';
import Milestone, { ORDER_STEPS, orderActiveKey } from '@/components/dashboard/Milestone';
import { DELIVERABLE_LABEL, formatINR } from '@/lib/format';

const ORDER_BADGE = {
  PENDING: { variant: 'warning', label: 'Pending payment' },
  PAID: { variant: 'success', label: 'Paid' },
  IN_PROGRESS: { variant: 'info', label: 'In progress' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  REFUNDED: { variant: 'default', label: 'Refunded' },
};

const ESCROW_BADGE = {
  HELD: { variant: 'info', label: 'Held' },
  RELEASED: { variant: 'success', label: 'Released' },
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

export default function OrderDetailPage() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'BRAND') router.replace('/dashboard');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role !== 'BRAND') return;
    apiClient
      .get(`/api/v1/orders/${params.id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((e) => toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id]);

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!order) return null;

  const meta = ORDER_BADGE[order.status] ?? { variant: 'default', label: order.status };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/dashboard/orders' },
          { label: order.orderNumber },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold text-zinc-900">{order.orderNumber}</h1>
          <div className="mt-1 text-sm text-zinc-500">
            Placed {dateStr(order.createdAt)}
            {order.paidAt && ` · Paid ${dateStr(order.paidAt)}`}
          </div>
        </div>
        <Badge variant={meta.variant} size="lg">
          {meta.label}
        </Badge>
      </div>

      {/* Milestone tracker */}
      <Card padding="lg" className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Order milestones
        </h2>
        <div className="mt-5">
          <Milestone steps={ORDER_STEPS} activeKey={orderActiveKey(order)} />
        </div>
      </Card>

      {/* Top stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Order total" value={formatINR(order.total)} />
        <Stat label="Items" value={String(order.items?.length ?? 0)} />
        <Stat label="Campaigns" value={String(order.campaigns?.length ?? 0)} />
      </div>

      {/* Items */}
      <Card padding="none" className="mt-8 overflow-hidden">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Items</h2>
        </div>
        {order.items?.length ? (
          <ul className="divide-y divide-zinc-100">
            {order.items.map((item) => {
              const snap = item.snapshot ?? {};
              return (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-900">
                        {item.itemType === 'PACKAGE'
                          ? snap.packageTitle ?? 'Package'
                          : 'Custom influencer booking'}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Qty {item.qty} · Unit {formatINR(item.price)}
                      </div>
                      {Array.isArray(snap.deliverables) && snap.deliverables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {snap.deliverables.map((d, i) => (
                            <Badge key={i}>
                              {d.qty}× {DELIVERABLE_LABEL[d.type] ?? d.type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-zinc-900">
                        {formatINR(Number(item.price) * item.qty)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No items" />
        )}
        <div className="bg-zinc-50 px-6 py-4">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-600">Subtotal</dt>
              <dd className="font-medium text-zinc-900">{formatINR(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600">Tax</dt>
              <dd className="font-medium text-zinc-900">{formatINR(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2">
              <dt className="font-semibold text-zinc-900">Total</dt>
              <dd className="text-lg font-bold text-zinc-900">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Escrow */}
      {order.escrows?.length > 0 && (
        <Card padding="lg" className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900">Escrow</h2>
          <ul className="mt-3 space-y-2">
            {order.escrows.map((e) => {
              const m = ESCROW_BADGE[e.status] ?? { variant: 'default', label: e.status };
              return (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{formatINR(e.amount)}</div>
                    <div className="text-xs text-zinc-500">
                      Created {dateStr(e.createdAt)}
                      {e.releasedAt && ` · Released ${dateStr(e.releasedAt)}`}
                    </div>
                  </div>
                  <Badge variant={m.variant}>{m.label}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Campaigns */}
      {order.campaigns?.length > 0 && (
        <Card padding="lg" className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900">Campaigns generated</h2>
          <ul className="mt-3 space-y-2">
            {order.campaigns.map((c) => {
              const deliverables = c.deliverables ?? [];
              const paid = deliverables.filter((d) => d.status === 'PAID').length;
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/campaigns/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/30"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{c.title}</div>
                      <div className="text-xs text-zinc-500">
                        {paid}/{deliverables.length} deliverables paid · {c.status}
                      </div>
                    </div>
                    <span className="text-sm text-brand-700">View →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
