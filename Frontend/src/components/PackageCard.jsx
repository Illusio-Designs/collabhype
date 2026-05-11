import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import { formatINR, formatCount, TIER_LABEL, DELIVERABLE_LABEL } from '@/lib/format';

export default function PackageCard({ pkg }) {
  const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];
  return (
    <Link href={`/packages/${pkg.slug}`} className="block h-full">
      <Card hover className="group flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="brand">{TIER_LABEL[pkg.tier] ?? pkg.tier}</Badge>
          {pkg.niche && <Badge>{pkg.niche.name}</Badge>}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-brand-700">
            {pkg.title}
          </h3>
          {pkg.description && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{pkg.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {deliverables.slice(0, 3).map((d, i) => (
            <Badge key={i}>
              {d.qty}× {DELIVERABLE_LABEL[d.type] ?? d.type}
            </Badge>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-zinc-100 pt-4">
          <div>
            <div className="text-xs text-zinc-500">From</div>
            <div className="text-2xl font-bold text-zinc-900">{formatINR(pkg.price)}</div>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <div>{pkg.influencerCount} influencers</div>
            {pkg.estReach != null && <div>~{formatCount(pkg.estReach)} reach</div>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
