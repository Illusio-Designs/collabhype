'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-zinc-50 pb-2 pt-6">
      {/* Giant watermark of the brand name behind the footer card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
      >
        <div
          className="text-center font-black tracking-tighter text-zinc-200/70"
          style={{ fontSize: 'clamp(72px, 17vw, 260px)', lineHeight: 0.85 }}
        >
          Collabcreator
        </div>
      </div>

      {/* The footer card itself */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-10 md:grid-cols-[1.2fr,2fr]">
            {/* ===== Left: brand + tagline + socials ===== */}
            <div>
              <div className="flex items-center gap-2 text-xl font-bold text-brand-800">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-white">
                  C
                </span>
                Collabcreator
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">
                Helping marketers run influencer campaigns at scale — curated creators,
                escrow-backed payments, in-app briefs.
              </p>
              <div className="mt-6 flex items-center gap-4 text-zinc-500">
                <a
                  href="#"
                  aria-label="X (formerly Twitter)"
                  className="transition hover:text-brand-700"
                >
                  <XIcon />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="transition hover:text-brand-700"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="transition hover:text-brand-700"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="transition hover:text-brand-700"
                >
                  <YouTubeIcon />
                </a>
              </div>
            </div>

            {/* ===== Right: nav columns ===== */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <FooterColumn
                title="For Brands"
                links={[
                  { href: '/packages', label: 'Packages' },
                  { href: '/influencers', label: 'Creators' },
                  { href: '/how-it-works', label: 'How it works' },
                  { href: '/register?role=brand', label: 'Sign up' },
                ]}
              />
              <FooterColumn
                title="For Creators"
                links={[
                  { href: '/register?role=influencer', label: 'Join' },
                  { href: '/login', label: 'Sign in' },
                  { href: '/dashboard/payouts', label: 'Payouts' },
                  { href: '/dashboard/rates', label: 'Rate card' },
                ]}
              />
              <FooterColumn
                title="Company"
                links={[
                  { href: '/about', label: 'About' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/ui-kit', label: 'UI kit' },
                ]}
              />
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-6 text-xs text-zinc-500 sm:flex-row">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div>© {new Date().getFullYear()} Collabcreator. All rights reserved.</div>
              <div className="text-[11px] text-zinc-400">
                Managed by{' '}
                <span className="font-semibold text-zinc-700">Finvera Solution LLP</span>
              </div>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-zinc-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-zinc-900">
                Terms of Service
              </Link>
              <a href="#" className="hover:text-zinc-900">
                Cookies
              </a>
            </div>
          </div>
        </div>

        {/* Spacer so the watermark text peeks below the card a bit */}
        <div className="h-24 sm:h-32 lg:h-40" />
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-zinc-600 transition hover:text-brand-700">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22zm7.78 0h4.37v2h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v7.36h-4.56v-6.53c0-1.56-.03-3.56-2.17-3.56-2.17 0-2.5 1.7-2.5 3.45V22H8z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.6 4.6 12 4.6 12 4.6s-7.6 0-9.4.5A3 3 0 0 0 .5 7.2C0 9 0 12 0 12s0 3 .5 4.8A3 3 0 0 0 2.6 18.9c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.6 15.5V8.5L15.8 12z" />
    </svg>
  );
}
