import Link from 'next/link';
import { LayoutGrid, ShieldCheck, Sparkles, Users } from 'lucide-react';

export const metadata = {
  title: 'Join as a Brand — Collabhype',
  description:
    'Run influencer campaigns without the back-and-forth. Buy curated packages or hand-pick creators, with escrow-backed payments and per-deliverable payouts.',
};

const BENEFITS = [
  {
    icon: LayoutGrid,
    title: 'Buy curated packages',
    body: 'Pre-built bundles of vetted creators. Higher volume, lower per-influencer cost.',
  },
  {
    icon: Users,
    title: 'Hand-pick creators',
    body: 'Browse by tier, niche, city, and platform. Add creators to your cart in one click.',
  },
  {
    icon: ShieldCheck,
    title: 'Escrow-backed payments',
    body: 'Your funds are held in escrow and released only as creators deliver approved work.',
  },
  {
    icon: Sparkles,
    title: 'Briefs & approvals in one place',
    body: 'Send briefs, review drafts, approve posts, and track every deliverable from one dashboard.',
  },
];

export default function JoinBrandPage() {
  return (
    <article>
      <section className="-mt-header bg-gradient-to-b from-brand-50 to-white pt-header">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="eyebrow">For brands</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Run influencer campaigns without the back-and-forth
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Buy ready-made creator packages or hand-pick influencers yourself. Pay securely through
            escrow, send briefs, and approve deliverables — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register?role=brand"
              className="rounded-full bg-brand-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              Create brand account
            </Link>
            <Link
              href="/packages"
              className="rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-semibold text-zinc-800 transition hover:border-brand-300"
            >
              Browse packages
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
            <h2 className="text-2xl font-bold sm:text-3xl">Launch your first campaign</h2>
            <p className="mx-auto mt-2 max-w-xl text-brand-100">
              Create a brand account, pick a package or creators, and go live in minutes.
            </p>
            <Link
              href="/register?role=brand"
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
            >
              Join as a brand
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
