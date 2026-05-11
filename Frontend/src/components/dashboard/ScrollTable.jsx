'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

// Wraps a table (or any wide block) so it scrolls horizontally on narrow
// viewports. Shows a right-edge fade + "Swipe →" hint while there's more
// content off-screen, so users on mobile know the table extends past the
// viewport. Hint hides when scrolled fully to the right.
export default function ScrollTable({ children, className, hintLabel = 'Swipe' }) {
  const scrollerRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [atStart, setAtStart] = useState(true);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const overflow = el.scrollWidth > el.clientWidth + 1;
      setHasOverflow(overflow);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
      setAtStart(el.scrollLeft <= 0);
    };
    update();

    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={scrollerRef}
        className="overflow-x-auto pb-1 [scrollbar-width:thin]"
      >
        {children}
      </div>

      {/* Left fade (only when scrolled past the start) */}
      <div
        aria-hidden
        className={clsx(
          'pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent transition-opacity duration-200',
          atStart ? 'opacity-0' : 'opacity-100',
        )}
      />

      {/* Right fade + swipe hint (only while more content sits off-screen) */}
      <div
        aria-hidden
        className={clsx(
          'pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-white to-transparent pr-2 transition-opacity duration-200',
          hasOverflow && !atEnd ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm md:hidden">
          {hintLabel} →
        </span>
      </div>
    </div>
  );
}
