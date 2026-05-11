'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

const COLORS = {
  brand: 'bg-brand-700',
  success: 'bg-green-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
};

export default function Progress({
  value = 0,
  max = 100,
  label,
  color = 'brand',
  showPercent = true,
  className,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-zinc-700">{label}</span>}
          {showPercent && <span className="text-zinc-500">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={clsx('h-full rounded-full', COLORS[color])}
        />
      </div>
    </div>
  );
}
