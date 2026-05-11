import Link from 'next/link';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'How it works — Collabhype',
  description:
    'From cart to campaign in four steps. Self-serve influencer marketing with escrow.',
};

const STEPS = [
  {
    n: '01',
    title: 'Browse and build',
    body: 'Pick a curated pack of creators or compose your own from filters by tier, niche, city, and platform. Every creator profile shows real follower counts pulled from Instagram and YouTube OAuth.',
    points: [
      'Filter by tier — nano, micro, macro, mega',
      'Filter by niche — beauty, food, fitness, and more',
      'Filter by city — including Tier-2 and Tier-3',
      'Add packages and individual creators to one cart',
    ],
  },
  {
    n: '02',
    title: 'Pay securely',
    body: 'Checkout with Razorpay. Your full amount is held in escrow — released only when creators deliver. UPI, cards, netbanking, and wallets all supported.',
    points: [
      'Razorpay-backed checkout',
      'Funds held in escrow, not paid out',
      'Itemised invoices for every order',
      'Indian rupee, GST-ready',
    ],
  },
  {
    n: '03',
    title: 'Brief, draft, approve',
    body: 'Share your brief in-app — campaign goals, hashtags, do\'s and don\'ts. Creators submit drafts; you approve in two clicks or request revisions with feedback.',
    points: [
      'Single source of truth for every campaign',
      'No DM chaos, no lost email threads',
      'Per-deliverable status tracking',
      'Instant notifications to both sides',
    ],
  },
  {
    n: '04',
    title: 'Release payment',
    body: 'Once posts go live, you release payment per deliverable. Creators receive UPI within 1-2 business days. Your money never leaves escrow without your approval.',
    points: [
      'Approve and release per deliverable',
      'UPI payouts to creators in 1-2 days',
      'Automatic escrow release when all are paid',
      'Full audit trail for tax and accounting',
    ],
  },
];

const FOR_BRANDS = [
  { t: 'No agency markup', d: 'Book creators directly. Keep 100% of what you pay.' },
  { t: 'Verified reach', d: 'Follower counts and engagement pulled live from Meta + Google.' },
  { t: 'Escrow protection', d: 'Funds released only when deliverables are approved.' },
  { t: 'Mix and match tiers', d: 'Combine nano, micro, macro, mega in a single campaign.' },
];

const FOR_CREATORS = [
  { t: 'Get discovered', d: 'Brands filter by niche and city — show up in the right searches.' },
  { t: 'Set your own rates', d: 'Publish your rate card per deliverable. No haggling.' },
  { t: 'Predictable payouts', d: 'UPI within 1-2 days of brand approval. No chasing invoices.' },
  { t: 'Full control', d: 'Toggle availability, accept or skip campaigns, work on your schedule.' },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="eyebrow">How it works</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            From cart to campaign in{' '}
            <span className="text-brand-700">four steps</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Run influencer marketing at the speed of software. No sales calls, no agency
            handlers, no email threads — just clear status at every step.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ol className="space-y-12">
            {STEPS.map((s) => (
              <li key={s.n} className="grid gap-6 lg:grid-cols-[120px,1fr]">
                <div className="text-6xl font-bold text-brand-700">{s.n}</div>
                <Card padding="lg">
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-900">{s.title}</h3>
                  <p className="mt-3 text-zinc-600">{s.body}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-zinc-700">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* For brands / creators */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card padding="lg" className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-100">
                For brands
              </div>
              <h3 className="mt-2 text-2xl font-bold">Run campaigns at the speed of thought</h3>
              <ul className="mt-6 space-y-3">
                {FOR_BRANDS.map((p) => (
                  <li key={p.t} className="text-sm">
                    <div className="font-semibold text-white">{p.t}</div>
                    <div className="mt-0.5 text-brand-100">{p.d}</div>
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=brand"
                className="mt-7 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
              >
                Get started as a brand →
              </Link>
            </Card>
            <Card padding="lg">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                For creators
              </div>
              <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                Turn your audience into reliable income
              </h3>
              <ul className="mt-6 space-y-3">
                {FOR_CREATORS.map((p) => (
                  <li key={p.t} className="text-sm">
                    <div className="font-semibold text-zinc-900">{p.t}</div>
                    <div className="mt-0.5 text-zinc-600">{p.d}</div>
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=influencer"
                className="btn-primary mt-7 inline-flex !px-5 !py-2.5"
              >
                Join as a creator →
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Ready to launch?</h2>
          <p className="mt-3 text-brand-100">
            Sign up free. Pay only when you book.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/packages"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              Browse packages →
            </Link>
            <Link
              href="/influencers"
              className="rounded-lg border border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Find creators
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
