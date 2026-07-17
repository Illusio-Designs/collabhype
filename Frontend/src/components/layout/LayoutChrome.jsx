'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

// Hides the public Header + Footer on /dashboard routes so the dashboard
// can render its own full-height layout (sidebar + top bar).
export default function LayoutChrome({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return children;
  }

  return (
    <>
      <Header />
      {/* The header is fixed, so it no longer reserves space. Offset content by
          its height here; pages whose hero should sit behind it pull back up
          with -mt-header and re-apply pt-header to their own content. */}
      <main className="flex-1 pt-header">{children}</main>
      <Footer />
    </>
  );
}
