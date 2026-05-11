'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  FormField,
  Input,
  Spinner,
  useToast,
} from '@/components/ui';
import { DELIVERABLE_LABEL, formatINR } from '@/lib/format';

const DELIVERABLES = Object.keys(DELIVERABLE_LABEL);

export default function RatesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // map: deliverable -> { active, price }
  const [rates, setRates] = useState(
    Object.fromEntries(DELIVERABLES.map((d) => [d, { active: false, price: '' }])),
  );

  useEffect(() => {
    if (!isLoading && user && user.role !== 'INFLUENCER') router.replace('/dashboard');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role !== 'INFLUENCER') return;
    apiClient
      .get('/api/v1/influencers/me')
      .then(({ data }) => {
        const next = { ...rates };
        for (const d of DELIVERABLES) next[d] = { active: false, price: '' };
        for (const r of data.profile.rateCards ?? []) {
          next[r.deliverable] = { active: true, price: String(r.price) };
        }
        setRates(next);
      })
      .catch((e) => toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function update(deliv, patch) {
    setRates((r) => ({ ...r, [deliv]: { ...r[deliv], ...patch } }));
  }

  async function onSave() {
    const payload = DELIVERABLES
      .filter((d) => rates[d].active && rates[d].price)
      .map((d) => ({ deliverable: d, price: Number(rates[d].price) }));
    if (!payload.length) {
      toast.push({ variant: 'warning', title: 'Add at least one rate' });
      return;
    }
    if (payload.some((p) => !(p.price >= 0))) {
      toast.push({ variant: 'warning', title: 'Prices must be non-negative numbers' });
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/api/v1/influencers/me/rate-cards', { rates: payload });
      toast.push({ variant: 'success', title: 'Rate card saved' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(e) });
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

  const activeCount = DELIVERABLES.filter((d) => rates[d].active).length;
  const total = DELIVERABLES.filter((d) => rates[d].active).reduce(
    (s, d) => s + (Number(rates[d].price) || 0),
    0,
  );

  return (
    <div>
      <span className="eyebrow">Pricing</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Rate card</h1>
      <p className="mt-2 text-zinc-600">
        Set your price per deliverable. Brands see this when booking you for a custom campaign.
      </p>

      <Card padding="lg" className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Pick what you offer</h2>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Active deliverables</div>
            <div className="text-xl font-bold text-zinc-900">
              {activeCount}
              <span className="ml-1 text-sm font-medium text-zinc-500">/ {DELIVERABLES.length}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 divide-y divide-zinc-100">
          {DELIVERABLES.map((d) => (
            <div key={d} className="flex items-center gap-4 py-3">
              <div className="flex w-64 flex-shrink-0 items-center gap-3">
                <Checkbox
                  checked={rates[d].active}
                  onChange={(e) => update(d, { active: e.target.checked })}
                />
                <span className="text-sm font-medium text-zinc-800">{DELIVERABLE_LABEL[d]}</span>
              </div>
              <FormField className="max-w-[200px]">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="₹ price"
                  disabled={!rates[d].active}
                  value={rates[d].price}
                  onChange={(e) => update(d, { price: e.target.value })}
                />
              </FormField>
              {rates[d].active && rates[d].price && (
                <Badge variant="brand">{formatINR(rates[d].price)}</Badge>
              )}
            </div>
          ))}
        </div>

        <Alert variant="info" className="mt-6">
          Total of active rates: <strong>{formatINR(total)}</strong>. Brands typically book
          bundles — match your prices to your tier and engagement.
        </Alert>

        <div className="mt-6 flex justify-end">
          <Button onClick={onSave} loading={saving}>
            Save rate card
          </Button>
        </div>
      </Card>
    </div>
  );
}
