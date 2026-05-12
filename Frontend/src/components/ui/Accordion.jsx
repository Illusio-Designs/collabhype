'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items, allowMultiple = false, defaultOpen = null }) {
  const [open, setOpen] = useState(allowMultiple ? defaultOpen ?? [] : defaultOpen);

  function toggle(i) {
    if (allowMultiple) {
      const arr = Array.isArray(open) ? open : [];
      setOpen(arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]);
    } else {
      setOpen(open === i ? null : i);
    }
  }

  function isOpen(i) {
    return allowMultiple ? Array.isArray(open) && open.includes(i) : open === i;
  }

  return (
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
      {items.map((item, i) => {
        const opened = isOpen(i);
        return (
          <div key={i} className="px-5">
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-semibold text-zinc-900">{item.title}</span>
              <motion.span
                animate={{ rotate: opened ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-zinc-400"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {opened && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-sm leading-6 text-zinc-600">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
