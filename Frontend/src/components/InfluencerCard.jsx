import Link from 'next/link';
import { Avatar, Badge, Card } from '@/components/ui';
import { formatCount, TIER_LABEL, PLATFORM_LABEL } from '@/lib/format';

export default function InfluencerCard({ profile }) {
  const name = profile.user?.fullName || 'Influencer';
  const socials = Array.isArray(profile.socialAccounts) ? profile.socialAccounts : [];
  const niches = Array.isArray(profile.niches) ? profile.niches : [];
  return (
    <Link href={`/influencers/${profile.id}`} className="block h-full">
      <Card hover className="group flex h-full flex-col gap-4">
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
    </Link>
  );
}
