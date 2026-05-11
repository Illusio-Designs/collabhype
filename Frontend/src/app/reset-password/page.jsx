'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Alert,
  Button,
  Card,
  FormField,
  PasswordInput,
  Spinner,
} from '@/components/ui';

function ResetPasswordInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('token') || '';

  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    if (form.newPassword.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (form.newPassword !== form.confirm) {
      setErr('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/api/v1/auth/reset-password', {
        token,
        newPassword: form.newPassword,
      });
      setDone(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Reset password</h1>
        <Alert variant="danger" title="Missing reset token" className="mt-6">
          This link is incomplete. Please request a new password reset.
        </Alert>
        <div className="mt-6">
          <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline">
            ← Back to forgot password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Choose a new password</h1>
      <p className="mt-2 text-zinc-600">
        Pick something strong and unique — we never reuse passwords.
      </p>

      <Card padding="lg" className="mt-8">
        {done ? (
          <Alert variant="success" title="Password updated">
            Redirecting to sign in…
          </Alert>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
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
            <Button type="submit" fullWidth loading={submitting}>
              Update password
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner size="lg" className="mx-auto my-16 text-brand-700" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
