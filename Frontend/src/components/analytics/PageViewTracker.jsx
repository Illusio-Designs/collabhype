'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

function Tracker() {
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    trackPageView(url);
  }, [pathname, sp]);

  // Re-fire on consent grant so the initial page view is captured if the
  // user accepts cookies AFTER the page already loaded.
  useEffect(() => {
    function onConsent(e) {
      if (e.detail === 'accepted') {
        const qs = sp?.toString();
        const url = qs ? `${pathname}?${qs}` : pathname;
        trackPageView(url);
      }
    }
    window.addEventListener('ch:consent-change', onConsent);
    return () => window.removeEventListener('ch:consent-change', onConsent);
  }, [pathname, sp]);

  return null;
}

export default function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
