import Link from 'next/link';
import { apiFetchSafe } from '@/lib/api';
import { Breadcrumb } from '@/components/ui';

export const metadata = {
  title: 'Blog — Collabhype',
  description: 'Guides, tips, and updates on influencer marketing in India.',
};

// Always render fresh so newly published posts appear without a rebuild.
export const dynamic = 'force-dynamic';

function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function BlogListPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  const page = Number(sp.page) || 1;
  const data = await apiFetchSafe(`/api/v1/blog?page=${page}&limit=12`, null);
  const posts = data?.posts ?? [];
  const meta = data?.meta ?? { totalPages: 1, page };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
      </div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Blog</h1>
        <p className="mt-2 text-zinc-600">Guides, tips, and updates from the Collabhype team.</p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500">
          No posts yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="aspect-[16/9] overflow-hidden bg-zinc-100">
                {p.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-300">
                    <span className="text-3xl font-bold">CH</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="text-xs text-zinc-500">{fmtDate(p.publishedAt)}</div>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900 group-hover:text-brand-700">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-600">{p.excerpt}</p>
                )}
                <span className="mt-4 text-sm font-semibold text-brand-700">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {(meta.totalPages ?? 1) > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/blog?page=${n}`}
              className={`grid h-9 w-9 place-items-center rounded-lg border text-sm font-medium ${
                n === (meta.page ?? page)
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-zinc-200 text-zinc-700 hover:border-brand-300'
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
