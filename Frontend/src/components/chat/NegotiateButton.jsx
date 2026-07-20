'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessagesSquare } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Button, useToast } from '@/components/ui';

// Shown on a Micro/Macro/Mega creator profile. Brands click to open (or start)
// a negotiation chat. Non-brands are routed to sign in as a brand.
export default function NegotiateButton({ influencerId, className }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  // Negotiation is a brand-only action, so the button is shown only to brands.
  if (!user || user.role !== 'BRAND') return null;

  async function start() {
    setBusy(true);
    try {
      const { data } = await apiClient.post('/api/v1/chat/conversations', { influencerId });
      router.push(`/dashboard/messages?c=${data.conversation.id}`);
    } catch (e) {
      // Consent required → go to messages which shows the consent gate.
      if (e?.response?.status === 403) {
        router.push('/dashboard/messages');
        return;
      }
      toast.push({ variant: 'danger', title: "Couldn't start chat", body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <Button variant="outline" onClick={start} loading={busy} className={className}>
        <MessagesSquare className="mr-2 h-4 w-4" />
        Negotiate rate
      </Button>
      <p className="mt-2 text-center text-xs text-zinc-500">Prefer a custom rate? Negotiate directly.</p>
    </div>
  );
}
