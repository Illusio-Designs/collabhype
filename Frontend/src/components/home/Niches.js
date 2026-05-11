'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

export default function Niches({ niches = [] }) {
  if (!niches.length) return null;
  return (
    <section className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="eyebrow">By category</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Explore by niche
          </h2>
          <p className="mt-4 text-zinc-600">
            From beauty to gaming — every niche has its specialists.
          </p>
        </motion.div>

        <StaggerContainer className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {niches.map((n) => (
            <StaggerItem key={n.slug}>
              <Link
                href={`/influencers?nicheSlug=${n.slug}`}
                className="group block rounded-xl border border-zinc-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-brand-600 hover:shadow-lg"
              >
                <div className="text-sm font-semibold text-zinc-900 group-hover:text-brand-700">
                  {n.name}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
