'use client';

import clsx from 'clsx';

// Visual milestone tracker for multi-step workflows. Each step has:
//   { key: string, label: string, sub?: string }
// Pass `activeKey` (current step) and `completedKeys` (set of already-done
// steps). The tracker auto-highlights everything up to and including the
// current step.
//
// On mobile the tracker stacks vertically; on sm+ it renders as a horizontal
// stepper with connector lines.
//
// Helpers below export the canonical step lists for an Order and a Campaign
// Deliverable so callers don't have to redefine the workflow shapes.

export const ORDER_STEPS = [
  { key: 'PLACED',     label: 'Order placed',     sub: 'Cart checked out' },
  { key: 'PAID',       label: 'Payment confirmed', sub: 'Funds in escrow' },
  { key: 'BRIEF_SENT', label: 'Brief dispatched',  sub: 'Creators notified' },
  { key: 'IN_PROGRESS', label: 'In progress',      sub: 'Drafts + approvals' },
  { key: 'COMPLETED',  label: 'Completed',         sub: 'Escrow released' },
];

export const DELIVERABLE_STEPS = [
  { key: 'PENDING',         label: 'Pending',     sub: 'Awaiting draft' },
  { key: 'DRAFT_SUBMITTED', label: 'Draft',       sub: 'Awaiting approval' },
  { key: 'APPROVED',        label: 'Approved',    sub: 'Ready to post' },
  { key: 'POSTED',          label: 'Posted',      sub: 'Live + payout pending' },
  { key: 'PAID',            label: 'Paid',        sub: 'Released to creator' },
];

export function orderActiveKey(order) {
  if (!order) return 'PLACED';
  if (order.status === 'COMPLETED') return 'COMPLETED';
  if (order.status === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (order.status === 'PAID') return 'BRIEF_SENT';
  if (order.status === 'PENDING') return 'PLACED';
  return 'PLACED';
}

export function deliverableActiveKey(deliverable) {
  if (!deliverable) return 'PENDING';
  // REVISION_REQUESTED visually maps back to DRAFT_SUBMITTED — i.e. the
  // creator owes a fresh draft. The state machine handles it; the tracker
  // just shows the current bucket.
  if (deliverable.status === 'REVISION_REQUESTED') return 'DRAFT_SUBMITTED';
  return deliverable.status ?? 'PENDING';
}

export default function Milestone({ steps, activeKey, completedKeys, className }) {
  const completed = new Set(completedKeys ?? []);
  const activeIndex = Math.max(0, steps.findIndex((s) => s.key === activeKey));

  return (
    <ol
      className={clsx(
        'relative flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0',
        className,
      )}
    >
      {steps.map((step, i) => {
        const isCompleted = completed.has(step.key) || i < activeIndex;
        const isActive = i === activeIndex;
        const isLast = i === steps.length - 1;

        const dotTone = isCompleted
          ? 'bg-brand-700 text-white ring-brand-100'
          : isActive
            ? 'bg-white text-brand-700 ring-brand-200 ring-4'
            : 'bg-zinc-100 text-zinc-400 ring-zinc-200';
        const lineTone = isCompleted ? 'bg-brand-700' : 'bg-zinc-200';
        const labelTone = isActive
          ? 'text-zinc-900'
          : isCompleted
            ? 'text-zinc-700'
            : 'text-zinc-400';

        return (
          <li
            key={step.key}
            className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center"
          >
            {/* Mobile vertical connector to next step */}
            {!isLast && (
              <span
                aria-hidden
                className={clsx(
                  'absolute left-[14px] top-8 h-full w-0.5 sm:hidden',
                  lineTone,
                )}
              />
            )}
            {/* Desktop horizontal connector */}
            {!isLast && (
              <span
                aria-hidden
                className={clsx(
                  'absolute top-3.5 hidden h-0.5 sm:left-1/2 sm:right-[-50%] sm:block',
                  lineTone,
                )}
              />
            )}

            <span
              className={clsx(
                'relative z-10 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-xs font-bold ring-2 transition',
                dotTone,
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted ? (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M8.143 14.428a1 1 0 0 1-1.414 0L3.272 10.97a1 1 0 1 1 1.414-1.415l2.75 2.75 7.95-7.95a1 1 0 1 1 1.415 1.414l-8.658 8.658Z" />
                </svg>
              ) : (
                i + 1
              )}
            </span>

            <div className="min-w-0 flex-1 sm:mt-2 sm:flex-none">
              <div className={clsx('text-sm font-semibold', labelTone)}>{step.label}</div>
              {step.sub && (
                <div className="text-[11px] leading-tight text-zinc-500">{step.sub}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
