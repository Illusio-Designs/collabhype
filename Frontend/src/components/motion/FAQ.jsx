'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function FAQ({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="px-6">
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold text-zinc-900 sm:text-lg">{item.q}</span>
              <PlusMinusIcon open={isOpen} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm leading-7 text-zinc-600 sm:text-base">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Two SVG lines that morph between + (closed) and − (open).
 * The vertical bar rotates 90° to disappear into the horizontal bar.
 */
function PlusMinusIcon({ open }) {
  return (
    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        {/* horizontal bar — always visible */}
        <line x1="2" y1="8" x2="14" y2="8" />
        {/* vertical bar — rotates 90° to vanish when open */}
        <motion.line
          x1="8"
          y1="2"
          x2="8"
          y2="14"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: '8px 8px' }}
        />
      </svg>
    </span>
  );
}
