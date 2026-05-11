'use client';

import { useState } from 'react';
import clsx from 'clsx';

export default function Switch({
  checked: controlled,
  defaultChecked = false,
  onChange,
  label,
  description,
  disabled = false,
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const checked = controlled ?? internal;

  function toggle() {
    if (disabled) return;
    const next = !checked;
    if (controlled === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <label
      className={clsx(
        'flex w-fit cursor-pointer items-start gap-3',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={toggle}
        className={clsx(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          checked ? 'bg-brand-700' : 'bg-zinc-300',
        )}
      >
        <span
          className={clsx(
            'mt-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
      {(label || description) && (
        <span className="select-none">
          {label && <span className="text-sm font-medium text-zinc-800">{label}</span>}
          {description && (
            <span className="block text-xs text-zinc-500">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
