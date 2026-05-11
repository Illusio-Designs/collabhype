'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, Badge, Button, Card, Input, Spinner } from '@/components/ui';
import { DUMMY_ADMIN_USERS_LIST } from '@/lib/dummyData';

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Platform admin</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Users</h1>
          <p className="mt-1 text-sm text-zinc-600">Search, suspend, or manage every account.</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search users…" className="w-64" />
          <Button>Invite</Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
       <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">User</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Joined</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {DUMMY_ADMIN_USERS_LIST.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} size="sm" />
                    <div>
                      <div className="font-medium text-zinc-900">{u.fullName}</div>
                      <div className="text-xs text-zinc-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <Badge variant={u.role === 'BRAND' ? 'brand' : u.role === 'INFLUENCER' ? 'info' : 'dark'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-6 py-3 text-zinc-600">
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-3">
                  <Badge variant={u.isActive ? 'success' : 'default'}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="text-xs font-medium text-brand-700 hover:underline">
                    Manage →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
      </Card>
    </div>
  );
}
