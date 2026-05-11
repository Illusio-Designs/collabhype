'use client';

import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

const SERVICES = [
  {
    title: 'Curated packages',
    desc: 'Pre-built bundles by tier, niche, and budget. Buy a pack of 10 nano creators or 5 micros in one click.',
    icon: PackageIcon,
  },
  {
    title: 'Custom mixes',
    desc: 'Filter creators by tier, niche, city, platform — add exactly who you want and the deliverables you need.',
    icon: MixIcon,
  },
  {
    title: 'Campaign workspace',
    desc: 'Share briefs, review drafts, request revisions or approve — everything tracked, nothing lost in DMs.',
    icon: WorkflowIcon,
  },
  {
    title: 'Escrow & payouts',
    desc: 'Razorpay-secured escrow holds your funds. Released to creators per deliverable after you approve.',
    icon: ShieldIcon,
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
          {SERVICES.map((s) => (
            <StaggerItem key={s.title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="card h-full"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <s.icon />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{s.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function PackageIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7l9-4 9 4M3 7v10l9 4m-9-14l9 4m0 0v14m0-14l9-4m-9 18l9-4V7" strokeLinejoin="round" />
    </svg>
  );
}
function MixIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="5" />
      <circle cx="15" cy="15" r="5" />
    </svg>
  );
}
function WorkflowIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5h12M9 12h12M9 19h12M3 5l1 1L7 3M3 12l1 1 3-3M3 19l1 1 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
