import Link from 'next/link';
import { Check } from 'lucide-react';
import { Avatar, Badge, Card } from '@/components/ui';
import CreatorBadge from '@/components/CreatorBadge';
import {
  brandPriceFromCreatorRate,
  formatCount,
  formatINR,
  PLATFORM_LABEL,
  TIER_LABEL,
} from '@/lib/format';

// Starting rate = the cheapest rate-card item. Brand pays creator_rate × 1.05,
// so we show the all-in brand-side price (matches what they see in the cart).
function startingRateFor(rateCards) {
  if (!Array.isArray(rateCards) || !rateCards.length) return null;
  const cheapest = rateCards.reduce(
    (min, rc) => (Number(rc.price) < Number(min.price) ? rc : min),
    rateCards[0],
  );
  return brandPriceFromCreatorRate(cheapest.price);
}

export default function InfluencerCard({
  profile,
  selectable = false,
  selected = false,
  onToggle,
}) {
  const name = profile.user?.fullName || 'Influencer';
  const socials = Array.isArray(profile.socialAccounts) ? profile.socialAccounts : [];
  const niches = Array.isArray(profile.niches) ? profile.niches : [];
  const startingRate = startingRateFor(profile.rateCards);

  const inner = (
    <Card hover className="group relative flex h-full flex-col gap-4">
      {selectable && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle?.(profile);
          }}
          aria-pressed={selected}
          aria-label={selected ? 'Deselect creator' : 'Select creator'}
          className={`absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-md border-2 transition ${
            selected
              ? 'border-brand-700 bg-brand-700 text-white'
              : 'border-zinc-300 bg-white text-transparent hover:border-brand-500'
          }`}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
      )}

      <div className="flex items-center gap-3">
        <Avatar src={profile.user?.avatarUrl} name={name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-zinc-900 group-hover:text-brand-700">
            {name}
          </div>
          <div className="truncate text-xs text-zinc-500">
            {profile.city ? `${profile.city} · ` : ''}
            {TIER_LABEL[profile.tier] ?? profile.tier ?? 'New creator'}
          </div>
        </div>
        {profile.badge && profile.badge !== 'NONE' && (
          <div className="flex-shrink-0">
            <CreatorBadge badge={profile.badge} size="sm" />
          </div>
        )}
      </div>

      {niches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {niches.slice(0, 3).map((n) => (
            <Badge key={n.niche?.id ?? n.nicheId}>{n.niche?.name}</Badge>
          ))}
        </div>
      )}

      <div className="space-y-1.5 border-t border-zinc-100 pt-3">
        {socials.slice(0, 2).map((s) => (
          <div key={s.platform} className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">{PLATFORM_LABEL[s.platform] ?? s.platform}</span>
            <span className="font-medium text-zinc-900">{formatCount(s.followers)}</span>
          </div>
        ))}
        {!socials.length && (
          <div className="text-xs text-zinc-400">No connected platforms yet</div>
        )}
      </div>

      {/* Footer: starting rate + view profile affordance */}
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-zinc-100 pt-3">
        <div className="min-w-0">
          {startingRate ? (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Starting from
              </div>
              <div className="truncate text-base font-bold text-zinc-900">
                {formatINR(startingRate)}
              </div>
            </>
          ) : (
            <div className="text-xs text-zinc-400">Rate card pending</div>
          )}
        </div>
        {!selectable && (
          <span className="flex-shrink-0 text-xs font-semibold text-brand-700 transition group-hover:translate-x-0.5">
            View profile →
          </span>
        )}
      </div>
    </Card>
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={() => onToggle?.(profile)}
        className="block h-full w-full text-left"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href={`/influencers/${profile.id}`} className="block h-full">
      {inner}
    </Link>
  );
}
