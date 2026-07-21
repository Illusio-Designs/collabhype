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
import LatestBlog from '@/components/home/LatestBlog';
import Newsletter from '@/components/home/Newsletter';
import FinalCTA from '@/components/home/FinalCTA';
import { metadataForSlug } from '@/lib/content';

export async function generateMetadata() {
  return metadataForSlug('home', {
    title: "Collabhype — India's self-serve influencer marketplace",
    description:
      'Buy Nano creator packs in bulk or hand-pick Micro/Macro/Mega creators. Escrow-backed payouts, transparent pricing.',
  });
}

// The data-driven sections (FeaturedPackages, Niches, LatestBlog) fetch their
// own data from the browser via apiClient, so those calls are visible in the
// Network tab. This page stays a server component only to emit SEO metadata.
export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <Stats />
      <Services />
      <HowItWorks />
      <Tiers />
      <CreatorReels />
      <FeaturedPackages />
      <ForBrandsAndCreators />
      <Niches />
      <Testimonials />
      <LatestBlog />
      <FAQSection />
      <Newsletter />
      <FinalCTA />
    </>
  );
}
