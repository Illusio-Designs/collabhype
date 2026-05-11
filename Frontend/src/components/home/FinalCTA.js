'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinalCTA() {
  return (
    <section className="bg-zinc-50 pb-20 pt-12">
      {/* Outer container matches header + footer width (max-w-7xl px-4/6/8). */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-700 to-purple-600 sm:rounded-[2.5rem]">
          {/* Dotted pattern background */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Dotted globe / dome (decorative SVG) */}
          <svg
            aria-hidden
            viewBox="0 0 800 400"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[42%] opacity-30"
            style={{ width: '90%', maxWidth: '900px' }}
          >
            {[140, 110, 80, 50].map((r, i) => (
              <ellipse
                key={r}
                cx="400"
                cy="400"
                rx={r * 3.2}
                ry={r}
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeDasharray="2 8"
                opacity={1 - i * 0.2}
              />
            ))}
            {[-60, -30, 0, 30, 60].map((deg) => (
              <ellipse
                key={deg}
                cx="400"
                cy="400"
                rx={Math.abs(Math.cos((deg * Math.PI) / 180)) * 140 * 3.2 + 10}
                ry={140}
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeDasharray="2 6"
                opacity={0.4}
                transform={`rotate(${deg}, 400, 400)`}
              />
            ))}
          </svg>

          {/* Floating blur blob */}
          <motion.div
            aria-hidden
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-400/30 blur-3xl"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="relative px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-10"
          ><div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-300" />
              Take your campaigns to the next level
              <span className="h-1.5 w-1.5 rounded-full bg-pink-300" />
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Bring your customer reach to the next level of excellence.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-violet-100">
              Get set up in minutes. No long-term contracts. Pay only for what you book.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register?role=brand"
                className="rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brand-800 shadow-lg transition hover:bg-violet-50 hover:shadow-xl"
              >
                Make a campaign →
              </Link>
              <Link
                href="/register?role=influencer"
                className="rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                I'm a creator
              </Link>
            </div>
          </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
