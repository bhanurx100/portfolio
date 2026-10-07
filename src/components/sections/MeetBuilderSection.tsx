/**
 * Meet the Builder — a short human intro, not a philosophy deck.
 *
 * One headline, one honest paragraph, three working principles, and the
 * facts that matter (where, how long, availability) with a way to reach me.
 * No tabs, no state — it reads in under thirty seconds.
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { personalInfo } from '../../data/portfolio-data';

const PRINCIPLES: { n: string; title: string; detail: string }[] = [
  {
    n: '01',
    title: 'Start from the product workflow, not the stack.',
    detail: 'Understand accounts, bookings, and data flows first — then choose tools.',
  },
  {
    n: '02',
    title: 'Keep interfaces, APIs, and data consistent.',
    detail: 'Reusable components, typed flows, and maintainable architecture across screens.',
  },
  {
    n: '03',
    title: 'Build for real use and iteration.',
    detail: 'Responsive layouts, predictable state, and incremental improvements that hold up.',
  },
];

export const MeetBuilderSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const prefersReducedMotion = useReducedMotion();
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section id="meet-the-builder" aria-label="Meet the builder" className="py-12 sm:py-16 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="tech-label" style={{ color: 'var(--accent)' }}>Meet the builder</p>
          <h2 className="mt-2" style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Hi, I'm {personalInfo.shortName} — {personalInfo.headline.charAt(0).toLowerCase() + personalInfo.headline.slice(1)}
          </h2>
          <p className="mt-3" style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-2)' }}>
            {personalInfo.title} — {personalInfo.positioning} {personalInfo.supporting}
          </p>

          {/* Principles — three short rows */}
          <div className="mt-6 divide-y" style={{ borderColor: line, borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="flex items-baseline gap-4 py-3.5">
                <span className="font-mono shrink-0" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>
                  {p.n}
                </span>
                <div className="min-w-0">
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)' }}>{p.title}</div>
                  <div className="mt-0.5" style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-3)' }}>{p.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Facts + contact */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="inline-flex items-center gap-1.5 font-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              {personalInfo.location}
            </span>
            <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {personalInfo.availability}
            </span>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-xl"
              style={{ height: 44, padding: '0 20px', fontSize: 14, fontWeight: 700, background: isDark ? '#F1F5F9' : '#0F172A', color: isDark ? '#0B1120' : '#F8FAFC' }}
            >
              Get in touch
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
