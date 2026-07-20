'use client';

import clsx from 'clsx';
import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';

// Shared shimmer placeholders for dashboard loading states. All of these use
// the `.skeleton` shimmer utility (via <Skeleton />) so every loading surface —
// tables, KPI strips, cards, whole pages — animates consistently instead of a
// bare spinner.

// A run of skeleton table rows, sized to fill an existing <tbody>. Drop this in
// wherever a table is loading so the column layout doesn't jump when data lands.
export function TableRowsSkeleton({ rows = 6, cols = 4, pad = 'px-4 py-3' }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className={pad}>
              <Skeleton
                variant="text"
                className={clsx('h-4', c === 0 ? 'w-32' : 'w-16')}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Standalone bordered table skeleton (header + rows) for pages that render a
// raw <table> rather than the shared <Table /> component.
export function TableSkeleton({ rows = 6, cols = 4, className }) {
  return (
    <div className={clsx('overflow-hidden rounded-2xl border border-zinc-200 bg-white', className)}>
      <table className="min-w-full divide-y divide-zinc-200">
        <thead className="bg-zinc-50">
          <tr>
            {Array.from({ length: cols }).map((_, c) => (
              <th key={c} className="px-4 py-3 text-left">
                <Skeleton variant="text" className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          <TableRowsSkeleton rows={rows} cols={cols} />
        </tbody>
      </table>
    </div>
  );
}

// KPI / stat strip placeholder — matches the 2/4-up grid used across dashboards.
export function KpiSkeleton({ count = 4, className }) {
  return (
    <div
      className={clsx(
        'grid gap-3 sm:gap-4',
        count === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} padding="md">
          <Skeleton variant="text" className="h-3 w-24" />
          <Skeleton variant="text" className="mt-3 h-7 w-20" />
        </Card>
      ))}
    </div>
  );
}

// A vertical list of card rows (used by the "recent X" panels).
export function CardListSkeleton({ items = 4, className }) {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-3"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-2/3" />
            <Skeleton variant="text" className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// A single content card placeholder (title + body lines).
export function CardSkeleton({ lines = 4, className }) {
  return (
    <Card padding="lg" className={className}>
      <Skeleton variant="text" className="h-5 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4" style={{ width: `${90 - i * 8}%` }} />
        ))}
      </div>
    </Card>
  );
}

// Chat thread placeholder: alternating left/right message bubbles.
export function ChatThreadSkeleton({ bubbles = 6, className }) {
  // Deterministic per-index sizing (no Math.random) so it stays stable.
  const widths = ['60%', '45%', '72%', '38%', '55%', '66%'];
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: bubbles }).map((_, i) => {
        const mine = i % 2 === 1;
        return (
          <div key={i} className={clsx('flex', mine ? 'justify-end' : 'justify-start')}>
            <Skeleton
              className="h-10 rounded-2xl"
              style={{ width: widths[i % widths.length] }}
            />
          </div>
        );
      })}
    </div>
  );
}

// Full-page dashboard skeleton: header block + KPI strip + a couple of cards.
// This is the drop-in replacement for the old full-page <Spinner size="lg" />.
export function PageSkeleton({ kpis = 4, cards = 2 }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton variant="text" className="h-3 w-28" />
        <Skeleton variant="text" className="h-8 w-72 max-w-full" />
        <Skeleton variant="text" className="h-4 w-96 max-w-full" />
      </div>
      {kpis > 0 && <KpiSkeleton count={kpis} />}
      <div className={clsx('grid gap-6', cards >= 2 && 'lg:grid-cols-2')}>
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Table-focused page skeleton: header block + KPI strip + a table.
export function TablePageSkeleton({ kpis = 4, rows = 8, cols = 5 }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton variant="text" className="h-3 w-28" />
        <Skeleton variant="text" className="h-8 w-64 max-w-full" />
        <Skeleton variant="text" className="h-4 w-96 max-w-full" />
      </div>
      {kpis > 0 && <KpiSkeleton count={kpis} />}
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  );
}

export default PageSkeleton;
