'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

const ToastContext = createContext(null);

const VARIANTS = {
  info: 'bg-white border-zinc-200 text-zinc-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  danger: 'bg-red-50 border-red-200 text-red-900',
};

const ICONS = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-brand-600">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-9-3a1 1 0 112 0 1 1 0 01-2 0zm.25 2.75a.75.75 0 000 1.5h.5v3H9a.75.75 0 000 1.5h2a.75.75 0 000-1.5h-.25v-3.75a.75.75 0 00-.75-.75h-.75z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-600">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-amber-500">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875a1.75 1.75 0 01-1.515 2.63H3.72a1.75 1.75 0 01-1.515-2.63l6.28-10.875zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-600">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.3a1 1 0 011.4 0L11 8.6l.9-.9a1 1 0 111.4 1.4L12.4 10l.9.9a1 1 0 11-1.4 1.4l-.9-.9-.9.9a1 1 0 11-1.4-1.4l.9-.9-.9-.9a1 1 0 010-1.4z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = Math.random().toString(36).slice(2);
      const item = { id, variant: 'info', duration: 4000, ...toast };
      setToasts((prev) => [...prev, item]);
      if (item.duration > 0) {
        setTimeout(() => remove(id), item.duration);
      }
      return id;
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={clsx(
                'pointer-events-auto rounded-xl border p-4 shadow-lg',
                VARIANTS[t.variant],
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{ICONS[t.variant]}</div>
                <div className="min-w-0 flex-1">
                  {t.title && <div className="text-sm font-semibold">{t.title}</div>}
                  {t.body && (
                    <div className={clsx('text-sm', t.title && 'mt-0.5 opacity-90')}>
                      {t.body}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="flex-shrink-0 opacity-50 transition hover:opacity-100"
                  aria-label="Dismiss"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
