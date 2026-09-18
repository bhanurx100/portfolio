/**
 * Build stages — shared loop module.
 *
 * The seven-stage method as data + blueprint drawings, plus the LoopStrip:
 * a snap-scroll sheet browser with one expanded sheet. Used inside the
 * Builder Lab section so method and playground live together.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { useReducedMotion } from 'motion/react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Callout {
  n: string;
  text: string;
}

export interface BuildStage {
  id: string;
  n: string;
  title: string;
  fig: string;
  question: string;
  callouts: Callout[];
  evidence: { text: string; ref: string };
}

export const STAGES: BuildStage[] = [
  {
    id: 'understand', n: '01', title: 'Understand', fig: 'Problem statement',
    question: 'What problem are we solving, for whom, and what does “better” mean?',
    callouts: [
      { n: '1', text: 'Real user words first — “split the dinner bill?” not “fintech solution”.' },
      { n: '2', text: 'The breaking moment: banking apps, spreadsheets and splitting tools each cover only part of it.' },
      { n: '3', text: '“Better” = nobody opens a spreadsheet after dinner.' },
    ],
    evidence: { text: 'Start from a real mismatch: the tools people use each cover only part of the job.', ref: 'Method' },
  },
  {
    id: 'model', n: '02', title: 'Model', fig: 'Ledger schema',
    question: 'What are the entities, states and constraints — before any code?',
    callouts: [
      { n: '1', text: 'Three tables: accounts, orders, items.' },
      { n: '2', text: 'Typed once across client, server and database — the schema is the contract.' },
      { n: '3', text: 'Failure states modeled here, not discovered after launch.' },
    ],
    evidence: { text: 'A data model drawn before code: entities, states, and where truth lives.', ref: 'Method' },
  },
  {
    id: 'design', n: '03', title: 'Design', fig: 'Phone wireframe · 390pt',
    question: 'What should this feel like at 390px wide, with one thumb?',
    callouts: [
      { n: '1', text: 'Phone layout first — 390pt wide, one decision per screen.' },
      { n: '2', text: 'Primary action inside thumb reach; 44pt minimum targets.' },
      { n: '3', text: 'Checkout flow: search → detail → options → info → payment.' },
    ],
    evidence: { text: 'One decision per screen, drawn at true phone scale.', ref: 'Method' },
  },
  {
    id: 'build', n: '04', title: 'Build', fig: 'Vertical slice',
    question: 'What is the smallest slice that runs end to end?',
    callouts: [
      { n: '1', text: 'UI → state → API → data, vertically — no layer done “first”.' },
      { n: '2', text: 'One type contract band ties every layer together.' },
      { n: '3', text: 'A contract change breaks at compile time, not in production.' },
    ],
    evidence: { text: 'Typed contracts from screen to database — a contract change breaks at compile time, not in production.', ref: 'Method' },
  },
  {
    id: 'stress', n: '05', title: 'Stress', fig: 'Failure routing',
    question: 'What happens when it fails — offline, rejected, interrupted?',
    callouts: [
      { n: '1', text: 'Happy path stays solid: request → 200 OK → receipt.' },
      { n: '2', text: 'No signal detours through the offline queue, then rejoins.' },
      { n: '3', text: 'Retries are idempotent — retry ×3 never double-charges.' },
    ],
    evidence: { text: 'The Builder Lab above runs this detour live — press Break.', ref: 'Builder Lab' },
  },
  {
    id: 'measure', n: '06', title: 'Measure', fig: 'Honest instrumentation',
    question: 'What should improve next — and can I observe it honestly?',
    callouts: [
      { n: '1', text: 'Instrumented: checkout success, retry rate, crash-free sessions.' },
      { n: '2', text: 'Skipped: page views, vanity counters, dashboard decor.' },
      { n: '3', text: 'Every number observable in the demo or labeled simulation.' },
    ],
    evidence: { text: 'Every number shown is either observable in the demo or labeled simulation.', ref: 'Method' },
  },
  {
    id: 'ship', n: '07', title: 'Ship', fig: 'Release loop',
    question: 'How does this reach people — and how does it come back?',
    callouts: [
      { n: '1', text: 'Smallest useful version ships first — a slice, not a suite.' },
      { n: '2', text: 'Observe real use, then loop back into the next slice.' },
      { n: '3', text: 'Feedback loops shorter than the original decision.' },
    ],
    evidence: { text: 'Ship the smallest useful version first; observe real use; iterate fast.', ref: 'Method' },
  },
];

export interface Ink {
  line: string;
  soft: string;
  faint: string;
  accent: string;
  paper: string;
}

export function useInk(): { ink: Ink; isDark: boolean; sheetBg: string; sheetEdge: string; line: string } {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ink: Ink = isDark
    ? { line: '#DCE6F5', soft: '#9DB1CC', faint: '#5F7091', accent: '#7FB3FF', paper: '#0B2547' }
    : { line: '#1E3A8A', soft: '#3B5BA9', faint: '#8AA0C8', accent: '#1D4ED8', paper: '#FFFFFF' };
  return {
    ink,
    isDark,
    sheetBg: isDark ? '#0B2547' : '#F2F6FD',
    sheetEdge: isDark ? '#274067' : '#C4D3EC',
    line: isDark ? 'var(--line-dark)' : 'var(--line)',
  };
}

export function Frame({ n, fig, ink, children }: { n: string; fig: string; ink: Ink; children: React.ReactNode }) {
  return (
    <g>
      <defs>
        <pattern id={`bp-grid-${n}`} width={20} height={20} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={1} fill={ink.faint} opacity={0.5} />
        </pattern>
      </defs>
      <rect x={4} y={4} width={392} height={292} fill={`url(#bp-grid-${n})`} />
      <rect x={4} y={4} width={392} height={292} fill="none" stroke={ink.line} strokeWidth={1.5} />
      {children}
      <g fontFamily="monospace">
        <text x={14} y={288} fontSize={9} letterSpacing={1} fill={ink.faint}>FIG. {n} — {fig.toUpperCase()}</text>
        <text x={386} y={288} fontSize={9} textAnchor="end" letterSpacing={1} fill={ink.faint}>SHEET {n}/07</text>
      </g>
    </g>
  );
}

const T = ({ x, y, s = 11, w = 600, children, fill, anchor }: { x: number; y: number; s?: number; w?: number; fill: string; anchor?: string; children: React.ReactNode }) => (
  <text x={x} y={y} fontSize={s} fontWeight={w} fill={fill} textAnchor={(anchor ?? 'start') as 'start' | 'middle' | 'end'}>{children}</text>
);

export function Drawing({ id, ink }: { id: string; ink: Ink }) {
  const mono = 'monospace';
  switch (id) {
    case 'understand':
      return (
        <g>
          <rect x={36} y={70} width={180} height={84} rx={12} fill="none" stroke={ink.line} strokeWidth={2} strokeDasharray="7 5" />
          <T x={52} y={98} s={13} fill={ink.line}>“split the</T>
          <T x={52} y={116} s={13} fill={ink.line}>dinner bill?”</T>
          <path d="M 80 154 L 70 172 L 96 154" fill="none" stroke={ink.line} strokeWidth={2} />
          <line x1={216} y1={112} x2={272} y2={112} stroke={ink.accent} strokeWidth={2.5} />
          <path d="M 264 106 L 274 112 L 264 118" fill="none" stroke={ink.accent} strokeWidth={2.5} />
          <circle cx={318} cy={112} r={30} fill="none" stroke={ink.accent} strokeWidth={2.5} />
          <circle cx={318} cy={112} r={16} fill="none" stroke={ink.accent} strokeWidth={2} opacity={0.6} />
          <circle cx={318} cy={112} r={4} fill={ink.accent} />
          <g fontFamily={mono}>
            <text x={36} y={52} fontSize={10} letterSpacing={1.5} fill={ink.faint}>USER WORDS</text>
            <text x={288} y={52} fontSize={10} letterSpacing={1.5} fill={ink.faint}>“BETTER”</text>
          </g>
          <circle cx={52} cy={186} r={9} fill={ink.accent} />
          <T x={52} y={189.5} s={10} w={800} fill={ink.paper} anchor="middle">1</T>
          <circle cx={318} cy={186} r={9} fill={ink.accent} />
          <T x={318} y={189.5} s={10} w={800} fill={ink.paper} anchor="middle">2</T>
        </g>
      );
    case 'model':
      return (
        <g>
          {[
            { x: 30, t: 'ACCOUNTS', rows: ['id', 'owner', 'balance'] },
            { x: 155, t: 'ORDERS', rows: ['id', 'total', 'state'] },
            { x: 280, t: 'ITEMS', rows: ['id', 'qty', 'price'] },
          ].map((tb) => (
            <g key={tb.t}>
              <rect x={tb.x} y={80} width={90} height={110} fill="none" stroke={ink.line} strokeWidth={2} />
              <line x1={tb.x} y1={102} x2={tb.x + 90} y2={102} stroke={ink.line} strokeWidth={2} />
              <T x={tb.x + 7} y={96} s={9} w={800} fill={ink.line}>{tb.t}</T>
              {tb.rows.map((r, i) => (
                <g key={r}>
                  <T x={tb.x + 7} y={122 + i * 20} s={10} fill={ink.soft}>{r}</T>
                  <line x1={tb.x} y1={130 + i * 20} x2={tb.x + 90} y2={130 + i * 20} stroke={ink.faint} strokeWidth={1} />
                </g>
              ))}
            </g>
          ))}
          <line x1={120} y1={135} x2={155} y2={135} stroke={ink.accent} strokeWidth={2.5} />
          <line x1={245} y1={135} x2={280} y2={135} stroke={ink.accent} strokeWidth={2.5} />
          <g fontFamily={mono}>
            <text x={30} y={52} fontSize={10} letterSpacing={1.5} fill={ink.faint}>ONE SCHEMA · THREE SURFACES</text>
          </g>
          <circle cx={52} cy={222} r={9} fill={ink.accent} />
          <T x={52} y={225.5} s={10} w={800} fill={ink.paper} anchor="middle">1</T>
          <T x={68} y={226} s={11} fill={ink.soft}>typed once — client · server · database</T>
        </g>
      );
    case 'design':
      return (
        <g>
          <rect x={94} y={34} width={32} height={64} rx={8} fill="none" stroke={ink.accent} strokeWidth={2.5} />
          <line x1={101} y1={48} x2={119} y2={48} strokeLinecap="round" strokeWidth={3} stroke={ink.accent} />
          <line x1={101} y1={56} x2={114} y2={56} stroke={ink.soft} strokeWidth={2.4} strokeLinecap="round" opacity={0.8} />
          <rect x={101} y={66} width={18} height={8} rx={4} fill={ink.accent} opacity={0.9} />
          <line x1={101} y1={82} x2={119} y2={82} stroke={ink.soft} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <path d="M 140 96 Q 158 96 162 78" fill="none" stroke={ink.accent} strokeWidth={1.6} strokeDasharray="3 3" opacity={0.8} />
          <circle cx={162} cy={76} r={3} fill={ink.accent} />
          <rect x={60} y={40} width={110} height={210} rx={18} fill="none" stroke={ink.line} strokeWidth={2.5} />
          <line x1={76} y1={72} x2={154} y2={72} stroke={ink.line} strokeWidth={3} strokeLinecap="round" />
          <line x1={76} y1={86} x2={140} y2={86} stroke={ink.soft} strokeWidth={2.4} strokeLinecap="round" />
          <rect x={76} y={150} width={78} height={26} rx={13} fill={ink.accent} opacity={0.9} />
          <T x={115} y={167} s={11} w={800} fill={ink.paper} anchor="middle">CONTINUE</T>
          <line x1={60} y1={28} x2={170} y2={28} stroke={ink.faint} strokeWidth={1} />
          <line x1={60} y1={24} x2={60} y2={32} stroke={ink.faint} strokeWidth={1} />
          <line x1={170} y1={24} x2={170} y2={32} stroke={ink.faint} strokeWidth={1} />
          <T x={115} y={20} s={10} fill={ink.faint} anchor="middle">390pt</T>
          <circle cx={250} cy={163} r={20} fill="none" stroke={ink.accent} strokeWidth={2} strokeDasharray="4 3" />
          <line x1={196} y1={163} x2={230} y2={163} stroke={ink.accent} strokeWidth={1.5} />
          <T x={250} y={140} s={10} fill={ink.faint} anchor="middle">⌀ 44pt min</T>
          <path d="M 250 250 Q 300 250 310 200" fill="none" stroke={ink.accent} strokeWidth={1.6} strokeDasharray="5 4" />
          <T x={288} y={262} s={10} fill={ink.faint} anchor="middle">thumb reach</T>
        </g>
      );
    case 'build':
      return (
        <g>
          {['UI', 'STATE', 'API', 'DATA'].map((l, i) => (
            <g key={l}>
              <rect x={110} y={52 + i * 46} width={180} height={34} rx={8} fill={i === 3 ? ink.accent : 'none'} stroke={i === 3 ? ink.accent : ink.line} strokeWidth={2} opacity={i === 3 ? 0.9 : 1} />
              <T x={200} y={74 + i * 46} s={12} w={800} fill={i === 3 ? ink.paper : ink.line} anchor="middle">{l}</T>
            </g>
          ))}
          <rect x={76} y={52} width={14} height={172} rx={7} fill="none" stroke={ink.accent} strokeWidth={2} strokeDasharray="5 4" />
          <g fontFamily={mono} transform="rotate(-90 40 140)">
            <text x={40} y={140} fontSize={10} letterSpacing={2} fill={ink.faint} textAnchor="middle">TYPE CONTRACT</text>
          </g>
          <line x1={330} y1={69} x2={330} y2={207} stroke={ink.line} strokeWidth={1.5} />
          <path d="M 325 197 L 330 207 L 335 197" fill="none" stroke={ink.line} strokeWidth={1.5} />
          <T x={348} y={142} s={10} fill={ink.faint}>one slice ↓</T>
        </g>
      );
    case 'stress':
      return (
        <g>
          <rect x={30} y={100} width={70} height={30} rx={8} fill="none" stroke={ink.line} strokeWidth={2} />
          <T x={65} y={119} s={10} w={700} fill={ink.line} anchor="middle">REQUEST</T>
          <line x1={100} y1={115} x2={150} y2={115} stroke={ink.line} strokeWidth={2.5} />
          <T x={125} y={106} s={9} fill={ink.faint} anchor="middle">200 OK</T>
          <rect x={150} y={100} width={70} height={30} rx={8} fill="none" stroke={ink.line} strokeWidth={2} />
          <T x={185} y={119} s={10} w={700} fill={ink.line} anchor="middle">RECEIPT</T>
          <path d="M 100 130 Q 125 200 185 200 L 285 200" fill="none" stroke={ink.accent} strokeWidth={2.2} strokeDasharray="7 5" />
          <path d="M 128 178 L 118 196 L 126 196 L 122 210" fill="none" stroke={ink.accent} strokeWidth={2.4} strokeLinejoin="round" />
          <T x={150} y={192} s={9} fill={ink.faint}>no signal</T>
          <rect x={220} y={185} width={90} height={30} rx={8} fill="none" stroke={ink.accent} strokeWidth={2} strokeDasharray="5 4" />
          <T x={265} y={204} s={10} w={700} fill={ink.line} anchor="middle">RETRY ×3</T>
          <line x1={310} y1={200} x2={340} y2={200} stroke={ink.accent} strokeWidth={2} />
          <line x1={340} y1={200} x2={340} y2={130} stroke={ink.accent} strokeWidth={2} />
          <path d="M 334 140 L 340 130 L 346 140" fill="none" stroke={ink.accent} strokeWidth={2} />
          <T x={352} y={170} s={9} fill={ink.faint}>rejoin</T>
          <g fontFamily={mono}>
            <text x={30} y={52} fontSize={10} letterSpacing={1.5} fill={ink.faint}>IDEMPOTENT — RETRY NEVER DOUBLE-CHARGES</text>
          </g>
        </g>
      );
    case 'measure':
      return (
        <g>
          <T x={30} y={70} s={11} w={800} fill={ink.line}>INSTRUMENT ✓</T>
          {['checkout success', 'retry rate', 'crash-free'].map((t, i) => (
            <g key={t}>
              <rect x={30} y={84 + i * 34} width={150} height={26} rx={7} fill="none" stroke={ink.accent} strokeWidth={1.8} />
              <T x={42} y={101 + i * 34} s={10.5} fill={ink.line}>{t}</T>
              <T x={170} y={101 + i * 34} s={11} w={800} fill={ink.accent} anchor="end">✓</T>
            </g>
          ))}
          <T x={230} y={70} s={11} w={800} fill={ink.faint}>SKIP ✗</T>
          {['page views', 'vanity counters', 'decor'].map((t, i) => (
            <g key={t} opacity={0.75}>
              <rect x={230} y={84 + i * 34} width={140} height={26} rx={7} fill="none" stroke={ink.faint} strokeWidth={1.4} strokeDasharray="4 3" />
              <T x={242} y={101 + i * 34} s={10.5} fill={ink.soft}>{t}</T>
              <T x={360} y={101 + i * 34} s={11} w={800} fill={ink.faint} anchor="end">✗</T>
            </g>
          ))}
          <T x={30} y={232} s={10} fill={ink.faint}>observable in the demo — or labeled simulation. nothing else.</T>
        </g>
      );
    case 'ship':
      return (
        <g>
          {['SLICE', 'REVIEW', 'DEPLOY', 'OBSERVE'].map((t, i) => (
            <g key={t}>
              <rect x={24 + i * 92} y={110} width={76} height={44} rx={9} fill={i === 0 ? ink.accent : 'none'} stroke={i === 0 ? ink.accent : ink.line} strokeWidth={2} opacity={i === 0 ? 0.92 : 1} />
              <T x={62 + i * 92} y={135} s={10.5} w={800} fill={i === 0 ? ink.paper : ink.line} anchor="middle">{t}</T>
              {i < 3 && <line x1={104 + i * 92} y1={132} x2={114 + i * 92} y2={132} stroke={ink.line} strokeWidth={2} />}
              {i < 3 && <path d={`M ${110 + i * 92} 128 L ${116 + i * 92} 132 L ${110 + i * 92} 136`} fill="none" stroke={ink.line} strokeWidth={2} />}
            </g>
          ))}
          <path d="M 330 154 Q 360 220 200 236 Q 60 250 44 170" fill="none" stroke={ink.accent} strokeWidth={2} strokeDasharray="7 5" />
          <path d="M 38 182 L 44 170 L 52 178" fill="none" stroke={ink.accent} strokeWidth={2} />
          <T x={200} y={258} s={10} fill={ink.faint} anchor="middle">observe → loop back into the next slice</T>
          <g fontFamily={mono}>
            <text x={30} y={52} fontSize={10} letterSpacing={1.5} fill={ink.faint}>SMALLEST USEFUL VERSION FIRST</text>
          </g>
        </g>
      );
    default:
      return <g />;
  }
}

/* ------------------------------------------------------------------ */
/* Loop strip — sheet browser fused into the Lab                        */
/* ------------------------------------------------------------------ */

const STEP_MS = 4600;

export const LoopStrip: React.FC = () => {
  const { ink, isDark, sheetBg, sheetEdge, line } = useInk();
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stripRef, { margin: '-15% 0px' });
  const startedRef = useRef(false);

  const jump = useCallback((i: number) => {
    setIdx(i);
    setPlaying(false);
  }, []);

  const next = useCallback(() => {
    setIdx((v) => (v >= STAGES.length - 1 ? v : v + 1));
  }, []);

  const prev = useCallback(() => {
    setPlaying(false);
    setIdx((v) => (v + STAGES.length - 1) % STAGES.length);
  }, []);

  useEffect(() => {
    if (!playing || !inView || reduceMotion) return;
    if (idx >= STAGES.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(next, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, idx, next, inView, reduceMotion]);

  useEffect(() => {
    if (inView && !startedRef.current && !reduceMotion) {
      startedRef.current = true;
      const t = setTimeout(() => setPlaying(true), 700);
      return () => clearTimeout(t);
    }
  }, [inView, reduceMotion]);

  const stage = STAGES[idx];

  return (
    <div ref={stripRef} id="how-i-build" className="scroll-mt-24 space-y-4">
      {/* Strip header */}
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <p className="tech-label" style={{ color: 'var(--accent)' }}>The loop</p>
          <h3 style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)', marginTop: 2 }}>
            Seven stages, zero projects.
          </h3>
        </div>
        <span className="flex-1" />
        {!reduceMotion && (
          <span className="flex items-center gap-1" style={{ paddingBottom: 2 }}>
            <button onClick={prev} aria-label="Previous stage" className="flex items-center justify-center rounded-lg transition active:scale-95" style={{ width: 30, height: 30, color: ink.soft, background: 'transparent', border: `1px solid ${sheetEdge}`, cursor: 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => (idx >= STAGES.length - 1 ? (setIdx(0), setPlaying(true)) : setPlaying(!playing))} aria-label={playing ? 'Pause' : 'Play the loop'} className="flex items-center justify-center rounded-lg transition active:scale-95" style={{ width: 30, height: 30, background: ink.accent, color: ink.paper, border: 'none', cursor: 'pointer' }}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </span>
        )}
      </div>

      {/* Sheet browser */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x" style={{ paddingBottom: 4 }} role="listbox" aria-label="Build stages">
        {STAGES.map((s, i) => {
          const on = i === idx;
          return (
            <button
              key={s.id}
              role="option"
              aria-selected={on}
              onClick={() => jump(i)}
              className="shrink-0 snap-start rounded-xl border overflow-hidden text-left transition-all"
              style={{
                width: 144,
                borderColor: on ? ink.accent : sheetEdge,
                background: sheetBg,
                boxShadow: on ? `0 0 0 1px ${ink.accent}, 0 12px 28px -14px rgba(15,23,42,0.4)` : 'none',
                cursor: 'pointer',
                opacity: on ? 1 : 0.72,
              }}
            >
              <svg viewBox="0 0 400 300" className="w-full h-auto block pointer-events-none" aria-hidden>
                <Frame n={s.n} fig={s.fig} ink={ink}>
                  <Drawing id={s.id} ink={ink} />
                </Frame>
              </svg>
              <div className="flex items-center gap-2" style={{ padding: '7px 10px', borderTop: `1px solid ${sheetEdge}` }}>
                <span className="font-mono" style={{ fontSize: 10.5, fontWeight: 800, color: on ? ink.accent : 'var(--text-4)' }}>{s.n}</span>
                <span style={{ fontSize: 12.5, fontWeight: on ? 800 : 600, color: on ? 'var(--text-1)' : 'var(--text-3)' }}>{s.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded sheet */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: sheetEdge, background: sheetBg }}
        >
          <div className="grid md:grid-cols-2">
            <svg viewBox="0 0 400 300" className="w-full h-auto block" role="img" aria-label={`${stage.title}: ${stage.question}`}>
              <Frame n={stage.n} fig={stage.fig} ink={ink}>
                <Drawing id={stage.id} ink={ink} />
              </Frame>
            </svg>
            <div style={{ padding: '16px 18px', borderTop: `1px solid ${sheetEdge}` }} className="md:border-t-0 md:border-l">
              <div className="font-mono" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: ink.accent }}>
                {stage.n} · {stage.title.toUpperCase()}
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#EDF2FA' : '#0F1E3D', marginTop: 6, lineHeight: 1.45 }}>{stage.question}</p>
              <ul className="space-y-1.5" style={{ marginTop: 10 }}>
                {stage.callouts.map((c) => (
                  <li key={c.n} className="flex items-start gap-2.5">
                    <span className="shrink-0 rounded-full flex items-center justify-center font-mono" style={{ width: 18, height: 18, fontSize: 10, fontWeight: 800, background: ink.accent, color: ink.paper, marginTop: 1 }}>
                      {c.n}
                    </span>
                    <span style={{ fontSize: 13, lineHeight: 1.55, color: isDark ? '#B9C7DE' : '#2A3D63' }}>{c.text}</span>
                  </li>
                ))}
              </ul>
              <div className="font-mono" style={{ fontSize: 11, marginTop: 10, color: isDark ? '#8EA0B8' : '#5B6B85' }}>
                <span style={{ color: 'var(--ok)', fontWeight: 700 }}>→ {stage.evidence.ref} · </span>
                {stage.evidence.text}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
