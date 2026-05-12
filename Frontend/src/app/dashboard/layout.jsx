'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Link as LinkIconLucide,
  LogOut,
  Menu,
  Package,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, Spinner, Tooltip } from '@/components/ui';

// ============================================================================
// Role-aware sidebar configurations
// ============================================================================

const NAV = {
  BRAND: [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: ClipboardList, badge: '12' },
        { href: '/dashboard/orders', label: 'Orders', icon: Receipt },
        { href: '/cart', label: 'Cart', icon: ShoppingCart },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/profile', label: 'Brand profile', icon: Building2 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, dot: true },
        { href: '/dashboard/support', label: 'Help & disputes', icon: LifeBuoy },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
  INFLUENCER: [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: ClipboardList, badge: '3' },
        { href: '/dashboard/payouts', label: 'Payouts', icon: Wallet },
      ],
    },
    {
      label: 'Creator setup',
      items: [
        { href: '/dashboard/profile', label: 'Profile', icon: User },
        { href: '/dashboard/socials', label: 'Connect socials', icon: LinkIconLucide },
        { href: '/dashboard/rates', label: 'Rate card', icon: Wallet },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, dot: true },
        { href: '/dashboard/support', label: 'Help & disputes', icon: LifeBuoy },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
  ADMIN: [
    {
      label: 'Platform',
      items: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/dashboard/admin/users', label: 'Users', icon: Users, badge: '1.2K' },
        { href: '/dashboard/admin/packages', label: 'Packages', icon: Package },
        { href: '/dashboard/admin/orders', label: 'All orders', icon: Receipt },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { href: '/dashboard/admin/content', label: 'SEO & content', icon: ClipboardList },
        { href: '/dashboard/admin/tracking', label: 'Tracking', icon: LineChart },
      ],
    },
    {
      label: 'Support',
      items: [
        { href: '/dashboard/admin/support', label: 'Support queue', icon: LifeBuoy, dot: true },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, dot: true },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
};

// ============================================================================
// Layout
// ============================================================================

const COLLAPSED_KEY = 'ch_dashboard_sidebar_collapsed';

export default function DashboardLayout({ children }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Hydrate the collapsed flag from localStorage so the layout doesn't
  // visually jump on every reload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === '1');
  }, []);

  useEffect(() => {
    if (!isLoading && !user) router.replace(`/login?next=${pathname}`);
  }, [isLoading, user, router, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      }
      return next;
    });
  };

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
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
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

function Sidebar({
  nav,
  pathname,
  user,
  roleLabel,
  onLogout,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
}) {
  // `collapsed` only applies to the desktop sticky sidebar. The mobile drawer
  // always renders fully expanded since screen space is already constrained.
  // `isMobile` flag toggles the visible close button inside the drawer.
  const renderContent = (isCollapsed, isMobile = false) => (
    <div
      className={clsx(
        'flex h-full flex-col border-r border-zinc-200 bg-gradient-to-b from-brand-50 via-brand-100 to-brand-200 p-4 transition-[width] duration-200',
        isCollapsed ? 'w-20 items-center' : 'w-72',
      )}
    >
      <div className={clsx('flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
        <Link
          href="/"
          className={clsx(
            'flex items-center gap-2.5 rounded-xl px-2 py-2 text-lg font-bold text-brand-800 transition hover:bg-white/60',
            isCollapsed && 'px-1',
          )}
          title="Collabhype"
        >
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-brand-700 text-white shadow-sm">
            C
          </span>
          {!isCollapsed && <span>Collabhype</span>}
        </Link>
        {/* Close button — mobile only, always visible at the top of the drawer */}
        {isMobile && (
          <button
            type="button"
            onClick={onMobileClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-brand-800 transition hover:bg-white/70 hover:text-brand-900"
            aria-label="Close menu"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {/* Collapse toggle — desktop only */}
        {!isMobile && !isCollapsed && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden h-8 w-8 place-items-center rounded-lg text-brand-800/80 transition hover:bg-white/70 hover:text-brand-900 lg:grid"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isMobile && isCollapsed && onToggleCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mt-3 hidden h-8 w-8 place-items-center rounded-lg text-brand-800/80 transition hover:bg-white/70 hover:text-brand-900 lg:grid"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {nav.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-800/70">
                {section.label}
              </div>
            )}
            <div className={clsx('space-y-0.5', isCollapsed ? 'mt-0' : 'mt-2')}>
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
                    title={isCollapsed ? item.label : undefined}
                    className={clsx(
                      'group relative flex items-center rounded-xl text-sm font-medium transition',
                      isCollapsed
                        ? 'h-10 w-10 justify-center'
                        : 'justify-between gap-3 px-3 py-2',
                      isActive
                        ? 'bg-white text-brand-800 shadow-sm ring-1 ring-brand-100'
                        : 'text-brand-900/80 hover:bg-white/70 hover:text-brand-900',
                    )}
                  >
                    <span className={clsx('flex items-center', isCollapsed ? '' : 'gap-3')}>
                      <Icon
                        className={clsx(
                          'h-4 w-4 flex-shrink-0',
                          isActive ? 'text-brand-700' : 'text-brand-800/70',
                        )}
                      />
                      {!isCollapsed && item.label}
                    </span>
                    {!isCollapsed && item.badge && (
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          isActive ? 'bg-brand-100 text-brand-800' : 'bg-white/70 text-brand-800',
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {!isCollapsed && item.dot && !item.badge && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                    {/* Dot indicator when collapsed but the item has a notification */}
                    {isCollapsed && item.dot && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={clsx(
          'mt-6 flex items-center rounded-2xl bg-zinc-950 text-white',
          isCollapsed ? 'h-12 w-12 justify-center' : 'gap-3 p-3',
        )}
      >
        <Avatar name={user.fullName} size={isCollapsed ? 'sm' : 'md'} />
        {!isCollapsed && (
          <>
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
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={onLogout}
          className="mt-2 grid h-9 w-9 place-items-center rounded-lg text-brand-800/80 transition hover:bg-white/70 hover:text-brand-900"
          title="Sign out"
          aria-label="Sign out"
        >
          <SignOutIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-shrink-0 lg:flex">
        {renderContent(collapsed, false)}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative h-full">{renderContent(false, true)}</aside>
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
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="text-xs text-zinc-500">Welcome,</div>
            <div className="text-sm font-bold text-zinc-900 sm:text-base">{user.fullName}</div>
          </div>
        </div>

        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
            <HelpCircle className="h-4 w-4" />
          </button>
          <Link
            href="/dashboard/notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Link>
        </div>
      </div>
    </header>
  );
}

