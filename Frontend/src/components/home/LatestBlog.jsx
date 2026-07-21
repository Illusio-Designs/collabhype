'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';

function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// "Latest from the blog" home section. Fetches its own data from the browser
// (GET /api/v1/blog) so the call is visible in the Network tab. Renders up to 3
// published posts; hides itself entirely when there are none.
export default function LatestBlog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let active = true;
    apiClient
      .get('/api/v1/blog?limit=3')
      .then(({ data }) => {
        if (active) setPosts(data?.posts ?? []);
      })
      .catch(() => {
        if (active) setPosts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!posts.length) return null;

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">From the blog</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Influencer marketing, decoded
            </h2>
            <p className="mt-2 text-zinc-600">
              Playbooks, pricing breakdowns, and creator trends for Indian brands.
            </p>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Read the blog
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
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
                <h3 className="mt-1 text-lg font-semibold text-zinc-900 group-hover:text-brand-700">
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-600">{p.excerpt}</p>
                )}
                <span className="mt-4 text-sm font-semibold text-brand-700">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
