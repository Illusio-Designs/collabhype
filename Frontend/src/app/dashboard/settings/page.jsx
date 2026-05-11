'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Alert,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  PasswordInput,
  useToast,
} from '@/components/ui';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div>
      <span className="eyebrow">Account</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Settings</h1>
      <p className="mt-2 text-zinc-600">Manage how you sign in, get notified, and your data.</p>

      <div className="mt-8 space-y-6">
        <AccountInfo user={user} />
        <ChangePassword />
        <DangerZone user={user} onDeleted={logout} />
      </div>
    </div>
  );
}

// ============ Account info (read-only for now) ============

function AccountInfo({ user }) {
  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-zinc-900">Account</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Some details can&apos;t be changed here. Reach out to support to update them.
      </p>
      <dl className="mt-5 divide-y divide-zinc-100">
        {[
          { label: 'Email', value: user.email },
          { label: 'Full name', value: user.fullName },
          { label: 'Account type', value: user.role === 'BRAND' ? 'Brand' : 'Creator' },
          { label: 'Phone', value: user.phone || 'Not provided' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3">
            <dt className="text-sm text-zinc-500">{row.label}</dt>
            <dd className="text-sm font-medium text-zinc-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

// ============ Change password ============

function ChangePassword() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    if (form.newPassword.length < 8) {
      setErr('New password must be at least 8 characters.');
      return;
    }
    if (form.newPassword !== form.confirm) {
      setErr('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.push({ variant: 'success', title: 'Password changed' });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-zinc-900">Change password</h2>
      <p className="mt-1 text-sm text-zinc-600">Use a strong password unique to Collabhype.</p>
      <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:max-w-md">
        <FormField label="Current password" required>
          <PasswordInput
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => set('currentPassword', e.target.value)}
            required
          />
        </FormField>
        <FormField label="New password" hint="At least 8 characters" required>
          <PasswordInput
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            required
          />
        </FormField>
        <FormField label="Confirm new password" required>
          <PasswordInput
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            required
          />
        </FormField>
        {err && <Alert variant="danger">{err}</Alert>}
        <div>
          <Button type="submit" loading={saving}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ============ Danger zone ============

function DangerZone({ user, onDeleted }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const REQUIRED = 'delete my account';
  const canDelete = password.length > 0 && confirmText.trim().toLowerCase() === REQUIRED;

  async function onDelete() {
    setErr(null);
    setBusy(true);
    try {
      await apiClient.delete('/api/v1/auth/me', { data: { password } });
      toast.push({ variant: 'success', title: 'Account closed', body: 'You have been signed out.' });
      onDeleted?.();
      router.push('/');
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card padding="lg" className="border-red-200">
      <h2 className="text-lg font-semibold text-red-900">Danger zone</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Deleting your account disables sign-in and removes you from search results. Active
        campaigns and past payouts remain on record for accounting.
      </p>
      <div className="mt-5">
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => {
          if (!busy) {
            setOpen(false);
            setPassword('');
            setConfirmText('');
            setErr(null);
          }
        }}
        size="md"
        title="Delete your Collabhype account?"
        description={`Account: ${user.email}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete} loading={busy} disabled={!canDelete}>
              Permanently close
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="warning" title="This action can't be reversed online">
            Reach out to support within 14 days if you want to restore access.
          </Alert>
          <FormField label="Type your password to confirm" required>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          <FormField
            label={`Type "${REQUIRED}" to confirm`}
            hint="Case insensitive."
            required
          >
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          </FormField>
          {err && <Alert variant="danger">{err}</Alert>}
        </div>
      </Modal>
    </Card>
  );
}
