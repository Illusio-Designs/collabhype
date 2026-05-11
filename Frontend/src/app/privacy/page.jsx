export const metadata = {
  title: 'Privacy Policy — Collabhype',
};

const SECTIONS = [
  {
    title: '1. What we collect',
    body: 'We collect account information (name, email, phone), payment information (via Razorpay, we never store full card numbers), social account metadata (followers, engagement) when you connect Instagram/YouTube via OAuth, and basic device + usage data (IP address, browser, pages visited).',
  },
  {
    title: '2. How we use it',
    body: 'To operate the platform — show creators to brands, brands to creators, process payments, send campaign notifications, and improve the product. We never sell your data.',
  },
  {
    title: '3. Social account tokens',
    body: 'OAuth tokens for Instagram and YouTube are encrypted at rest with AES-256-GCM. We only read profile + recent post statistics — we never post on your behalf or read your DMs.',
  },
  {
    title: '4. Cookies',
    body: 'We use essential cookies for authentication. We do not use third-party advertising cookies or cross-site trackers.',
  },
  {
    title: '5. Sharing with third parties',
    body: 'We share data only with: Razorpay (for payments), Meta and Google (for the OAuth flow you initiate), and email service providers (for transactional emails). These vendors are contractually bound to protect your data.',
  },
  {
    title: '6. Data retention',
    body: 'We retain account data while your account is active. After closure, we retain transactional records for 7 years to comply with tax law, and delete the rest within 90 days.',
  },
  {
    title: '7. Your rights',
    body: 'You can access, export, correct, or delete your personal data at any time from your dashboard or by emailing us. We respond to verified requests within 30 days.',
  },
  {
    title: '8. Children',
    body: 'Collabhype is not for users under 18. If we discover a minor has signed up, we will remove the account.',
  },
  {
    title: '9. Security',
    body: 'Passwords are hashed with bcrypt. Tokens are encrypted. All traffic is over TLS. We follow industry best practices but no system is 100% secure — please use a strong, unique password.',
  },
  {
    title: '10. Changes',
    body: 'If we materially change this policy we will notify you. Minor edits are reflected here with an updated "Last updated" date.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
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
