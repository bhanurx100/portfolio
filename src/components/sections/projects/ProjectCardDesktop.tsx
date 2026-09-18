/**
 * Selected Work — desktop proof layer.
 *
 * Editorial open composition: real device on one side, honest narrative on
 * the other. No mega-cards, no badges-worth-of-borders, no invented metrics.
 * Every claim is defensible; status is explicit (BUILT / full codebase).
 */

import React from 'react';
import { ArrowRight, Github, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { DeviceFrame } from '../../common/DeviceFrame';
import { StayEaseScreen } from '../../common/AppScreens';
import { SplitFinScreen } from '../../common/SplitFinScreen';

export interface ProjectShowcaseItem {
  id: 'stayease' | 'splitfin';
  name: string;
  category: string;
  tagline: string;
  why: string;
  whatIBuilt: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  themeColor: 'blue' | 'emerald';
}

interface ProjectCardDesktopProps {
  project: ProjectShowcaseItem;
  index: number;
  onOpenCaseStudy: (slug: string) => void;
}

export const ProjectCardDesktop: React.FC<ProjectCardDesktopProps> = ({
  project,
  index,
  onOpenCaseStudy,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEven = index % 2 === 0;
  const accent = project.id === 'stayease' ? 'var(--accent)' : 'var(--ok)';

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-12 gap-10 xl:gap-16 items-center py-14"
    >
      {/* Narrative column */}
      <div className={`col-span-12 lg:col-span-7 space-y-6 ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
        {/* Kicker */}
        <div className="flex items-baseline gap-4">
          <span className="tech-label" style={{ color: accent }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.02em' }}>
            {project.category}
          </span>
        </div>

        {/* Title + tagline */}
        <div className="space-y-3">
          <h3 style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
            {project.name}
          </h3>
          <p style={{ fontSize: 16.5, lineHeight: 1.55, fontWeight: 500, color: 'var(--text-2)', maxWidth: 520 }}>
            {project.tagline}
          </p>
        </div>

        {/* Why — open composition, no nested card */}
        <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 16 }}>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-2)' }}>{project.why}</p>
        </div>

        {/* Built with — plain text, no pill wall */}
        <div className="space-y-1.5">
          <div className="tech-label">Built with</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-3)', maxWidth: 520 }}>
            {project.technologies.join('  ·  ')}
          </p>
        </div>

        {/* Evidence + actions */}
        <div className="flex items-center flex-wrap gap-x-5 gap-y-3 pt-1">
          <button
            onClick={() => onOpenCaseStudy(project.id)}
            className="group inline-flex items-center gap-2 rounded-xl"
            style={{
              height: 44,
              padding: '0 20px',
              fontSize: 14,
              fontWeight: 700,
              background: isDark ? '#F1F5F9' : '#0F172A',
              color: isDark ? '#0B1120' : '#F8FAFC',
            }}
          >
            Read the case study
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}
            >
              <Github size={15} /> Source
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}
            >
              <ExternalLink size={14} /> Live build
            </a>
          )}

          <span
            className="rounded-full"
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '4px 11px',
              color: 'var(--ok)',
              background: 'color-mix(in srgb, var(--ok) 12%, transparent)',
            }}
          >
            BUILT — FULL CODEBASE
          </span>
        </div>
      </div>

      {/* Device column */}
      <div className={`col-span-12 lg:col-span-5 flex justify-center ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
        <DeviceFrame width={248} ariaLabel={`${project.name} app preview`}>
          {project.id === 'stayease' ? <StayEaseScreen /> : <SplitFinScreen />}
        </DeviceFrame>
      </div>
    </motion.article>
  );
};
