/**
 * Selected Work — mobile presentation.
 *
 * Deliberately NOT a horizontal swipe reel: on a phone, projects read better
 * as a vertical editorial rhythm — device first (the product), then the story,
 * then actions. One project per screenful, honest evidence labels.
 */

import React from 'react';
import { ArrowRight, Github, ExternalLink } from 'lucide-react';
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
                  color: 'var(--ok)',
                  background: 'color-mix(in srgb, var(--ok) 12%, transparent)',
                }}
              >
                BUILT
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
                  color: 'var(--surface-0)',
                }}
              >
                Case study
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.name} source on GitHub`}
                  className="inline-flex items-center justify-center rounded-xl"
                  style={{
                    height: 48,
                    width: 48,
                    border: '1.5px solid var(--line-strong)',
                    color: 'var(--text-2)',
                  }}
                >
                  <Github size={18} />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.name} live build`}
                  className="inline-flex items-center justify-center rounded-xl"
                  style={{
                    height: 48,
                    width: 48,
                    border: '1.5px solid var(--line-strong)',
                    color: 'var(--text-2)',
                  }}
                >
                  <ExternalLink size={17} />
                </a>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};
