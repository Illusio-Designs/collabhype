'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiError } from '@/lib/apiClient';
import { Alert, Button, Card, FormField, Input, PasswordInput, Spinner } from '@/components/ui';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/dashboard';
  const { login, demoLogin } = useAuth();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      router.push(next);
    } catch (err) {
      setServerError(apiError(err));
    }
  }

  function tryDemo(role) {
    demoLogin(role);
    router.push('/dashboard');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Sign in</h1>
      <p className="mt-2 text-zinc-600">Welcome back to Collabcreator.</p>

      <Card padding="lg" className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input
              type="email"
              autoComplete="email"
              error={!!errors.email}
              {...register('email')}
            />
          </FormField>
          <FormField label="Password" error={errors.password?.message} required>
            <PasswordInput
              autoComplete="current-password"
              error={!!errors.password}
              {...register('password')}
            />
          </FormField>

          <div className="-mt-1 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Sign in
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-zinc-600">
        New to Collabcreator?{' '}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>

      {/* Demo mode — bypasses the backend so you can preview the dashboard. */}
      <div className="mt-8 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Try a demo
        </div>
        <p className="mt-1 text-xs text-zinc-600">
          Skip sign-up and explore the dashboard with dummy data.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => tryDemo('BRAND')}>
            Brand
          </Button>
          <Button variant="outline" size="sm" onClick={() => tryDemo('INFLUENCER')}>
            Creator
          </Button>
          <Button variant="outline" size="sm" onClick={() => tryDemo('ADMIN')}>
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-[40vh] place-items-center text-brand-700">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
