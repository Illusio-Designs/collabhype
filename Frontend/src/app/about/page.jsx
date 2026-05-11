import Link from 'next/link';
import { Stat } from '@/components/ui';

export const metadata = {
  title: 'About — Collabhype',
  description: 'Why we built Collabhype and what we stand for.',
};

const VALUES = [
  {
    title: 'Transparency by default',
    body: 'Real follower counts via official OAuth. No self-reported numbers, no inflated reach.',
  },
  {
    title: 'Pay on results',
    body: 'Brands pay into escrow. Creators get paid per approved deliverable — no chasing invoices.',
  },
  {
    title: 'Tier-2 and Tier-3 friendly',
    body: 'We over-index on regional creators. Some of India\'s best engagement lives outside metros.',
  },
  {
    title: 'No long-term lock-in',
    body: 'No retainers. No monthly minimums. Book what you need, when you need it.',
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="eyebrow">About us</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Influencer marketing, finally{' '}
            <span className="text-brand-700">self-serve</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Collabhype is a marketplace where brands and creators meet directly — no agency
            markups, no DM chaos. Built for India, by people who&apos;ve run campaigns at scale.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="eyebrow">Our story</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              Built because agencies were the bottleneck
            </h2>
          </div>
          <div className="space-y-5 text-zinc-600">
            <p>
              We&apos;ve all been there: a brand wants to ship a campaign in two weeks, the agency
              shares a Google Sheet of creators, three rounds of email later you&apos;ve lost half
              the influencers and your launch date.
            </p>
            <p>
              Collabhype replaces that with software. Browse vetted creators, book them like
              you&apos;d book a flight, brief them in-app, approve drafts in two clicks, and only
              pay when posts go live.
            </p>
            <p>
              On the creator side, we replace 50 DMs and ghosted invoices with a clean dashboard
              and predictable UPI payouts.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label="Vetted creators" value="1,000+" />
            <Stat label="Niches covered" value="12+" />
            <Stat label="Cities reached" value="50+" />
            <Stat label="Escrow-backed" value="100%" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="eyebrow">What we stand for</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              Four non-negotiables
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="text-3xl font-bold text-brand-700">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="mt-3 text-lg font-semibold text-zinc-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Start a campaign today.</h2>
          <p className="mt-3 text-brand-100">No demos. No sales calls. Just book and go.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register?role=brand"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              I&apos;m a brand
            </Link>
            <Link
              href="/register?role=influencer"
              className="rounded-lg border border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              I&apos;m a creator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
