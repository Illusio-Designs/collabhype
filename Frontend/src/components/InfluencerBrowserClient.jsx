'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InfluencerCard from '@/components/InfluencerCard';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Alert, Button, Spinner } from '@/components/ui';
import { brandPriceFromCreatorRate, formatINR } from '@/lib/format';

// Pick a sensible default deliverable for bulk-add: prefer IG_REEL, else first rate card.
function defaultDeliverableFor(profile) {
  const cards = profile.rateCards ?? [];
  const reel = cards.find((c) => c.deliverable === 'IG_REEL');
  return reel ?? cards[0] ?? null;
}

export default function InfluencerBrowserClient({ influencers }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [addedCount, setAddedCount] = useState(0);

  const selectedList = useMemo(
    () => influencers.filter((i) => selectedIds.has(i.id)),
    [influencers, selectedIds],
  );

  const estimatedBrandTotal = useMemo(() => {
    return selectedList.reduce((sum, inf) => {
      const rc = defaultDeliverableFor(inf);
      return sum + (rc ? brandPriceFromCreatorRate(rc.price) : 0);
    }, 0);
  }, [selectedList]);

  function toggle(profile) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(profile.id)) next.delete(profile.id);
      else next.add(profile.id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setError(null);
    setAddedCount(0);
  }

  async function bulkAddToCart() {
    if (!selectedList.length) return;
    setBusy(true);
    setError(null);
    setAddedCount(0);
    try {
      let ok = 0;
      for (const inf of selectedList) {
        const rc = defaultDeliverableFor(inf);
        if (!rc) continue;
        await apiClient.post('/api/v1/cart/items', {
          itemType: 'INFLUENCER',
          influencerId: inf.id,
          deliverables: [{ type: rc.deliverable, qty: 1 }],
          qty: 1,
        });
        ok += 1;
      }
      setAddedCount(ok);
      // Brief delay so the user sees the success state before we route.
      setTimeout(() => router.push('/cart'), 700);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!influencers.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
        <h3 className="text-lg font-semibold text-zinc-900">No creators match your filters</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Try a different tier or remove the niche filter.
        </p>
      </div>
    );
  }

  const isBrand = user?.role === 'BRAND';
  const canSelect = isBrand && !isLoading;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">
          {selectMode
            ? `${selectedIds.size} selected`
            : `${influencers.length} creator${influencers.length === 1 ? '' : 's'} available`}
        </div>
        {canSelect ? (
          selectMode ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setSelectMode(false); clearSelection(); }}>
                Cancel
              </Button>
              {selectedIds.size > 0 && (
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
              Select multiple
            </Button>
          )
        ) : !isLoading && !user ? (
          <Link href="/login?next=/influencers" className="text-sm font-medium text-brand-700 hover:underline">
            Sign in as a brand to bulk-add →
          </Link>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {influencers.map((i) => (
          <InfluencerCard
            key={i.id}
            profile={i}
            selectable={selectMode}
            selected={selectedIds.has(i.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      {/* Floating bulk action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[min(640px,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                {selectedIds.size} creator{selectedIds.size === 1 ? '' : 's'} selected
              </div>
              <div className="text-xs text-zinc-500">
                Est. {formatINR(estimatedBrandTotal)} · 1 default deliverable each + 5% platform fee
              </div>
            </div>
            <div className="flex items-center gap-2">
              {addedCount > 0 && (
                <span className="text-xs font-medium text-emerald-700">
                  Added {addedCount} · redirecting…
                </span>
              )}
              <Button
                onClick={bulkAddToCart}
                loading={busy}
                disabled={busy || addedCount > 0}
                size="md"
              >
                {busy ? <Spinner size="sm" /> : 'Add all to cart'}
              </Button>
            </div>
          </div>
          {error && (
            <Alert variant="danger" className="mt-2">
              {error}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
