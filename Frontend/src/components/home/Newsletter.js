'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Alert, Button, FormField, Input } from '@/components/ui';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-brand-50 p-10 text-center sm:p-14"
        >
          <span className="eyebrow">Stay in the loop</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Industry insights, twice a month
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-600">
            Influencer marketing trends, rate-card benchmarks, and platform updates. No spam.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-8 max-w-sm"
            >
              <Alert variant="success" title="You're on the list">
                Thanks — see you in your inbox.
              </Alert>
            </motion.div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <FormField className="flex-1">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brand.com"
                />
              </FormField>
              <Button type="submit" size="lg">
                Subscribe
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
