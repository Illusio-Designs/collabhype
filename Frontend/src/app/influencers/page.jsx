'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import InfluencerBrowserClient from '@/components/InfluencerBrowserClient';
import InfluencerSearch from '@/components/InfluencerSearch';
import FiltersDrawer from '@/components/FiltersDrawer';
import Pagination from '@/components/Pagination';
import { Breadcrumb } from '@/components/ui';

const SORTS = [
  { value: 'followers_desc', label: 'Most followers' },
  { value: 'engagement_desc', label: 'Best engagement' },
  { value: 'newest', label: 'Newest first' },
];

const EMPTY_META = { total: 0, page: 1, limit: 20, totalPages: 1 };

// Fetches from the browser (GET /api/v1/influencers + /api/v1/niches) so the
// calls are visible in the Network tab. Filters/search/pagination live in the
// URL, so the list refetches whenever the query string changes.
function InfluencersBrowser() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const sp = Object.fromEntries(searchParams.entries());

  const [influencers, setInfluencers] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .get(`/api/v1/influencers${qs ? `?${qs}` : ''}`)
      .then(({ data }) => {
        if (!active) return;
        setInfluencers(data?.influencers ?? []);
        setMeta(data?.meta ?? EMPTY_META);
      })
      .catch(() => {
        if (!active) return;
        setInfluencers([]);
        setMeta(EMPTY_META);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [qs]);

  useEffect(() => {
    let active = true;
    apiClient
      .get('/api/v1/niches')
      .then(({ data }) => {
        if (active) setNiches(data?.niches ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Influencers' }]} />
      </div>
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Influencers</h1>
            <p className="mt-2 text-zinc-600">
              {meta?.total ?? 0} creators. Filter by tier, niche, city or platform.
            </p>
          </div>
          <FiltersDrawer niches={niches} extraSorts={SORTS} />
        </div>
        <div className="mt-4">
          <InfluencerSearch />
        </div>
      </header>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
          ))}
        </div>
      ) : (
        <InfluencerBrowserClient influencers={influencers} />
      )}
      <Pagination pathname="/influencers" searchParams={sp} meta={meta} />
    </div>
  );
}

export default function InfluencersPage() {
  return (
    <Suspense fallback={null}>
      <InfluencersBrowser />
    </Suspense>
  );
}
