import { Breadcrumb } from '@/components/ui';
import { metadataForSlug } from '@/lib/content';

const FALLBACK_METADATA = {
  title: 'Terms of Service — Collabhype',
};

export function generateMetadata() {
  return metadataForSlug('terms', FALLBACK_METADATA);
}

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating an account or using Collabhype, you agree to these Terms and to our Privacy Policy (which you accept at registration). If you do not agree, you may not use the platform.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be 18 or older to use Collabhype. Brand accounts must represent a real business entity. Creator accounts must represent a real individual with an active social media presence. We verify follower counts and engagement directly from Instagram and YouTube via official OAuth — self-reported numbers are not accepted.',
  },
  {
    title: '3. Accounts and security',
    body: 'You are responsible for keeping your password and access credentials secure, and for all activity that occurs under your account. Notify us immediately of any unauthorized use.',
  },
  {
    title: '4. How Collabhype works',
    body: 'Brands buy bulk Nano packs (creators under 1K followers) or hand-pick Micro (1K–100K), Macro (100K–1M), and Mega (1M+) creators. When a Nano pack is purchased, matching creators are invited by niche and claim delivery slots until the pack is filled. Hand-picked creators are added to your booking at their published rate plus a platform fee. Every order is paid up front and tracked as a campaign.',
  },
  {
    title: '5. Payments, escrow and fees',
    body: 'Brands pay via Razorpay. Funds are held in escrow and are only released once the campaign\'s deliverables are approved and completed. Hand-picked creator bookings include a platform fee (currently 5%) that is shown to you at checkout before you pay. Creator payouts are issued to the UPI ID or bank account on file after approval. Prices are in INR and inclusive of applicable taxes unless stated otherwise.',
  },
  {
    title: '6. Messaging and on-platform communication',
    body: 'Micro, Macro, and Mega creators may message brands about rates through Collabhype\'s in-platform chat. All communication and payment must stay on the platform. Sharing or soliciting personal contact details — phone numbers, email addresses, external social handles, or links intended to move the conversation off-site — is strictly prohibited. Our systems automatically screen messages for this; repeated violations (three strikes) result in automatic account suspension. Attempting to take a transaction off-platform to avoid fees or escrow is a serious breach of these Terms.',
  },
  {
    title: '7. Briefs, shipping and delivery',
    body: 'Before a creator\'s delivery address is shared, the brand must send a brief describing the campaign and any product to be shipped. Creators agree to complete the deliverables they accept, on the agreed timeline, and to disclose paid partnerships as required by law.',
  },
  {
    title: '8. Content and deliverables',
    body: 'Creators retain ownership of original content, but grant brands a perpetual, royalty-free, worldwide license to use approved deliverables for marketing purposes. Nano packs include Content Rights as described on the pack. Creators must comply with applicable advertising disclosure laws (e.g. ASCI guidelines in India).',
  },
  {
    title: '9. Prohibited conduct',
    body: 'No fake followers, AI-generated audience inflation, hate speech, harassment, or content that violates third-party rights. Brands may not engage in deceptive marketing, bait-and-switch, or post requirements that breach platform policies. Neither party may circumvent Collabhype\'s payments, escrow, or fees.',
  },
  {
    title: '10. Disputes',
    body: 'For deliverable disputes, our team will mediate in good faith and may issue partial or full refunds from escrow based on evidence. Decisions are final unless overturned via formal arbitration in Rajkot, India.',
  },
  {
    title: '11. Termination',
    body: 'We may suspend or terminate accounts that violate these Terms — including automatic suspension for repeated contact-sharing. Either party may close their account at any time; outstanding obligations (pending payouts, active campaigns, escrow) survive termination.',
  },
  {
    title: '12. Limitation of liability',
    body: 'Collabhype is provided "as is." We are not liable for indirect, incidental, or consequential damages. Our aggregate liability is limited to the fees paid in the 12 months preceding a claim.',
  },
  {
    title: '13. Changes to these terms',
    body: 'We may update these Terms. We\'ll notify you via email or in-app for material changes. Continued use after changes constitutes acceptance.',
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Terms' }]} />
        </div>
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
