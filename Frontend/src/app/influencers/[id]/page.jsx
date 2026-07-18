import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  formatINR,
  formatCount,
  TIER_LABEL,
  DELIVERABLE_LABEL,
  PLATFORM_LABEL,
} from '@/lib/format';
import { Instagram, Youtube } from 'lucide-react';
import AddInfluencerForm from '@/components/cart/AddInfluencerForm';
import CreatorBadge from '@/components/CreatorBadge';
import { Badge, Breadcrumb } from '@/components/ui';

const PLATFORM_STYLE = {
  INSTAGRAM: {
    Icon: Instagram,
    bg: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]',
  },
  YOUTUBE: { Icon: Youtube, bg: 'bg-red-600' },
};

async function loadInfluencer(id) {
  try {
    const data = await apiFetch(`/api/v1/influencers/${id}`);
    return data.profile;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const profile = await loadInfluencer(id);
  if (!profile) return { title: 'Influencer — Collabhype' };
  return {
    title: `${profile.user?.fullName ?? 'Influencer'} — Collabhype`,
    description: profile.bio ?? undefined,
  };
}

export default async function InfluencerDetailPage({ params }) {
  const { id } = await params;
  const profile = await loadInfluencer(id);
  if (!profile) notFound();

  const name = profile.user?.fullName ?? 'Influencer';
  const socials = profile.socialAccounts ?? [];
  const niches = profile.niches ?? [];
  const rateCards = profile.rateCards ?? [];
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article>
      <section className="-mt-header bg-gradient-to-b from-brand-50 to-white pt-header">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Influencers', href: '/influencers' },
                { label: name },
              ]}
            />
          </div>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4">
                {profile.user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.user.avatarUrl}
                    alt={name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                      {name}
                    </h1>
                    {profile.badge && profile.badge !== 'NONE' && (
                      <CreatorBadge badge={profile.badge} size="md" />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                    {profile.city && <span>{profile.city}</span>}
                    {profile.tier && (
                      <>
                        <span>·</span>
                        <Badge variant="brand">{TIER_LABEL[profile.tier]}</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Reputation strip */}
              {(profile.completedCampaigns ?? 0) > 0 && (
                <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Completed</div>
                    <div className="mt-1 text-xl font-bold text-zinc-900">
                      {profile.completedCampaigns}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Success</div>
                    <div className="mt-1 text-xl font-bold text-zinc-900">
                      {Math.round(profile.successRate ?? 0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Response</div>
                    <div className="mt-1 text-xl font-bold text-zinc-900">
                      {Math.round(profile.responseRate ?? 0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Rating</div>
                    <div className="mt-1 text-xl font-bold text-zinc-900">
                      {Number(profile.avgRating ?? 0).toFixed(1)} / 5
                    </div>
                  </div>
                </div>
              )}

              {profile.bio && (
                <p className="mt-6 text-lg leading-relaxed text-zinc-700">{profile.bio}</p>
              )}

              {niches.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {niches.map((n) => (
                    <Badge key={n.niche?.id ?? n.nicheId}>{n.niche?.name}</Badge>
                  ))}
                </div>
              )}

              {/* Socials */}
              {socials.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {socials.map((s) => {
                    const style = PLATFORM_STYLE[s.platform] ?? PLATFORM_STYLE.INSTAGRAM;
                    const Icon = style.Icon;
                    return (
                      <a
                        key={s.platform}
                        href={s.profileUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
                      >
                        <div
                          className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-white ${style.bg}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-semibold text-zinc-900">
                              @{s.handle}
                            </span>
                            {s.isVerified && (
                              <span className="text-[11px] font-medium text-brand-700">Verified</span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {PLATFORM_LABEL[s.platform] ?? s.platform}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 gap-5 text-right">
                          <div>
                            <div className="text-base font-bold text-zinc-900">
                              {formatCount(s.followers)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                              Followers
                            </div>
                          </div>
                          <div>
                            <div className="text-base font-bold text-zinc-900">
                              {Number(s.engagementRate).toFixed(1)}%
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                              Engage
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="card lg:sticky lg:top-20 lg:h-fit">
              <AddInfluencerForm
                influencerId={profile.id}
                influencerName={name}
                rateCards={rateCards}
              />
              <p className="mt-3 text-center text-xs text-zinc-500">
                Funds held in escrow until {name} delivers.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </article>
  );
}
