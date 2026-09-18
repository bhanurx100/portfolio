import React from 'react';
import { HeroDesktop } from './HeroDesktop';
import { HeroMobile } from './HeroMobile';

interface HeroProps {
  onOpenCaseStudy: (slug: string) => void;
  onOpenCommandPalette?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenCaseStudy,
}) => {
  return (
    <section
      id="hero"
      className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center pt-6 sm:pt-10 pb-10 sm:pb-16 overflow-hidden"
    >
      {/* Desktop Composition (lg+) */}
      <HeroDesktop onOpenCaseStudy={onOpenCaseStudy} />

      {/* Mobile & Tablet Composition (<lg) */}
      <HeroMobile onOpenCaseStudy={onOpenCaseStudy} />
    </section>
  );
};
