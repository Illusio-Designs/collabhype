import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input(
  { error, icon, iconRight, className, type = 'text', ...rest },
  ref,
) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={clsx(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-zinc-300 focus:border-brand-500 focus:ring-brand-500',
          icon && 'pl-10',
          iconRight && 'pr-10',
          className,
        )}
        {...rest}
      />
      {iconRight && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
          {iconRight}
        </span>
      )}
    </div>
  );
});

export default Input;
