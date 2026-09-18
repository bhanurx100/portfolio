/**
 * How I Build — the process section.
 *
 * Not a capabilities grid. One product problem walked through the seven
 * stages I actually work in; each stage asks its real question and points to
 * evidence from shipped work. Single column of stages, one expanded at a
 * time — reads as a story on mobile, as a two-column composition on desktop.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion } from 'motion/react';

interface Stage {
  id: string;
  n: string;
  title: string;
  question: string;
  what: string[];
  evidence: { text: string; ref: string };
}

const STAGES: Stage[] = [
  {
    id: 'understand',
    n: '01',
    title: 'Understand',
    question: 'What problem are we solving, for whom, and what does “better” mean?',
    what: [
      'Write the problem in one sentence a user would actually say.',
      'Name the moment the current process breaks — build for that moment.',
    ],
    evidence: { text: 'SplitFin started from a real mismatch: money is shared constantly, but banking apps, spreadsheets and splitting tools each cover only part of it.', ref: 'SplitFin' },
  },
  {
    id: 'model',
    n: '02',
    title: 'Model',
    question: 'What are the entities, states and constraints — before any code?',
    what: [
      'Data model first: entities, relationships, and where truth lives.',
      'Decide the failure model as part of the model, not after launch.',
    ],
    evidence: { text: 'SplitFin’s model: accounts, transactions, categories, split groups/members — typed once across client, ledger and database so the schema is the contract.', ref: 'SplitFin' },
  },
  {
    id: 'design',
    n: '03',
    title: 'Design',
    question: 'What should this feel like at 390px wide, with one thumb?',
    what: [
      'Design the phone layout first; desktop gets the same story with more air.',
      'Primary actions within thumb reach, 44px targets, no decoration without a job.',
    ],
    evidence: { text: 'StayEase booking flow: search → hotel detail → rooms → guest info → payment, each step one decision wide.', ref: 'StayEase' },
  },
  {
    id: 'build',
    n: '04',
    title: 'Build',
    question: 'What is the smallest slice that runs end to end?',
    what: [
      'UI → state → API → data, vertically, in that order — no layer done “first”.',
      'Type the contract once (TypeScript across client, ledger and database) and let both sides drift together.',
    ],
    evidence: { text: 'Both products share this shape: typed contracts from screen to database — the ledger in SplitFin, live inventory in StayEase — so a contract change breaks at compile time, not in production.', ref: 'StayEase + SplitFin' },
  },
  {
    id: 'stress',
    n: '05',
    title: 'Stress',
    question: 'What happens when it fails — offline, rejected, interrupted?',
    what: [
      'Rehearse the unhappy paths: no network, duplicate submits, half-finished flows.',
      'Make recovery boring: idempotent writes, queued retries, human escalation when it matters.',
    ],
    evidence: { text: 'StayEase caches rate-limited external APIs behind a 10-minute enrichment cache; the Builder Lab on this page lets you break a system on purpose and watch it reroute.', ref: 'StayEase + Builder Lab' },
  },
  {
    id: 'measure',
    n: '06',
    title: 'Measure',
    question: 'What should improve next — and can I observe it honestly?',
    what: [
      'Instrument what answers a question; skip what only decorates a dashboard.',
      'Report what is real. No invented benchmarks, ever.',
    ],
    evidence: { text: 'Every number on this portfolio is either observable in the demo or labeled as a simulation — that standard applies to work too.', ref: 'This site' },
  },
  {
    id: 'ship',
    n: '07',
    title: 'Ship',
    question: 'How does this reach people — and how does it come back?',
    what: [
      'Ship the smallest useful version, then watch how it is actually used.',
      'Iterate on feedback loops shorter than the memory of the original decision.',
    ],
    evidence: { text: 'Both apps are deployed; source and code access are linked from Selected Work — credentials and admin portals gated for teams.', ref: 'Selected Work' },
  },
];

export const HowIBuildSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<string>('understand');

  const activeIdx = STAGES.findIndex((s) => s.id === active);
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section id="how-i-build" className="py-20 sm:py-28 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header */}
        <div className="max-w-2xl space-y-4 mb-10 sm:mb-16">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>How I build</p>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            One problem, seven stages.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2)' }}>
            This is the loop I work in — walked through with a real problem each product answered.
            The Builder Lab below runs the same thinking live.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Stage list */}
          <div className="lg:col-span-5" role="tablist" aria-label="Build stages">
            {STAGES.map((s, i) => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(s.id)}
                  className="w-full text-left flex items-center gap-4"
                  style={{
                    padding: '14px 6px',
                    borderBottom: i < STAGES.length - 1 ? `1px solid ${line}` : 'none',
                    background: 'transparent',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderTop: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {/* Progress rail */}
                  <span
                    className="shrink-0 rounded-full transition-all"
                    style={{
                      width: 3,
                      height: isActive ? 40 : 20,
                      background: isActive ? 'var(--accent)' : line,
                      transition: reduceMotion ? 'none' : 'height 0.3s ease, background 0.3s ease',
                    }}
                    aria-hidden
                  />
                  <span
                    className="tech-label shrink-0"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-4)', width: 26 }}
                  >
                    {s.n}
                  </span>
                  <span
                    className="transition-colors"
                    style={{
                      fontSize: isActive ? 19 : 17,
                      fontWeight: isActive ? 800 : 600,
                      letterSpacing: '-0.01em',
                      color: isActive ? 'var(--text-1)' : 'var(--text-3)',
                    }}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stage detail — inline on mobile, side panel on desktop */}
          <div className="lg:col-span-7">
            {/* Desktop detail */}
            <div className="hidden lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={STAGES[activeIdx].id}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="lg:sticky lg:top-28 space-y-7"
                >
                  <StageDetail stage={STAGES[activeIdx]} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile: same detail, appears under the list */}
            <div className="lg:hidden mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`m-${STAGES[activeIdx].id}`}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <StageDetail stage={STAGES[activeIdx]} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* The stack behind the work — interactive map */}
        <StackMap />
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Stack → project map (demo: "interactive tech stack")                */
/* ------------------------------------------------------------------ */

const STACK_NODES: { id: string; name: string; in: string[] }[] = [
  { id: 'expo', name: 'Expo SDK 52', in: ['StayEase', 'SplitFin'] },
  { id: 'rn', name: 'React Native', in: ['StayEase', 'SplitFin'] },
  { id: 'supabase', name: 'Supabase · realtime', in: ['StayEase', 'SplitFin'] },
  { id: 'postgis', name: 'Postgres · PostGIS', in: ['StayEase', 'SplitFin'] },
  { id: 'mmkv', name: 'MMKV · SQLite', in: ['StayEase', 'SplitFin'] },
  { id: 'stripe', name: 'Stripe', in: ['StayEase'] },
  { id: 'maestro', name: 'Maestro E2E', in: ['StayEase', 'SplitFin'] },
  { id: 'ts', name: 'TypeScript', in: ['StayEase', 'SplitFin', 'This portfolio'] },
  { id: 'react', name: 'React 19 · Vite · Tailwind v4', in: ['This portfolio'] },
  { id: 'node', name: 'Node · Express · Gemini', in: ['This portfolio'] },
];

const StackMap: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [active, setActive] = useState<string | null>(null);
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';
  const activeNode = STACK_NODES.find((n) => n.id === active) ?? null;

  return (
    <div className="mt-14 sm:mt-20 space-y-5">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-end">
        <div className="lg:col-span-5 space-y-3">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>The stack behind the work</p>
          <h3 style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
            Every technology here maps to something real.
          </h3>
        </div>
        <p className="lg:col-span-7" style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-2)' }}>
          Select a technology to see which project it powers. Nothing on this page claims a tool
          that isn't used twice — the portfolio itself is included, honestly.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2" role="list" aria-label="Technologies">
        {STACK_NODES.map((n) => {
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              role="listitem"
              aria-pressed={isActive}
              onClick={() => setActive(isActive ? null : n.id)}
              className="rounded-xl border px-3 py-2.5 text-left transition-colors"
              style={{
                background: isActive
                  ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                  : isDark
                  ? 'var(--surface-1)'
                  : '#fff',
                borderColor: isActive ? 'var(--accent)' : line,
              }}
            >
              <div className="text-[13px] font-semibold" style={{ color: isActive ? 'var(--accent)' : 'var(--text-1)' }}>
                {n.name}
              </div>
              <div className="text-[10.5px] font-mono mt-0.5" style={{ color: 'var(--text-4)' }}>
                {n.in.length} surface{n.in.length > 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="rounded-xl border px-4 py-3"
        style={{ borderColor: line, background: activeNode ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'transparent', minHeight: 48 }}
        aria-live="polite"
      >
        {activeNode ? (
          <span style={{ fontSize: 14, color: 'var(--text-2)' }}>
            <span className="tech-label" style={{ marginRight: 8 }}>{activeNode.name}</span>
            used in → <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{activeNode.in.join(' · ')}</span>
          </span>
        ) : (
          <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>
            Select a technology — every project on this page is accounted for.
          </span>
        )}
      </div>
    </div>
  );
};

const StageDetail: React.FC<{ stage: Stage }> = ({ stage }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <div className="space-y-6">
      <div style={{ paddingLeft: 0 }}>
        <h3 style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.35, color: 'var(--text-1)' }}>
          {stage.question}
        </h3>
      </div>

      <ul className="space-y-3">
        {stage.what.map((w, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="shrink-0 rounded-full" style={{ width: 6, height: 6, marginTop: 9, background: 'var(--accent)' }} aria-hidden />
            <span style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)' }}>{w}</span>
          </li>
        ))}
      </ul>

      <div
        className="flex items-start gap-3"
        style={{ borderLeft: `3px solid var(--accent)`, paddingLeft: 14, padding: '12px 0 12px 14px', borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}
      >
        <span className="tech-label shrink-0" style={{ marginTop: 2 }}>In practice</span>
        <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)' }}>
          {stage.evidence.text}
          <span className="tech-label" style={{ display: 'block', marginTop: 6, color: 'var(--accent)' }}>
            → {stage.evidence.ref}
          </span>
        </span>
      </div>
    </div>
  );
};
