'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, apiError } from '@/lib/apiClient';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, Button, Input, Spinner } from '@/components/ui';
import { formatINR, DELIVERABLE_LABEL } from '@/lib/format';

export default function AddInfluencerForm({ influencerId, influencerName, rateCards }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selections, setSelections] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <Button fullWidth disabled>
        <Spinner size="sm" /> Loading…
      </Button>
    );
  }

  if (!user) {
    return (
      <Link href={`/login?next=/influencers/${influencerId}`} className="block">
        <Button fullWidth>Sign in to add to cart</Button>
      </Link>
    );
  }

  if (user.role !== 'BRAND') {
    return <Alert variant="info">Only brand accounts can book influencers.</Alert>;
  }

  if (!rateCards?.length) {
    return (
      <Alert variant="warning">This creator hasn't published a rate card yet.</Alert>
    );
  }

  function updateQty(deliverable, qty) {
    setSelections((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[deliverable];
      else next[deliverable] = qty;
      return next;
    });
  }

  const selectedItems = Object.entries(selections).filter(([, q]) => q > 0);
  const subtotal = selectedItems.reduce((sum, [d, q]) => {
    const rc = rateCards.find((r) => r.deliverable === d);
    return sum + (rc ? Number(rc.price) * q : 0);
  }, 0);

  async function add() {
    if (!selectedItems.length) {
      setErr('Pick at least one deliverable');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const deliverables = selectedItems.map(([type, qty]) => ({ type, qty }));
      await apiClient.post('/api/v1/cart/items', {
        itemType: 'INFLUENCER',
        influencerId,
        deliverables,
        qty: 1,
      });
      setAdded(true);
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  if (added) {
    return (
      <>
        <Alert variant="success" className="mb-3">
          Added {influencerName} to your cart.
        </Alert>
        <Button fullWidth onClick={() => router.push('/cart')}>
          View cart →
        </Button>
        <Button
          variant="ghost"
          fullWidth
          size="sm"
          className="mt-2"
          onClick={() => {
            setAdded(false);
            setSelections({});
          }}
        >
          Book again
        </Button>
      </>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Pick deliverables
      </p>
      <div className="space-y-2">
        {rateCards.map((rc) => {
          const qty = selections[rc.deliverable] || 0;
          const active = qty > 0;
          return (
            <div
              key={rc.id}
              className={`rounded-lg border p-3 transition ${
                active ? 'border-brand-300 bg-brand-50/40' : 'border-zinc-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight text-zinc-900">
                    {DELIVERABLE_LABEL[rc.deliverable] ?? rc.deliverable}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">{formatINR(rc.price)} each</div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQty(rc.deliverable, Math.max(0, qty - 1))}
                    disabled={qty <= 0}
                    className="grid h-7 w-7 place-items-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <Input
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) =>
                      updateQty(rc.deliverable, Math.max(0, parseInt(e.target.value || '0', 10)))
                    }
                    className="w-12 text-center !py-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateQty(rc.deliverable, qty + 1)}
                    className="grid h-7 w-7 place-items-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
              {active && (
                <div className="mt-2 flex items-center justify-between border-t border-brand-100 pt-2 text-xs">
                  <span className="text-zinc-500">Line total</span>
                  <span className="font-semibold text-brand-700">
                    {formatINR(Number(rc.price) * qty)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {subtotal > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
          <span className="text-zinc-600">Subtotal</span>
          <span className="font-bold text-zinc-900">{formatINR(subtotal)}</span>
        </div>
      )}

      <Button
        onClick={add}
        loading={busy}
        disabled={!selectedItems.length}
        fullWidth
        className="mt-4"
      >
        {selectedItems.length ? 'Add to cart' : 'Pick deliverables to add'}
      </Button>
      {err && (
        <Alert variant="danger" className="mt-2">
          {err}
        </Alert>
      )}
    </div>
  );
}
