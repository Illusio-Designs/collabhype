import Hero from '@/components/home/Hero';
import BrandMarquee from '@/components/home/BrandMarquee';
import Stats from '@/components/home/Stats';
import Services from '@/components/home/Services';
import HowItWorks from '@/components/home/HowItWorks';
import Tiers from '@/components/home/Tiers';
import FeaturedPackages from '@/components/home/FeaturedPackages';
import ForBrandsAndCreators from '@/components/home/ForBrandsAndCreators';
import Niches from '@/components/home/Niches';
import Testimonials from '@/components/home/Testimonials';
import FAQSection from '@/components/home/FAQSection';
import Newsletter from '@/components/home/Newsletter';
import FinalCTA from '@/components/home/FinalCTA';
import { DUMMY_NICHES, DUMMY_PACKAGES } from '@/lib/dummyData';

export default function HomePage() {
  // Dummy data — backend-independent so the marketing UI always renders.
  // When wiring to live data, swap these for apiFetchSafe calls.
  const featured = DUMMY_PACKAGES;
  const niches = DUMMY_NICHES;

  return (
    <>
      <Hero />
      <BrandMarquee />
      <Stats />
      <Services />
      <HowItWorks />
      <Tiers />
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
