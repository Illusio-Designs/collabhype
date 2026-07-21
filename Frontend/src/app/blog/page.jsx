'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, apiError } from '@/lib/apiClient';
import { Breadcrumb } from '@/components/ui';

function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Blog list — fetches GET /api/v1/blog directly from the browser via apiClient,
// so the call is visible/inspectable in the Network tab (like /auth/me).
export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    apiClient
      .get(`/api/v1/blog?page=${page}&limit=12`)
      .then(({ data }) => {
        if (!active) return;
        setPosts(data?.posts ?? []);
        setMeta(data?.meta ?? { totalPages: 1, page });
      })
      .catch((e) => {
        if (!active) return;
        setError(apiError(e));
        setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
      </div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Blog</h1>
        <p className="mt-2 text-zinc-600">Guides, tips, and updates from the Collabhype team.</p>
      </header>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="aspect-[16/9] animate-pulse bg-zinc-100" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-12 text-center text-red-600">
          Couldn&apos;t load posts: {error}
        </div>
      ) : posts.length === 0 ? (
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
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`grid h-9 w-9 place-items-center rounded-lg border text-sm font-medium ${
                n === (meta.page ?? page)
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-zinc-200 text-zinc-700 hover:border-brand-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
