/**
 * Hero — Mobile composition (<lg).
 *
 * Mobile hierarchy rebuilt intentionally: identity statement first, then ONE
 * interactive device preview (the strongest proof), then CTAs. The preview is
 * interactive on mobile — search, booking sheet and split engine all work.
 */

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import { personalInfo } from '../../../data/portfolio-data';
import { useTheme } from '../../../context/ThemeContext';
import { DeviceFrame } from '../../common/DeviceFrame';
import { StayEaseScreen } from '../../common/AppScreens';
import { SplitFinScreen } from '../../common/SplitFinScreen';

interface HeroMobileProps {
  onOpenCaseStudy: (slug: string) => void;
}

export const HeroMobile: React.FC<HeroMobileProps> = ({ onOpenCaseStudy }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();
  const [project, setProject] = useState<'stayease' | 'splitfin'>('stayease');

  return (
    <div className="block lg:hidden w-full max-w-md mx-auto px-5 pt-24 pb-10">
      {/* Identity */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3 text-left"
      >
        <div className="tech-label" style={{ fontSize: 12 }}>{personalInfo.name}</div>
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2.1rem, 9vw, 2.6rem)',
            lineHeight: 1.1,
            fontWeight: 700,
            color: 'var(--text-1)',
          }}
        >
          I build software products — from idea to{' '}
          <span style={{ color: 'var(--accent)' }}>interface to system.</span>
        </h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-2)' }}>
          Product engineer across frontend, backend, mobile and applied AI.
        </p>
      </motion.div>

      {/* One device moment — interactive, tap-friendly */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="mt-8 flex flex-col items-center gap-5"
      >
        <DeviceFrame width={228} ariaLabel={`${project === 'stayease' ? 'StayEase' : 'SplitFin'} app preview`}>
          {project === 'stayease' ? <StayEaseScreen /> : <SplitFinScreen />}
        </DeviceFrame>

        {/* Project tabs + case study */}
        <div
          className="flex items-center rounded-full p-1 w-full"
          style={{ background: isDark ? 'var(--surface-1)' : '#fff', border: `1px solid var(--line${isDark ? '-dark' : ''})` }}
          role="tablist"
          aria-label="Switch project preview"
        >
          {(['stayease', 'splitfin'] as const).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={project === p}
              onClick={() => setProject(p)}
              className="flex-1 rounded-full transition-colors"
              style={{
                padding: '10px 0',
                fontSize: 13.5,
                fontWeight: 700,
                color: project === p ? 'var(--canvas-bg)' : 'var(--text-3)',
                background: project === p ? 'var(--text-1)' : 'transparent',
              }}
            >
              {p === 'stayease' ? 'StayEase' : 'SplitFin'}
            </button>
          ))}
        </div>
        <button
          onClick={() => onOpenCaseStudy(project)}
          className="w-full rounded-xl"
          style={{
            height: 44,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--accent)',
            background: 'transparent',
            border: `1.5px solid var(--line${isDark ? '-strong-dark' : '-strong'})`,
          }}
        >
          Interactive preview · read the case study →
        </button>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        className="mt-8 grid grid-cols-1 gap-3"
      >
        <a
          href="#builder-lab"
          className="flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 50,
            background: 'var(--text-1)',
            color: 'var(--canvas-bg)',
            fontSize: 15.5,
            fontWeight: 700,
          }}
        >
          See how I build <ArrowRight size={17} />
        </a>
        <a
          href="#work"
          className="flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 50,
            background: 'transparent',
            border: `1.5px solid var(--line${isDark ? '-strong-dark' : '-strong'})`,
            color: 'var(--text-1)',
            fontSize: 15.5,
            fontWeight: 600,
          }}
        >
          Explore the work
        </a>
      </motion.div>
    </div>
  );
};
