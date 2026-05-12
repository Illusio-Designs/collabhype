'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const BRAND_POINTS = [
  'Browse, book, and brief without a single sales call',
  'Verified follower counts via Instagram & YouTube OAuth',
  'Escrow protection — your money is safe until delivery',
  'Mix nano, micro, macro, mega in one campaign',
  'Pan-India reach including Tier-2 and Tier-3 cities',
];

const CREATOR_POINTS = [
  'Get discovered by brands looking for your niche',
  'Connect IG & YouTube — we surface real metrics',
  'Predictable UPI payouts after approved deliverables',
  'Set your own rates per deliverable type',
  'Stay in control — accept, skip, or pause availability',
];

const variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function ForBrandsAndCreators() {
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
          <span className="eyebrow">Built for both sides</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            One platform, two perfect-fit experiences
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* For brands */}
          <motion.div
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white shadow-xl sm:p-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100 backdrop-blur">
              For brands
            </div>
            <h3 className="mt-5 text-2xl font-bold sm:text-3xl">
              Run campaigns at the speed of thought
            </h3>
            <p className="mt-3 text-brand-100">
              Skip the agency markup. Book directly, track everything, pay only on delivery.
            </p>
            <ul className="mt-7 space-y-3">
              {BRAND_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <CheckBadge />
                  <span className="text-brand-50">{p}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=brand"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Create brand account →
            </Link>
          </motion.div>

          {/* For creators */}
          <motion.div
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl sm:p-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
              For creators
            </div>
            <h3 className="mt-5 text-2xl font-bold text-zinc-900 sm:text-3xl">
              Turn your audience into a reliable income
            </h3>
            <p className="mt-3 text-zinc-600">
              No more chasing brands or DMs. Get matched with campaigns that fit your niche.
            </p>
            <ul className="mt-7 space-y-3">
              {CREATOR_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <CheckBadgeDark />
                  <span className="text-zinc-700">{p}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=influencer"
              className="btn-primary mt-8 inline-flex items-center gap-2 !px-5 !py-3"
            >
              Join as creator →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CheckBadge() {
  return (
    <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-white/20">
      <Check className="h-3 w-3 text-white" strokeWidth={3} />
    </span>
  );
}

function CheckBadgeDark() {
  return (
    <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-brand-50">
      <Check className="h-3 w-3 text-brand-700" strokeWidth={3} />
    </span>
  );
}
