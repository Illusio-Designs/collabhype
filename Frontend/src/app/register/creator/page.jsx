import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create a creator account — Collabhype',
  description:
    'Sign up as a creator to set your own rates, get booked by brands, and receive escrow-protected payouts via UPI.',
};

export default function RegisterCreatorPage() {
  return <RegisterForm role="INFLUENCER" />;
}
