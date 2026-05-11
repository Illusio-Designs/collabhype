'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Filters from '@/components/Filters';

const FILTER_KEYS = ['tier', 'nicheSlug', 'city', 'platform', 'q', 'sort', 'minFollowers', 'maxFollowers', 'minPrice', 'maxPrice'];

export default function FiltersDrawer({ niches = [], extraSorts = [] }) {
  const [open, setOpen] = useState(false);
  const sp = useSearchParams();
  const pathname = usePathname();

  // Count active filters (ignore empty / 'page')
  const activeCount = FILTER_KEYS.reduce((n, k) => {
    const v = sp.get(k);
    return n + (v && v !== '' ? 1 : 0);
  }, 0);

  // Close on route change
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M4 5h16M7 12h10M10 19h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h2 className="text-base font-semibold text-zinc-900">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 transition hover:bg-zinc-100"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Filters niches={niches} extraSorts={extraSorts} />
            </div>
            <div className="border-t border-zinc-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
              >
                Show results
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
