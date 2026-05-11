'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient, apiError } from '@/lib/apiClient';
import { Alert, Button, Card, FormField, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState(null);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/api/v1/auth/forgot-password', { email });
      setSent(true);
      if (data?.devResetUrl) setDevUrl(data.devResetUrl);
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Forgot password</h1>
      <p className="mt-2 text-zinc-600">
        Enter your email and we&apos;ll send a link to reset it.
      </p>

      <Card padding="lg" className="mt-8">
        {sent ? (
          <div className="space-y-4">
            <Alert variant="success" title="Check your inbox">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. The
              link expires in 1 hour.
            </Alert>
            {devUrl && (
              <Alert variant="info" title="Dev mode">
                Email isn&apos;t configured yet — open this link to continue:
                <br />
                <a
                  href={devUrl}
                  className="mt-2 block break-all font-mono text-xs text-brand-700 hover:underline"
                >
                  {devUrl}
                </a>
              </Alert>
            )}
            <div className="text-center text-sm text-zinc-600">
              <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Email" required>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brand.com"
                required
              />
            </FormField>
            {err && <Alert variant="danger">{err}</Alert>}
            <Button type="submit" fullWidth loading={submitting}>
              Send reset link
            </Button>
          </form>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
