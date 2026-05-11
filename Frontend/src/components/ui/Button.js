'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 focus:ring-brand-500 active:bg-brand-900',
  secondary:
    'bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 focus:ring-zinc-700 active:bg-black',
  outline:
    'border border-zinc-300 bg-white text-zinc-900 shadow-sm hover:border-brand-600 hover:text-brand-700 focus:ring-brand-500',
  ghost: 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-300',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
  accent:
    'bg-accent-500 text-white shadow-sm hover:bg-accent-600 focus:ring-accent-500 active:bg-accent-600',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-7 py-3.5 text-base',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconRight,
    fullWidth = false,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : icon ? <span className="-ml-0.5">{icon}</span> : null}
      {children && <span>{children}</span>}
      {!loading && iconRight ? <span className="-mr-0.5">{iconRight}</span> : null}
    </button>
  );
});

export default Button;
