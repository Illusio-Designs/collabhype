import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Create your account — Collabhype',
  description: 'Join Collabhype as a brand or as a creator.',
};

// Role chooser. Old links like /register?role=brand still work — they redirect
// straight to the dedicated page.
export default function RegisterPage({ searchParams }) {
  const role = searchParams?.role?.toString().toLowerCase();
  if (role === 'brand') redirect('/register/brand');
  if (role === 'influencer' || role === 'creator') redirect('/register/creator');

  const CHOICES = [
    {
      href: '/register/brand',
      icon: Building2,
      title: "I'm a brand",
      body: 'Run campaigns, buy creator packages, and hand-pick influencers.',
    },
    {
      href: '/register/creator',
      icon: Sparkles,
      title: "I'm a creator",
      body: 'Set your rates, get booked by brands, and get paid via UPI.',
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create your account</h1>
        <p className="mt-2 text-zinc-600">First, tell us who you are.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CHOICES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <c.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900">{c.title}</h2>
            <p className="mt-1 flex-1 text-sm leading-6 text-zinc-600">{c.body}</p>
            <span className="mt-4 text-sm font-semibold text-brand-700 group-hover:underline">
              Continue →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
