'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from '@/components/ui';
import { ChevronRight } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';

export default function AdminContentPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // entry or 'new'

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/admin/content');
      setItems(data.items ?? []);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  if (isLoading || !user || user.role !== 'ADMIN' || loading) {
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
          { label: 'SEO & content' },
        ]}
        eyebrow="Platform admin"
        title="SEO & content"
        subtitle="Page-level SEO (title, description, OG image) editable per slug."
        action={<Button onClick={() => setEditing('new')}>+ New entry</Button>}
      />

      <Card padding="none" className="overflow-hidden">
       <ScrollTable hintLabel="Scroll">
        <table className="min-w-full">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Slug</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">SEO title</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Status</th>
              <th className="px-3 py-3 sm:px-6 text-left font-semibold">Updated</th>
              <th className="px-3 py-3 sm:px-6" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                  No content entries yet. Click "+ New entry" to create one.
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50">
                <td className="px-3 py-3 sm:px-6 font-mono text-xs font-semibold text-brand-700">
                  /{c.slug}
                </td>
                <td className="px-3 py-3 sm:px-6 text-zinc-700">
                  <div className="line-clamp-1 max-w-md">{c.title || '—'}</div>
                  {c.description && (
                    <div className="line-clamp-1 max-w-md text-xs text-zinc-500">
                      {c.description}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 sm:px-6">
                  <Badge variant={c.isPublished ? 'success' : 'default'}>
                    {c.isPublished ? 'Published' : 'Hidden'}
                  </Badge>
                </td>
                <td className="px-3 py-3 sm:px-6 text-zinc-500">
                  {new Date(c.updatedAt).toLocaleDateString('en-IN')}
                </td>
                <td className="whitespace-nowrap px-3 py-3 sm:px-6 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(c)}
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

      <ContentEditorModal
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </div>
  );
}

function ContentEditorModal({ editing, onClose, onSaved }) {
  const toast = useToast();
  const isNew = editing === 'new';
  const open = !!editing;
  const [form, setForm] = useState({
    slug: '',
    title: '',
    description: '',
    ogImageUrl: '',
    body: '',
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isNew) {
      setForm({ slug: '', title: '', description: '', ogImageUrl: '', body: '', isPublished: true });
    } else {
      setForm({
        slug: editing.slug,
        title: editing.title ?? '',
        description: editing.description ?? '',
        ogImageUrl: editing.ogImageUrl ?? '',
        body: editing.body ?? '',
        isPublished: editing.isPublished !== false,
      });
    }
  }, [open, isNew, editing]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      if (isNew) {
        await apiClient.post('/api/v1/admin/content', form);
        toast.push({ variant: 'success', title: 'Content created' });
      } else {
        const { slug: _slug, ...patch } = form;
        await apiClient.patch(`/api/v1/admin/content/${editing.slug}`, patch);
        toast.push({ variant: 'success', title: 'Content updated' });
      }
      onSaved?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(e) });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm(`Delete content "${editing.slug}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/v1/admin/content/${editing.slug}`);
      toast.push({ variant: 'success', title: 'Deleted' });
      onSaved?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Delete failed', body: apiError(e) });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      size="lg"
      title={isNew ? 'New content entry' : `Edit /${editing?.slug}`}
      description="SEO metadata + optional rich body. Frontend pages can opt into this content via /api/v1/content/:slug."
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
        <FormField label="Slug" hint="Lowercase letters/numbers/hyphens — used in URL routing" required>
          <Input
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            disabled={!isNew}
            placeholder="home, about, how-it-works…"
          />
        </FormField>
        <FormField label="SEO title">
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Page title — used in <title> and OG"
          />
        </FormField>
        <FormField label="SEO description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Short summary for search engines and social previews."
          />
        </FormField>
        <FormField label="OG image URL" hint="Used for social-card previews (1200×630 recommended)">
          <Input
            type="url"
            value={form.ogImageUrl}
            onChange={(e) => set('ogImageUrl', e.target.value)}
            placeholder="https://…/og.png"
          />
        </FormField>
        <FormField label="Body (optional, markdown)">
          <Textarea
            rows={6}
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Page body content — markdown supported."
          />
        </FormField>
        <Switch
          checked={form.isPublished}
          onChange={(v) => set('isPublished', v)}
          label="Published"
          description="Unpublished entries return 404 on the public endpoint."
        />
      </div>
    </Modal>
  );
}

