'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { Badge, Button, Card, EmptyState, useToast } from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import { PageSkeleton, CardSkeleton } from '@/components/dashboard/Skeletons';
import { DELIVERABLE_LABEL, formatINR } from '@/lib/format';

export default function TasksPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'INFLUENCER') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/campaigns/tasks');
      setTasks(data.tasks ?? []);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.role === 'INFLUENCER') load();
  }, [user, load]);

  async function accept(task) {
    setBusyId(task.id);
    try {
      const { data } = await apiClient.post(`/api/v1/campaigns/${task.id}/claim`);
      toast.push({
        variant: 'success',
        title: 'Task accepted',
        body: `You're in! (${data.filled}/${data.target} filled)`,
      });
      setTasks((rows) => rows.filter((t) => t.id !== task.id));
    } catch (e) {
      toast.push({ variant: 'danger', title: "Couldn't accept", body: apiError(e) });
      load();
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading || !user || user.role !== 'INFLUENCER') {
    return <PageSkeleton kpis={0} cards={3} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks' }]}
        eyebrow="Creator"
        title="Available tasks"
        subtitle="Paid tasks matched to your niche. Accept to join the campaign."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} lines={3} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks right now"
          description="When a brand needs creators in your niche, matching tasks show up here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((t) => {
            const brand = t.order?.brand?.brandProfile?.companyName ?? t.order?.brand?.fullName ?? 'A brand';
            const dels = Array.isArray(t.taskDeliverables) ? t.taskDeliverables : [];
            const remaining = Math.max(0, (t.slotsTarget ?? 0) - (t.slotsFilled ?? 0));
            return (
              <Card key={t.id} padding="lg" className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Badge variant="brand">{remaining} slots left</Badge>
                  <span className="text-sm font-bold text-zinc-900">{formatINR(t.taskPayoutPerUnit ?? 0)}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-zinc-900">{t.title}</h3>
                <div className="mt-1 text-xs text-zinc-500">by {brand}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dels.map((d, i) => (
                    <span key={i} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {DELIVERABLE_LABEL[d.type] ?? d.type}
                      {d.qty > 1 ? ` ×${d.qty}` : ''}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex-1" />
                <Button onClick={() => accept(t)} loading={busyId === t.id} className="mt-2 w-full !justify-center">
                  Accept task
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
