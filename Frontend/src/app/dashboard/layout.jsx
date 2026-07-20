'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  Award,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  SlidersHorizontal,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Link as LinkIconLucide,
  LogOut,
  Menu,
  MessagesSquare,
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
import { apiClient } from '@/lib/apiClient';
import { Avatar, Spinner, Tooltip } from '@/components/ui';

// ============================================================================
// Role-aware sidebar configurations
// ============================================================================

// Nav is static config; live counters (unread notifications) are layered on at
// render time from real API data — never hardcoded here.
const NAV = {
  BRAND: [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: ClipboardList },
        { href: '/dashboard/messages', label: 'Messages', icon: MessagesSquare },
        { href: '/dashboard/orders', label: 'Orders', icon: Receipt },
        { href: '/cart', label: 'Cart', icon: ShoppingCart },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/profile', label: 'Brand profile', icon: Building2 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
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
        { href: '/dashboard/tasks', label: 'Tasks', icon: ClipboardList },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: ClipboardList },
        { href: '/dashboard/messages', label: 'Messages', icon: MessagesSquare },
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
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
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
        { href: '/dashboard/admin/users', label: 'Users', icon: Users },
        { href: '/dashboard/admin/creators', label: 'Creators & badges', icon: Award },
        { href: '/dashboard/admin/packages', label: 'Packages', icon: Package },
        { href: '/dashboard/admin/orders', label: 'All orders', icon: Receipt },
        { href: '/dashboard/admin/payouts', label: 'Payouts', icon: Wallet },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { href: '/dashboard/admin/blog', label: 'Blog', icon: FileText },
        { href: '/dashboard/admin/content', label: 'SEO & content', icon: ClipboardList },
        { href: '/dashboard/admin/tracking', label: 'Tracking', icon: LineChart },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { href: '/dashboard/admin/settings', label: 'Platform settings', icon: SlidersHorizontal },
      ],
    },
    {
      label: 'Support',
      items: [
        { href: '/dashboard/admin/support', label: 'Support queue', icon: LifeBuoy },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
};

// The one live counter the sidebar/topbar surface: unread notifications.
const NOTIFICATIONS_HREF = '/dashboard/notifications';

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
  const [unreadCount, setUnreadCount] = useState(0);

  // Real unread-notification count drives the bell/sidebar dot — no dot when 0.
  // Re-fetches on navigation and whenever the notifications page marks items
  // read (via the 'ch:notifications-updated' event), so the badge updates live.
  useEffect(() => {
    if (!user) return;
    let active = true;
    const refetch = () => {
      apiClient
        .get('/api/v1/notifications', { params: { limit: 1 } })
        .then((res) => active && setUnreadCount(res.data.unreadCount ?? 0))
        .catch(() => active && setUnreadCount(0));
    };
    refetch();
    window.addEventListener('ch:notifications-updated', refetch);
    return () => {
      active = false;
      window.removeEventListener('ch:notifications-updated', refetch);
    };
  }, [user, pathname]);

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
        unreadCount={unreadCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          user={user}
          roleLabel={roleLabel}
          onMobileMenu={() => setMobileOpen(true)}
          unreadCount={unreadCount}
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
  unreadCount = 0,
}) {
  // Collapsible nav groups (dropdown/accordion) — keyed by section label.
  const [closedGroups, setClosedGroups] = useState({});
  const toggleGroup = (label) => setClosedGroups((g) => ({ ...g, [label]: !g[label] }));

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
          {isCollapsed ? (
            <Image
              src="/logo-mark.png"
              alt="Collabhype"
              width={512}
              height={512}
              className="h-9 w-9 flex-shrink-0"
            />
          ) : (
            <Image
              src="/logo.png"
              alt="Collabhype"
              width={1967}
              height={480}
              className="h-8 w-auto"
            />
          )}
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
        {nav.map((section) => {
          const closed = !isCollapsed && closedGroups[section.label];
          return (
          <div key={section.label}>
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(section.label)}
                className="flex w-full items-center justify-between rounded-md px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-800/70 transition hover:text-brand-900"
              >
                {section.label}
                <ChevronDown
                  className={clsx('h-3.5 w-3.5 transition-transform', closed && '-rotate-90')}
                />
              </button>
            )}
            <div
              className={clsx('space-y-0.5', isCollapsed ? 'mt-0' : 'mt-2', closed && 'hidden')}
            >
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                // Only the notifications item shows a dot, and only when there
                // are genuinely unread notifications.
                const showDot = item.href === NOTIFICATIONS_HREF && unreadCount > 0;
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
                    {!isCollapsed && showDot && (
                      <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {/* Dot indicator when collapsed but there are unread items */}
                    {isCollapsed && showDot && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
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

function TopBar({ user, onMobileMenu, unreadCount = 0 }) {
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
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

