'use client';

import { motion } from 'framer-motion';

export default function Marquee({ items, duration = 35, className }) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 text-2xl font-bold uppercase tracking-tight text-zinc-400"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
