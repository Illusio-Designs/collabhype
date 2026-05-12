'use client';

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { inputClasses } from './FormField';

// Curated country list — India first since the platform is India-focused.
// Add more here as we expand internationally; flags use Unicode regional
// indicator emojis so no extra assets are needed.
export const COUNTRIES = [
  { code: 'IN', name: 'India',          dial: '+91',  flag: '🇮🇳' },
  { code: 'US', name: 'United States',  dial: '+1',   flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44',  flag: '🇬🇧' },
  { code: 'AE', name: 'UAE',            dial: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore',      dial: '+65',  flag: '🇸🇬' },
  { code: 'AU', name: 'Australia',      dial: '+61',  flag: '🇦🇺' },
  { code: 'CA', name: 'Canada',         dial: '+1',   flag: '🇨🇦' },
  { code: 'DE', name: 'Germany',        dial: '+49',  flag: '🇩🇪' },
  { code: 'FR', name: 'France',         dial: '+33',  flag: '🇫🇷' },
  { code: 'JP', name: 'Japan',          dial: '+81',  flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil',         dial: '+55',  flag: '🇧🇷' },
  { code: 'ZA', name: 'South Africa',   dial: '+27',  flag: '🇿🇦' },
];

const DEFAULT_COUNTRY = COUNTRIES[0];

// Find the longest matching dial prefix in the curated list. We try
// longest-first so '+1' doesn't shadow '+91'.
function detectCountry(rawValue) {
  if (!rawValue) return null;
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  return sorted.find((c) => rawValue.startsWith(c.dial)) ?? null;
}

// Phone input with a country-flag selector on the left. `value` and
// `onChange` operate on the E.164-ish full string (e.g. "+919812345678").
const PhoneInput = forwardRef(function PhoneInput(
  { value = '', onChange, error = false, disabled = false, className, name, autoComplete = 'tel', placeholder = 'Phone number', ...rest },
  ref,
) {
  const detected = detectCountry(value);
  const initialCountry = detected ?? DEFAULT_COUNTRY;
  const initialNational = detected ? value.slice(detected.dial.length).trim() : value;

  const [country, setCountry] = useState(initialCountry);
  const [national, setNational] = useState(initialNational);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  // Keep local state in sync when the parent updates the value externally.
  useEffect(() => {
    const d = detectCountry(value);
    if (d) {
      setCountry((prev) => (prev.code === d.code ? prev : d));
      setNational(value.slice(d.dial.length).trim());
    } else {
      setNational(value ?? '');
    }
  }, [value]);

  // Click-outside to close the dropdown.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  function emit(nextCountry, nextNational) {
    const cleaned = String(nextNational).replace(/[^\d ]/g, '').trimStart();
    const full = cleaned ? `${nextCountry.dial}${cleaned.replace(/\s+/g, '')}` : '';
    onChange?.(full);
  }

  function pickCountry(c) {
    setCountry(c);
    setOpen(false);
    emit(c, national);
  }

  function onInput(e) {
    const next = e.target.value;
    setNational(next);
    emit(country, next);
  }

  // Outer div is `relative` (for absolute dropdown positioning). Inner flex
  // wrapper owns the rounded border + overflow-hidden so the country button
  // and input share a clipped pill. Keeping `overflow-hidden` OFF the outer
  // div ensures the dropdown isn't clipped when it opens.
  const fieldClasses = clsx(
    'flex items-stretch overflow-hidden rounded-lg border bg-white shadow-sm transition focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500',
    error ? 'border-red-400' : 'border-zinc-300 hover:border-zinc-400',
    disabled && 'cursor-not-allowed opacity-60',
  );

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <div className={fieldClasses}>
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className="flex flex-shrink-0 items-center gap-1.5 border-r border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none" aria-hidden="true">{country.flag}</span>
          <span className="tabular-nums">{country.dial}</span>
          <ChevronDown
            className={clsx('h-3.5 w-3.5 text-zinc-500 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>

        <input
          ref={ref}
          type="tel"
          inputMode="tel"
          name={name}
          autoComplete={autoComplete}
          value={national}
          onChange={onInput}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            inputClasses,
            // Strip the FormField input's own border/ring so the wrapper owns the look.
            '!border-0 !shadow-none !ring-0 focus:!ring-0',
            'min-w-0 flex-1 rounded-none bg-white',
          )}
          {...rest}
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 max-h-72 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-xl"
        >
          {COUNTRIES.map((c) => {
            const selected = c.code === country.code;
            return (
              <li
                key={c.code}
                role="option"
                aria-selected={selected}
                onClick={() => pickCountry(c)}
                className={clsx(
                  'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition',
                  selected ? 'bg-brand-50 text-brand-800' : 'text-zinc-800 hover:bg-zinc-50',
                )}
              >
                <span className="text-base leading-none" aria-hidden="true">{c.flag}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                <span className="tabular-nums text-zinc-500">{c.dial}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

export default PhoneInput;
