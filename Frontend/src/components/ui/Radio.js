import { forwardRef } from 'react';
import clsx from 'clsx';

const Radio = forwardRef(function Radio(
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
          type="radio"
          disabled={disabled}
          className={clsx(
            'peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-zinc-300 bg-white shadow-sm transition',
            'hover:border-zinc-400',
            'checked:border-brand-700 checked:border-[5px]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed',
            className,
          )}
          {...rest}
        />
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

export default Radio;
