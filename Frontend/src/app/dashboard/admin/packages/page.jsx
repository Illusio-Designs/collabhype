'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChevronRight } from 'lucide-react';
import { Badge, Button, Card, Spinner } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
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
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin' },
          { label: 'Packages' },
        ]}
        eyebrow="Platform admin"
        title="Packages"
        subtitle="Curated bundles shown to brands in the marketplace."
        action={<Button>+ New package</Button>}
      />

      <KpiStrip
        kpis={[
          { label: 'Total packs', value: String(DUMMY_PACKAGES.length) },
          {
            label: 'Active',
            value: String(DUMMY_PACKAGES.filter((p) => p.isActive).length),
          },
          {
            label: 'Total slots',
            value: formatCount(
              DUMMY_PACKAGES.reduce((s, p) => s + (p.influencerCount ?? 0), 0),
            ),
          },
          {
            label: 'Avg price',
            value: formatINR(
              DUMMY_PACKAGES.length
                ? DUMMY_PACKAGES.reduce((s, p) => s + Number(p.price ?? 0), 0) /
                    DUMMY_PACKAGES.length
                : 0,
            ),
          },
        ]}
      />

      <Card padding="none" className="overflow-hidden">
       <ScrollTable hintLabel="Scroll">
        <table className="min-w-full">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Title</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Tier</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Influencers</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Price</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Est. reach</th>
              <th className="px-3 py-3 sm:px-6" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {DUMMY_PACKAGES.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="px-3 py-3 sm:px-6">
                  <div className="font-medium text-zinc-900">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.niche?.name}</div>
                </td>
                <td className="px-3 py-3 sm:px-6">
                  <Badge variant="brand">{TIER_LABEL[p.tier]}</Badge>
                </td>
                <td className="px-3 py-3 sm:px-6 text-zinc-600">{p.influencerCount}</td>
                <td className="px-3 py-3 sm:px-6 font-semibold text-zinc-900">{formatINR(p.price)}</td>
                <td className="px-3 py-3 sm:px-6 text-zinc-600">{formatCount(p.estReach)}</td>
                <td className="whitespace-nowrap px-3 py-3 sm:px-6 text-right">
                  <Button size="sm" variant="outline" iconRight={<ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </ScrollTable>
      </Card>
    </div>
  );
}

