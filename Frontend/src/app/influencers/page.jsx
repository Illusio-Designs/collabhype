import { apiFetchSafe } from '@/lib/api';
import InfluencerBrowserClient from '@/components/InfluencerBrowserClient';
import FiltersDrawer from '@/components/FiltersDrawer';
import Pagination from '@/components/Pagination';
import { Breadcrumb } from '@/components/ui';

export const metadata = {
  title: 'Browse influencers — Collabhype',
  description: 'Find vetted influencers by tier, niche, city, and platform.',
};

const SORTS = [
  { value: 'followers_desc', label: 'Most followers' },
  { value: 'engagement_desc', label: 'Best engagement' },
  { value: 'newest', label: 'Newest first' },
];

export default async function InfluencersPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  const qs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v != null && v !== ''),
  ).toString();

  const [data, nichesData] = await Promise.all([
    apiFetchSafe(`/api/v1/influencers${qs ? `?${qs}` : ''}`, null),
    apiFetchSafe('/api/v1/niches', null),
  ]);

  const influencers = data?.influencers ?? [];
  const meta = data?.meta ?? { total: influencers.length, page: 1, limit: 20, totalPages: 1 };
  const niches = nichesData?.niches ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Influencers' }]} />
      </div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Influencers</h1>
          <p className="mt-2 text-zinc-600">
            {meta?.total ?? 0} creators. Filter by tier, niche, city or platform.
          </p>
        </div>
        <FiltersDrawer niches={niches} extraSorts={SORTS} />
      </header>

      <InfluencerBrowserClient influencers={influencers} />
      <Pagination pathname="/influencers" searchParams={sp} meta={meta} />
    </div>
  );
}
