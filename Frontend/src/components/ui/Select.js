'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

export default function Select({
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  error = false,
  className,
}) {
  const [internal, setInternal] = useState(defaultValue ?? null);
  const current = value !== undefined ? value : internal;

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // keep highlight in sync when opening
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === current);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, current, options]);

  function pick(opt) {
    if (opt.disabled) return;
    if (value === undefined) setInternal(opt.value);
    onChange?.(opt.value);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (highlight >= 0 && options[highlight]) pick(options[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }

  const selected = options.find((o) => o.value === current);

  return (
    <div ref={wrapRef} className={clsx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition focus:outline-none',
          error
            ? 'border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-zinc-300 hover:border-zinc-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
          open && !error && 'border-brand-500 ring-1 ring-brand-500',
          disabled && 'cursor-not-allowed bg-zinc-50 opacity-60',
        )}
      >
        <span className={clsx('truncate', !selected && 'text-zinc-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-4 w-4 flex-shrink-0 text-zinc-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
          >
            {options.length === 0 && (
              <div className="px-2.5 py-2 text-sm text-zinc-400">No options</div>
            )}
            {options.map((opt, i) => {
              const isSelected = opt.value === current;
              const isHighlight = i === highlight;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => pick(opt)}
                  onMouseEnter={() => setHighlight(i)}
                  className={clsx(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition',
                    opt.disabled
                      ? 'cursor-not-allowed text-zinc-400'
                      : isSelected
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : isHighlight
                          ? 'bg-zinc-100 text-zinc-900'
                          : 'text-zinc-700',
                  )}
                >
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.description && (
                    <span className="ml-2 truncate text-xs text-zinc-400">
                      {opt.description}
                    </span>
                  )}
                  {isSelected && (
                    <svg className="h-4 w-4 flex-shrink-0 text-brand-700" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
