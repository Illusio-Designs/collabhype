import Marquee from '@/components/motion/Marquee';

const BRANDS = [
  'NOVA',
  'SUTRA',
  'BLOOM',
  'PLUM',
  'VITA',
  'ZEN',
  'ATLAS',
  'AURA',
  'KAVI',
  'LUMEN',
  'SAGE',
  'OLIVE',
];

export default function BrandMarquee() {
  return (
    <section className="border-y border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Trusted by next-generation brands
        </p>
        <Marquee items={BRANDS} duration={40} />
      </div>
    </section>
  );
}
