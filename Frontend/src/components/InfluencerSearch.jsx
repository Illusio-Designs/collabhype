'use client';

import { Suspense, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

function SearchInner() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams(sp);
    const val = q.trim();
    if (val) params.set('q', val);
    else params.delete('q');
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form onSubmit={submit} className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search creators by name or handle…"
        className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </form>
  );
}

// Standalone creator search, shown on the browse page outside the filter drawer.
export default function InfluencerSearch() {
  return (
    <Suspense fallback={<div className="h-11 w-full sm:max-w-sm" />}>
      <SearchInner />
    </Suspense>
  );
}
