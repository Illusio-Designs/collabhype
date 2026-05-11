import Link from 'next/link';
import { Card } from '@/components/ui';
import { DELIVERABLE_LABEL, formatINR } from '@/lib/format';

const CHECK_ICON = (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className="mt-[3px] h-4 w-4 flex-shrink-0 text-brand-600"
  >
    <path
      fill="currentColor"
      d="M8.143 14.428a1 1 0 0 1-1.414 0L3.272 10.97a1 1 0 1 1 1.414-1.415l2.75 2.75 7.95-7.95a1 1 0 1 1 1.415 1.414l-8.658 8.658Z"
    />
  </svg>
);

export default function PackageCard({ pkg }) {
  const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];
  const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];

  return (
    <Card
      hover
      className="group relative flex h-full flex-col gap-5 !p-6"
    >
      {pkg.isMostPopular && (
        <span className="absolute right-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          Most Popular
        </span>
      )}

      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {pkg.packName ?? pkg.title}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          {pkg.mrp ? (
            <span className="text-sm font-medium text-zinc-400 line-through">
              {formatINR(pkg.mrp)}
            </span>
          ) : null}
          <span className="text-3xl font-bold text-zinc-900">
            {pkg.pricePerInfluencer != null
              ? formatINR(pkg.pricePerInfluencer)
              : formatINR(pkg.price)}
          </span>
          <span className="text-xs text-zinc-500">per influencer</span>
        </div>
        {pkg.subtitle && (
          <p className="mt-2 text-sm text-zinc-600">{pkg.subtitle}</p>
        )}
      </div>

      <ul className="space-y-2 border-t border-zinc-100 pt-4 text-sm text-zinc-700">
        <li className="flex items-start gap-2">
          {CHECK_ICON}
          <span>
            <strong className="font-semibold text-zinc-900">
              {pkg.influencerCount}
            </strong>{' '}
            Influencers
          </span>
        </li>
        {deliverables.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            {CHECK_ICON}
            <span>
              {d.qty > 1 ? `${d.qty}× ` : ''}
              {DELIVERABLE_LABEL[d.type] ?? d.type}
            </span>
          </li>
        ))}
      </ul>

      {benefits.length > 0 && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Additional Benefits
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-800">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                {CHECK_ICON}
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto border-t border-zinc-100 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-zinc-500">Total</div>
            <div className="text-2xl font-bold text-zinc-900">
              {formatINR(pkg.price)}
            </div>
          </div>
          <Link
            href={`/packages/${pkg.slug}`}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            View pack →
          </Link>
        </div>
      </div>
    </Card>
  );
}
