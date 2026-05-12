'use client';

import clsx from 'clsx';
import { Check } from 'lucide-react';

// Multi-step progress indicator. Renders a horizontal track (or vertical
// on mobile) with one node per step. Each step has 3 visual states:
// upcoming, current, completed.
//
// Usage:
//   <Stepper
//     current={2}
//     steps={[
//       { label: 'Profile' },
//       { label: 'Socials' },
//       { label: 'Rate card' },
//       { label: 'Review' },
//     ]}
//   />

export default function Stepper({
  steps = [],
  current = 0,
  orientation = 'horizontal',
  onStepClick,
  className,
}) {
  const isVertical = orientation === 'vertical';

  return (
    <ol
      className={clsx(
        isVertical ? 'space-y-4' : 'flex items-start',
        className,
      )}
    >
      {steps.map((step, i) => {
        const status = i < current ? 'completed' : i === current ? 'current' : 'upcoming';
        const isLast = i === steps.length - 1;
        const clickable = !!onStepClick && status !== 'upcoming';
        return (
          <li
            key={step.label + i}
            className={clsx(isVertical ? 'flex gap-3' : 'flex flex-1 items-start')}
          >
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={clickable ? () => onStepClick(i) : undefined}
                disabled={!clickable}
                className={clsx(
                  'grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-semibold transition',
                  status === 'completed' && 'bg-brand-700 text-white',
                  status === 'current' && 'bg-white text-brand-700 ring-2 ring-brand-600',
                  status === 'upcoming' && 'bg-zinc-100 text-zinc-500',
                  clickable && 'cursor-pointer hover:ring-2 hover:ring-brand-300',
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {status === 'completed' ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </button>
              {isVertical && !isLast && (
                <div
                  className={clsx(
                    'mt-1 w-px flex-1',
                    status === 'completed' ? 'bg-brand-700' : 'bg-zinc-200',
                  )}
                  style={{ minHeight: '2rem' }}
                />
              )}
            </div>
            <div
              className={clsx(
                isVertical ? 'flex-1 pb-4' : 'mt-2 flex-1 px-2 text-center',
              )}
            >
              <div
                className={clsx(
                  'text-sm font-semibold',
                  status === 'upcoming' ? 'text-zinc-500' : 'text-zinc-900',
                )}
              >
                {step.label}
              </div>
              {step.description && (
                <div className="mt-0.5 text-xs text-zinc-500">{step.description}</div>
              )}
            </div>
            {!isVertical && !isLast && (
              <div
                className={clsx(
                  'mt-[18px] h-px flex-shrink-0 transition',
                  status === 'completed' ? 'w-8 bg-brand-700 sm:w-16' : 'w-8 bg-zinc-200 sm:w-16',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
