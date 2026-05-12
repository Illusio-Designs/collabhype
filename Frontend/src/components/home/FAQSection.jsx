'use client';

import { motion } from 'framer-motion';
import { Accordion } from '@/components/ui';

const ITEMS = [
  {
    title: 'How does pricing work?',
    content:
      "Packages have a fixed all-in price covering all influencers and deliverables. For custom mixes, the cart prices each deliverable at the creator's published rate card. There are no platform fees on top — what you see is what you pay.",
  },
  {
    title: "What if a creator doesn't deliver?",
    content:
      'Your funds stay in escrow until you approve each deliverable. If a creator fails to deliver, you can request a revision or, in unresolved cases, our team mediates and issues a refund for that line item.',
  },
  {
    title: 'How do you verify follower counts?',
    content:
      'Creators connect their Instagram and YouTube accounts via official OAuth. We pull real-time followers, average likes/comments, and engagement rate directly from Meta and Google — no self-reported numbers.',
  },
  {
    title: 'When do creators get paid?',
    content:
      "After you approve a deliverable as POSTED, payment for that line item is released to the creator's UPI within 1-2 business days via Razorpay Payouts.",
  },
  {
    title: 'Can I mix tiers in one campaign?',
    content:
      'Absolutely. The custom cart is built for this — add 10 nano creators for engagement, 2 micros for reach, and 1 macro for credibility, all in one checkout.',
  },
  {
    title: 'What payment methods do you accept?',
    content:
      'All Razorpay-supported methods for Indian brands: UPI, cards (Visa/Mastercard/RuPay/Amex), netbanking, wallets, and EMI on select cards.',
  },
  {
    title: 'Do you cover Tier-2 and Tier-3 creators?',
    content:
      'Yes — this is one of our specialties. We have creators in over 50 cities including Indore, Surat, Coimbatore, Lucknow, Vijayawada, and many more. Filter by city to find them.',
  },
];

export default function FAQSection() {
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
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Questions, answered
          </h2>
          <p className="mt-4 text-zinc-600">
            Everything you need to know before your first campaign.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <Accordion items={ITEMS} defaultOpen={0} />
        </motion.div>
      </div>
    </section>
  );
}
