'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  FormField,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from '@/components/ui';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
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
    apiClient
      .get('/api/v1/brands/me')
      .then(({ data }) => {
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
      <span className="eyebrow">Settings</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Brand profile</h1>
      <p className="mt-2 text-zinc-600">How creators see your brand when accepting briefs.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-zinc-900">Company info</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Company name" required>
              <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} required />
            </FormField>
            <FormField label="Industry">
              <Input value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="Beauty, Food, Tech…" />
            </FormField>
            <FormField label="Website">
              <Input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://yourbrand.com" />
            </FormField>
            <FormField label="GSTIN">
              <Input value={form.gstin} onChange={(e) => set('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" />
            </FormField>
            <FormField label="Logo URL" className="sm:col-span-2">
              <Input type="url" value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…/logo.png" />
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
const COUNTRIES = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AE', label: 'UAE' },
  { value: 'SG', label: 'Singapore' },
];

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

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/v1/influencers/me'),
      apiClient.get('/api/v1/niches'),
    ])
      .then(([me, n]) => {
        const p = me.data.profile;
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
        setSelectedNiches(new Set((p.niches ?? []).map((x) => x.niche.slug)));
        setNiches(n.data.niches ?? []);
      })
      .catch((e) => toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleNiche(slug) {
    setSelectedNiches((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
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
      <span className="eyebrow">Settings</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Your profile</h1>
      <p className="mt-2 text-zinc-600">
        Brands see this when browsing creators. Stay accurate to get matched well.
      </p>

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
            <FormField label="City">
              <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Mumbai" />
            </FormField>
            <FormField label="State">
              <Input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="Maharashtra" />
            </FormField>
            <FormField label="Country">
              <Select
                value={form.country}
                onChange={(v) => set('country', v)}
                options={COUNTRIES}
              />
            </FormField>
            <FormField label="Languages" hint="Comma-separated, e.g. en, hi, ta">
              <Input value={form.languages} onChange={(e) => set('languages', e.target.value)} />
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
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {niches.map((n) => (
              <Checkbox
                key={n.slug}
                label={n.name}
                checked={selectedNiches.has(n.slug)}
                onChange={() => toggleNiche(n.slug)}
              />
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={saveNiches} loading={savingNiches} disabled={!niches.length}>
            Save niches
          </Button>
        </div>
      </Card>
    </div>
  );
}
