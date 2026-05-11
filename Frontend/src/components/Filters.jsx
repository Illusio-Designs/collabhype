'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button, FormField, Input, Select } from '@/components/ui';
import { TIER_LABEL } from '@/lib/format';

const TIER_OPTIONS = [
  { value: '', label: 'All tiers' },
  { value: 'NANO', label: TIER_LABEL.NANO },
  { value: 'MICRO', label: TIER_LABEL.MICRO },
  { value: 'MACRO', label: TIER_LABEL.MACRO },
  { value: 'MEGA', label: TIER_LABEL.MEGA },
];

export default function Filters({ niches = [], extraSorts = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function update(key, value) {
    const params = new URLSearchParams(sp);
    if (value === '' || value == null) params.delete(key);
    else params.set(key, value);
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function reset() {
    router.push(pathname);
  }

  const nicheOptions = [
    { value: '', label: 'All niches' },
    ...niches.map((n) => ({ value: n.slug, label: n.name })),
  ];

  const sortOptions = [{ value: '', label: 'Default' }, ...extraSorts];

  return (
    <aside className="space-y-6 lg:sticky lg:top-20">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Filters</h2>
        <Button variant="ghost" size="sm" onClick={reset}>
          Reset
        </Button>
      </div>

      <FormField label="Tier">
        <Select
          value={sp.get('tier') ?? ''}
          onChange={(v) => update('tier', v)}
          options={TIER_OPTIONS}
        />
      </FormField>

      <FormField label="Niche">
        <Select
          value={sp.get('nicheSlug') ?? ''}
          onChange={(v) => update('nicheSlug', v)}
          options={nicheOptions}
        />
      </FormField>

      <FormField label="Search" hint="Press Enter to search">
        <Input
          type="search"
          defaultValue={sp.get('q') ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('q', e.currentTarget.value.trim());
          }}
          placeholder="Search…"
        />
      </FormField>

      <FormField label="Sort by">
        <Select
          value={sp.get('sort') ?? ''}
          onChange={(v) => update('sort', v)}
          options={sortOptions}
        />
      </FormField>
    </aside>
  );
}
