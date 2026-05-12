'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Wraps a table (or any wide block) so it scrolls horizontally when content
// exceeds the viewport. Edge fades + clickable chevron buttons surface the
// overflow on both mobile and desktop. Buttons programmatically scroll by
// roughly one viewport width; long-press isn't supported (intentionally
// keep the impl simple — wheel/touch scrolling still works as expected).
export default function ScrollTable({ children, className }) {
  const scrollerRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 1;
    setHasOverflow(overflow);
    setAtStart(el.scrollLeft <= 0);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  const scrollBy = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Scroll roughly 80% of viewport so a sliver of the previous column
    // stays visible — gives the user a clear sense of position.
    const distance = Math.max(160, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * distance, behavior: 'smooth' });
  }, []);

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={scrollerRef}
        className="overflow-x-auto pb-1 [scrollbar-width:thin]"
      >
        {children}
      </div>

      {/* Left edge: fade + scroll-back button (visible only when scrolled away from start) */}
      <div
        aria-hidden={atStart || !hasOverflow}
        className={clsx(
          'pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-start pl-1 bg-gradient-to-r from-white to-transparent transition-opacity duration-200',
          hasOverflow && !atStart ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          tabIndex={hasOverflow && !atStart ? 0 : -1}
          aria-label="Scroll left"
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-white shadow-md ring-1 ring-zinc-700/40 transition hover:scale-105 hover:bg-zinc-800 disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Right edge: fade + scroll-forward button */}
      <div
        aria-hidden={atEnd || !hasOverflow}
        className={clsx(
          'pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end pr-1 bg-gradient-to-l from-white to-transparent transition-opacity duration-200',
          hasOverflow && !atEnd ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          type="button"
          onClick={() => scrollBy(1)}
          tabIndex={hasOverflow && !atEnd ? 0 : -1}
          aria-label="Scroll right"
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-white shadow-md ring-1 ring-zinc-700/40 transition hover:scale-105 hover:bg-zinc-800 disabled:opacity-0"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

