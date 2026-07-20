'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient, apiError } from '@/lib/apiClient';
import { Alert, Button, Card, FormField, Input, PasswordInput, PhoneInput } from '@/components/ui';

const schema = z
  .object({
    fullName: z.string().min(2, 'At least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Please re-type your password'),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    city: z.string().optional(),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: 'Please accept the Privacy Policy to continue' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Role-specific copy + the link to the other role's page.
const COPY = {
  BRAND: {
    eyebrow: 'For brands',
    title: 'Create your brand account',
    subtitle: 'Run campaigns, buy packages, and hand-pick creators.',
    nameLabel: 'Your name',
    altPrompt: 'Are you a creator?',
    altHref: '/register/creator',
    altLabel: 'Join as a creator',
  },
  INFLUENCER: {
    eyebrow: 'For creators',
    title: 'Create your creator account',
    subtitle: 'Set your rates, get booked by brands, and get paid via UPI.',
    nameLabel: 'Full name',
    altPrompt: 'Are you a brand?',
    altHref: '/register/brand',
    altLabel: 'Join as a brand',
  },
};

// Dedicated registration form for a single role (no role toggle).
export default function RegisterForm({ role }) {
  const cfg = COPY[role] ?? COPY.BRAND;
  const router = useRouter();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { phone: '' } });

  async function onSubmit(values) {
    setServerError(null);
    const payload = { ...values, role };
    delete payload.confirmPassword;
    if (!payload.phone) delete payload.phone;
    if (role !== 'BRAND' || !payload.companyName) delete payload.companyName;
    if (role !== 'INFLUENCER' || !payload.city) delete payload.city;
    try {
      // Create the account, then send the user to sign in (no auto-login).
      await apiClient.post('/api/v1/auth/register', payload);
      router.push('/login?registered=1');
    } catch (err) {
      setServerError(apiError(err));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <span className="eyebrow">{cfg.eyebrow}</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{cfg.title}</h1>
      <p className="mt-2 text-zinc-600">{cfg.subtitle}</p>

      <Card padding="lg" className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label={cfg.nameLabel} error={errors.fullName?.message} required>
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
            <Input type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
          </FormField>

          <FormField label="Phone (optional)" error={errors.phone?.message}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={!!errors.phone}
                />
              )}
            />
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

          <FormField label="Re-type password" error={errors.confirmPassword?.message} required>
            <PasswordInput
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
          </FormField>

          <div>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                {...register('acceptPrivacy')}
                className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded-md border-zinc-300 text-brand-700 focus:ring-brand-500"
              />
              <span className="text-sm text-zinc-600">
                I agree to the{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Terms
                </Link>
                .
              </span>
            </label>
            {errors.acceptPrivacy && (
              <p className="mt-1 text-xs text-red-600">{errors.acceptPrivacy.message}</p>
            )}
          </div>

          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Create account
          </Button>
        </form>
      </Card>

      <div className="mt-6 space-y-1 text-center text-sm text-zinc-600">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
        <p>
          {cfg.altPrompt}{' '}
          <Link href={cfg.altHref} className="font-semibold text-brand-700 hover:underline">
            {cfg.altLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
