'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Check, ChevronDown, Search } from 'lucide-react';

// Shared dropdown used across the whole app. Every list is scrollable
// (max-h-72 + overflow) and, once it has more than a handful of options, a
// search box appears so long lists (countries, cities, languages…) are
// filterable. Pass `searchable` to force it on/off; leave it undefined for the
// automatic threshold.
export default function Select({
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  searchable,
  disabled = false,
  error = false,
  className,
}) {
  const [internal, setInternal] = useState(defaultValue ?? null);
  const current = value !== undefined ? value : internal;

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  // Show the search box automatically for longer lists, or when forced.
  const showSearch = searchable ?? options.length > 7;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label ?? ''} ${o.description ?? ''} ${o.value ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // reset search + focus the box each time it opens; seed the highlight
  useEffect(() => {
    if (open) {
      setQuery('');
      const idx = options.findIndex((o) => o.value === current);
      setHighlight(idx >= 0 ? idx : 0);
      if (showSearch) {
        // focus after the panel mounts
        const t = setTimeout(() => searchRef.current?.focus(), 20);
        return () => clearTimeout(t);
      }
    }
  }, [open, current, options, showSearch]);

  // keep the highlighted row inside the scroll viewport
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${highlight}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  function pick(opt) {
    if (!opt || opt.disabled) return;
    if (value === undefined) setInternal(opt.value);
    onChange?.(opt.value);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (highlight >= 0 && filtered[highlight]) pick(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setHighlight((h) => Math.min(filtered.length - 1, h + 1));
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
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex h-4 w-4 flex-shrink-0 text-zinc-400"
          aria-hidden
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1.5 flex max-h-72 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg"
          >
            {showSearch && (
              <div className="sticky top-0 flex items-center gap-2 border-b border-zinc-100 bg-white px-2.5 py-2">
                <Search className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full border-0 bg-transparent p-0 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                />
              </div>
            )}

            <div ref={listRef} className="overflow-y-auto p-1">
              {filtered.length === 0 && (
                <div className="px-2.5 py-2 text-sm text-zinc-400">
                  {query ? 'No matches' : 'No options'}
                </div>
              )}
              {filtered.map((opt, i) => {
                const isSelected = opt.value === current;
                const isHighlight = i === highlight;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    data-idx={i}
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
                    {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-brand-700" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
