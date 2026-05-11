'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, Spinner } from '@/components/ui';

// ============================================================================
// Role-aware sidebar configurations
// ============================================================================

const NAV = {
  BRAND: [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Overview', icon: GridIcon, exact: true },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: ClipboardIcon, badge: '12' },
        { href: '/dashboard/orders', label: 'Orders', icon: ReceiptIcon },
        { href: '/cart', label: 'Cart', icon: CartIcon },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/profile', label: 'Brand profile', icon: BuildingIcon },
        { href: '/dashboard/notifications', label: 'Notifications', icon: BellIcon, dot: true },
        { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
      ],
    },
  ],
  INFLUENCER: [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Overview', icon: GridIcon, exact: true },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: ClipboardIcon, badge: '3' },
        { href: '/dashboard/payouts', label: 'Payouts', icon: CashIcon },
      ],
    },
    {
      label: 'Creator setup',
      items: [
        { href: '/dashboard/profile', label: 'Profile', icon: UserIcon },
        { href: '/dashboard/socials', label: 'Connect socials', icon: LinkIcon },
        { href: '/dashboard/rates', label: 'Rate card', icon: WalletIcon },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/notifications', label: 'Notifications', icon: BellIcon, dot: true },
        { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
      ],
    },
  ],
  ADMIN: [
    {
      label: 'Platform',
      items: [
        { href: '/dashboard', label: 'Overview', icon: GridIcon, exact: true },
        { href: '/dashboard/admin/users', label: 'Users', icon: UsersIcon, badge: '1.2K' },
        { href: '/dashboard/admin/packages', label: 'Packages', icon: PackageIcon },
        { href: '/dashboard/admin/orders', label: 'All orders', icon: ReceiptIcon },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { href: '/dashboard/admin/content', label: 'SEO & content', icon: DocIcon },
        { href: '/dashboard/admin/tracking', label: 'Tracking', icon: ChartIcon },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/notifications', label: 'Notifications', icon: BellIcon, dot: true },
        { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
      ],
    },
  ],
};

// ============================================================================
// Layout
// ============================================================================

export default function DashboardLayout({ children }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace(`/login?next=${pathname}`);
  }, [isLoading, user, router, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="grid h-screen place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  const nav = NAV[user.role] ?? NAV.BRAND;
  const roleLabel =
    user.role === 'BRAND' ? 'Brand' : user.role === 'INFLUENCER' ? 'Creator' : 'Admin';

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar
        nav={nav}
        pathname={pathname}
        user={user}
        roleLabel={roleLabel}
        onLogout={logout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          user={user}
          roleLabel={roleLabel}
          onMobileMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

// ============================================================================
// Sidebar
// ============================================================================

function Sidebar({ nav, pathname, user, roleLabel, onLogout, mobileOpen, onMobileClose }) {
  const content = (
    <div className="flex h-full w-72 flex-col border-r border-zinc-200 bg-gradient-to-b from-rose-50/60 via-pink-50/40 to-violet-50/40 p-4">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-lg font-bold text-brand-800 transition hover:bg-white/60"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white shadow-sm">
          C
        </span>
        Collabcreator
      </Link>

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {nav.map((section) => (
          <div key={section.label}>
            <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              {section.label}
            </div>
            <div className="mt-2 space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={clsx(
                      'flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-white text-brand-700 shadow-sm ring-1 ring-zinc-100'
                        : 'text-zinc-600 hover:bg-white/60 hover:text-zinc-900',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={clsx(
                          'h-4 w-4 flex-shrink-0',
                          isActive ? 'text-brand-600' : 'text-zinc-400',
                        )}
                      />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          isActive ? 'bg-brand-100 text-brand-700' : 'bg-zinc-100 text-zinc-600',
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.dot && !item.badge && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-zinc-950 p-3 text-white">
        <Avatar name={user.fullName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{user.fullName}</div>
          <div className="truncate text-[11px] text-zinc-400">
            {roleLabel} · {user.email}
          </div>
        </div>
        <button
          onClick={onLogout}
          className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
          title="Sign out"
        >
          <SignOutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-shrink-0 lg:flex">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative h-full">{content}</aside>
        </div>
      )}
    </>
  );
}

// ============================================================================
// Top bar
// ============================================================================

function TopBar({ user, onMobileMenu }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-lg">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenu}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div>
            <div className="text-xs text-zinc-500">Welcome,</div>
            <div className="text-sm font-bold text-zinc-900 sm:text-base">{user.fullName}</div>
          </div>
        </div>

        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Find something…"
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-12 text-sm transition placeholder:text-zinc-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
            title="Help"
            aria-label="Help"
          >
            <HelpIcon className="h-4 w-4" />
          </button>
          <Link
            href="/dashboard/notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
            title="Notifications"
            aria-label="Notifications"
          >
            <BellIcon className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// Icons
// ============================================================================

function GridIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function UserIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0114 0" strokeLinecap="round" />
      <circle cx="17" cy="9" r="3" />
      <path d="M14.5 14a5 5 0 017.5 4.5" strokeLinecap="round" />
    </svg>
  );
}
function BuildingIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" strokeLinecap="round" />
    </svg>
  );
}
function LinkIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function WalletIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M16 13h2" strokeLinecap="round" />
    </svg>
  );
}
function ClipboardIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4h6v3H9z" strokeLinejoin="round" />
    </svg>
  );
}
function CashIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function ReceiptIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 2v20l3-2 3 2 3-2 3 2 3-2V2H5z" strokeLinejoin="round" />
      <path d="M9 7h6M9 11h6M9 15h4" strokeLinecap="round" />
    </svg>
  );
}
function CartIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5h2l3 11h10l3-8H7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}
function PackageIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M3 7l9-4 9 4M3 7v10l9 4m-9-14l9 4m0 0v14m0-14l9-4m-9 18l9-4V7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BellIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 003.4 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CogIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SignOutIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DocIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChartIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15l3-4 4 2 5-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MenuIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m17 17 4 4" strokeLinecap="round" />
    </svg>
  );
}
function HelpIcon(p) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path
        d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
