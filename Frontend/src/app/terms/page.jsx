export const metadata = {
  title: 'Terms of Service — Collabhype',
};

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating an account or using Collabhype, you agree to these Terms. If you do not agree, you may not use the platform.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be 18 or older to use Collabhype. Brand accounts must represent a real business entity. Creator accounts must represent a real individual with an active social media presence.',
  },
  {
    title: '3. Accounts and security',
    body: 'You are responsible for keeping your password and access credentials secure, and for all activity that occurs under your account. Notify us immediately of any unauthorized use.',
  },
  {
    title: '4. Payments and escrow',
    body: 'Brands pay via Razorpay. Funds are held in escrow until deliverables are approved. Payouts to creators are issued via Razorpay Payouts to the bank account or UPI ID on file. Platform fees, if any, are disclosed at checkout.',
  },
  {
    title: '5. Content and deliverables',
    body: 'Creators retain ownership of original content, but grant brands a perpetual, royalty-free, worldwide license to use approved deliverables for marketing purposes. Creators must comply with applicable advertising disclosure laws (e.g. ASCI guidelines in India).',
  },
  {
    title: '6. Prohibited conduct',
    body: 'No fake followers, AI-generated audience inflation, hate speech, harassment, or content that violates third-party rights. Brands may not engage in deceptive marketing, bait-and-switch, or post requirements that breach platform policies.',
  },
  {
    title: '7. Disputes',
    body: 'For deliverable disputes, our team will mediate in good faith and may issue partial or full refunds based on evidence. Decisions are final unless overturned via formal arbitration in Mumbai, India.',
  },
  {
    title: '8. Termination',
    body: 'We may suspend or terminate accounts that violate these Terms. Either party may close their account at any time; outstanding obligations (pending payouts, active campaigns) survive termination.',
  },
  {
    title: '9. Limitation of liability',
    body: 'Collabhype is provided "as is." We are not liable for indirect, incidental, or consequential damages. Our aggregate liability is limited to the fees paid in the 12 months preceding a claim.',
  },
  {
    title: '10. Changes to these terms',
    body: 'We may update these Terms. We\'ll notify you via email or in-app for material changes. Continued use after changes constitutes acceptance.',
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">Terms of Service</h1>
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
          Questions about these Terms? Email{' '}
          <a className="text-brand-700 hover:underline" href="mailto:legal@collabhype.in">
            legal@collabhype.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}
