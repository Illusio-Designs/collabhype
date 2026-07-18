import Hero from '@/components/home/Hero';
import BrandMarquee from '@/components/home/BrandMarquee';
import Stats from '@/components/home/Stats';
import Services from '@/components/home/Services';
import HowItWorks from '@/components/home/HowItWorks';
import Tiers from '@/components/home/Tiers';
import CreatorReels from '@/components/home/CreatorReels';
import FeaturedPackages from '@/components/home/FeaturedPackages';
import ForBrandsAndCreators from '@/components/home/ForBrandsAndCreators';
import Niches from '@/components/home/Niches';
import Testimonials from '@/components/home/Testimonials';
import FAQSection from '@/components/home/FAQSection';
import Newsletter from '@/components/home/Newsletter';
import FinalCTA from '@/components/home/FinalCTA';
import { apiFetchSafe } from '@/lib/api';
import { metadataForSlug } from '@/lib/content';

export async function generateMetadata() {
  return metadataForSlug('home', {
    title: "Collabhype — India's self-serve influencer marketplace",
    description:
      'Buy Nano creator packs in bulk or hand-pick Micro/Macro/Mega creators. Escrow-backed payouts, transparent pricing.',
  });
}

export default async function HomePage() {
  const [packagesData, nichesData] = await Promise.all([
    apiFetchSafe('/api/v1/packages?limit=8', null),
    apiFetchSafe('/api/v1/niches', null),
  ]);
  const featured = packagesData?.packages ?? [];
  const niches = nichesData?.niches ?? [];

  return (
    <>
      <Hero />
      <BrandMarquee />
      <Stats />
      <Services />
      <HowItWorks />
      <Tiers />
      <CreatorReels />
      <FeaturedPackages packages={featured} />
      <ForBrandsAndCreators />
      <Niches niches={niches} />
      <Testimonials />
      <FAQSection />
      <Newsletter />
      <FinalCTA />
    </>
  );
}
