import { forwardRef } from 'react';
import clsx from 'clsx';

const Checkbox = forwardRef(function Checkbox(
  { label, description, className, disabled, ...rest },
  ref,
) {
  return (
    <label
      className={clsx(
        'flex w-fit cursor-pointer items-start gap-2.5',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="relative inline-flex h-5 w-5 flex-shrink-0">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={clsx(
            'peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-300 bg-white shadow-sm transition',
            'hover:border-zinc-400',
            'checked:border-brand-700 checked:bg-brand-700 checked:hover:border-brand-800 checked:hover:bg-brand-800',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed',
            className,
          )}
          {...rest}
        />
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3 8l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {(label || description) && (
        <span className="select-none">
          {label && <span className="text-sm font-medium text-zinc-800">{label}</span>}
          {description && <span className="block text-xs text-zinc-500">{description}</span>}
        </span>
      )}
    </label>
  );
});

export default Checkbox;
