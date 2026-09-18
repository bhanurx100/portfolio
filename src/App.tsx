/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { HeroSection } from './components/sections/HeroSection';

/* Builder Lab is below the fold and self-contained — load it on demand. */
const BuilderLabSection = lazy(() =>
  import('./components/sections/build-engine/BuilderLab').then((m) => ({ default: m.BuilderLabSection }))
);
/* GitHub (contribution graph) sits far below the fold — defer it too. */
const GitHubSection = lazy(() =>
  import('./components/sections/GitHubSection').then((m) => ({ default: m.GitHubSection }))
);
/* On-demand overlays — only fetched when first needed. */
const CommandPalette = lazy(() =>
  import('./components/common/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);
const CaseStudyModal = lazy(() =>
  import('./components/common/CaseStudyModal').then((m) => ({ default: m.CaseStudyModal }))
);
import { ProjectsSection } from './components/sections/ProjectsSection';
import { HowIBuildSection } from './components/sections/HowIBuild';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/common/Footer';
import { GlobalBackground } from './components/common/GlobalBackground';
import { projectsData } from './data/portfolio-data';

function PortfolioMain() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedCaseStudySlug, setSelectedCaseStudySlug] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const isDark = theme === 'dark';

  // Scroll spy to detect active section in viewport
  useEffect(() => {
    const sections = ['hero', 'work', 'how-i-build', 'builder-lab', 'experience', 'github', 'contact'];
    
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenCaseStudy = (slug: string) => {
    setSelectedCaseStudySlug(slug);
  };

  const handleCloseCaseStudy = () => {
    setSelectedCaseStudySlug(null);
  };

  const handleOpenCommandPalette = () => {
    setIsCommandPaletteOpen(true);
  };

  const handleCloseCommandPalette = () => {
    setIsCommandPaletteOpen(false);
  };

  const currentProject = selectedCaseStudySlug ? projectsData[selectedCaseStudySlug] : null;

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-600 selection:text-white flex flex-col relative transition-colors duration-300 ${
      isDark ? 'bg-[#0E1626] text-slate-200' : 'bg-[#EEF2F6] text-slate-900'
    }`}>
      {/* Restrained Quiet Ambient Background */}
      <GlobalBackground />

      {/* Sticky Clean Header Navigation */}
      <Header
        activeSection={activeSection}
        onOpenCommandPalette={handleOpenCommandPalette}
      />

      {/* Main Content Sections with Subtle Page Reveal */}
      <motion.main
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-1 relative z-10"
      >
        <HeroSection
          onOpenCaseStudy={handleOpenCaseStudy}
          onOpenCommandPalette={handleOpenCommandPalette}
        />
        <ProjectsSection onOpenCaseStudy={handleOpenCaseStudy} />
        <HowIBuildSection />
        <Suspense fallback={<div id="builder-lab" style={{ minHeight: 420 }} aria-hidden /> }>
          <BuilderLabSection />
        </Suspense>
        <ExperienceSection />
        <Suspense fallback={<div id="github" style={{ minHeight: 320 }} aria-hidden />}>
          <GitHubSection />
        </Suspense>
        <ContactSection />
      </motion.main>

      <Suspense fallback={null}>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={handleCloseCommandPalette}
          onOpenCaseStudy={handleOpenCaseStudy}
        />
      </Suspense>

      {/* Refined Footer */}
      <Footer />

      {/* Case Study Modal */}
      <Suspense fallback={null}>
        <CaseStudyModal
          project={currentProject}
          isOpen={Boolean(selectedCaseStudySlug)}
          onClose={handleCloseCaseStudy}
          onSwitchProject={handleOpenCaseStudy}
        />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PortfolioMain />
    </ThemeProvider>
  );
}
