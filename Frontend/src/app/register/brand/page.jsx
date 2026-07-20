import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create a brand account — Collabhype',
  description:
    'Sign up as a brand to run influencer campaigns, buy curated creator packages, and pay securely through escrow.',
};

export default function RegisterBrandPage() {
  return <RegisterForm role="BRAND" />;
}
