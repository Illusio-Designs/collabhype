'use client';

import { motion } from 'framer-motion';
import { ListChecks, Package, ShieldCheck, Sparkles } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

const SERVICES = [
  {
    title: 'Curated packages',
    desc: 'Pre-built bundles by tier, niche, and budget. Buy a pack of 10 nano creators or 5 micros in one click.',
    icon: Package,
  },
  {
    title: 'Custom mixes',
    desc: 'Filter creators by tier, niche, city, platform — add exactly who you want and the deliverables you need.',
    icon: Sparkles,
  },
  {
    title: 'Campaign workspace',
    desc: 'Share briefs, review drafts, request revisions or approve — everything tracked, nothing lost in DMs.',
    icon: ListChecks,
  },
  {
    title: 'Escrow & payouts',
    desc: 'Razorpay-secured escrow holds your funds. Released to creators per deliverable after you approve.',
    icon: ShieldCheck,
  },
];

export default function Services() {
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
          <span className="eyebrow">What you get</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            One platform. End-to-end influencer marketing.
          </h2>
          <p className="mt-4 text-zinc-600">
            Replace 5 tools and 50 email threads with a single workspace.
          </p>
        </motion.div>

        <StaggerContainer className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="card h-full"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-zinc-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{s.desc}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
