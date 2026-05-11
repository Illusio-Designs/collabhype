'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

const NAV_LINKS = [
  { href: '/packages', label: 'Packages' },
  { href: '/influencers', label: 'Influencers' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const isBrand = user?.role === 'BRAND';
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll when the menu is open so the underlying page doesn't move.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 pt-3 sm:pt-4">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 px-3 shadow-md backdrop-blur-lg sm:h-16 sm:px-6">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-2 text-base font-bold text-brand-800 sm:gap-2.5 sm:text-lg"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-700 text-sm text-white shadow-sm sm:h-9 sm:w-9 sm:text-base">
              C
            </span>
            <span className="hidden xs:inline sm:inline">Collabhype</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-700 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-brand-700">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster — desktop */}
          <div className="hidden flex-shrink-0 items-center gap-3 md:flex">
            {!isLoading && user ? (
              <>
                {isBrand && (
                  <Link
                    href="/cart"
                    className="text-sm font-medium text-zinc-700 transition hover:text-brand-700"
                  >
                    Cart
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-700 transition hover:text-brand-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-700 transition hover:text-brand-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-10 w-10 place-items-center rounded-xl text-zinc-700 transition hover:bg-zinc-100 md:hidden"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — overlay + panel */}
      {open && (
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
            className="fixed inset-0 z-30 bg-zinc-900/30 backdrop-blur-sm"
          />
          <div
            id="mobile-menu"
            className="fixed inset-x-3 top-20 z-40 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-zinc-800 transition hover:bg-zinc-50 hover:text-brand-700"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 border-t border-zinc-100" />
              {!isLoading && user ? (
                <>
                  {isBrand && (
                    <Link
                      href="/cart"
                      className="rounded-lg px-3 py-2.5 text-base font-medium text-zinc-800 transition hover:bg-zinc-50 hover:text-brand-700"
                    >
                      Cart
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-zinc-800 transition hover:bg-zinc-50 hover:text-brand-700"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-zinc-800 transition hover:bg-zinc-50 hover:text-brand-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="mt-2 rounded-full bg-brand-700 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
                  >
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
