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
import AddInfluencerForm from '@/components/cart/AddInfluencerForm';
import CreatorBadge from '@/components/CreatorBadge';
import NegotiateButton from '@/components/chat/NegotiateButton';
import { Badge, Breadcrumb } from '@/components/ui';

const NEGOTIABLE_TIERS = ['MICRO', 'MACRO', 'MEGA'];

// Inline brand marks — this lucide-react build doesn't ship Instagram/Youtube.
function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.3" cy="6.7" r="1.25" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

const PLATFORM_STYLE = {
  INSTAGRAM: {
    Icon: InstagramIcon,
    bg: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]',
  },
  YOUTUBE: { Icon: YoutubeIcon, bg: 'bg-red-600' },
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
              {NEGOTIABLE_TIERS.includes(profile.tier) && (
                <div className="mt-3">
                  <NegotiateButton influencerId={profile.id} className="w-full !justify-center" />
                  <p className="mt-2 text-center text-xs text-zinc-500">
                    Prefer a custom rate? Negotiate directly.
                  </p>
                </div>
              )}
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
