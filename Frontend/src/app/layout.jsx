import './globals.css';
import Script from 'next/script';
import { Jost } from 'next/font/google';
import LayoutChrome from '@/components/layout/LayoutChrome';
import { AuthProvider } from '@/components/auth/AuthProvider';
import SmoothScroll from '@/components/motion/SmoothScroll';
import { ToastProvider } from '@/components/ui/Toast';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import CookieConsent from '@/components/CookieConsent';

// AvantGarde-inspired geometric sans. Jost ships free + open source.
const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata = {
  title: 'Collabhype — Influencer marketplace for India',
  description:
    'Buy curated influencer packages or build your own from a catalog of vetted creators. Self-serve influencer marketing with escrow-backed payments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
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
