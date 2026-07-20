import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetchSafe } from '@/lib/api';
import { Breadcrumb } from '@/components/ui';

export const dynamic = 'force-dynamic';

async function loadPost(slug) {
  const data = await apiFetchSafe(`/api/v1/blog/${slug}`, null);
  return data?.post ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: 'Blog — Collabhype' };
  return {
    title: `${post.seoTitle || post.title} — Collabhype`,
    description: post.seoDescription || post.excerpt || undefined,
    openGraph: post.coverImageUrl ? { images: [post.coverImageUrl] } : undefined,
  };
}

function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const tags = (post.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title },
          ]}
        />
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span>{fmtDate(post.publishedAt || post.createdAt)}</span>
          {post.authorName && (
            <>
              <span>·</span>
              <span>{post.authorName}</span>
            </>
          )}
        </div>
      </header>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="mt-8 w-full rounded-2xl object-cover"
        />
      )}

      <div
        className="blog-content mt-8"
        // Content is authored by trusted admins via the editor.
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />

      {tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-100 pt-6">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10">
        <Link href="/blog" className="text-sm font-semibold text-brand-700 hover:underline">
          ← Back to blog
        </Link>
      </div>

      <style>{`
        .blog-content { color: #3f3f46; line-height: 1.8; font-size: 1.05rem; }
        .blog-content h1, .blog-content h2, .blog-content h3 { color: #18181b; font-weight: 700; line-height: 1.3; margin: 1.6em 0 0.6em; }
        .blog-content h1 { font-size: 1.8rem; }
        .blog-content h2 { font-size: 1.5rem; }
        .blog-content h3 { font-size: 1.25rem; }
        .blog-content p { margin: 0 0 1.1em; }
        .blog-content a { color: #4338ca; text-decoration: underline; }
        .blog-content ul, .blog-content ol { margin: 0 0 1.1em 1.5em; }
        .blog-content ul { list-style: disc; }
        .blog-content ol { list-style: decimal; }
        .blog-content li { margin: 0.3em 0; }
        .blog-content img { border-radius: 0.75rem; margin: 1.2em 0; max-width: 100%; height: auto; }
        .blog-content blockquote { border-left: 4px solid #c7d2fe; padding-left: 1rem; color: #52525b; font-style: italic; margin: 1.2em 0; }
        .blog-content pre { background: #18181b; color: #f4f4f5; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; margin: 1.2em 0; }
        .blog-content code { font-family: ui-monospace, monospace; font-size: 0.9em; }
        .blog-content iframe { width: 100%; aspect-ratio: 16/9; border: 0; border-radius: 0.75rem; margin: 1.2em 0; }
      `}</style>
    </article>
  );
}
