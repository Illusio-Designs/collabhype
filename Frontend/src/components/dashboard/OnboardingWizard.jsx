'use client';

import { useState } from 'react';
import { apiClient, apiError } from '@/lib/apiClient';
import { invalidate } from '@/lib/apiCache';
import { Button, Input, Modal, Select, Switch, Textarea, useToast } from '@/components/ui';
import MultiSelect from '@/components/MultiSelect';
import { COUNTRIES, INDIAN_STATES, LANGUAGES, citiesForState } from '@/lib/geo';

const STEPS = ['About you', 'Location & languages', 'Niches', 'Payment'];

// First-login wizard that walks a creator through completing their profile.
// `initial` seeds the form; `niches` is the option list from /niches.
export default function OnboardingWizard({ open, initial, niches = [], onClose, onComplete }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [nicheOptions, setNicheOptions] = useState(niches);
  const [form, setForm] = useState({
    bio: initial?.bio ?? '',
    country: initial?.country ?? 'IN',
    state: initial?.state ?? '',
    city: initial?.city ?? '',
    languages: initial?.languages ? initial.languages.split(',').map((s) => s.trim()).filter(Boolean) : [],
    upiId: initial?.upiId ?? '',
    baseRate: initial?.baseRate != null ? String(initial.baseRate) : '',
    isAvailable: initial?.isAvailable !== false,
    niches: initial?.niches ?? [],
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function createNiche(name) {
    try {
      const { data } = await apiClient.post('/api/v1/niches', { name });
      const niche = data.niche;
      setNicheOptions((prev) =>
        prev.some((n) => n.slug === niche.slug) ? prev : [...prev, niche],
      );
      return niche.slug;
    } catch (e) {
      toast.push({ variant: 'danger', title: "Couldn't add niche", body: apiError(e) });
      return null;
    }
  }

  async function finish() {
    setSaving(true);
    try {
      await apiClient.patch('/api/v1/influencers/me', {
        bio: form.bio || undefined,
        country: form.country || undefined,
        state: form.state || undefined,
        city: form.city || undefined,
        languages: form.languages.length ? form.languages.join(',') : undefined,
        upiId: form.upiId || undefined,
        baseRate: form.baseRate ? Number(form.baseRate) : undefined,
        isAvailable: form.isAvailable,
      });
      if (form.niches.length) {
        await apiClient.put('/api/v1/influencers/me/niches', { nicheSlugs: form.niches });
      }
      invalidate('/api/v1/influencers/me');
      toast.push({ variant: 'success', title: 'Profile saved', body: "You're all set." });
      onComplete?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(e) });
    } finally {
      setSaving(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose?.()}
      size="lg"
      title="Complete your creator profile"
      description={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => (saving ? null : onClose?.())} disabled={saving}>
            Skip for now
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={saving}>
                Back
              </Button>
            )}
            {isLast ? (
              <Button onClick={finish} loading={saving}>
                Finish
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            )}
          </div>
        </div>
      }
    >
      {/* Progress bar */}
      <div className="mb-5 flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-zinc-200'}`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Field label="Short bio" hint="2–3 sentences brands will read.">
            <Textarea
              rows={4}
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Who you are and what you create…"
            />
          </Field>
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
            <div>
              <div className="text-sm font-medium text-zinc-900">Available for bookings</div>
              <div className="text-xs text-zinc-500">Turn off if you can't take campaigns now.</div>
            </div>
            <Switch checked={form.isAvailable} onChange={(v) => set('isAvailable', v)} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <Select
              value={form.country}
              onChange={(v) => setForm((f) => ({ ...f, country: v, state: '', city: '' }))}
              options={COUNTRIES}
            />
          </Field>
          <Field label="State">
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
          </Field>
          <Field label="City">
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
          </Field>
          <Field label="Languages" className="sm:col-span-2">
            <MultiSelect
              options={LANGUAGES}
              value={form.languages}
              onChange={(arr) => set('languages', arr)}
              placeholder="Add a language…"
              allSelectedLabel="All languages added"
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <Field label="Your niches" hint="Pick all that apply — or add your own if it's not listed.">
          <MultiSelect
            options={nicheOptions.map((n) => ({ value: n.slug, label: n.name }))}
            value={form.niches}
            onChange={(slugs) => set('niches', slugs)}
            onCreate={createNiche}
            placeholder="Add a niche…"
            allSelectedLabel="All niches added"
            createPlaceholder="Add a niche not listed…"
          />
        </Field>
      )}

      {step === 3 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="UPI ID" hint="Where we send your payouts.">
            <Input value={form.upiId} onChange={(e) => set('upiId', e.target.value)} placeholder="you@upi" />
          </Field>
          <Field label="Base rate (INR)" hint="Optional reference price.">
            <Input
              type="number"
              min="0"
              value={form.baseRate}
              onChange={(e) => set('baseRate', e.target.value)}
            />
          </Field>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, hint, className, children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
