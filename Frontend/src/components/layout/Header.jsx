'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const isBrand = user?.role === 'BRAND';

  return (
    <header className="sticky top-0 z-40 pt-3 sm:pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact floating pill — narrower than the page content (max-w-5xl)
            so it visibly reads as a discrete floating nav, not a stretched bar. */}
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white/90 px-4 shadow-md backdrop-blur-lg sm:px-6">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-2.5 text-lg font-bold text-brand-800"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-base text-white shadow-sm">
              C
            </span>
            Collabhype
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-700 md:flex">
            <Link href="/packages" className="transition hover:text-brand-700">
              Packages
            </Link>
            <Link href="/influencers" className="transition hover:text-brand-700">
              Influencers
            </Link>
            <Link href="/how-it-works" className="transition hover:text-brand-700">
              How it works
            </Link>
            <Link href="/about" className="transition hover:text-brand-700">
              About
            </Link>
          </nav>

          <div className="flex flex-shrink-0 items-center gap-3">
            {!isLoading && user ? (
              <>
                {isBrand && (
                  <Link
                    href="/cart"
                    className="hidden text-sm font-medium text-zinc-700 transition hover:text-brand-700 sm:inline"
                  >
                    Cart
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="hidden text-sm font-medium text-zinc-700 transition hover:text-brand-700 sm:inline"
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
                  className="hidden text-sm font-medium text-zinc-700 transition hover:text-brand-700 sm:inline"
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
        </div>
      </div>
    </header>
  );
}
