'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';

const childInit = { opacity: 0, y: 18 };
const childIn = { opacity: 1, y: 0 };
const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  return (
    <section className="bg-zinc-50 pb-12 pt-4 sm:pb-16 sm:pt-6 lg:pb-20">
      {/* Outer container matches header + footer width (max-w-7xl px-4/6/8) so
          the panel never gets wider than the header. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 sm:rounded-[2.5rem]">
          {/* Decorative blurred blobs */}
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-violet-300 to-pink-300 opacity-60 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ scale: [1.08, 1, 1.08] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-gradient-to-tl from-pink-200 to-orange-200 opacity-50 blur-3xl"
          />

          <div className="relative px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* ===== LEFT: copy ===== */}
            <div>
              <motion.span
                initial={childInit}
                animate={childIn}
                transition={{ duration: 0.5, ease }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 shadow-sm ring-1 ring-zinc-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                Best influencer marketplace in India
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              </motion.span>

              <motion.h1
                initial={childInit}
                animate={childIn}
                transition={{ duration: 0.6, delay: 0.1, ease }}
                className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.5rem]"
              >
                Personalized influencer{' '}
                <span className="text-brand-700">campaigns</span>
                <br />
                for better brands.
              </motion.h1>

              <motion.p
                initial={childInit}
                animate={childIn}
                transition={{ duration: 0.6, delay: 0.2, ease }}
                className="mt-6 max-w-lg text-lg leading-7 text-zinc-600"
              >
                Buy curated packs of vetted creators or hand-pick influencers one at a time. Pay
                once, brief in-app, release escrow when posts go live.
              </motion.p>

              <motion.div
                initial={childInit}
                animate={childIn}
                transition={{ duration: 0.6, delay: 0.3, ease }}
                className="mt-9 flex flex-wrap gap-3"
              >
                <Link href="/packages">
                  <Button size="xl" className="!rounded-full !shadow-lg">
                    Browse packages →
                  </Button>
                </Link>
                <Link href="/influencers">
                  <Button
                    size="xl"
                    variant="outline"
                    className="!rounded-full !bg-white"
                  >
                    Find creators
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={childInit}
                animate={childIn}
                transition={{ duration: 0.6, delay: 0.4, ease }}
                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500"
              >
                <span className="flex items-center gap-1.5">
                  <Check /> No setup fees
                </span>
                <span className="flex items-center gap-1.5">
                  <Check /> Escrow-backed
                </span>
                <span className="flex items-center gap-1.5">
                  <Check /> Razorpay secure
                </span>
              </motion.div>
            </div>

            {/* ===== RIGHT: visual ===== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
              className="relative mx-auto h-[420px] w-full max-w-[420px] sm:h-[460px] lg:h-[480px] lg:max-w-none"
            >
              {/* Creator backdrop tile */}
              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="relative h-[320px] w-[230px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-2xl ring-4 ring-white sm:h-[340px] sm:w-[240px]">
                  {/* Inner texture */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5), transparent 50%)',
                    }}
                    aria-hidden
                  />
                  {/* Big avatar circle */}
                  <div className="absolute inset-x-6 top-12 grid place-items-center">
                    <div className="grid h-32 w-32 place-items-center rounded-full bg-white/15 ring-4 ring-white/30 backdrop-blur-sm">
                      <span className="text-4xl font-bold text-white">A</span>
                    </div>
                  </div>
                  {/* Caption */}
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                      Featured creator
                    </div>
                    <div className="mt-0.5 text-base font-bold text-white">@aanyamehta</div>
                    <div className="mt-0.5 text-xs text-white/70">Beauty · Mumbai</div>
                  </div>
                </div>
              </div>

              {/* Float #1 — top-right stat card */}
              <motion.div
                initial={{ opacity: 0, y: -10, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease }}
                className="absolute right-0 top-4 z-20 w-48 rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-zinc-100 sm:right-2 sm:w-52"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Live campaign
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">2.4M</div>
                <div className="text-xs text-zinc-500">total reach this week</div>
                <div className="mt-3 flex -space-x-2">
                  {[
                    { l: 'A', c: 'bg-pink-400' },
                    { l: 'R', c: 'bg-violet-500' },
                    { l: 'V', c: 'bg-rose-400' },
                    { l: 'P', c: 'bg-purple-500' },
                  ].map((a) => (
                    <div
                      key={a.l}
                      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-white ${a.c}`}
                    >
                      {a.l}
                    </div>
                  ))}
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700 ring-2 ring-white">
                    +12
                  </div>
                </div>
              </motion.div>

              {/* Float #2 — bottom-left payment card */}
              <motion.div
                initial={{ opacity: 0, y: 10, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.75, ease }}
                className="absolute bottom-4 left-0 z-20 w-52 rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-zinc-100 sm:left-2 sm:w-56"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-green-100">
                    <svg
                      className="h-5 w-5 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Payment released
                    </div>
                    <div className="text-lg font-bold text-zinc-900">₹45,000</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Sent via UPI</span>
                  <span className="font-medium text-green-600">just now</span>
                </div>
              </motion.div>

              {/* Float #3 — top-left brief chip (hidden on tiny screens) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.65, ease }}
                className="absolute left-0 top-32 z-20 hidden rounded-full bg-white px-4 py-2 shadow-lg ring-1 ring-zinc-100 sm:left-2 sm:block"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-100">
                    <svg className="h-3 w-3 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
                      <path d="M14 2v6h6" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-xs font-semibold text-zinc-900">Brief sent</span>
                </div>
              </motion.div>

              {/* Float #4 — bottom-right action chip (hidden on tiny screens) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.85, ease }}
                className="absolute bottom-24 right-2 z-20 hidden items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 shadow-lg sm:flex"
              >
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="text-[11px] font-semibold text-white">3 new bookings</span>
              </motion.div>
            </motion.div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      className="h-4 w-4 text-brand-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
