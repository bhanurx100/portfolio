import React from 'react';
import { HeroDesktop } from './HeroDesktop';
import { HeroMobile } from './HeroMobile';

interface HeroProps {
  onOpenCaseStudy: (slug: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenCaseStudy,
}) => {
  return (
    <section
      id="hero"
      className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center pt-4 sm:pt-6 pb-6 sm:pb-10 overflow-hidden"
    >
      {/* Desktop Composition (lg+) */}
      <HeroDesktop onOpenCaseStudy={onOpenCaseStudy} />

      {/* Mobile & Tablet Composition (<lg) */}
      <HeroMobile onOpenCaseStudy={onOpenCaseStudy} />
    </section>
  );
};
