'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

const TIERS = [
  {
    name: 'Nano',
    range: '1K – 10K',
    desc: 'Highly engaged niche audiences. Best for early-stage brand testing.',
    tier: 'NANO',
  },
  {
    name: 'Micro',
    range: '10K – 100K',
    desc: 'Cost-effective, trusted voices. The sweet spot for most campaigns.',
    tier: 'MICRO',
  },
  {
    name: 'Macro',
    range: '100K – 1M',
    desc: 'Broad reach with credibility. Great for launches and awareness.',
    tier: 'MACRO',
  },
  {
    name: 'Mega',
    range: '1M+',
    desc: 'Mass reach and cultural moments. Reserved for hero campaigns.',
    tier: 'MEGA',
  },
];

export default function Tiers() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="eyebrow">Creator tiers</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Mix nano, micro, macro, or mega
          </h2>
          <p className="mt-4 text-zinc-600">
            Each tier serves a different goal — engagement, reach, or credibility. Stack them in
            one campaign.
          </p>
        </motion.div>

        <StaggerContainer className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <StaggerItem key={t.tier}>
              <Link
                href={`/influencers?tier=${t.tier}`}
                className="group block h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-600 hover:shadow-xl"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  {t.tier}
                </div>
                <div className="mt-3 text-3xl font-bold text-zinc-900">{t.name}</div>
                <div className="mt-1 text-sm font-medium text-zinc-500">{t.range} followers</div>
                <p className="mt-4 text-sm leading-6 text-zinc-600">{t.desc}</p>
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
                  Browse {t.name.toLowerCase()}s
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
