'use client';

import { useState } from 'react';
import { Alert, Button, Card, FormField, Input, Select, Textarea, useToast } from '@/components/ui';

const REASONS = [
  { value: 'general', label: 'General inquiry' },
  { value: 'partnership', label: 'Partnership / business' },
  { value: 'support', label: 'Account support' },
  { value: 'press', label: 'Press' },
];

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', reason: 'general', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // Persistence will be wired in a later phase. For now, acknowledge locally.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setSubmitting(false);
    toast.push({ variant: 'success', title: 'Message sent', body: 'We\'ll get back within a day.' });
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="eyebrow">Get in touch</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Questions, partnerships, or press — drop us a line and we&apos;ll reply within one
            business day.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-6 text-sm text-zinc-600 lg:col-span-1">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</div>
              <a href="mailto:hello@collabhype.in" className="mt-1 block font-medium text-zinc-900 hover:text-brand-700">
                hello@collabhype.in
              </a>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Support</div>
              <a href="mailto:support@collabhype.in" className="mt-1 block font-medium text-zinc-900 hover:text-brand-700">
                support@collabhype.in
              </a>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Office</div>
              <div className="mt-1 font-medium text-zinc-900">Rajkot, India</div>
              <div className="text-zinc-500">Mon–Fri, 10am–7pm IST</div>
            </div>
          </div>

          <Card padding="lg" className="lg:col-span-2">
            {submitted ? (
              <Alert variant="success" title="Thanks — we got it.">
                We&apos;ll reply to {form.email} within one business day.
              </Alert>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Your name" required>
                    <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
                  </FormField>
                  <FormField label="Email" required>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      required
                    />
                  </FormField>
                </div>
                <FormField label="Reason">
                  <Select value={form.reason} onChange={(v) => set('reason', v)} options={REASONS} />
                </FormField>
                <FormField label="Message" required>
                  <Textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="Tell us what's on your mind…"
                    required
                  />
                </FormField>
                <div className="flex justify-end">
                  <Button type="submit" loading={submitting}>
                    Send message
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
