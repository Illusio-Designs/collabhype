'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Tabs({ tabs, defaultIndex = 0, onChange, variant = 'underline' }) {
  const [active, setActive] = useState(defaultIndex);

  function select(i) {
    setActive(i);
    onChange?.(i);
  }

  if (variant === 'pills') {
    return (
      <div>
        <div className="inline-flex rounded-lg bg-zinc-100 p-1">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => select(i)}
              className={clsx(
                'relative rounded-md px-4 py-1.5 text-sm font-medium transition',
                active === i ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900',
              )}
            >
              {active === i && (
                <motion.span
                  layoutId="pill"
                  className="absolute inset-0 rounded-md bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="pt-5">{tabs[active]?.content}</div>
      </div>
    );
  }

  // underline (default)
  return (
    <div>
      <div className="border-b border-zinc-200">
        <div className="flex gap-6">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => select(i)}
              className={clsx(
                'relative px-1 py-3 text-sm font-medium transition',
                active === i ? 'text-brand-700' : 'text-zinc-600 hover:text-zinc-900',
              )}
            >
              {t.label}
              {active === i && (
                <motion.span
                  layoutId="underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-700"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-5">{tabs[active]?.content}</div>
    </div>
  );
}
