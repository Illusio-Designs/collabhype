'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

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
          className="fixed inset-0 z-50 grid place-items-center p-4"
          onClick={closeOnBackdrop ? onClose : undefined}
        >
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" aria-hidden />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className={clsx(
              'relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl',
              SIZES[size],
            )}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
                <div>
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
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
