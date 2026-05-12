'use client';

import { motion } from 'framer-motion';
import { ALL_LOGOS } from './BrandLogos';

export default function BrandMarquee() {
  return (
    <section className="border-y border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Trusted by next-generation Indian brands
        </p>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <motion.div
            className="flex items-center gap-16 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
          >
            {[...ALL_LOGOS, ...ALL_LOGOS].map((entry, i) => (
              <div key={i} className="flex-shrink-0 opacity-80 grayscale transition hover:opacity-100">
                <entry.Logo />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
