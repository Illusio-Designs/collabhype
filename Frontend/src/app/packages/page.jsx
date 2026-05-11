import { apiFetchSafe } from '@/lib/api';
import PackageCard from '@/components/PackageCard';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { DUMMY_NICHES, DUMMY_PACKAGES } from '@/lib/dummyData';

export const metadata = {
  title: 'Browse packages — Collabhype',
  description: 'Pre-built influencer packages by tier, niche, and budget.',
};

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'reach_desc', label: 'Reach: high to low' },
];

function filterDummyPackages(sp) {
  let list = [...DUMMY_PACKAGES];
  if (sp.tier) list = list.filter((p) => p.tier === sp.tier);
  if (sp.nicheSlug) list = list.filter((p) => p.niche?.slug === sp.nicheSlug);
  if (sp.minPrice) list = list.filter((p) => Number(p.price) >= Number(sp.minPrice));
  if (sp.maxPrice) list = list.filter((p) => Number(p.price) <= Number(sp.maxPrice));
  if (sp.q) {
    const q = String(sp.q).toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q));
  }
  const sort = sp.sort ?? 'newest';
  if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
  else if (sort === 'reach_desc') list.sort((a, b) => (b.estReach ?? 0) - (a.estReach ?? 0));
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
}

export default async function PackagesPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  const qs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v != null && v !== ''),
  ).toString();

  // Try live API; fall back to dummy when unreachable or empty.
  const [data, nichesData] = await Promise.all([
    apiFetchSafe(`/api/v1/packages${qs ? `?${qs}` : ''}`, null),
    apiFetchSafe('/api/v1/niches', null),
  ]);

  const fromApi = data?.packages ?? [];
  const useDummy = fromApi.length === 0;
  const packages = useDummy ? filterDummyPackages(sp) : fromApi;
  const meta = useDummy
    ? { total: packages.length, page: 1, limit: packages.length || 1, totalPages: 1 }
    : data?.meta;
  const niches = nichesData?.niches?.length ? nichesData.niches : DUMMY_NICHES;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Packages</h1>
        <p className="mt-2 text-zinc-600">
          Curated influencer bundles ready to launch. {meta?.total ?? 0} total.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
        <Filters niches={niches} extraSorts={SORTS} />

        <div>
          {packages.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {packages.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
              <h3 className="text-lg font-semibold text-zinc-900">No packages match your filters</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Try widening the tier or removing the niche filter.
              </p>
            </div>
          )}

          <Pagination pathname="/packages" searchParams={sp} meta={meta} />
        </div>
      </div>
    </div>
  );
}
