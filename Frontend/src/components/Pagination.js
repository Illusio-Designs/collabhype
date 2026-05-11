import Link from 'next/link';
import clsx from 'clsx';

function buildHref(pathname, searchParams, page) {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) params.delete('page');
  else params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function Pagination({ pathname, searchParams, meta }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages } = meta;
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const prevDisabled = page === 1;
  const nextDisabled = page === totalPages;

  return (
    <nav className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6">
      <Link
        href={buildHref(pathname, searchParams, prev)}
        aria-disabled={prevDisabled}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-brand-600 hover:text-brand-700',
          prevDisabled && 'pointer-events-none opacity-40',
        )}
      >
        ← Previous
      </Link>
      <div className="text-sm text-zinc-600">
        Page <span className="font-semibold text-zinc-900">{page}</span> of {totalPages}
      </div>
      <Link
        href={buildHref(pathname, searchParams, next)}
        aria-disabled={nextDisabled}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-brand-600 hover:text-brand-700',
          nextDisabled && 'pointer-events-none opacity-40',
        )}
      >
        Next →
      </Link>
    </nav>
  );
}
