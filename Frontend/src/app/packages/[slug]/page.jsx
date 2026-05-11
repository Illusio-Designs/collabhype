import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { formatINR, formatCount, TIER_LABEL, DELIVERABLE_LABEL, PLATFORM_LABEL } from '@/lib/format';
import AddPackageButton from '@/components/cart/AddPackageButton';
import { Badge, Card } from '@/components/ui';
import { DUMMY_PACKAGES, DUMMY_INFLUENCERS } from '@/lib/dummyData';

async function loadPackage(slug) {
  try {
    const data = await apiFetch(`/api/v1/packages/${slug}`);
    return data.package;
  } catch {
    // Fall back to dummy data so the design previews without the backend.
    const dummy = DUMMY_PACKAGES.find((p) => p.slug === slug);
    if (!dummy) return null;
    return {
      ...dummy,
      influencers: DUMMY_INFLUENCERS.slice(0, Math.min(dummy.influencerCount, 6)).map((inf) => ({
        influencer: inf,
      })),
    };
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await loadPackage(slug);
  if (!pkg) return { title: 'Package — Collabhype' };
  return {
    title: `${pkg.title} — Collabhype`,
    description: pkg.description ?? undefined,
  };
}

export default async function PackageDetailPage({ params }) {
  const { slug } = await params;
  const pkg = await loadPackage(slug);
  if (!pkg) notFound();

  const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];
  const influencers = (pkg.influencers ?? []).map((pi) => pi.influencer).filter(Boolean);

  return (
    <article>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="brand">{TIER_LABEL[pkg.tier] ?? pkg.tier}</Badge>
                {pkg.niche && <Badge>{pkg.niche.name}</Badge>}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                {pkg.title}
              </h1>
              {pkg.description && (
                <p className="mt-4 text-lg leading-relaxed text-zinc-600">{pkg.description}</p>
              )}
            </div>

            <aside className="card lg:sticky lg:top-20 lg:h-fit">
              <div className="text-xs text-zinc-500">Total package price</div>
              <div className="mt-1 text-4xl font-bold text-zinc-900">{formatINR(pkg.price)}</div>
              <div className="mt-1 text-sm text-zinc-500">Inclusive of all deliverables</div>

              <dl className="mt-5 space-y-2 border-t border-zinc-100 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-600">Influencers</dt>
                  <dd className="font-medium text-zinc-900">{pkg.influencerCount}</dd>
                </div>
                {pkg.estReach != null && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-600">Est. reach</dt>
                    <dd className="font-medium text-zinc-900">~{formatCount(pkg.estReach)}</dd>
                  </div>
                )}
                {pkg.estEngagement != null && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-600">Est. engagement</dt>
                    <dd className="font-medium text-zinc-900">
                      ~{formatCount(pkg.estEngagement)}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-6">
                <AddPackageButton packageId={pkg.id} slug={pkg.slug} />
              </div>
              <p className="mt-3 text-center text-xs text-zinc-500">
                Funds held in escrow until creators deliver.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="border-t border-zinc-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-zinc-900">What's included per influencer</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deliverables.map((d, i) => (
              <div key={i} className="card flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-500">Deliverable</div>
                  <div className="mt-1 font-semibold text-zinc-900">
                    {DELIVERABLE_LABEL[d.type] ?? d.type}
                  </div>
                </div>
                <div className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                  {d.qty}×
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Influencers */}
      {influencers.length > 0 && (
        <section className="border-t border-zinc-200 bg-zinc-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-zinc-900">
              Influencers in this pack ({influencers.length})
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {influencers.map((inf) => {
                const top = (inf.socialAccounts ?? [])[0];
                return (
                  <Link
                    key={inf.id}
                    href={`/influencers/${inf.id}`}
                    className="card flex items-center gap-3"
                  >
                    {inf.user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inf.user.avatarUrl}
                        alt={inf.user.fullName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {(inf.user?.fullName ?? '?')[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-zinc-900">
                        {inf.user?.fullName}
                      </div>
                      {top && (
                        <div className="truncate text-xs text-zinc-500">
                          {PLATFORM_LABEL[top.platform] ?? top.platform} · {formatCount(top.followers)}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
