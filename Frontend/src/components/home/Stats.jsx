'use client';

import { motion } from 'framer-motion';
import Counter from '@/components/motion/Counter';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

const STATS = [
  { value: 1000, suffix: '+', label: 'Vetted creators', sub: 'Real, verified profiles' },
  { value: 12, suffix: '+', label: 'Niches covered', sub: 'Beauty to gaming' },
  { value: 50, suffix: '+', label: 'Cities reached', sub: 'Tier-1 to Tier-3 India' },
  { value: 100, suffix: '%', label: 'Escrow-backed', sub: 'Funds held until delivery' },
];

export default function Stats() {
  return (
    <section className="bg-zinc-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            By the numbers
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Scale that compounds with every brand
          </h2>
          <p className="mt-4 text-zinc-400">
            We're growing fast — and so is the creator network. Every booking funds another
            successful collab.
          </p>
        </motion.div>

        <StaggerContainer className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem
              key={s.label}
              className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur sm:p-6"
            >
              <div className="truncate text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 truncate text-sm font-semibold text-brand-300">{s.label}</div>
              <div className="mt-1 line-clamp-2 text-xs text-zinc-500">{s.sub}</div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
