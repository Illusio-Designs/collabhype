'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Star as StarIcon } from 'lucide-react';

// Star rating control — works as both display (readOnly) and input.
//
// Usage (display):  <Rating value={4.5} readOnly />
// Usage (input):    <Rating value={value} onChange={setValue} />

const SIZE_CLS = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export default function Rating({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
  showValue = false,
  className,
}) {
  const [hover, setHover] = useState(null);
  const displayed = hover ?? value;
  const sizeCls = SIZE_CLS[size] ?? SIZE_CLS.md;

  return (
    <div className={clsx('inline-flex items-center gap-1.5', className)}>
      <div
        className="inline-flex items-center"
        role={readOnly ? 'img' : 'radiogroup'}
        aria-label={`Rating ${value} out of ${max}`}
        onMouseLeave={() => !readOnly && setHover(null)}
      >
        {Array.from({ length: max }).map((_, i) => {
          const filled = displayed - i;
          const isFull = filled >= 1;
          const isHalf = filled >= 0.5 && filled < 1;
          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange?.(i + 1)}
              onMouseEnter={() => !readOnly && setHover(i + 1)}
              aria-label={`${i + 1} star${i ? 's' : ''}`}
              className={clsx(
                'relative grid place-items-center transition',
                readOnly ? 'cursor-default' : 'cursor-pointer',
              )}
            >
              <StarIcon
                className={clsx(sizeCls, isFull ? 'text-amber-400' : 'text-zinc-200')}
                fill="currentColor"
              />
              {isHalf && (
                <StarIcon
                  className={clsx(sizeCls, 'absolute inset-0 text-amber-400')}
                  fill="currentColor"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-zinc-700">{value.toFixed(1)}</span>
      )}
    </div>
  );
}

