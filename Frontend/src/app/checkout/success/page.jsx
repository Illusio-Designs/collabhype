'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';

function SuccessContent() {
  const sp = useSearchParams();
  const orderNum = sp.get('num') || '—';
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
        <Check className="h-8 w-8 text-green-600" strokeWidth={2.5} />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900">Payment received</h1>
      <p className="mt-3 text-zinc-600">
        Order <span className="font-mono font-medium text-zinc-900">{orderNum}</span> is confirmed.
        Campaign briefs have been dispatched to the creators.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/dashboard">
          <Button>Go to dashboard</Button>
        </Link>
        <Link href="/packages">
          <Button variant="outline">Browse more</Button>
        </Link>
      </div>
      <p className="mt-6 text-xs text-zinc-500">
        Funds are held in escrow. Released per deliverable after you approve.
      </p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-[40vh] place-items-center text-brand-700">
          <Spinner size="lg" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
