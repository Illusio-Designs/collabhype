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

  async function start() {
    if (!user) {
      router.push(`/login?next=/influencers`);
      return;
    }
    if (user.role !== 'BRAND') {
      toast.push({ variant: 'info', title: 'Brands only', body: 'Sign in as a brand to negotiate.' });
      return;
    }
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
    <Button variant="outline" onClick={start} loading={busy} className={className}>
      <MessagesSquare className="mr-2 h-4 w-4" />
      Negotiate rate
    </Button>
  );
}
