'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { getConsent, setConsent } from '@/lib/analytics';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!getConsent()) {
      // Small delay so the banner doesn't fight with the initial render.
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    setConsent('accepted');
    setShow(false);
  }

  function decline() {
    setConsent('declined');
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl sm:inset-x-4 sm:bottom-4"
        >
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
              <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-brand-50 text-2xl">
                🍪
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-semibold text-zinc-900">We use cookies</div>
                <p className="mt-1 leading-6 text-zinc-600">
                  We use essential cookies to keep you signed in. With your consent we also use
                  analytics cookies to understand how the product is used.{' '}
                  <Link href="/privacy" className="font-medium text-brand-700 hover:underline">
                    Read our policy →
                  </Link>
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={decline}>
                  Decline
                </Button>
                <Button size="sm" onClick={accept}>
                  Accept all
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
