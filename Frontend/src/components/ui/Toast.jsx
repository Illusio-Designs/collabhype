'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  info: 'bg-white border-zinc-200 text-zinc-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  danger: 'bg-red-50 border-red-200 text-red-900',
};

const ICONS = {
  info: <Info className="h-5 w-5 text-brand-600" />,
  success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  danger: <XCircle className="h-5 w-5 text-red-600" />,
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
                  <X className="h-4 w-4" />
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
