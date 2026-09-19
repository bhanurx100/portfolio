/**
 * Meet the Builder — cross-identity, not a bio dup.
 *
 * Five crafts under one identity: PRODUCT · ENGINEERING · AI · MOBILE · SYSTEMS.
 * Each is a lens, not a badge — tap an identity to see what it means in
 * practice and where it's witnessed on this page. Every line is honest and
 * traceable to a real artifact in the portfolio.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import {
  Boxes,
  Cpu,
  Map,
  MapPin,
  Route,
  Sparkles,
} from 'lucide-react';

interface Identity {
  id: string;
  icon: React.ReactNode;
  title: string;
  meaning: string;
  witness: string;
  href: string;
}

const IDENTITIES: Identity[] = [
  {
    id: 'product',
    icon: <Route className="w-3.5 h-3.5" />,
    title: 'PRODUCT',
    meaning:
      'Read the job to be done before writing code. Tradeoffs are framed as advantages and consequences — decided on the canvas, not by vibes.',
    witness: 'as seen in · Builder Lab decision room',
    href: '#builder-lab',
  },
  {
    id: 'engineering',
    icon: <Cpu className="w-3.5 h-3.5" />,
    title: 'ENGINEERING',
    meaning:
      'Type-safe boundaries, deterministic engines, small surfaces. The builder on this page composes systems from typed patterns — no random, no account.',
    witness: 'as seen in · the engine behind Builder Lab',
    href: '#builder-lab',
  },
  {
    id: 'ai',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    title: 'AI',
    meaning:
      'AI is a structured build partner — research, synthesis, code review, pattern extraction — never an authority. Claims stay repo-backed.',
    witness: 'as seen in · Mode-B composition in Builder Lab',
    href: '#builder-lab',
  },
  {
    id: 'mobile',
    icon: <Boxes className="w-3.5 h-3.5" />,
    title: 'MOBILE',
    meaning:
      'Offline-first React Native for StayEase and SplitFin — one codebase, both stores, Maestro-verified flows on real simulators.',
    witness: 'as seen in · the two apps in my work',
    href: '#work',
  },
  {
    id: 'systems',
    icon: <Map className="w-3.5 h-3.5" />,
    title: 'SYSTEMS',
    meaning:
      'Systems are designed before they are coded: state machines, message flows, gate recovery. Failure is a designed path, not an accident.',
    witness: 'as seen in · simulation · recovery · gates',
    href: '#builder-lab',
  },
];

const AI_PRACTICES: { title: string; detail: string }[] = [
  { title: 'Research & synthesis', detail: 'AI gathers and structures signals; I decide what they mean.' },
  { title: 'Codegen & review', detail: 'Drafts and diffs pass through human-shaped review before landing.' },
  { title: 'Determinism by design', detail: 'Product logic lives in typed engines I control — AI stays a contributor, never the authority.' },
];

export const MeetBuilderSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const identity = IDENTITIES[active];
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section id="meet-the-builder" aria-label="Meet the builder" className="py-12 sm:py-16 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-8">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>Meet the builder</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            One identity, five crafts.
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* The human story */}
          <aside className="lg:col-span-5 space-y-5">
            <div className="lg:sticky lg:top-28 space-y-5">
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-2)' }}>
                I ship software like a small product studio: figure out what the job actually
                is, model it cleanly, then build the smallest system that survives contact
                with real users.
              </p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-3)' }}>
                The apps on this page are not demos — they run offline-first, hold real money
                records, and are verified end-to-end on simulators. When I call something
                production, it means you can break it and it recovers.
              </p>

              {/* How AI fits the workflow — honest, bounded */}
              <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: line, background: isDark ? 'rgba(148,163,184,0.05)' : '#fff' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  <span className="tech-label" style={{ color: 'var(--text-2)' }}>How AI fits my workflow</span>
                </div>
                {AI_PRACTICES.map((p) => (
                  <div key={p.title}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{p.title}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.65, color: 'var(--text-3)' }}>{p.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Cross-identity selector */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 min-[480px]:grid-cols-5 gap-1.5" role="tablist" aria-label="Identity crafts">
              {IDENTITIES.map((it, i) => {
                const on = i === active;
                return (
                  <button
                    key={it.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(i)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border transition min-h-[44px]"
                    style={{
                      borderColor: on ? 'var(--accent)' : line,
                      background: on ? (isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.07)') : 'transparent',
                      color: on ? 'var(--accent)' : 'var(--text-2)',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                    }}
                    aria-label={`Identity: ${it.title}`}
                  >
                    {it.icon}
                    <span className="hidden min-[980px]:inline">{it.title}</span>
                    <span className="min-[980px]:hidden">{it.title.slice(0, 1)}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={identity.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-2xl border p-5"
                style={{ borderColor: line, background: isDark ? 'rgba(148,163,184,0.05)' : '#fff', minHeight: 168 }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--accent)' }}>{identity.icon}</span>
                  <span className="tech-label" style={{ color: 'var(--accent)' }}>{identity.title}</span>
                </div>
                <p className="mt-2.5" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-1)', fontWeight: 500 }}>
                  {identity.meaning}
                </p>
                <a href={identity.href} className="inline-flex items-center gap-1.5 mt-3 font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                  <MapPin className="w-3 h-3" />
                  <span className="transition" style={{}}>{identity.witness}</span>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};