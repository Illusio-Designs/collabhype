'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { invalidate } from '@/lib/apiCache';
import { Button, Card, FormField, Input, Switch, Textarea, useToast } from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import { PageSkeleton } from '@/components/dashboard/Skeletons';
import RichTextEditor from '@/components/RichTextEditor';
import LogoUpload from '@/components/dashboard/LogoUpload';

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  tags: '',
  authorName: '',
  seoTitle: '',
  seoDescription: '',
  status: 'DRAFT',
};

export default function BlogEditorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const isNew = params.id === 'new';

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/api/v1/admin/blog/${params.id}`);
      const p = data.post;
      setForm({
        title: p.title ?? '',
        slug: p.slug ?? '',
        excerpt: p.excerpt ?? '',
        content: p.content ?? '',
        coverImageUrl: p.coverImageUrl ?? '',
        tags: p.tags ?? '',
        authorName: p.authorName ?? '',
        seoTitle: p.seoTitle ?? '',
        seoDescription: p.seoDescription ?? '',
        status: p.status ?? 'DRAFT',
      });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [isNew, params.id, toast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save(nextStatus) {
    if (!form.title.trim()) {
      toast.push({ variant: 'danger', title: 'Title is required' });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || undefined,
      content: form.content || undefined,
      coverImageUrl: form.coverImageUrl || '',
      tags: form.tags || undefined,
      authorName: form.authorName || undefined,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      status: nextStatus ?? form.status,
    };
    try {
      if (isNew) {
        await apiClient.post('/api/v1/admin/blog', payload);
      } else {
        await apiClient.patch(`/api/v1/admin/blog/${params.id}`, payload);
      }
      invalidate('/api/v1/admin/blog');
      toast.push({ variant: 'success', title: isNew ? 'Post created' : 'Post saved' });
      router.push('/dashboard/admin/blog');
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(e) });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !user || user.role !== 'ADMIN' || loading) {
    return <PageSkeleton kpis={0} cards={2} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Blog', href: '/dashboard/admin/blog' },
          { label: isNew ? 'New post' : 'Edit post' },
        ]}
        eyebrow="Platform admin"
        title={isNew ? 'New post' : 'Edit post'}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save('DRAFT')} loading={saving}>
              Save draft
            </Button>
            <Button onClick={() => save('PUBLISHED')} loading={saving}>
              Publish
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card padding="lg" className="space-y-4">
            <FormField label="Title" required>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
            </FormField>
            <FormField label="Excerpt" hint="Short summary shown on the blog list.">
              <Textarea rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </FormField>
            <FormField label="Content">
              <RichTextEditor value={form.content} onChange={(html) => set('content', html)} />
            </FormField>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
              <div>
                <div className="text-sm font-medium text-zinc-900">Published</div>
                <div className="text-xs text-zinc-500">Off = saved as draft.</div>
              </div>
              <Switch
                checked={form.status === 'PUBLISHED'}
                onChange={(v) => set('status', v ? 'PUBLISHED' : 'DRAFT')}
              />
            </div>
            <FormField label="Slug" hint="Auto-generated from the title if left blank.">
              <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="my-post" />
            </FormField>
            <FormField label="Tags" hint="Comma separated.">
              <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="news, tips" />
            </FormField>
            <FormField label="Author">
              <Input value={form.authorName} onChange={(e) => set('authorName', e.target.value)} />
            </FormField>
          </Card>

          <Card padding="lg" className="space-y-3">
            <div className="text-sm font-semibold text-zinc-900">Cover image</div>
            <LogoUpload value={form.coverImageUrl} onChange={(url) => set('coverImageUrl', url)} folder="blog" />
          </Card>

          <Card padding="lg" className="space-y-4">
            <div className="text-sm font-semibold text-zinc-900">SEO</div>
            <FormField label="SEO title">
              <Input value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
            </FormField>
            <FormField label="SEO description">
              <Textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => set('seoDescription', e.target.value)}
              />
            </FormField>
          </Card>
        </aside>
      </div>
    </div>
  );
}
