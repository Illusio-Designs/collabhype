'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Compact, accessible pagination control.
//
// Usage:
//   <Pagination page={page} pageCount={pageCount} onChange={setPage} />
//
// Renders first/last pages, the current page +/- 1 neighbour, and ellipsis
// dividers in between. Buttons are square 8px-tall pills that match the
// rest of the kit's brand styling.

export default function Pagination({
  page = 1,
  pageCount = 1,
  onChange,
  siblings = 1,
  className,
  showEdges = true,
}) {
  if (pageCount <= 1) return null;

  const range = buildRange(page, pageCount, siblings);

  const go = (p) => {
    if (p < 1 || p > pageCount || p === page) return;
    onChange?.(p);
  };

  return (
    <nav
      aria-label="Pagination"
      className={clsx('flex items-center justify-center gap-1', className)}
    >
      {showEdges && (
        <NavButton onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </NavButton>
      )}
      {range.map((entry, i) =>
        entry === '…' ? (
          <span
            key={`gap-${i}`}
            className="grid h-9 w-9 place-items-center text-sm text-zinc-400"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => go(entry)}
            aria-current={entry === page ? 'page' : undefined}
            className={clsx(
              'grid h-9 min-w-[2.25rem] place-items-center rounded-lg px-2 text-sm font-semibold transition',
              entry === page
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
            )}
          >
            {entry}
          </button>
        ),
      )}
      {showEdges && (
        <NavButton
          onClick={() => go(page + 1)}
          disabled={page === pageCount}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </NavButton>
      )}
    </nav>
  );
}

function NavButton({ children, disabled, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        'grid h-9 w-9 place-items-center rounded-lg text-sm text-zinc-600 transition',
        disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-zinc-100 hover:text-zinc-900',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function buildRange(page, pageCount, siblings) {
  const total = siblings * 2 + 5; // first + last + current + 2 siblings + 2 gaps
  if (pageCount <= total) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, pageCount);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < pageCount - 1;

  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + siblings * 2;
    return [...Array.from({ length: leftCount }, (_, i) => i + 1), '…', pageCount];
  }
  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + siblings * 2;
    return [
      1,
      '…',
      ...Array.from({ length: rightCount }, (_, i) => pageCount - rightCount + 1 + i),
    ];
  }
  return [
    1,
    '…',
    ...Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i),
    '…',
    pageCount,
  ];
}

