/**
 * How I Build — presented as an agent run.
 *
 * The seven stages I actually work in, shown the way an agent would present
 * its own plan: a run strip with progress, a plan column (done / running /
 * queued), and an output card per stage — goal, actions with the method each
 * one uses, and the artifact: evidence from shipped work. Same story on
 * mobile, two-column composition on desktop.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';

interface Stage {
  id: string;
  n: string;
  title: string;
  question: string;
  what: string[];
  tools: string[];
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
    tools: ['frame.problem', 'find.breaking-moment'],
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
    tools: ['schema.contract', 'failure.first'],
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
    tools: ['layout.390px', 'thumb.reach'],
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
    tools: ['slice.vertical', 'type.once'],
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
    tools: ['chaos.offline', 'recover.boring'],
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
    tools: ['instrument.question', 'report.honest'],
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
    tools: ['release.slice', 'loop.feedback'],
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
  const progress = ((activeIdx + 1) / STAGES.length) * 100;

  return (
    <section id="how-i-build" className="py-20 sm:py-28 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header */}
        <div className="max-w-2xl space-y-4 mb-8 sm:mb-10">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>How I build</p>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            One problem, seven stages.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2)' }}>
            This is the loop I work in — walked through with a real problem each product answered.
            The Builder Lab below runs the same thinking live.
          </p>
        </div>

        {/* Run strip — the agent presenting its plan */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between font-mono" style={{ fontSize: 11.5 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: 'var(--accent)', marginRight: 8, boxShadow: '0 0 8px var(--accent)' }} aria-hidden />
              run · how-i-build
            </span>
            <span style={{ color: 'var(--text-4)' }}>
              {String(activeIdx + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
            </span>
          </div>
          <div className="mt-2 rounded-full" style={{ height: 3, background: isDark ? 'var(--surface-3)' : 'var(--surface-3)' }} aria-hidden>
            <motion.div
              className="rounded-full"
              style={{ height: '100%', background: 'var(--accent)', boxShadow: isDark ? '0 0 12px var(--accent)' : 'none' }}
              animate={{ width: `${progress}%` }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 24 }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Plan column */}
          <div className="lg:col-span-5 flex flex-col gap-1" role="listbox" aria-label="Build stages">
            {STAGES.map((s, i) => {
              const isActive = s.id === active;
              const isDone = i < activeIdx;
              return (
                <button
                  key={s.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => setActive(s.id)}
                  className="w-full text-left flex items-center gap-3.5 rounded-xl transition-colors"
                  style={{
                    padding: '11px 12px',
                    background: isActive
                      ? 'color-mix(in srgb, var(--accent) 9%, transparent)'
                      : 'transparent',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                    boxShadow: isActive && isDark ? '0 0 24px color-mix(in srgb, var(--accent) 22%, transparent)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {/* Status */}
                  <span className="shrink-0 flex items-center justify-center" style={{ width: 22 }} aria-hidden>
                    {isDone ? (
                      <span className="rounded-full flex items-center justify-center" style={{ width: 18, height: 18, background: 'color-mix(in srgb, var(--ok) 16%, transparent)' }}>
                        <Check size={11} strokeWidth={3} color="var(--ok)" />
                      </span>
                    ) : isActive ? (
                      <span className="relative flex" style={{ width: 10, height: 10 }}>
                        {!reduceMotion && (
                          <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: 'var(--accent)', opacity: 0.5 }} />
                        )}
                        <span className="relative inline-flex rounded-full" style={{ width: 10, height: 10, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                      </span>
                    ) : (
                      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-4)' }}>{s.n}</span>
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className="block transition-colors"
                      style={{
                        fontSize: isActive ? 16.5 : 15.5,
                        fontWeight: isActive ? 800 : 600,
                        letterSpacing: '-0.01em',
                        color: isActive ? 'var(--text-1)' : isDone ? 'var(--text-2)' : 'var(--text-3)',
                      }}
                    >
                      {s.title}
                    </span>
                    <span className="block font-mono truncate" style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>
                      $ {s.tools[0]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Output card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={STAGES[activeIdx].id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="rounded-2xl lg:sticky lg:top-28"
                style={{
                  border: `1px solid ${line}`,
                  background: isDark ? 'var(--surface-1)' : '#fff',
                  boxShadow: isDark
                    ? '0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent), 0 16px 48px rgba(0,0,0,0.45)'
                    : 'var(--shadow-2)',
                  overflow: 'hidden',
                }}
              >
                {/* Card header — stage address */}
                <div
                  className="flex items-center justify-between font-mono"
                  style={{ fontSize: 11, padding: '10px 18px', borderBottom: `1px solid ${line}`, color: 'var(--text-4)' }}
                >
                  <span>
                    stage <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{STAGES[activeIdx].n}</span>
                    /{String(STAGES.length).padStart(2, '0')} · {STAGES[activeIdx].id}
                  </span>
                  <span style={{ color: 'var(--ok)', fontWeight: 700 }}>
                    {activeIdx < STAGES.length - 1 ? '→ next: ' + STAGES[activeIdx + 1].id : '■ run complete'}
                  </span>
                </div>

                <div className="space-y-5" style={{ padding: '20px 18px' }}>
                  {/* Goal */}
                  <div>
                    <div className="tech-label" style={{ marginBottom: 6 }}>Goal</div>
                    <h3 style={{ fontSize: 'clamp(19px, 2.2vw, 24px)', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.35, color: 'var(--text-1)' }}>
                      {STAGES[activeIdx].question}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="tech-label" style={{ marginBottom: 8 }}>Actions</div>
                    <ul className="space-y-2.5">
                      {STAGES[activeIdx].what.map((w, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span
                            className="shrink-0 font-mono rounded-md"
                            style={{
                              fontSize: 10.5,
                              padding: '3px 7px',
                              marginTop: 2,
                              color: 'var(--accent)',
                              background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            $ {STAGES[activeIdx].tools[i] ?? STAGES[activeIdx].tools[0]}
                          </span>
                          <span style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Artifact */}
                  <div
                    style={{
                      border: `1px solid ${line}`,
                      borderLeft: '3px solid var(--accent)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      background: isDark ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'var(--surface-2)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <span className="tech-label">Artifact — in practice</span>
                      <span
                        className="tech-label rounded-full"
                        style={{
                          padding: '2px 9px',
                          color: 'var(--accent)',
                          border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                        }}
                      >
                        → {STAGES[activeIdx].evidence.ref}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-2)' }}>
                      {STAGES[activeIdx].evidence.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
