import Link from 'next/link';
import { BadgeCheck, IndianRupee, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Join as a Creator — Collabhype',
  description:
    'Get booked by brands, set your own rates, and get paid via UPI with escrow-protected payouts. Join Collabhype as a creator.',
};

const BENEFITS = [
  {
    icon: IndianRupee,
    title: 'Set your own rates',
    body: 'Build a rate card per deliverable. Brands see exactly what they pay before booking you.',
  },
  {
    icon: Sparkles,
    title: 'Get booked by brands',
    body: 'Appear in the marketplace by niche, city, and platform. Brands hand-pick you or buy packages.',
  },
  {
    icon: ShieldCheck,
    title: 'Escrow-protected payouts',
    body: 'Funds are held in escrow and released to your UPI after each approved deliverable.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified, not self-reported',
    body: 'Connect Instagram to show real follower counts and engagement — no screenshots.',
  },
];

export default function JoinCreatorPage() {
  return (
    <article>
      <section className="-mt-header bg-gradient-to-b from-brand-50 to-white pt-header">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="eyebrow">For creators</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Get paid for the content you already love making
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Collabhype connects you with brands that book you directly. Set your rates, accept
            briefs, and get paid to your UPI — with funds held safely in escrow until you deliver.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register?role=influencer"
              className="rounded-full bg-brand-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              Create creator account
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-semibold text-zinc-800 transition hover:border-brand-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">{b.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">{b.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl bg-brand-700 px-6 py-12 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to start earning?</h2>
            <p className="mx-auto mt-2 max-w-xl text-brand-100">
              Create your profile in minutes, connect your Instagram, and start getting booked.
            </p>
            <Link
              href="/register?role=influencer"
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
            >
              Join as a creator
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
