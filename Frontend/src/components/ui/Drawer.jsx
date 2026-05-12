'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

// Side-sheet (drawer) — like a Modal but slides in from an edge. Used for
// filter panels, mobile nav, and detail views that should preserve the
// underlying page context.
//
// Usage:
//   <Drawer open={open} onClose={close} title="Filters" side="right">…</Drawer>

const SIDE_CLS = {
  right: 'right-0 top-0 h-full w-full max-w-md border-l',
  left: 'left-0 top-0 h-full w-full max-w-md border-r',
  bottom: 'bottom-0 left-0 w-full max-h-[85vh] border-t',
};

const SIDE_ANIM = {
  right: 'translate-x-0',
  left: 'translate-x-0',
  bottom: 'translate-y-0',
};

const SIDE_ANIM_CLOSED = {
  right: 'translate-x-full',
  left: '-translate-x-full',
  bottom: 'translate-y-full',
};

export default function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  size = 'md', // sm | md | lg
  footer,
  children,
  className,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    // Lock body scroll while drawer is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const widthBySize = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl' }[size] ?? 'max-w-md';
  const sideCls = SIDE_CLS[side] ?? SIDE_CLS.right;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 transition-opacity duration-200',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'absolute flex flex-col border-zinc-200 bg-white shadow-2xl transition-transform duration-300',
          sideCls,
          side === 'right' || side === 'left' ? widthBySize : '',
          open ? SIDE_ANIM[side] : SIDE_ANIM_CLOSED[side],
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
            <div>
              {title && (
                <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
