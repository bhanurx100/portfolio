/**
 * Selected Work — mobile presentation.
 *
 * Deliberately NOT a horizontal swipe reel: on a phone, projects read better
 * as a vertical editorial rhythm — device first (the product), then the story,
 * then actions. One project per screenful, honest evidence labels.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ProjectShowcaseItem } from './ProjectCardDesktop';
import { DeviceFrame } from '../../common/DeviceFrame';
import { StayEaseScreen } from '../../common/AppScreens';
import { SplitFinScreen } from '../../common/SplitFinScreen';

interface ProjectReelMobileProps {
  projects: ProjectShowcaseItem[];
  onOpenCaseStudy: (slug: string) => void;
}

export const ProjectReelMobile: React.FC<ProjectReelMobileProps> = ({
  projects,
  onOpenCaseStudy,
}) => {
  return (
    <div className="flex flex-col">
      {projects.map((project, idx) => {
        const accent = project.id === 'stayease' ? 'var(--accent)' : 'var(--ok)';
        return (
          <motion.article
            key={project.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`py-10 ${idx > 0 ? 'border-t border-[var(--line)] dark:border-[var(--line-dark)]' : ''}`}
          >
            {/* Kicker */}
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <span className="tech-label" style={{ color: accent }}>
                {String(idx + 1).padStart(2, '0')} · {project.category}
              </span>
              <span
                className="rounded-full shrink-0"
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '3px 10px',
                  color: 'var(--text-2)',
                  background: 'color-mix(in srgb, var(--text-3) 12%, transparent)',
                }}
              >
                2025
              </span>
            </div>

            {/* Device first — the product is the hero */}
            <div className="flex justify-center mb-6">
              <DeviceFrame width={216} ariaLabel={`${project.name} app preview`}>
                {project.id === 'stayease' ? <StayEaseScreen /> : <SplitFinScreen />}
              </DeviceFrame>
            </div>

            {/* Story */}
            <div className="space-y-3">
              <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
                {project.name}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: 'var(--text-2)' }}>
                {project.tagline}
              </p>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-3)', borderLeft: `3px solid ${accent}`, paddingLeft: 12 }}>
                {project.why}
              </p>
              <p className="tech-label" style={{ letterSpacing: 0, textTransform: 'none', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)' }}>
                {project.technologies.join('  ·  ')}
              </p>
            </div>

            {/* Actions — full-width primary, 44px+ targets */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => onOpenCaseStudy(project.id)}
                className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl"
                style={{
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                  background: 'var(--text-1)',
                  color: 'var(--canvas-bg)',
                }}
              >
                Case study
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Live demo of ${project.name}`}
                  className="inline-flex items-center justify-center rounded-xl"
                  style={{
                    height: 48,
                    padding: '0 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    border: '1.5px solid var(--line-strong)',
                    color: 'var(--accent)',
                  }}
                >
                  Live ↗
                </a>
              )}
            </div>
            <p className="tech-label" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12, marginTop: 8 }}>
              {project.githubUrl
                ? 'Source and live demo linked — case study covers architecture and decisions.'
                : 'Live demo linked — case study covers architecture and decisions.'}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
};
