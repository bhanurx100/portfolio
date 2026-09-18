/**
 * How I Build — the ship log.
 *
 * The process as a CI run streams it: one command, seven stages, each action
 * checked off with its method, evidence attached as proof lines, and a clock
 * showing real elapsed time (observable, never invented). You watch it ship
 * instead of reading about shipping. Fixed-height terminal, compact header —
 * the whole section fits without scrolling the page.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useInView, useReducedMotion } from 'motion/react';
import { Play, Pause, RotateCcw, Terminal } from 'lucide-react';

interface StageAction {
  tool: string;
  text: string;
}

interface Stage {
  id: string;
  n: string;
  title: string;
  question: string;
  actions: StageAction[];
  evidence: { text: string; ref: string };
}

const STAGES: Stage[] = [
  {
    id: 'understand', n: '01', title: 'Understand',
    question: 'What problem are we solving, for whom, and what does “better” mean?',
    actions: [
      { tool: 'frame.problem', text: 'Write the problem in one sentence a user would actually say.' },
      { tool: 'find.breaking-moment', text: 'Name the moment the current process breaks — build for that moment.' },
    ],
    evidence: { text: 'SplitFin started from a real mismatch: money is shared constantly, but banking apps, spreadsheets and splitting tools each cover only part of it.', ref: 'SplitFin' },
  },
  {
    id: 'model', n: '02', title: 'Model',
    question: 'What are the entities, states and constraints — before any code?',
    actions: [
      { tool: 'schema.contract', text: 'Data model first: entities, relationships, where truth lives.' },
      { tool: 'failure.first', text: 'Decide the failure model as part of the model, not after launch.' },
    ],
    evidence: { text: 'SplitFin’s model: accounts, transactions, categories, split groups/members — typed once across client, ledger and database so the schema is the contract.', ref: 'SplitFin' },
  },
  {
    id: 'design', n: '03', title: 'Design',
    question: 'What should this feel like at 390px wide, with one thumb?',
    actions: [
      { tool: 'layout.390px', text: 'Phone layout first; desktop gets the same story with more air.' },
      { tool: 'thumb.reach', text: 'Primary actions in thumb reach, 44px targets, zero decoration.' },
    ],
    evidence: { text: 'StayEase booking flow: search → hotel detail → rooms → guest info → payment, each step one decision wide.', ref: 'StayEase' },
  },
  {
    id: 'build', n: '04', title: 'Build',
    question: 'What is the smallest slice that runs end to end?',
    actions: [
      { tool: 'slice.vertical', text: 'UI → state → API → data, vertically, in that order.' },
      { tool: 'type.once', text: 'Type the contract once across client, ledger and database.' },
    ],
    evidence: { text: 'Both products share this shape: typed contracts from screen to database — the ledger in SplitFin, live inventory in StayEase — so a contract change breaks at compile time, not in production.', ref: 'StayEase + SplitFin' },
  },
  {
    id: 'stress', n: '05', title: 'Stress',
    question: 'What happens when it fails — offline, rejected, interrupted?',
    actions: [
      { tool: 'chaos.offline', text: 'Rehearse the unhappy paths: no network, duplicate submits.' },
      { tool: 'recover.boring', text: 'Idempotent writes, queued retries, human escalation.' },
    ],
    evidence: { text: 'StayEase caches rate-limited external APIs behind a 10-minute enrichment cache; the Builder Lab on this page lets you break a system on purpose and watch it reroute.', ref: 'StayEase + Builder Lab' },
  },
  {
    id: 'measure', n: '06', title: 'Measure',
    question: 'What should improve next — and can I observe it honestly?',
    actions: [
      { tool: 'instrument.question', text: 'Instrument what answers a question, nothing decorative.' },
      { tool: 'report.honest', text: 'Report what is real. No invented benchmarks, ever.' },
    ],
    evidence: { text: 'Every number on this portfolio is either observable in the demo or labeled as a simulation — that standard applies to work too.', ref: 'This site' },
  },
  {
    id: 'ship', n: '07', title: 'Ship',
    question: 'How does this reach people — and how does it come back?',
    actions: [
      { tool: 'release.slice', text: 'Ship the smallest useful version, then watch real use.' },
      { tool: 'loop.feedback', text: 'Iterate on loops shorter than the original decision.' },
    ],
    evidence: { text: 'Both apps are deployed; source and code access are linked from Selected Work — credentials and admin portals gated for teams.', ref: 'Selected Work' },
  },
];

type LineKind = 'cmd' | 'stage' | 'ok' | 'proof' | 'done' | 'blank';
interface LogLine {
  id: number;
  kind: LineKind;
  text: string;
  ref?: string;
}

const LINE_MS = 380;

function scriptLines(): Omit<LogLine, 'id'>[] {
  const lines: Omit<LogLine, 'id'>[] = [{ kind: 'cmd', text: 'howibuild --run --stages 7' }];
  for (const s of STAGES) {
    lines.push({ kind: 'stage', text: `[${s.n}/07] ${s.title.toUpperCase()} — ${s.question}` });
    for (const a of s.actions) {
      lines.push({ kind: 'ok', text: `${a.tool} — ${a.text}` });
    }
    lines.push({ kind: 'proof', text: s.evidence.text, ref: s.evidence.ref });
  }
  return lines;
}

const fmtElapsed = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

export const HowIBuildSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  const [lines, setLines] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: '-20% 0px' });
  const startedRef = useRef(false);
  const idRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0);

  const script = useRef(scriptLines());

  const reset = useCallback(() => {
    setLines([]);
    setFinished(false);
    setElapsed(0);
    idRef.current = 0;
  }, []);

  const start = useCallback(() => {
    reset();
    startRef.current = Date.now();
    setRunning(true);
  }, [reset]);

  /* Stream lines while running and visible */
  useEffect(() => {
    if (!running || !inView || reduceMotion) return;
    if (idRef.current >= script.current.length) {
      setRunning(false);
      setFinished(true);
      setLines((prev) => [
        ...prev,
        { id: 9999, kind: 'done', text: `run complete — 7 stages · ${fmtElapsed(Date.now() - startRef.current)} · evidence-backed` },
      ]);
      return;
    }
    const t = setTimeout(() => {
      const next = script.current[idRef.current];
      idRef.current += 1;
      setLines((prev) => [...prev, { ...next, id: idRef.current }]);
    }, LINE_MS);
    return () => clearTimeout(t);
  }, [running, lines.length, inView, reduceMotion]);

  /* Elapsed clock — real observable time */
  useEffect(() => {
    if (!running || !inView) return;
    const t = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
    return () => clearInterval(t);
  }, [running, inView]);

  /* Follow the run */
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines.length]);

  /* Reduced motion: full log instantly, no timers */
  useEffect(() => {
    if (!reduceMotion || lines.length > 0) return;
    setLines(script.current.map((l, i) => ({ ...l, id: i + 1 })));
    setFinished(true);
  }, [reduceMotion, lines.length]);

  /* Auto-play once on entry */
  useEffect(() => {
    if (inView && !startedRef.current && !reduceMotion) {
      startedRef.current = true;
      const t = setTimeout(start, 500);
      return () => clearTimeout(t);
    }
  }, [inView, reduceMotion, start]);

  const status = finished ? 'DONE' : running ? 'LIVE' : 'IDLE';

  const lineColor = (k: LineKind) =>
    k === 'cmd' ? (isDark ? '#F1F5F9' : '#0F172A')
    : k === 'stage' ? 'var(--accent)'
    : k === 'ok' ? (isDark ? '#34D399' : '#047857')
    : k === 'done' ? 'var(--accent)'
    : isDark ? '#B6C2D6' : '#3D4A61';

  return (
    <section ref={sectionRef} id="how-i-build" className="py-16 sm:py-24 border-b overflow-hidden" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-6 sm:mb-8">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>How I build</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            The ship log.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)' }}>
            Seven stages, streamed like the CI run that ships them — every action checked, every claim provenanced, clocked in real time.
          </p>
        </div>

        {/* Terminal */}
        <div
          className="rounded-2xl border overflow-hidden max-w-3xl mx-auto"
          style={{
            borderColor: line,
            background: isDark ? '#04070D' : '#fff',
            boxShadow: isDark ? '0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent), 0 0 64px color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--shadow-2)',
          }}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2.5" style={{ padding: '10px 14px', borderBottom: `1px solid ${line}` }}>
            <span className="flex gap-1.5" aria-hidden>
              {['#F87171', '#FBBF24', '#34D399'].map((c) => (
                <span key={c} style={{ width: 9, height: 9, borderRadius: 999, background: c, opacity: 0.85 }} />
              ))}
            </span>
            <span className="font-mono flex items-center gap-1.5" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
              <Terminal size={12} /> howibuild — run.log
            </span>
            <span className="flex-1" />
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-4)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtElapsed(elapsed)}
            </span>
            <span
              className="font-mono rounded-full"
              style={{
                fontSize: 10, fontWeight: 700, padding: '2px 9px',
                color: finished ? 'var(--ok)' : running ? 'var(--accent)' : 'var(--text-3)',
                background: finished ? 'color-mix(in srgb, var(--ok) 12%, transparent)' : running ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                border: `1px solid ${finished ? 'color-mix(in srgb, var(--ok) 35%, transparent)' : running ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : line}`,
              }}
            >
              ● {status}
            </span>
          </div>

          {/* Log body */}
          <div
            ref={bodyRef}
            className="overflow-y-auto scrollbar-thin font-mono"
            style={{ height: 340, padding: '14px 16px', fontSize: 12.5, lineHeight: 1.7 }}
            aria-live="polite"
            aria-label="Build run log"
          >
            {lines.length === 0 && !reduceMotion && (
              <span style={{ color: 'var(--text-4)' }}>
                $ <span className="animate-pulse">▊</span>
              </span>
            )}
            {lines.map((l) => (
              <motion.div
                key={l.id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {l.kind === 'cmd' && (
                  <div style={{ color: lineColor(l.kind), fontWeight: 700 }}>
                    <span style={{ color: 'var(--accent)' }}>$ </span>{l.text}
                  </div>
                )}
                {l.kind === 'stage' && (
                  <div style={{ color: lineColor(l.kind), fontWeight: 700, marginTop: 8 }}>
                    ▸ {l.text}
                  </div>
                )}
                {l.kind === 'ok' && (
                  <div style={{ color: lineColor(l.kind) }}>
                    <span style={{ opacity: 0.9 }}>  ✓ </span>{l.text}
                  </div>
                )}
                {l.kind === 'proof' && (
                  <div style={{ color: lineColor(l.kind) }}>
                    <span style={{ color: 'var(--ok)', fontWeight: 700 }}>  → {l.ref}: </span>{l.text}
                  </div>
                )}
                {l.kind === 'done' && (
                  <div style={{ color: lineColor(l.kind), fontWeight: 700, marginTop: 8 }}>
                    ■ {l.text}
                  </div>
                )}
              </motion.div>
            ))}
            {running && (
              <span style={{ color: 'var(--accent)' }}>
                <span className="animate-pulse">▊</span>
              </span>
            )}
          </div>

          {/* Transport */}
          <div className="flex items-center gap-2" style={{ padding: '10px 14px', borderTop: `1px solid ${line}` }}>
            {!reduceMotion && (
              <button
                onClick={() => (finished ? (reset(), start()) : running ? setRunning(false) : lines.length === 0 ? start() : setRunning(true))}
                aria-label={running ? 'Pause' : finished ? 'Replay' : lines.length === 0 ? 'Run' : 'Resume'}
                className="flex items-center justify-center rounded-lg transition active:scale-95"
                style={{ width: 36, height: 36, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: isDark ? '0 0 16px color-mix(in srgb, var(--accent) 40%, transparent)' : 'none' }}
              >
                {running ? <Pause size={15} /> : finished ? <RotateCcw size={15} /> : <Play size={15} />}
              </button>
            )}
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: isDark ? '#141D31' : '#E6EBF2' }} aria-hidden>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(lines.length / (script.current.length + 1)) * 100}%`, background: 'var(--accent)', transitionDuration: '300ms' }}
              />
            </div>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-4)', fontVariantNumeric: 'tabular-nums' }}>
              {lines.length}/{script.current.length + 1}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
