'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge, Button, Card, Spinner } from '@/components/ui';
import { formatINR, formatCount, TIER_LABEL } from '@/lib/format';
import { DUMMY_PACKAGES } from '@/lib/dummyData';

export default function AdminPackagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Platform admin</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Packages</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Curated bundles shown to brands in the marketplace.
          </p>
        </div>
        <Button>+ New package</Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Title</th>
              <th className="px-6 py-3 text-left font-semibold">Tier</th>
              <th className="px-6 py-3 text-left font-semibold">Influencers</th>
              <th className="px-6 py-3 text-left font-semibold">Price</th>
              <th className="px-6 py-3 text-left font-semibold">Est. reach</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {DUMMY_PACKAGES.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="px-6 py-3">
                  <div className="font-medium text-zinc-900">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.niche?.name}</div>
                </td>
                <td className="px-6 py-3">
                  <Badge variant="brand">{TIER_LABEL[p.tier]}</Badge>
                </td>
                <td className="px-6 py-3 text-zinc-600">{p.influencerCount}</td>
                <td className="px-6 py-3 font-semibold text-zinc-900">{formatINR(p.price)}</td>
                <td className="px-6 py-3 text-zinc-600">{formatCount(p.estReach)}</td>
                <td className="px-6 py-3 text-right">
                  <button className="text-xs font-medium text-brand-700 hover:underline">
                    Edit →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
