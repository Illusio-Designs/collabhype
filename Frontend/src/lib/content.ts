import type { Metadata } from 'next';
import { API_BASE } from './api';

// =============================================================================
// CMS-driven page content. The backend exposes SEO metadata + optional body
// per slug at GET /api/v1/content/:slug. Marketing pages opt into it via
// `metadataForSlug`, falling back to their hard-coded metadata when the entry
// is missing/unpublished or the backend is unreachable.
// =============================================================================

export interface PageContent {
  slug: string;
  title?: string | null;
  description?: string | null;
  ogImageUrl?: string | null;
  body?: string | null;
  isPublished?: boolean;
}

// Cached at the edge with ISR (revalidate every 5 min) rather than `no-store`,
// so marketing pages stay static/ISR and don't call the CMS on every request.
export async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/content/${slug}`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: PageContent | null };
    return data?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Build Next.js `Metadata` for a slug, preferring CMS values and filling any
 * gap with the page's own fallback. Safe to call from `generateMetadata` — it
 * never throws and never blocks rendering if the CMS is down.
 */
export async function metadataForSlug(slug: string, fallback: Metadata): Promise<Metadata> {
  const content = await getPageContent(slug);
  if (!content) return fallback;

  const title = content.title || fallback.title;
  const description = content.description || fallback.description;
  const ogImages = content.ogImageUrl ? [{ url: content.ogImageUrl }] : undefined;

  return {
    ...fallback,
    title,
    description,
    openGraph: {
      ...(fallback.openGraph ?? {}),
      title: title ?? undefined,
      description: description ?? undefined,
      ...(ogImages ? { images: ogImages } : {}),
    },
  };
}
