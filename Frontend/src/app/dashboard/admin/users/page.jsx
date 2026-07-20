'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Pagination,
  Select,
  Spinner,
  useToast,
} from '@/components/ui';
import { useConfirm } from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { TablePageSkeleton } from '@/components/dashboard/Skeletons';
import { formatCount } from '@/lib/format';

const PAGE_SIZE = 20;
const STATS_URL = '/api/v1/admin/stats';

const ROLE_OPTIONS = [
  { value: 'BRAND', label: 'Brand' },
  { value: 'INFLUENCER', label: 'Creator' },
];

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        `/api/v1/admin/users?page=${page}&limit=${PAGE_SIZE}` +
        (query ? `&q=${encodeURIComponent(query)}` : '');
      const [usersData, statsData] = await Promise.all([dedupedGet(url), dedupedGet(STATS_URL)]);
      setUsers(usersData.users ?? []);
      setMeta(usersData.meta ?? { total: 0, page, totalPages: 1 });
      setStats(statsData ?? null);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [page, query, toast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  async function toggleActive(u) {
    const next = !u.isActive;
    if (!(await confirm({ title: `${next ? 'Reactivate' : 'Suspend'} user?`, body: `${next ? 'Reactivate' : 'Suspend'} ${u.fullName}?`, variant: next ? 'primary' : 'danger', confirmText: next ? 'Reactivate' : 'Suspend' }))) return;
    setSavingId(u.id);
    try {
      await apiClient.patch(`/api/v1/admin/users/${u.id}`, { isActive: next });
      setUsers((rows) => rows.map((r) => (r.id === u.id ? { ...r, isActive: next } : r)));
      invalidate('/api/v1/admin/users');
      toast.push({ variant: 'success', title: next ? 'Reactivated' : 'Suspended' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Update failed', body: apiError(e) });
    } finally {
      setSavingId(null);
    }
  }

  async function changeRole(u, role) {
    if (role === u.role) return;
    if (!(await confirm({ title: 'Change role?', body: `Change ${u.fullName}'s role to ${role}?`, confirmText: 'Change role' }))) return;
    setSavingId(u.id);
    try {
      await apiClient.patch(`/api/v1/admin/users/${u.id}`, { role });
      setUsers((rows) => rows.map((r) => (r.id === u.id ? { ...r, role } : r)));
      invalidate('/api/v1/admin/users');
      invalidate('/api/v1/admin/stats');
      toast.push({ variant: 'success', title: 'Role updated' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Update failed', body: apiError(e) });
    } finally {
      setSavingId(null);
    }
  }

  async function removeUser(u) {
    if (
      !(await confirm({
        title: 'Delete user?',
        body: `Delete ${u.fullName}? This cannot be undone. Accounts with orders or payouts can't be deleted — suspend them instead.`,
        variant: 'danger',
        confirmText: 'Delete',
      }))
    ) {
      return;
    }
    setSavingId(u.id);
    try {
      await apiClient.delete(`/api/v1/admin/users/${u.id}`);
      setUsers((rows) => rows.filter((r) => r.id !== u.id));
      invalidate('/api/v1/admin/users');
      invalidate('/api/v1/admin/stats');
      toast.push({ variant: 'success', title: 'User deleted' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Delete failed', body: apiError(e) });
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <TablePageSkeleton kpis={4} cols={5} />;
  }

  const kpis = [
    { label: 'Total users', value: formatCount(stats?.totalUsers ?? 0) },
    { label: 'Brands', value: formatCount(stats?.totalBrands ?? 0) },
    { label: 'Creators', value: formatCount(stats?.totalCreators ?? 0) },
    { label: 'Signups (7d)', value: formatCount(stats?.signupsThisWeek ?? 0) },
  ];

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
        subtitle="Search accounts and suspend or reactivate them."
        action={
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-64"
          />
        }
      />

      <KpiStrip kpis={kpis} />

      <Card padding="none" className="overflow-hidden">
        <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">User</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Role</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Joined</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
                <th className="px-3 py-3 sm:px-6 text-right font-semibold">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Spinner />
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No users match this search.
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((u) => (
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
                      <Badge
                        variant={u.role === 'BRAND' ? 'brand' : u.role === 'INFLUENCER' ? 'info' : 'dark'}
                      >
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
                    <td className="whitespace-nowrap px-3 py-3 sm:px-6">
                      {u.role === 'ADMIN' ? (
                        <div className="text-right text-xs text-zinc-400">—</div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-32">
                            <Select
                              value={u.role}
                              onChange={(v) => changeRole(u, v)}
                              options={ROLE_OPTIONS}
                              disabled={savingId === u.id}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant={u.isActive ? 'outline' : 'primary'}
                            loading={savingId === u.id}
                            onClick={() => toggleActive(u)}
                          >
                            {u.isActive ? 'Suspend' : 'Reactivate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={savingId === u.id}
                            onClick={() => removeUser(u)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </ScrollTable>
      </Card>

      <div className="flex flex-col items-center gap-2">
        <Pagination page={page} pageCount={meta.totalPages ?? 1} onChange={setPage} />
        <p className="text-xs text-zinc-500">
          {meta.total ?? 0} user{meta.total === 1 ? '' : 's'} · page {meta.page ?? page} of{' '}
          {meta.totalPages ?? 1}
        </p>
      </div>
    </div>
  );
}
