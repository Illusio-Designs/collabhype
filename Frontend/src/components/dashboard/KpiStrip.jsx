'use client';

import clsx from 'clsx';
import { Stat } from '@/components/ui';

// Reusable KPI strip for any dashboard page. Pass 2-4 KPIs; each has
// { label, value, change?, tone? }. `change` accepts a signed number for
// the percent delta. `tone` picks an optional background accent.
//
// `value` can be a string (already-formatted, e.g. `formatINR(123)`) or a
// number. Pass already-formatted values to keep currency / count rules in
// the call site.
export default function KpiStrip({ kpis = [], className }) {
  if (!Array.isArray(kpis) || kpis.length === 0) return null;
  return (
    <div
      className={clsx(
        'grid gap-3 sm:gap-4',
        kpis.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {kpis.map((k, i) => (
        <Stat
          key={`${k.label}-${i}`}
          label={k.label}
          value={k.value ?? '—'}
          change={k.change}
        />
      ))}
    </div>
  );
}
