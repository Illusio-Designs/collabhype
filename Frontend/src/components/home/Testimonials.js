'use client';

import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

const TESTIMONIALS = [
  {
    quote:
      "We ran a campaign with 50 nano creators in 3 weeks. Same effort would have taken three months over email and DMs.",
    name: 'Aanya Mehta',
    role: 'Brand Manager',
    company: 'Bloom Skincare',
    initials: 'AM',
  },
  {
    quote:
      "Finally, brands pay on time. The escrow system means I post knowing the money's already waiting for me.",
    name: 'Rohan Iyer',
    role: 'Lifestyle Creator',
    company: '47K Instagram followers',
    initials: 'RI',
  },
  {
    quote:
      "Found regional creators in Tier-3 cities we'd never have discovered otherwise. ROI was 3.2x.",
    name: 'Vikram Sharma',
    role: 'Growth Lead',
    company: 'Sutra Foods',
    initials: 'VS',
  },
];

export default function Testimonials() {
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
          <span className="eyebrow">In their words</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Loved by brands and creators alike
          </h2>
        </motion.div>

        <StaggerContainer className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="card h-full"
              >
                <svg
                  className="h-7 w-7 text-brand-200"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M9.5 5C6.5 5 4 7.5 4 10.5c0 2 1 3.5 2.5 4.5L4 22h5l1.5-7c1-1 1.5-2.5 1.5-4.5C12 7.5 9.5 5 9.5 5zM19.5 5c-3 0-5.5 2.5-5.5 5.5 0 2 1 3.5 2.5 4.5L14 22h5l1.5-7c1-1 1.5-2.5 1.5-4.5C22 7.5 19.5 5 19.5 5z" />
                </svg>
                <p className="mt-4 text-base leading-7 text-zinc-700">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">{t.name}</div>
                    <div className="text-xs text-zinc-500">
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
