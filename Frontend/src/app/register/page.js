'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiError } from '@/lib/apiClient';
import { Alert, Button, Card, FormField, Input, PasswordInput, Spinner } from '@/components/ui';

const schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  city: z.string().optional(),
});

function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialRole = sp.get('role')?.toUpperCase() === 'INFLUENCER' ? 'INFLUENCER' : 'BRAND';
  const [role, setRole] = useState(initialRole);
  const [serverError, setServerError] = useState(null);
  const { register: authRegister } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerError(null);
    const payload = { ...values, role };
    if (!payload.phone) delete payload.phone;
    if (role !== 'BRAND' || !payload.companyName) delete payload.companyName;
    if (role !== 'INFLUENCER' || !payload.city) delete payload.city;
    try {
      await authRegister(payload);
      router.push('/dashboard');
    } catch (err) {
      setServerError(apiError(err));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create your account</h1>
      <p className="mt-2 text-zinc-600">Get set up in two minutes.</p>

      <div className="mt-6 grid grid-cols-2 rounded-lg border border-zinc-200 p-1">
        {[
          { v: 'BRAND', label: "I'm a brand" },
          { v: 'INFLUENCER', label: "I'm a creator" },
        ].map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => setRole(opt.v)}
            className={clsx(
              'rounded-md py-2 text-sm font-semibold transition',
              role === opt.v
                ? 'bg-brand-700 text-white shadow'
                : 'text-zinc-700 hover:bg-zinc-50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card padding="lg" className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label={role === 'BRAND' ? 'Your name' : 'Full name'}
            error={errors.fullName?.message}
            required
          >
            <Input autoComplete="name" error={!!errors.fullName} {...register('fullName')} />
          </FormField>

          {role === 'BRAND' && (
            <FormField label="Company name" error={errors.companyName?.message}>
              <Input {...register('companyName')} />
            </FormField>
          )}

          {role === 'INFLUENCER' && (
            <FormField label="City" error={errors.city?.message}>
              <Input placeholder="e.g. Mumbai" {...register('city')} />
            </FormField>
          )}

          <FormField label="Email" error={errors.email?.message} required>
            <Input
              type="email"
              autoComplete="email"
              error={!!errors.email}
              {...register('email')}
            />
          </FormField>

          <FormField label="Phone (optional)" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" {...register('phone')} />
          </FormField>

          <FormField
            label="Password"
            hint="At least 8 characters"
            error={errors.password?.message}
            required
          >
            <PasswordInput
              autoComplete="new-password"
              error={!!errors.password}
              {...register('password')}
            />
          </FormField>

          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Create account
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-[40vh] place-items-center text-brand-700">
          <Spinner size="lg" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
