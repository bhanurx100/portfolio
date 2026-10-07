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
import { personalInfo, experienceData } from '../../data/portfolio-data';

export const ExperienceSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section id="experience" aria-label="Professional experience" className="py-12 sm:py-16 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header */}
        <div className="max-w-2xl space-y-3 mb-8">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>Experience</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Where I've built.
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Identity strip — who I am, in plain text */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="lg:sticky lg:top-28 space-y-5">
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-2)' }}>
                {personalInfo.positioning}
              </p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-3)' }}>
                {personalInfo.supporting}
              </p>
              <div className="space-y-1.5 pt-2" style={{ borderTop: `1px solid ${line}` }}>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{personalInfo.location}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-3)' }}>{personalInfo.availability}</div>
              </div>
            </div>
          </aside>

          {/* Timeline — open composition */}
          <div className="lg:col-span-8">
            {experienceData.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.08 }}
                className="block sm:grid sm:grid-cols-[120px_1fr] gap-5 sm:gap-8"
                style={{ paddingBottom: idx < experienceData.length - 1 ? 44 : 0 }}
              >
                {/* Date column — inline on mobile, right column on sm+ */}
                <div className="flex sm:block items-baseline gap-3 justify-between sm:text-right sm:justify-start pt-0 sm:pt-1 mb-2 sm:mb-0">
                  <div
                    className="tech-label"
                    style={{ color: exp.isCurrent ? 'var(--ok)' : 'var(--text-3)', lineHeight: 1.5 }}
                  >
                    {exp.period}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{exp.type}</div>
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
                      <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> · {exp.location}</span>
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-3)' }}>{exp.summary}</p>
                    <ul className="space-y-2 pt-1">
                      {exp.points.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="shrink-0 rounded-full" style={{ width: 5, height: 5, marginTop: 8, background: 'var(--text-4)' }} aria-hidden />
                          <span style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-2)' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-3)', paddingTop: 4 }}>
                      {exp.technologies.join('  ·  ')}
                    </p>
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
