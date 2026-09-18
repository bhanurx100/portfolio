/**
 * Hero — Desktop composition (lg+).
 *
 * Editorial layout: product-builder positioning on the left, a TWO-DEVICE
 * stage on the right — the active product in front, the other product behind
 * it. Click the rear device (or its chip) to swap foreground/background.
 * Restored interaction model; layout intentionally unchanged otherwise.
 */

import React, { useState } from 'react';
import { ArrowRight, MoveRight, Repeat } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import { personalInfo } from '../../../data/portfolio-data';
import { useTheme } from '../../../context/ThemeContext';
import { DeviceFrame } from '../../common/DeviceFrame';
import { StayEaseScreen } from '../../common/AppScreens';
import { SplitFinScreen } from '../../common/SplitFinScreen';

interface HeroDesktopProps {
  onOpenCaseStudy: (slug: string) => void;
}

export const HeroDesktop: React.FC<HeroDesktopProps> = ({ onOpenCaseStudy }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();
  const [front, setFront] = useState<'stayease' | 'splitfin'>('stayease');

  return (
    <div className="hidden lg:block w-full">
      <div className="max-w-6xl mx-auto px-8 pt-28 pb-16 grid grid-cols-12 gap-10 items-center min-h-[88vh]">
        {/* Left — editorial identity */}
        <div className="col-span-7 space-y-7">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full"
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '6px 14px',
                color: 'var(--ok)',
                background: 'color-mix(in srgb, var(--ok) 10%, transparent)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {personalInfo.availability}
            </span>
            <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>{personalInfo.location} · Remote</span>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="space-y-4"
          >
            <div className="tech-label" style={{ fontSize: 13 }}>{personalInfo.name}</div>
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(2.6rem, 4.2vw, 3.9rem)',
                lineHeight: 1.06,
                fontWeight: 700,
                color: 'var(--text-1)',
              }}
            >
              I build software products —
              <br />
              <span style={{ color: 'var(--accent)' }}>from idea to interface to system.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--text-2)', maxWidth: 560 }}>
              Product engineer working across frontend, backend, mobile and applied AI.
              Two shipped products below — and a lab where you can watch how I design the systems behind them.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="flex items-center gap-4 pt-1"
          >
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]"
              style={{
                height: 48,
                padding: '0 22px',
                background: isDark ? '#F1F5F9' : '#0F172A',
                color: isDark ? '#0F172A' : '#F8FAFC',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Explore the work <ArrowRight size={17} />
            </a>
            <a
              href="#builder-lab"
              className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]"
              style={{
                height: 48,
                padding: '0 22px',
                background: 'transparent',
                border: `1.5px solid var(--line${isDark ? '-strong-dark' : '-strong'})`,
                color: 'var(--text-1)',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              See how I build <MoveRight size={17} />
            </a>
          </motion.div>
        </div>

        {/* Right — two-device stage: foreground product + background product.
            Click the rear device to bring it forward. */}
        <motion.div
          className="col-span-5 flex flex-col items-center gap-5"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative w-full" style={{ height: 620 }}>
            {(['stayease', 'splitfin'] as const).map((p) => {
              const isFront = p === front;
              const Screen = p === 'stayease' ? StayEaseScreen : SplitFinScreen;
              return (
                <motion.div
                  key={p}
                  layout
                  className={isFront ? 'absolute left-0 bottom-0 z-20' : 'absolute right-0 top-0 z-10'}
                  animate={{
                    scale: isFront ? 1 : 0.84,
                    opacity: isFront ? 1 : 0.5,
                    filter: isFront ? 'blur(0px)' : 'blur(1.5px)',
                  }}
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 240 }}
                  style={{ transformOrigin: isFront ? 'bottom left' : 'top right' }}
                >
                  {isFront ? (
                    <div>
                      <DeviceFrame width={276} ariaLabel={`${p === 'stayease' ? 'StayEase' : 'SplitFin'} app preview`}>
                        <Screen />
                      </DeviceFrame>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFront(p)}
                      aria-label={`Bring ${p === 'stayease' ? 'StayEase' : 'SplitFin'} to the front`}
                      className="group relative block"
                    >
                      <DeviceFrame width={276} ariaLabel={`${p === 'stayease' ? 'StayEase' : 'SplitFin'} app preview`}>
                        <Screen />
                      </DeviceFrame>
                      <span
                        className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full whitespace-nowrap"
                        style={{
                          bottom: 22,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--text-1)',
                          background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)',
                          border: `1px solid var(--line${isDark ? '-dark' : ''})`,
                          boxShadow: isDark ? 'var(--shadow-1-dark)' : 'var(--shadow-1)',
                        }}
                      >
                        <Repeat size={12} />
                        View {p === 'stayease' ? 'StayEase' : 'SplitFin'}
                      </span>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Project switcher + case study */}
          <div
            className="flex items-center gap-1 rounded-full p-1"
            style={{ background: isDark ? 'var(--surface-1)' : '#fff', border: `1px solid var(--line${isDark ? '-dark' : ''})` }}
            role="tablist"
            aria-label="Switch project preview"
          >
            {(['stayease', 'splitfin'] as const).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={front === p}
                onClick={() => setFront(p)}
                className="relative rounded-full transition-colors"
                style={{
                  padding: '8px 18px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: front === p ? (isDark ? '#0B1120' : '#F8FAFC') : 'var(--text-3)',
                  background: front === p ? (isDark ? '#F1F5F9' : '#0F172A') : 'transparent',
                }}
              >
                {p === 'stayease' ? 'StayEase' : 'SplitFin'}
              </button>
            ))}
            <button
              onClick={() => onOpenCaseStudy(front)}
              className="rounded-full"
              style={{
                padding: '8px 18px',
                fontSize: 13.5,
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'transparent',
              }}
            >
              Case study ↗
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
