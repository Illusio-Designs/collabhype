'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

const ConfirmContext = createContext(null);

// A custom confirm dialog to replace the native window.confirm().
//   const confirm = useConfirm();
//   if (!(await confirm({ title, body, confirmText, variant }))) return;
// Pass a string for a title-only confirm.
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const [mounted, setMounted] = useState(false);
  const resolver = useRef(null);

  useEffect(() => setMounted(true), []);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        const base = typeof opts === 'string' ? { title: opts } : opts || {};
        setState({
          title: 'Are you sure?',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          variant: 'primary',
          ...base,
        });
      }),
    [],
  );

  const close = (val) => {
    resolver.current?.(val);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {state && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] grid place-items-center p-4"
                onClick={() => close(false)}
              >
                <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" aria-hidden />
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 12 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  role="alertdialog"
                  aria-modal="true"
                  className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
                >
                  <div className="flex gap-3">
                    <div
                      className={
                        'grid h-10 w-10 flex-shrink-0 place-items-center rounded-full ' +
                        (state.variant === 'danger'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-brand-50 text-brand-700')
                      }
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-zinc-900">{state.title}</h3>
                      {state.body && <p className="mt-1 text-sm text-zinc-600">{state.body}</p>}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => close(false)}>
                      {state.cancelText}
                    </Button>
                    <Button
                      variant={state.variant === 'danger' ? 'danger' : 'primary'}
                      onClick={() => close(true)}
                    >
                      {state.confirmText}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx;
}
