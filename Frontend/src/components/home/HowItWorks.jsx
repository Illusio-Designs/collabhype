'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

const STEPS = [
  {
    n: '01',
    t: 'Browse & build',
    d: 'Pick a curated pack of creators or compose your own from filters by tier, niche, city, and platform.',
  },
  {
    n: '02',
    t: 'Pay securely',
    d: 'Checkout with Razorpay. Funds held in escrow until creators deliver — your money is protected.',
  },
  {
    n: '03',
    t: 'Brief, draft, approve',
    d: 'Share briefs in-app, review drafts, request revisions, approve. Everything tracked, nothing lost in DMs.',
  },
  {
    n: '04',
    t: 'Pay on results',
    d: 'Once posts go live, release payment per deliverable. Creators get paid; you get the receipts.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="eyebrow">How it works</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            From cart to campaign in four steps
          </h2>
          <p className="mt-4 text-zinc-600">
            Built for speed. Designed so brands and creators never lose track of a deliverable.
          </p>
        </motion.div>

        <StaggerContainer className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <StaggerItem key={s.n}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="card relative h-full"
              >
                <div className="text-4xl font-bold text-brand-700">{s.n}</div>
                {i < STEPS.length - 1 && (
                  <div className="absolute right-5 top-7 hidden text-brand-200 lg:block">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">{s.t}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{s.d}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
