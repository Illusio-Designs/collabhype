'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import { Badge, Button, Card, Pagination, Spinner, useToast } from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';

const PAGE_SIZE = 20;

export default function AdminBlogPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(
    async ({ force = false } = {}) => {
      setLoading(true);
      try {
        const data = await dedupedGet(`/api/v1/admin/blog?page=${page}&limit=${PAGE_SIZE}`, {
          force,
        });
        setPosts(data.posts ?? []);
        setMeta(data.meta ?? { total: 0, page, totalPages: 1 });
      } catch (e) {
        toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
      } finally {
        setLoading(false);
      }
    },
    [page, toast],
  );

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  async function togglePublish(p) {
    const status = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setBusyId(p.id);
    try {
      await apiClient.patch(`/api/v1/admin/blog/${p.id}`, { status });
      setPosts((rows) => rows.map((r) => (r.id === p.id ? { ...r, status } : r)));
      invalidate('/api/v1/admin/blog');
      toast.push({ variant: 'success', title: status === 'PUBLISHED' ? 'Published' : 'Unpublished' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Update failed', body: apiError(e) });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await apiClient.delete(`/api/v1/admin/blog/${p.id}`);
      setPosts((rows) => rows.filter((r) => r.id !== p.id));
      invalidate('/api/v1/admin/blog');
      toast.push({ variant: 'success', title: 'Deleted' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Delete failed', body: apiError(e) });
    } finally {
      setBusyId(null);
    }
  }

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
          { label: 'Blog' },
        ]}
        eyebrow="Platform admin"
        title="Blog"
        subtitle="Write and manage blog posts."
        action={
          <Link href="/dashboard/admin/blog/new">
            <Button>+ New post</Button>
          </Link>
        }
      />

      <Card padding="none" className="overflow-hidden">
        <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Title</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Updated</th>
                <th className="px-3 py-3 sm:px-6 text-right font-semibold">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <Spinner />
                  </td>
                </tr>
              )}
              {!loading && posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No posts yet. Click "+ New post" to write one.
                  </td>
                </tr>
              )}
              {!loading &&
                posts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-3 sm:px-6">
                      <div className="font-medium text-zinc-900">{p.title}</div>
                      <div className="font-mono text-xs text-zinc-500">/{p.slug}</div>
                    </td>
                    <td className="px-3 py-3 sm:px-6">
                      <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'default'}>
                        {p.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 sm:px-6 text-zinc-600">
                      {new Date(p.updatedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 sm:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          loading={busyId === p.id}
                          onClick={() => togglePublish(p)}
                        >
                          {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Link href={`/dashboard/admin/blog/${p.id}`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={busyId === p.id}
                          onClick={() => remove(p)}
                        >
                          Delete
                        </Button>
                      </div>
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
          {meta.total ?? 0} post{meta.total === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
}
