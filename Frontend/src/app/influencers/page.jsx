import { apiFetchSafe } from '@/lib/api';
import InfluencerBrowserClient from '@/components/InfluencerBrowserClient';
import FiltersDrawer from '@/components/FiltersDrawer';
import Pagination from '@/components/Pagination';
import { DUMMY_INFLUENCERS, DUMMY_NICHES } from '@/lib/dummyData';

export const metadata = {
  title: 'Browse influencers — Collabhype',
  description: 'Find vetted influencers by tier, niche, city, and platform.',
};

const SORTS = [
  { value: 'followers_desc', label: 'Most followers' },
  { value: 'engagement_desc', label: 'Best engagement' },
  { value: 'newest', label: 'Newest first' },
];

function filterDummyInfluencers(sp) {
  let list = [...DUMMY_INFLUENCERS];
  if (sp.tier) list = list.filter((i) => i.tier === sp.tier);
  if (sp.nicheSlug) {
    list = list.filter((i) => i.niches?.some((n) => n.niche?.slug === sp.nicheSlug));
  }
  if (sp.city) {
    const c = String(sp.city).toLowerCase();
    list = list.filter((i) => i.city?.toLowerCase().includes(c));
  }
  if (sp.minFollowers) list = list.filter((i) => i.totalFollowers >= Number(sp.minFollowers));
  if (sp.maxFollowers) list = list.filter((i) => i.totalFollowers <= Number(sp.maxFollowers));
  if (sp.platform) {
    list = list.filter((i) => i.socialAccounts?.some((s) => s.platform === sp.platform));
  }
  if (sp.q) {
    const q = String(sp.q).toLowerCase();
    list = list.filter(
      (i) =>
        i.user.fullName.toLowerCase().includes(q) ||
        i.socialAccounts?.some((s) => s.handle.toLowerCase().includes(q)),
    );
  }
  const sort = sp.sort ?? 'followers_desc';
  if (sort === 'engagement_desc')
    list.sort((a, b) => (b.avgEngagementRate ?? 0) - (a.avgEngagementRate ?? 0));
  else if (sort === 'newest') {
    // dummy lacks createdAt; keep original order
  } else list.sort((a, b) => b.totalFollowers - a.totalFollowers);
  return list;
}

export default async function InfluencersPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  const qs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v != null && v !== ''),
  ).toString();

  const [data, nichesData] = await Promise.all([
    apiFetchSafe(`/api/v1/influencers${qs ? `?${qs}` : ''}`, null),
    apiFetchSafe('/api/v1/niches', null),
  ]);

  const fromApi = data?.influencers ?? [];
  const useDummy = fromApi.length === 0;
  const influencers = useDummy ? filterDummyInfluencers(sp) : fromApi;
  const meta = useDummy
    ? { total: influencers.length, page: 1, limit: influencers.length || 1, totalPages: 1 }
    : data?.meta;
  const niches = nichesData?.niches?.length ? nichesData.niches : DUMMY_NICHES;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
