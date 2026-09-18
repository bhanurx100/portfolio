/**
 * Experience — professional context, compact.
 *
 * Editorial timeline: open composition, no cards, no pills. Two entries,
 * verifiable, each with what was built. Carries the compact identity strip
 * (merged from the old About section) at the top.
 */

import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { personalInfo } from '../../data/portfolio-data';

export interface ConciseExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  isCurrent: boolean;
  type: string;
  bullets: string[];
}

export const conciseExperienceList: ConciseExperience[] = [
  {
    id: 'cynosure',
    role: 'Software Engineer',
    company: 'Cynosure Software Solutions',
    location: 'Hyderabad, India (Remote)',
    period: 'Dec 2023 — Present',
    isCurrent: true,
    type: 'Full-time',
    bullets: [
      'Engineered product features and modular UI with React, Next.js and TypeScript across core application views.',
      'Managed client–server data flows with TanStack Query and REST — mutation handling, deduplication, cache invalidation.',
      'Built backend REST endpoints with Node.js and Express: request validation, auth checks, structured errors.',
    ],
  },
  {
    id: 'webbers',
    role: 'Frontend Developer Intern',
    company: 'Webbers Labs Technologies LLP',
    location: 'Mysuru, India',
    period: 'Mar 2023 — Jun 2023',
    isCurrent: false,
    type: 'Internship',
    bullets: [
      'Built responsive, accessible interfaces and reusable UI modules with React and Tailwind from design specs.',
      'Integrated frontend views with REST APIs — form validation, dynamic rendering, error handling.',
      'Resolved cross-browser layout issues; refactored legacy UI into modular components.',
    ],
  },
];

export const ExperienceSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section id="experience" aria-label="Professional experience" className="py-20 sm:py-28 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header */}
        <div className="max-w-2xl space-y-4 mb-12 sm:mb-16">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>Experience</p>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Where I've built.
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Identity strip — who I am, in plain text */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="lg:sticky lg:top-28 space-y-5">
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-2)' }}>
                I build products from first principles: clear data models, type-safe boundaries,
                resilient state — then the interface that makes them usable.
              </p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-3)' }}>
                Web apps, fintech and SaaS tooling. Strong frontend craft, structured APIs,
                dependable validation — and a bias for shipping.
              </p>
              <div className="space-y-1.5 pt-2" style={{ borderTop: `1px solid ${line}` }}>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{personalInfo.location}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-3)' }}>{personalInfo.availability}</div>
              </div>
            </div>
          </aside>

          {/* Timeline — open composition */}
          <div className="lg:col-span-8">
            {conciseExperienceList.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.08 }}
                className="block sm:grid sm:grid-cols-[120px_1fr] gap-5 sm:gap-8"
                style={{ paddingBottom: idx < conciseExperienceList.length - 1 ? 44 : 0 }}
              >
                {/* Date column — inline on mobile, right column on sm+ */}
                <div className="flex sm:block items-baseline gap-3 justify-between sm:text-right sm:justify-start pt-0 sm:pt-1 mb-2 sm:mb-0">
                  <div
                    className="tech-label"
                    style={{ color: exp.isCurrent ? 'var(--ok)' : 'var(--text-4)', lineHeight: 1.5 }}
                  >
                    {exp.period}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>{exp.type}</div>
                </div>

                {/* Rail + content */}
                <div className="relative pl-5 sm:pl-7" style={{ borderLeft: `2px solid ${line}` }}>
                  {/* Node */}
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: 11,
                      height: 11,
                      left: -6.5,
                      top: 6,
                      background: exp.isCurrent ? 'var(--ok)' : 'var(--text-4)',
                      boxShadow: exp.isCurrent ? '0 0 0 4px color-mix(in srgb, var(--ok) 18%, transparent)' : 'none',
                    }}
                    aria-hidden
                  />

                  <div className="space-y-2.5">
                    <h3 style={{ fontSize: 18.5, fontWeight: 750, letterSpacing: '-0.01em', color: 'var(--text-1)' }}>
                      {exp.role}
                    </h3>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5, fontWeight: 600, color: 'var(--text-2)' }}>
                      {exp.company}
                      <span style={{ color: 'var(--text-4)', fontWeight: 400 }}> · {exp.location}</span>
                    </div>
                    <ul className="space-y-2 pt-1">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="shrink-0 rounded-full" style={{ width: 5, height: 5, marginTop: 8, background: 'var(--text-4)' }} aria-hidden />
                          <span style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-2)' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
