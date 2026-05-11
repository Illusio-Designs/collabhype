import './globals.css';
import Script from 'next/script';
import LayoutChrome from '@/components/layout/LayoutChrome';
import { AuthProvider } from '@/components/auth/AuthProvider';
import SmoothScroll from '@/components/motion/SmoothScroll';
import { ToastProvider } from '@/components/ui/Toast';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import CookieConsent from '@/components/CookieConsent';

export const metadata = {
  title: 'Collabcreator — Influencer marketplace for India',
  description:
    'Buy curated influencer packages or build your own from a catalog of vetted creators. Self-serve influencer marketing with escrow-backed payments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SmoothScroll>
          <ToastProvider>
            <AuthProvider>
              <LayoutChrome>{children}</LayoutChrome>
            </AuthProvider>
          </ToastProvider>
        </SmoothScroll>

        {/* Analytics — fires after the user accepts cookies, no-op otherwise */}
        <PageViewTracker />
        <CookieConsent />

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
