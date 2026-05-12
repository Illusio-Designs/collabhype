'use client';

import { useId, useRef, useState } from 'react';
import clsx from 'clsx';

// Minimal accessible tooltip — wraps any child element. Shows on hover and
// keyboard focus; uses CSS positioning (no portal needed for short labels).
//
// Usage:
//   <Tooltip label="Sign out">
//     <button>…</button>
//   </Tooltip>
//
// `placement` is 'top' (default) | 'bottom' | 'left' | 'right'.
// `variant`   is 'dark' (default) | 'brand' | 'light'.

const PLACEMENT_CLS = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

const VARIANTS = {
  dark: {
    bubble: 'bg-zinc-900 text-white',
    arrow: {
      top: 'border-t-zinc-900',
      bottom: 'border-b-zinc-900',
      left: 'border-l-zinc-900',
      right: 'border-r-zinc-900',
    },
  },
  brand: {
    bubble: 'bg-brand-800 text-white',
    arrow: {
      top: 'border-t-brand-800',
      bottom: 'border-b-brand-800',
      left: 'border-l-brand-800',
      right: 'border-r-brand-800',
    },
  },
  light: {
    bubble: 'border border-zinc-200 bg-white text-zinc-900 shadow-lg',
    arrow: {
      top: 'border-t-white',
      bottom: 'border-b-white',
      left: 'border-l-white',
      right: 'border-r-white',
    },
  },
};

const ARROW_BASE = {
  top: 'top-full left-1/2 -translate-x-1/2 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-y-transparent border-l-transparent',
};

export default function Tooltip({
  label,
  children,
  placement = 'top',
  variant = 'dark',
  delay = 80,
  className,
}) {
  const [shown, setShown] = useState(false);
  const timerRef = useRef(null);
  const id = useId();

  if (!label) return children;

  const open = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShown(true), delay);
  };
  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShown(false);
  };

  const v = VARIANTS[variant] ?? VARIANTS.dark;
  const p = PLACEMENT_CLS[placement] ?? PLACEMENT_CLS.top;
  const a = clsx(ARROW_BASE[placement] ?? ARROW_BASE.top, v.arrow[placement] ?? v.arrow.top);

  return (
    <span
      className={clsx('relative inline-flex', className)}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      <span aria-describedby={shown ? id : undefined} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-lg transition-all duration-150',
          v.bubble,
          p,
          shown ? 'translate-y-0 opacity-100' : 'opacity-0',
          placement === 'top' && !shown && 'translate-y-1',
          placement === 'bottom' && !shown && '-translate-y-1',
        )}
      >
        {label}
        <span aria-hidden className={clsx('absolute h-0 w-0 border-4', a)} />
      </span>
    </span>
  );
}
