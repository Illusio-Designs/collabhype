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
  Select,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from '@/components/ui';
import { ChevronRight } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import ScrollTable from '@/components/dashboard/ScrollTable';

const SETTINGS_URL = '/api/v1/admin/settings';

// Infer the editor `type` from a stored value so re-editing round-trips cleanly.
function inferType(value) {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (value && typeof value === 'object') return 'json';
  return 'string';
}

function displayValue(value) {
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [entries, setEntries] = useState([]); // [{ key, value }]
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { key, value } | 'new' | null

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(
    async ({ force = false } = {}) => {
      setLoading(true);
      try {
        // Backend returns a flat { key: value } map (secrets excluded).
        const data = await dedupedGet(SETTINGS_URL, { force });
        const map = data && typeof data === 'object' ? data : {};
        setEntries(Object.entries(map).map(([key, value]) => ({ key, value })));
      } catch (e) {
        toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

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
          { label: 'Platform settings' },
        ]}
        eyebrow="Platform admin"
        title="Platform settings"
        subtitle="Runtime configuration keys. Secret values are hidden from this list."
        action={<Button onClick={() => setEditing('new')}>+ New setting</Button>}
      />

      <Card padding="none" className="overflow-hidden">
        <ScrollTable hintLabel="Scroll">
          <table className="min-w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Key</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Value</th>
                <th className="px-3 py-3 sm:px-6 text-left font-semibold">Type</th>
                <th className="px-3 py-3 sm:px-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No settings yet. Click "+ New setting" to add one.
                  </td>
                </tr>
              )}
              {entries.map((s) => (
                <tr key={s.key} className="hover:bg-zinc-50">
                  <td className="px-3 py-3 sm:px-6 font-mono text-xs font-semibold text-brand-700">
                    {s.key}
                  </td>
                  <td className="px-3 py-3 sm:px-6 text-zinc-700">
                    <div className="line-clamp-1 max-w-md font-mono text-xs">{displayValue(s.value)}</div>
                  </td>
                  <td className="px-3 py-3 sm:px-6">
                    <Badge>{inferType(s.value)}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 sm:px-6 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(s)}
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

      <SettingEditorModal
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          invalidate(SETTINGS_URL);
          load({ force: true });
        }}
      />
    </div>
  );
}

function SettingEditorModal({ editing, onClose, onSaved }) {
  const toast = useToast();
  const isNew = editing === 'new';
  const open = !!editing;
  const [form, setForm] = useState({ key: '', value: '', type: 'string', isSecret: false });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isNew) {
      setForm({ key: '', value: '', type: 'string', isSecret: false });
    } else {
      setForm({
        key: editing.key,
        value: displayValue(editing.value),
        type: inferType(editing.value),
        isSecret: false,
      });
    }
  }, [open, isNew, editing]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Coerce the string form field into the value shape the backend expects.
  function coerceValue() {
    const raw = form.value;
    if (form.type === 'number') return Number(raw);
    if (form.type === 'boolean') return raw === 'true' || raw === '1' || raw === true;
    if (form.type === 'json') return JSON.parse(raw); // may throw — caught in save()
    return raw;
  }

  async function save() {
    if (!form.key.trim()) {
      toast.push({ variant: 'danger', title: 'Key is required' });
      return;
    }
    setSaving(true);
    try {
      const value = coerceValue();
      await apiClient.put(`${SETTINGS_URL}/${encodeURIComponent(form.key.trim())}`, {
        value,
        type: form.type,
        isSecret: form.isSecret,
      });
      toast.push({ variant: 'success', title: isNew ? 'Setting created' : 'Setting updated' });
      onSaved?.();
    } catch (e) {
      const msg = e instanceof SyntaxError ? 'Value is not valid JSON' : apiError(e);
      toast.push({ variant: 'danger', title: 'Save failed', body: msg });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm(`Delete setting "${editing.key}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiClient.delete(`${SETTINGS_URL}/${encodeURIComponent(editing.key)}`);
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
      title={isNew ? 'New setting' : `Edit ${editing?.key}`}
      description="Runtime configuration stored in the database. Mark sensitive values as secret to hide them from the list."
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
        <FormField label="Key" hint="e.g. platform_fee_rate, feature_x_enabled" required>
          <Input
            value={form.key}
            onChange={(e) => set('key', e.target.value)}
            disabled={!isNew}
            placeholder="setting_key"
          />
        </FormField>
        <FormField label="Type">
          <Select
            value={form.type}
            onChange={(v) => set('type', v)}
            options={[
              { value: 'string', label: 'string' },
              { value: 'number', label: 'number' },
              { value: 'boolean', label: 'boolean' },
              { value: 'json', label: 'json' },
            ]}
          />
        </FormField>
        <FormField
          label="Value"
          hint={
            form.type === 'json'
              ? 'Valid JSON — e.g. {"a":1} or [1,2,3]'
              : form.type === 'boolean'
                ? 'true or false'
                : undefined
          }
        >
          {form.type === 'json' ? (
            <Textarea
              rows={5}
              value={form.value}
              onChange={(e) => set('value', e.target.value)}
              placeholder='{"key": "value"}'
            />
          ) : (
            <Input
              value={form.value}
              onChange={(e) => set('value', e.target.value)}
              placeholder="Value"
            />
          )}
        </FormField>
        <Switch
          checked={form.isSecret}
          onChange={(v) => set('isSecret', v)}
          label="Secret"
          description="Secret values are excluded from the settings list responses."
        />
      </div>
    </Modal>
  );
}
