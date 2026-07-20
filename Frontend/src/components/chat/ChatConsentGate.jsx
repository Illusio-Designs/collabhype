'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { apiClient, apiError } from '@/lib/apiClient';
import { Button, Card, useToast } from '@/components/ui';

const RULES = [
  'Keep all communication on Collabhype — never share phone numbers, emails, or other contact details.',
  'Do not try to move the deal off-platform. Payments and delivery happen through Collabhype only.',
  'Negotiate rates here; the creator sends an offer and the brand adds it to booking.',
  'Sharing contact details is a policy violation and repeated attempts suspend your account.',
];

// Consent screen shown before a user can use negotiation chat. Records consent
// via POST /chat/consent.
export default function ChatConsentGate({ onAccepted }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    try {
      await apiClient.post('/api/v1/chat/consent');
      onAccepted?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card padding="lg" className="mx-auto max-w-xl">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">Before you start chatting</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Negotiation chat lets brands and creators agree rates directly. To keep everyone protected,
        please agree to the rules below.
      </p>
      <ul className="mt-4 space-y-2">
        {RULES.map((r) => (
          <li key={r} className="flex gap-2 text-sm text-zinc-700">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
            {r}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-zinc-500">
        See our{' '}
        <Link href="/privacy" target="_blank" className="font-medium text-brand-700 hover:underline">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/terms" target="_blank" className="font-medium text-brand-700 hover:underline">
          Terms
        </Link>
        .
      </p>
      <div className="mt-6">
        <Button onClick={accept} loading={busy}>
          I agree — start chatting
        </Button>
      </div>
    </Card>
  );
}
