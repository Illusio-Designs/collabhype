'use client';

import { useId, useState } from 'react';
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
const PLACEMENT_CLS = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

const ARROW_CLS = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-900 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-900 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-900 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-900 border-y-transparent border-l-transparent',
};

export default function Tooltip({
  label,
  children,
  placement = 'top',
  delay = 80,
  className,
}) {
  const [shown, setShown] = useState(false);
  const [pendingTimer, setPendingTimer] = useState(null);
  const id = useId();

  if (!label) return children;

  const open = () => {
    if (pendingTimer) clearTimeout(pendingTimer);
    const t = setTimeout(() => setShown(true), delay);
    setPendingTimer(t);
  };
  const close = () => {
    if (pendingTimer) clearTimeout(pendingTimer);
    setShown(false);
  };

  return (
    <span
      className={clsx('relative inline-flex', className)}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {/* Make the trigger forward aria-describedby for screen readers */}
      <span aria-describedby={shown ? id : undefined} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white shadow-lg transition-opacity duration-150',
          PLACEMENT_CLS[placement] ?? PLACEMENT_CLS.top,
          shown ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
        <span
          aria-hidden
          className={clsx('absolute h-0 w-0 border-4', ARROW_CLS[placement] ?? ARROW_CLS.top)}
        />
      </span>
    </span>
  );
}
