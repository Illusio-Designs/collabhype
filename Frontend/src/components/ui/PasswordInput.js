'use client';

import { forwardRef, useState } from 'react';
import clsx from 'clsx';

const PasswordInput = forwardRef(function PasswordInput(
  { error, icon, className, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={clsx(
          'block w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-zinc-300 focus:border-brand-500 focus:ring-brand-500',
          icon && 'pl-10',
          className,
        )}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-.51 1.16-1.24 2.21-2.13 3.12M6.07 6.16C3.95 7.61 2.31 9.66 1 12c1.73 3.89 6 7 11 7 1.99 0 3.86-.45 5.5-1.27"
            />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
});

export default PasswordInput;
