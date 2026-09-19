import React from 'react';
import { Hero } from './hero/Hero';

export { Hero } from './hero/Hero';
export { HeroDesktop } from './hero/HeroDesktop';
export { HeroMobile } from './hero/HeroMobile';
export { HeroMotionWrapper } from './hero/HeroMotion';

interface HeroSectionProps {
  onOpenCaseStudy: (slug: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = (props) => {
  return <Hero {...props} />;
};
