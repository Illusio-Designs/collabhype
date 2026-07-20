import { Breadcrumb } from '@/components/ui';
import { metadataForSlug } from '@/lib/content';

const FALLBACK_METADATA = {
  title: 'Privacy Policy — Collabhype',
};

export function generateMetadata() {
  return metadataForSlug('privacy', FALLBACK_METADATA);
}

const SECTIONS = [
  {
    title: '1. What we collect',
    body: 'Account information (name, email, phone); creator profile details (bio, city, niches, rate cards, and — once a brief is sent — the shipping address and pincode you provide for product delivery); payment information via Razorpay (we never store full card numbers); social account metadata (followers, engagement) when you connect Instagram/YouTube via OAuth; in-platform chat messages; and basic device + usage data (IP address, browser, pages and actions).',
  },
  {
    title: '2. How we use it',
    body: 'To operate the platform — match creators and brands, process escrow payments and payouts, send campaign and message notifications, enforce our policies, and improve the product. We never sell your data or use it for third-party advertising.',
  },
  {
    title: '3. In-platform messages',
    body: 'Messaging happens in Collabhype chat. To enforce our no-contact-sharing policy, our systems automatically screen message content for personal contact details (phone numbers, emails, external handles, off-site links). This screening is used only for policy enforcement and platform safety — not for advertising, and we do not sell it.',
  },
  {
    title: '4. Social account tokens',
    body: 'OAuth tokens for Instagram and YouTube are encrypted at rest. We only read profile and recent post statistics — we never post on your behalf or read your DMs.',
  },
  {
    title: '5. Cookies and analytics',
    body: 'We use essential cookies for authentication. Product analytics (which pages and actions you use) are only recorded after you accept cookies via our cookie banner, and are attributed to your account only while you are signed in. We do not use third-party advertising cookies or cross-site trackers.',
  },
  {
    title: '6. Sharing with third parties',
    body: 'We share data only with: Razorpay (for payments and payouts), Meta and Google (for the OAuth flow you initiate), and email service providers (for transactional emails). Brands and creators see the limited profile and delivery information needed to run a campaign. These vendors are contractually bound to protect your data.',
  },
  {
    title: '7. Data retention',
    body: 'We retain account data while your account is active. After closure, we retain transactional records for 7 years to comply with tax law, and delete the rest within 90 days.',
  },
  {
    title: '8. Your rights',
    body: 'You can access, export, correct, or delete your personal data at any time from your dashboard or by emailing us. We respond to verified requests within 30 days.',
  },
  {
    title: '9. Children',
    body: 'Collabhype is not for users under 18. If we discover a minor has signed up, we will remove the account.',
  },
  {
    title: '10. Security',
    body: 'Passwords are hashed with bcrypt. Tokens are encrypted. All traffic is over TLS. We follow industry best practices but no system is 100% secure — please use a strong, unique password.',
  },
  {
    title: '11. Changes',
    body: 'If we materially change this policy we will notify you. Minor edits are reflected here with an updated "Last updated" date.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]} />
        </div>
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: May 11, 2026</p>

        <div className="mt-10 space-y-8 text-zinc-700 leading-7">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-zinc-900">{s.title}</h2>
              <p className="mt-2 text-zinc-600">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-500">
          Privacy questions? Email{' '}
          <a className="text-brand-700 hover:underline" href="mailto:privacy@collabhype.in">
            privacy@collabhype.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}
