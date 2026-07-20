'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  Pagination,
  Select,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from '@/components/ui';
import { useConfirm } from '@/components/ui';
import { ChevronRight } from 'lucide-react';
import KpiStrip from '@/components/dashboard/KpiStrip';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';
import { TablePageSkeleton, TableRowsSkeleton } from '@/components/dashboard/Skeletons';
import { formatINR, formatCount, TIER_LABEL } from '@/lib/format';

const PAGE_SIZE = 20;
const STATS_URL = '/api/v1/admin/stats';

const TIER_OPTIONS = [
  { value: 'NANO', label: TIER_LABEL.NANO ?? 'Nano' },
  { value: 'MICRO', label: TIER_LABEL.MICRO ?? 'Micro' },
  { value: 'MACRO', label: TIER_LABEL.MACRO ?? 'Macro' },
  { value: 'MEGA', label: TIER_LABEL.MEGA ?? 'Mega' },
];

const emptyForm = {
  slug: '',
  title: '',
  subtitle: '',
  description: '',
  tier: 'MICRO',
  nicheId: '',
  price: '',
  influencerCount: '',
  mrp: '',
  pricePerInfluencer: '',
  estReach: '',
  estEngagement: '',
  deliverables: '[]',
  isActive: true,
  isMostPopular: false,
  currency: 'INR',
};

export default function AdminPackagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [packages, setPackages] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [niches, setNiches] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // pkg | 'new' | null

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgData, statsData, nicheData] = await Promise.all([
        dedupedGet(`/api/v1/admin/packages?page=${page}&limit=${PAGE_SIZE}`),
        dedupedGet(STATS_URL),
        dedupedGet('/api/v1/niches'),
      ]);
      setPackages(pkgData.packages ?? []);
      setMeta(pkgData.meta ?? { total: 0, page, totalPages: 1 });
      setStats(statsData ?? null);
      setNiches(nicheData.niches ?? []);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  const onSaved = () => {
    setEditing(null);
    invalidate('/api/v1/admin/packages');
    invalidate(STATS_URL);
    load();
  };

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <TablePageSkeleton kpis={4} cols={6} />;
  }

  const kpis = [
    { label: 'Total packs', value: String(stats?.totalPackages ?? 0) },
    { label: 'Active', value: String(stats?.activePackages ?? 0) },
    { label: 'Total slots', value: formatCount(stats?.totalSlots ?? 0) },
    { label: 'Avg price', value: formatINR(stats?.avgPackagePrice ?? 0) },
  ];

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
        action={<Button onClick={() => setEditing('new')}>+ New package</Button>}
      />

      <KpiStrip kpis={kpis} />

      <Card padding="none" className="overflow-hidden">
        <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Title</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Tier</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Influencers</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Price</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
                <th className="px-3 py-3 sm:px-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading && <TableRowsSkeleton rows={8} cols={6} pad="px-3 py-3 sm:px-6" />}
              {!loading && packages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No packages yet. Click "+ New package" to create one.
                  </td>
                </tr>
              )}
              {!loading &&
                packages.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-3 sm:px-6">
                      <div className="font-medium text-zinc-900">{p.title}</div>
                      <div className="text-xs text-zinc-500">{p.niche?.name ?? '—'}</div>
                    </td>
                    <td className="px-3 py-3 sm:px-6">
                      <Badge variant="brand">{TIER_LABEL[p.tier] ?? p.tier}</Badge>
                    </td>
                    <td className="px-3 py-3 sm:px-6 text-zinc-600">{p.influencerCount}</td>
                    <td className="px-3 py-3 sm:px-6 font-semibold text-zinc-900">
                      {formatINR(p.price)}
                    </td>
                    <td className="px-3 py-3 sm:px-6">
                      <Badge variant={p.isActive ? 'success' : 'default'}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 sm:px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(p)}
                        iconRight={<ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      >
                        Edit
                      </Button>
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
          {meta.total ?? 0} package{meta.total === 1 ? '' : 's'} · page {meta.page ?? page} of{' '}
          {meta.totalPages ?? 1}
        </p>
      </div>

      <PackageEditorModal
        editing={editing}
        niches={niches}
        onClose={() => setEditing(null)}
        onSaved={onSaved}
      />
    </div>
  );
}

function num(v) {
  return v === '' || v == null ? null : Number(v);
}

function PackageEditorModal({ editing, niches, onClose, onSaved }) {
  const toast = useToast();
  const confirm = useConfirm();
  const isNew = editing === 'new';
  const open = !!editing;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isNew) {
      setForm(emptyForm);
    } else {
      setForm({
        slug: editing.slug ?? '',
        title: editing.title ?? '',
        subtitle: editing.subtitle ?? '',
        description: editing.description ?? '',
        tier: editing.tier ?? 'MICRO',
        nicheId: editing.nicheId ?? '',
        price: editing.price != null ? String(editing.price) : '',
        influencerCount: editing.influencerCount != null ? String(editing.influencerCount) : '',
        mrp: editing.mrp != null ? String(editing.mrp) : '',
        pricePerInfluencer:
          editing.pricePerInfluencer != null ? String(editing.pricePerInfluencer) : '',
        estReach: editing.estReach != null ? String(editing.estReach) : '',
        estEngagement: editing.estEngagement != null ? String(editing.estEngagement) : '',
        deliverables: JSON.stringify(editing.deliverables ?? [], null, 2),
        isActive: editing.isActive !== false,
        isMostPopular: !!editing.isMostPopular,
        currency: editing.currency ?? 'INR',
      });
    }
  }, [open, isNew, editing]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function buildPayload() {
    let deliverables;
    try {
      deliverables = JSON.parse(form.deliverables || '[]');
    } catch {
      throw new Error('Deliverables must be valid JSON, e.g. [{"type":"IG_REEL","qty":1}]');
    }
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle || undefined,
      description: form.description || undefined,
      tier: form.tier,
      nicheId: form.nicheId || null,
      price: num(form.price) ?? 0,
      influencerCount: num(form.influencerCount) ?? 0,
      mrp: num(form.mrp),
      pricePerInfluencer: num(form.pricePerInfluencer),
      estReach: num(form.estReach),
      estEngagement: num(form.estEngagement),
      deliverables,
      isActive: form.isActive,
      isMostPopular: form.isMostPopular,
      currency: form.currency || 'INR',
    };
    if (isNew) payload.slug = form.slug.trim();
    return payload;
  }

  async function save() {
    if (!form.title.trim()) {
      toast.push({ variant: 'danger', title: 'Title is required' });
      return;
    }
    if (isNew && !form.slug.trim()) {
      toast.push({ variant: 'danger', title: 'Slug is required' });
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isNew) {
        await apiClient.post('/api/v1/admin/packages', payload);
        toast.push({ variant: 'success', title: 'Package created' });
      } else {
        await apiClient.patch(`/api/v1/admin/packages/${editing.id}`, payload);
        toast.push({ variant: 'success', title: 'Package updated' });
      }
      onSaved?.();
    } catch (e) {
      const msg = e instanceof Error && e.message.startsWith('Deliverables') ? e.message : apiError(e);
      toast.push({ variant: 'danger', title: 'Save failed', body: msg });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (isNew) return;
    if (!(await confirm({ title: 'Delete package?', body: `"${editing.title}" will be permanently deleted.`, variant: 'danger', confirmText: 'Delete' }))) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/v1/admin/packages/${editing.id}`);
      toast.push({ variant: 'success', title: 'Deleted' });
      onSaved?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Delete failed', body: apiError(e) });
    } finally {
      setDeleting(false);
    }
  }

  const nicheOptions = [
    { value: '', label: '— No niche —' },
    ...niches.map((n) => ({ value: n.id, label: n.name })),
  ];

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      size="lg"
      title={isNew ? 'New package' : `Edit ${editing?.title ?? ''}`}
      description="Marketplace bundle shown to brands. Deliverables is a JSON array of { type, qty }."
      footer={
        <>
          {!isNew && (
            <Button variant="danger" onClick={remove} loading={deleting} className="mr-auto">
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {isNew ? 'Create' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Slug" hint="Lowercase, hyphens — used in the URL" required>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              disabled={!isNew}
              placeholder="growth-micro-5-fashion"
            />
          </FormField>
          <FormField label="Tier">
            <Select value={form.tier} onChange={(v) => set('tier', v)} options={TIER_OPTIONS} />
          </FormField>
        </div>

        <FormField label="Title" required>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
        </FormField>
        <FormField label="Subtitle">
          <Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
        </FormField>
        <FormField label="Description">
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </FormField>

        <FormField label="Niche">
          <Select value={form.nicheId} onChange={(v) => set('nicheId', v)} options={nicheOptions} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Price (₹)" required>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </FormField>
          <FormField label="Influencer count">
            <Input
              type="number"
              value={form.influencerCount}
              onChange={(e) => set('influencerCount', e.target.value)}
            />
          </FormField>
          <FormField label="MRP (₹)" hint="Strike-through price (optional)">
            <Input type="number" value={form.mrp} onChange={(e) => set('mrp', e.target.value)} />
          </FormField>
          <FormField label="Price / influencer (₹)">
            <Input
              type="number"
              value={form.pricePerInfluencer}
              onChange={(e) => set('pricePerInfluencer', e.target.value)}
            />
          </FormField>
          <FormField label="Est. reach">
            <Input
              type="number"
              value={form.estReach}
              onChange={(e) => set('estReach', e.target.value)}
            />
          </FormField>
          <FormField label="Est. engagement">
            <Input
              type="number"
              value={form.estEngagement}
              onChange={(e) => set('estEngagement', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Deliverables (JSON)" hint='e.g. [{"type":"IG_REEL","qty":1}]'>
          <Textarea
            rows={4}
            value={form.deliverables}
            onChange={(e) => set('deliverables', e.target.value)}
            className="font-mono text-xs"
          />
        </FormField>

        <div className="flex flex-wrap gap-6">
          <Switch checked={form.isActive} onChange={(v) => set('isActive', v)} label="Active" />
          <Switch
            checked={form.isMostPopular}
            onChange={(v) => set('isMostPopular', v)}
            label="Most popular"
          />
        </div>
      </div>
    </Modal>
  );
}
