import { metadataForSlug } from '@/lib/content';

// The contact page is a client component (form state), so its SEO metadata
// lives here in a server-component layout, CMS-driven with a fallback.
export async function generateMetadata() {
  return metadataForSlug('contact', {
    title: 'Contact — Collabhype',
    description: "Questions, partnerships, or press — we'll reply within one business day.",
  });
}

export default function ContactLayout({ children }) {
  return children;
}
