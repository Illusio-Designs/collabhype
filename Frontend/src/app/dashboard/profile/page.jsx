'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError, uploadImage } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import {
  Alert,
  Button,
  Card,
  FormField,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import MultiSelect from '@/components/MultiSelect';
import LogoUpload from '@/components/dashboard/LogoUpload';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';
import { COUNTRIES, INDIAN_STATES, INDUSTRIES, LANGUAGES, citiesForState } from '@/lib/geo';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Admins have no personal profile form — bounce them to the overview.
  useEffect(() => {
    if (user && user.role === 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  if (!user || user.role === 'ADMIN') return null;
  return user.role === 'BRAND' ? <BrandProfileForm /> : <InfluencerProfileForm />;
}

// =======================================================================
// BRAND
// =======================================================================
function BrandProfileForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    website: '',
    industry: '',
    gstin: '',
    logoUrl: '',
    about: '',
  });

  useEffect(() => {
    dedupedGet('/api/v1/brands/me')
      .then((data) => {
        const p = data.profile;
        setForm({
          companyName: p.companyName ?? '',
          website: p.website ?? '',
          industry: p.industry ?? '',
          gstin: p.gstin ?? '',
          logoUrl: p.logoUrl ?? '',
          about: p.about ?? '',
        });
      })
      .catch((e) => toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch('/api/v1/brands/me', form);
      invalidate('/api/v1/brands/me');
      toast.push({ variant: 'success', title: 'Saved', body: 'Brand profile updated.' });
    } catch (err) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Brand profile' },
        ]}
        eyebrow="Settings"
        title="Brand profile"
        subtitle="How creators see your brand when accepting briefs."
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-zinc-900">Company info</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Company name" required>
              <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} required />
            </FormField>
            <FormField label="Industry">
              <Select
                value={form.industry}
                onChange={(v) => set('industry', v)}
                options={INDUSTRIES}
                placeholder="Select an industry…"
              />
            </FormField>
            <FormField label="Website">
              <Input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://yourbrand.com" />
            </FormField>
            <FormField label="GSTIN">
              <Input value={form.gstin} onChange={(e) => set('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" />
            </FormField>
            <FormField label="Logo" className="sm:col-span-2">
              <LogoUpload
                value={form.logoUrl}
                onChange={(url) => set('logoUrl', url)}
              />
            </FormField>
            <FormField label="About" className="sm:col-span-2">
              <Textarea
                rows={4}
                value={form.about}
                onChange={(e) => set('about', e.target.value)}
                placeholder="A short pitch creators will see when reviewing your campaigns."
              />
            </FormField>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

// =======================================================================
// INFLUENCER
// =======================================================================
const GENDERS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

function InfluencerProfileForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [niches, setNiches] = useState([]);
  const [selectedNiches, setSelectedNiches] = useState(new Set());
  const [savingNiches, setSavingNiches] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    city: '',
    state: '',
    country: 'IN',
    languages: '',
    gender: '',
    dob: '',
    baseRate: '',
    upiId: '',
    isAvailable: true,
  });

  const load = useCallback(
    ({ force = false } = {}) => {
      setLoading(true);
      return Promise.all([
        dedupedGet('/api/v1/influencers/me', { force }),
        dedupedGet('/api/v1/niches', { force }),
      ])
        .then(([me, n]) => {
          const p = me.profile;
          setForm({
            bio: p.bio ?? '',
            city: p.city ?? '',
            state: p.state ?? '',
            country: p.country ?? 'IN',
            languages: p.languages ?? '',
            gender: p.gender ?? '',
            dob: p.dob ? p.dob.slice(0, 10) : '',
            baseRate: p.baseRate != null ? String(p.baseRate) : '',
            upiId: p.upiId ?? '',
            isAvailable: p.isAvailable !== false,
          });
          const slugs = (p.niches ?? []).map((x) => x.niche.slug);
          setSelectedNiches(new Set(slugs));
          setNiches(n.niches ?? []);
          // First login: profile not set up yet (no niches) and not dismissed.
          if (
            typeof window !== 'undefined' &&
            slugs.length === 0 &&
            !localStorage.getItem('ch_onboarded')
          ) {
            setShowWizard(true);
          }
        })
        .catch((e) => toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) }))
        .finally(() => setLoading(false));
    },
    [toast],
  );

  useEffect(() => {
    load();
  }, [load]);

  function dismissWizard() {
    if (typeof window !== 'undefined') localStorage.setItem('ch_onboarded', '1');
    setShowWizard(false);
  }

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        bio: form.bio || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        languages: form.languages || undefined,
        gender: form.gender || undefined,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        baseRate: form.baseRate ? Number(form.baseRate) : undefined,
        upiId: form.upiId || undefined,
        isAvailable: form.isAvailable,
      };
      await apiClient.patch('/api/v1/influencers/me', payload);
      invalidate('/api/v1/influencers/me');
      toast.push({ variant: 'success', title: 'Saved', body: 'Profile updated.' });
    } catch (err) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(err) });
    } finally {
      setSaving(false);
    }
  }

  async function saveNiches() {
    if (!selectedNiches.size) {
      toast.push({ variant: 'warning', title: 'Pick at least one niche' });
      return;
    }
    setSavingNiches(true);
    try {
      await apiClient.put('/api/v1/influencers/me/niches', {
        nicheSlugs: [...selectedNiches],
      });
      invalidate('/api/v1/influencers/me');
      toast.push({ variant: 'success', title: 'Niches updated' });
    } catch (err) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(err) });
    } finally {
      setSavingNiches(false);
    }
  }

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' },
        ]}
        eyebrow="Settings"
        title="Your profile"
        subtitle="Brands see this when browsing creators. Stay accurate to get matched well."
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {/* Availability + basics */}
        <Card padding="lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Availability</h2>
              <p className="text-sm text-zinc-600">Turn off if you can't take new campaigns right now.</p>
            </div>
            <Switch
              checked={form.isAvailable}
              onChange={(v) => set('isAvailable', v)}
              label={form.isAvailable ? 'Open to work' : 'Paused'}
            />
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold text-zinc-900">About you</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField
              label="Bio"
              className="sm:col-span-2"
              hint="2–3 sentences brands will read."
            >
              <Textarea rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
            </FormField>
            <FormField label="Country">
              <Select
                value={form.country}
                onChange={(v) => setForm((f) => ({ ...f, country: v, state: '', city: '' }))}
                options={COUNTRIES}
              />
            </FormField>
            <FormField label="State">
              {form.country === 'IN' ? (
                <Select
                  value={form.state}
                  onChange={(v) => setForm((f) => ({ ...f, state: v, city: '' }))}
                  options={INDIAN_STATES}
                  placeholder="Select a state…"
                />
              ) : (
                <Input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="State / region" />
              )}
            </FormField>
            <FormField label="City">
              {form.country === 'IN' ? (
                <Select
                  value={form.city}
                  onChange={(v) => set('city', v)}
                  options={citiesForState(form.state)}
                  placeholder={form.state ? 'Select a city…' : 'Select a state first'}
                  disabled={!form.state}
                />
              ) : (
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
              )}
            </FormField>
            <FormField label="Languages" hint="Pick all you create in." className="sm:col-span-2">
              <MultiSelect
                options={LANGUAGES}
                value={form.languages ? form.languages.split(',').map((s) => s.trim()).filter(Boolean) : []}
                onChange={(arr) => set('languages', arr.join(','))}
                placeholder="Add a language…"
                allSelectedLabel="All languages added"
              />
            </FormField>
            <FormField label="Gender">
              <Select value={form.gender} onChange={(v) => set('gender', v)} options={GENDERS} />
            </FormField>
            <FormField label="Date of birth">
              <Input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
            </FormField>
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold text-zinc-900">Payment</h2>
          <p className="mt-1 text-sm text-zinc-600">
            We pay out via UPI after each approved deliverable.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="UPI ID">
              <Input value={form.upiId} onChange={(e) => set('upiId', e.target.value)} placeholder="you@upi" />
            </FormField>
            <FormField label="Base rate (INR)" hint="Optional reference price.">
              <Input type="number" min="0" value={form.baseRate} onChange={(e) => set('baseRate', e.target.value)} />
            </FormField>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save profile
          </Button>
        </div>
      </form>

      {/* Niches — saved separately */}
      <Card padding="lg" className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Niches</h2>
            <p className="text-sm text-zinc-600">Pick all that apply — at least one.</p>
          </div>
        </div>
        {niches.length === 0 ? (
          <Alert variant="warning" className="mt-4">
            No niches loaded. Make sure the backend is running and seeded.
          </Alert>
        ) : (
          <div className="mt-5">
            <MultiSelect
              options={niches.map((n) => ({ value: n.slug, label: n.name }))}
              value={[...selectedNiches]}
              onChange={(slugs) => setSelectedNiches(new Set(slugs))}
              onCreate={async (name) => {
                try {
                  const { data } = await apiClient.post('/api/v1/niches', { name });
                  const niche = data.niche;
                  setNiches((prev) =>
                    prev.some((n) => n.slug === niche.slug) ? prev : [...prev, niche],
                  );
                  setSelectedNiches((prev) => new Set(prev).add(niche.slug));
                  return niche.slug;
                } catch (e) {
                  toast.push({ variant: 'danger', title: "Couldn't add niche", body: apiError(e) });
                  return null;
                }
              }}
              placeholder="Add a niche…"
              allSelectedLabel="All niches added"
              createPlaceholder="Add a niche not listed…"
            />
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={saveNiches} loading={savingNiches} disabled={!niches.length}>
            Save niches
          </Button>
        </div>
      </Card>

      {showWizard && (
        <OnboardingWizard
          open
          niches={niches}
          initial={{
            bio: form.bio,
            country: form.country,
            state: form.state,
            city: form.city,
            languages: form.languages,
            upiId: form.upiId,
            baseRate: form.baseRate,
            isAvailable: form.isAvailable,
            niches: [...selectedNiches],
          }}
          onClose={dismissWizard}
          onComplete={() => {
            dismissWizard();
            load({ force: true });
          }}
        />
      )}
    </div>
  );
}
