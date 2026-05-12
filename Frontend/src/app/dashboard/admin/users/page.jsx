'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChevronRight } from 'lucide-react';
import { Avatar, Badge, Button, Card, Input, Spinner } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { DUMMY_ADMIN_USERS_LIST, DUMMY_PLATFORM_STATS } from '@/lib/dummyData';
import { formatCount } from '@/lib/format';

export default function AdminUsersPage() {
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
          { label: 'Users' },
        ]}
        eyebrow="Platform admin"
        title="Users"
        subtitle="Search, suspend, or manage every account."
        action={
          <div className="flex gap-2">
            <Input placeholder="Search users…" className="w-64" />
            <Button>Invite</Button>
          </div>
        }
      />

      <KpiStrip
        kpis={[
          { label: 'Total users', value: formatCount(DUMMY_PLATFORM_STATS.totalUsers) },
          { label: 'Brands', value: formatCount(DUMMY_PLATFORM_STATS.totalBrands) },
          { label: 'Creators', value: formatCount(DUMMY_PLATFORM_STATS.totalCreators) },
          { label: 'Signups (7d)', value: formatCount(DUMMY_PLATFORM_STATS.signupsThisWeek) },
        ]}
      />

      <Card padding="none" className="overflow-hidden">
       <ScrollTable hintLabel="Scroll">
        <table className="min-w-full">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">User</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Role</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Joined</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
              <th className="px-3 py-3 sm:px-6" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {DUMMY_ADMIN_USERS_LIST.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50">
                <td className="px-3 py-3 sm:px-6">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} size="sm" />
                    <div>
                      <div className="font-medium text-zinc-900">{u.fullName}</div>
                      <div className="text-xs text-zinc-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 sm:px-6">
                  <Badge variant={u.role === 'BRAND' ? 'brand' : u.role === 'INFLUENCER' ? 'info' : 'dark'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-3 py-3 sm:px-6 text-zinc-600">
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-3 py-3 sm:px-6">
                  <Badge variant={u.isActive ? 'success' : 'default'}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-3 sm:px-6 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    iconRight={<ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  >
                    Manage
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

