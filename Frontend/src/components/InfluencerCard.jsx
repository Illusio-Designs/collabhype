import Link from 'next/link';
import { Avatar, Badge, Card } from '@/components/ui';
import { formatCount, TIER_LABEL, PLATFORM_LABEL } from '@/lib/format';

export default function InfluencerCard({ profile, selectable = false, selected = false, onToggle }) {
  const name = profile.user?.fullName || 'Influencer';
  const socials = Array.isArray(profile.socialAccounts) ? profile.socialAccounts : [];
  const niches = Array.isArray(profile.niches) ? profile.niches : [];

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
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M8.143 14.428a1 1 0 0 1-1.414 0L3.272 10.97a1 1 0 1 1 1.414-1.415l2.75 2.75 7.95-7.95a1 1 0 1 1 1.415 1.414l-8.658 8.658Z" />
          </svg>
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
      </div>
      <div className="flex flex-wrap gap-1.5">
        {niches.slice(0, 3).map((n) => (
          <Badge key={n.niche?.id ?? n.nicheId}>{n.niche?.name}</Badge>
        ))}
      </div>
      <div className="mt-auto space-y-1.5 border-t border-zinc-100 pt-3">
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
