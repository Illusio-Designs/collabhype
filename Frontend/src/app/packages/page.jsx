'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import PackageCard from '@/components/PackageCard';
import { Breadcrumb } from '@/components/ui';

const TIER_TILES = [
  {
    tier: 'MICRO',
    title: 'Micro',
    range: '1K – 100K followers',
    body: 'Hand-pick creators with strong niche credibility. Pay each creator’s rate + 5% platform fee at checkout.',
  },
  {
    tier: 'MACRO',
    title: 'Macro',
    range: '100K – 1M followers',
    body: 'Established creators with broad reach. Hand-pick from our roster and bulk-add to your booking.',
  },
  {
    tier: 'MEGA',
    title: 'Mega',
    range: '1M+ followers',
    body: 'Hero campaigns with celebrity reach. Hand-pick from vetted Mega creators.',
  },
];

// Fetches packages from the browser (GET /api/v1/packages?tier=NANO) so the
// call is visible in the Network tab. Segregated by total price (cheapest first).
export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Packages — Collabhype';
    let active = true;
    setLoading(true);
    apiClient
      .get('/api/v1/packages?tier=NANO')
      .then(({ data }) => {
        if (!active) return;
        setPackages([...(data?.packages ?? [])].sort((a, b) => (a.price ?? 0) - (b.price ?? 0)));
      })
      .catch(() => {
        if (active) setPackages([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-center">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Packages' }]} />
      </div>
      <header className="mb-10 text-center">
        <span className="eyebrow">Bulk Nano packs</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Pick a pack and go live
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
          Pre-built bulk packs of Nano creators. Higher volume, lower per-influencer cost.
          All packs include Content Rights.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-zinc-900">No packages available yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
            Check back soon — new bulk packs are added regularly.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}

      <section className="mt-20">
        <div className="mb-8 text-center">
          <span className="eyebrow">Want bigger creators?</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Hand-pick Micro, Macro & Mega creators
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600">
            Browse the roster, select multiple creators, and add them to your booking in one click.
            Your booking shows each creator&apos;s rate + a flat 5% platform fee.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TIER_TILES.map((t) => (
            <Link
              key={t.tier}
              href={`/influencers?tier=${t.tier}`}
              className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                {t.title}
              </div>
              <div className="text-lg font-semibold text-zinc-900">{t.range}</div>
              <p className="text-sm text-zinc-600">{t.body}</p>
              <span className="mt-auto inline-flex items-center text-sm font-semibold text-brand-700">
                Browse {t.title} creators
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
