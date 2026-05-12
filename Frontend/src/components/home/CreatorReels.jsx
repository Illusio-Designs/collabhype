'use client';

import { motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { formatCount } from '@/lib/format';

// Reel placeholders. Swap in real video thumbnails when wiring the API.
const REELS = [
  {
    id: 'r1',
    handle: '@aanyamehta',
    niche: 'Beauty',
    title: 'Bloom serum routine',
    views: 124000,
    likes: 9800,
    gradient: 'from-rose-300 via-pink-400 to-fuchsia-500',
  },
  {
    id: 'r2',
    handle: '@rohaniyer',
    niche: 'Tech',
    title: 'Lenskart Air 2 review',
    views: 287000,
    likes: 21000,
    gradient: 'from-sky-400 via-indigo-500 to-violet-600',
  },
  {
    id: 'r3',
    handle: '@priyafit',
    niche: 'Fitness',
    title: '5-min morning routine',
    views: 542000,
    likes: 38000,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
  },
  {
    id: 'r4',
    handle: '@vikramfoodie',
    niche: 'Food',
    title: 'Chinese Wok ASMR',
    views: 198000,
    likes: 15600,
    gradient: 'from-amber-400 via-orange-500 to-red-500',
  },
  {
    id: 'r5',
    handle: '@karangames',
    niche: 'Gaming',
    title: 'boAt headset unbox',
    views: 712000,
    likes: 52000,
    gradient: 'from-violet-500 via-purple-600 to-indigo-700',
  },
  {
    id: 'r6',
    handle: '@naina_mom',
    niche: 'Parenting',
    title: 'Mamaearth diaper run',
    views: 89000,
    likes: 6400,
    gradient: 'from-pink-400 via-rose-400 to-amber-300',
  },
];

export default function CreatorReels() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="eyebrow">Creators in action</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Real campaigns, real results
          </h2>
          <p className="mt-4 text-zinc-600">
            A glimpse of recent posts from Collabhype creators across niches and cities.
          </p>
        </motion.div>

        <StaggerContainer className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {REELS.map((reel) => (
            <StaggerItem key={reel.id}>
              <ReelCard reel={reel} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ReelCard({ reel }) {
  const initial = reel.handle.replace('@', '').charAt(0).toUpperCase();
  return (
    <div className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl shadow-md ring-1 ring-zinc-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* gradient bg standing in for a video thumbnail */}
      <div className={`absolute inset-0 bg-gradient-to-br ${reel.gradient}`} />

      {/* highlight wash */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 55%)',
        }}
        aria-hidden
      />

      {/* faded initial as visual filler */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-7xl font-black text-white/25">{initial}</div>
      </div>

      {/* play icon, fades in on hover */}
      <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/25 backdrop-blur-md ring-1 ring-white/40">
          <Play className="h-6 w-6 translate-x-[1px] text-white" fill="currentColor" />
        </div>
      </div>

      {/* niche tag */}
      <div className="absolute left-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
        {reel.niche}
      </div>

      {/* bottom info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 text-white">
        <div className="truncate text-[11px] font-medium text-white/85">{reel.title}</div>
        <div className="mt-0.5 truncate text-sm font-bold">{reel.handle}</div>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3" fill="currentColor" />
            {formatCount(reel.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" fill="currentColor" />
            {formatCount(reel.likes)}
          </span>
        </div>
      </div>
    </div>
  );
}

