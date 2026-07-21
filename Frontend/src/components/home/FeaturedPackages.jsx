'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import PackageCard from '@/components/PackageCard';
import { apiClient } from '@/lib/apiClient';

// Fetches its own data from the browser (GET /api/v1/packages) so the call is
// visible in the Network tab. Segregated by total price (cheapest first).
export default function FeaturedPackages() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    let active = true;
    apiClient
      .get('/api/v1/packages?limit=8')
      .then(({ data }) => {
        if (!active) return;
        setPackages([...(data?.packages ?? [])].sort((a, b) => (a.price ?? 0) - (b.price ?? 0)));
      })
      .catch(() => {
        if (active) setPackages([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!packages.length) return null;

  return (
    <section className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="eyebrow">Curated bundles</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Featured packages
            </h2>
            <p className="mt-2 text-zinc-600">Ready-to-launch bundles handpicked by us.</p>
          </div>
          <Link
            href="/packages"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            See all packages
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>

        <StaggerContainer className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((p) => (
            <StaggerItem key={p.id}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                <PackageCard pkg={p} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
