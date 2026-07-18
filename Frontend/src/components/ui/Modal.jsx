'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { X } from 'lucide-react';

// Widths for the side panel.
const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

// A right-side sliding panel (drawer). Keeps the classic Modal API — open,
// onClose, title, description, children, footer, size — but renders as a
// full-height aside with a scrollable body, a pinned header and a pinned
// footer. `size` controls the panel width.
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-end"
          onClick={closeOnBackdrop ? onClose : undefined}
        >
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" aria-hidden />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className={clsx(
              'relative flex h-full w-full flex-col bg-white shadow-2xl',
              SIZES[size],
            )}
          >
            {(title || onClose) && (
              <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
                <div className="min-w-0">
                  {title && <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>}
                  {description && <p className="mt-1 text-sm text-zinc-600">{description}</p>}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="-mr-2 flex-shrink-0 rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex flex-shrink-0 flex-wrap justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
