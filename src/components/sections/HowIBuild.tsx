/**
 * How I Build — a self-playing build run.
 *
 * No tabs, no cards to read. A runner travels a winding line through seven
 * living stations — each one animates what that stage *does* (frame, model,
 * draw, stack, break, measure, launch). A ticker narrates in one line per
 * station; evidence rides along as a chip. Depth comes from parallax layers
 * and glow, not a 3D library. Auto-plays once on entry, replays on demand,
 * and stands still (with step controls) under reduced motion.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useInView } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Stage {
  id: string;
  n: string;
  title: string;
  caption: string;
  tool: string;
  evidence: { text: string; ref: string };
}

const STAGES: Stage[] = [
  {
    id: 'understand', n: '01', title: 'Understand',
    caption: 'One sentence a user would actually say.',
    tool: 'frame.problem',
    evidence: { text: 'SplitFin started from a real mismatch: money is shared constantly, but banking apps, spreadsheets and splitting tools each cover only part of it.', ref: 'SplitFin' },
  },
  {
    id: 'model', n: '02', title: 'Model',
    caption: 'Entities and failure modes, before any code.',
    tool: 'schema.contract',
    evidence: { text: 'SplitFin’s model: accounts, transactions, categories, split groups/members — typed once across client, ledger and database so the schema is the contract.', ref: 'SplitFin' },
  },
  {
    id: 'design', n: '03', title: 'Design',
    caption: 'Phone first, thumb reach, nothing decorative.',
    tool: 'layout.390px',
    evidence: { text: 'StayEase booking flow: search → hotel detail → rooms → guest info → payment, each step one decision wide.', ref: 'StayEase' },
  },
  {
    id: 'build', n: '04', title: 'Build',
    caption: 'Smallest vertical slice, typed end to end.',
    tool: 'slice.vertical',
    evidence: { text: 'Both products share this shape: typed contracts from screen to database — the ledger in SplitFin, live inventory in StayEase — so a contract change breaks at compile time, not in production.', ref: 'StayEase + SplitFin' },
  },
  {
    id: 'stress', n: '05', title: 'Stress',
    caption: 'Break it on purpose; recovery stays boring.',
    tool: 'chaos.offline',
    evidence: { text: 'StayEase caches rate-limited external APIs behind a 10-minute enrichment cache; the Builder Lab on this page lets you break a system on purpose and watch it reroute.', ref: 'StayEase + Builder Lab' },
  },
  {
    id: 'measure', n: '06', title: 'Measure',
    caption: 'Instrument questions, never vanity metrics.',
    tool: 'instrument.question',
    evidence: { text: 'Every number on this portfolio is either observable in the demo or labeled as a simulation — that standard applies to work too.', ref: 'This site' },
  },
  {
    id: 'ship', n: '07', title: 'Ship',
    caption: 'Smallest useful version, then watch and iterate.',
    tool: 'release.slice',
    evidence: { text: 'Both apps are deployed; source and code access are linked from Selected Work — credentials and admin portals gated for teams.', ref: 'Selected Work' },
  },
];

const RUN_SECONDS = 24;

/* Station coordinates + path per orientation */
function desktopPts() {
  return STAGES.map((_, i) => ({ x: 70 + i * (860 / 6), y: i % 2 === 0 ? 120 : 258 }));
}
function mobilePts() {
  return STAGES.map((_, i) => ({ x: i % 2 === 0 ? 128 : 272, y: 70 + i * 150 }));
}
function pathD(pts: { x: number; y: number }[], horizontal: boolean) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const q = pts[i];
    d += horizontal
      ? ` C ${p.x + 72} ${p.y}, ${q.x - 72} ${q.y}, ${q.x} ${q.y}`
      : ` C ${p.x} ${p.y + 75}, ${q.x} ${q.y - 75}, ${q.x} ${q.y}`;
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* Station glyphs — each stage drawn doing its job                      */
/* ------------------------------------------------------------------ */

const G: React.FC<{ children: React.ReactNode }> = ({ children }) => <g>{children}</g>;

function Glyph({ id, accent, soft, live }: { id: string; accent: string; soft: string; live: boolean }) {
  switch (id) {
    case 'understand':
      return (
        <G>
          <circle cx={0} cy={0} r={13} fill="none" stroke={accent} strokeWidth={2.5} />
          <circle cx={0} cy={0} r={6.5} fill="none" stroke={accent} strokeWidth={2} opacity={0.6} />
          <circle cx={0} cy={0} r={2.4} fill={accent} />
          {live && (
            <circle cx={0} cy={0} r={13} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.7}>
              <animate attributeName="r" values="13;22" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
        </G>
      );
    case 'model':
      return (
        <G>
          <rect x={-17} y={-12} width={13} height={24} rx={3} fill="none" stroke={soft} strokeWidth={2} />
          <rect x={-4} y={-12} width={13} height={24} rx={3} fill="none" stroke={accent} strokeWidth={2.5} />
          <rect x={9} y={-12} width={13} height={24} rx={3} fill="none" stroke={soft} strokeWidth={2} />
          <line x1={-4} y1={0} x2={9} y2={0} stroke={accent} strokeWidth={2}>
            {live && <animate attributeName="stroke-dasharray" values="0 20;20 0" dur="1.6s" repeatCount="indefinite" />}
          </line>
        </G>
      );
    case 'design':
      return (
        <G>
          <rect x={-10} y={-16} width={20} height={32} rx={5} fill="none" stroke={accent} strokeWidth={2.5} />
          <line x1={-5} y1={-6} x2={5} y2={-6} stroke={soft} strokeWidth={2} strokeLinecap="round" />
          <line x1={-5} y1={0} x2={2} y2={0} stroke={soft} strokeWidth={2} strokeLinecap="round" />
          <rect x={-5} y={6} width={10} height={4.5} rx={2.25} fill={accent} opacity={0.85} />
        </G>
      );
    case 'build':
      return (
        <G>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={-16 + i * 2.5}
              y={10 - i * 9}
              width={32 - i * 5}
              height={6}
              rx={3}
              fill={i === 2 ? accent : 'none'}
              stroke={i === 2 ? accent : soft}
              strokeWidth={2}
              opacity={i === 2 ? 0.95 : 0.75}
            >
              {live && <animate attributeName="y" values={`${10 - i * 9};${7 - i * 9};${10 - i * 9}`} dur="2.4s" repeatCount="indefinite" />}
            </rect>
          ))}
        </G>
      );
    case 'stress':
      return (
        <G>
          <path d="M 3 -16 L -7 2 L -1 2 L -3 16 L 7 -2 L 1 -2 Z" fill="none" stroke={accent} strokeWidth={2.5} strokeLinejoin="round">
            {live && <animate attributeName="opacity" values="1;0.35;1" dur="1.1s" repeatCount="indefinite" />}
          </path>
        </G>
      );
    case 'measure':
      return (
        <G>
          {[7, 13, 10].map((h, i) => (
            <rect key={i} x={-14 + i * 11} y={12 - h * 1.6} width={7} height={h * 1.6} rx={2.5} fill={i === 1 ? accent : soft} opacity={i === 1 ? 0.95 : 0.7}>
              {live && <animate attributeName="height" values={`${h * 1.6};${h * 1.6 + 5};${h * 1.6}`} dur="1.8s" begin={`${i * 0.25}s`} repeatCount="indefinite" />}
              {live && <animate attributeName="y" values={`${12 - h * 1.6};${7 - h * 1.6};${12 - h * 1.6}`} dur="1.8s" begin={`${i * 0.25}s`} repeatCount="indefinite" />}
            </rect>
          ))}
        </G>
      );
    case 'ship':
      return (
        <G>
          <circle cx={0} cy={2} r={8} fill={accent} opacity={0.9}>
            {live && <animate attributeName="cy" values="6;-8;6" dur="2.2s" repeatCount="indefinite" />}
          </circle>
          <path d="M -12 12 Q 0 18 12 12" fill="none" stroke={soft} strokeWidth={2} strokeLinecap="round" />
          {live && (
            <circle cx={0} cy={2} r={8} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.6}>
              <animate attributeName="r" values="8;17" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="2.2s" repeatCount="indefinite" />
            </circle>
          )}
        </G>
      );
    default:
      return <G />;
  }
}

/* ------------------------------------------------------------------ */

export const HowIBuildSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const progress = useMotionValue(0);
  const pathDRef = useRef<SVGPathElement>(null);
  const pathMRef = useRef<SVGPathElement>(null);
  const dotDRef = useRef<SVGCircleElement>(null);
  const dotMRef = useRef<SVGCircleElement>(null);
  const haloDRef = useRef<SVGCircleElement>(null);
  const haloMRef = useRef<SVGCircleElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const idxRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-25% 0px' });
  const startedRef = useRef(false);

  const accent = 'var(--accent)';
  /* Inactive glyph ink — same slate-400 / slate-500 secondary GitHub/Contact use. */
  const soft = isDark ? '#94A3B8' : '#64748B';

  const dPts = desktopPts();
  const mPts = mobilePts();
  const dD = pathD(dPts, true);
  const mD = pathD(mPts, false);

  const place = useCallback((v: number) => {
    const i = Math.min(STAGES.length - 1, Math.floor(v * STAGES.length));
    if (i !== idxRef.current) {
      idxRef.current = i;
      setIdx(i);
    }
    const targets: [React.RefObject<SVGPathElement | null>, React.RefObject<SVGCircleElement | null>, React.RefObject<SVGCircleElement | null>][] = [
      [pathDRef, dotDRef, haloDRef],
      [pathMRef, dotMRef, haloMRef],
    ];
    for (const [pRef, dRef, hRef] of targets) {
      const p = pRef.current;
      if (!p) continue;
      try {
        const len = p.getTotalLength();
        const pt = p.getPointAtLength(Math.max(0, Math.min(1, v)) * len);
        dRef.current?.setAttribute('cx', String(pt.x));
        dRef.current?.setAttribute('cy', String(pt.y));
        hRef.current?.setAttribute('cx', String(pt.x));
        hRef.current?.setAttribute('cy', String(pt.y));
      } catch {
        /* path not laid out yet */
      }
    }
  }, []);

  const play = useCallback(
    (from?: number) => {
      if (reduceMotion) return;
      controlsRef.current?.stop();
      const start = from ?? progress.get();
      if (start >= 0.999) {
        progress.set(0);
        idxRef.current = -1;
      }
      setFinished(false);
      setPlaying(true);
      controlsRef.current = animate(progress, 1, {
        duration: Math.max(0.5, (1 - progress.get()) * RUN_SECONDS),
        ease: 'linear',
        onUpdate: place,
        onComplete: () => {
          setPlaying(false);
          setFinished(true);
        },
      });
    },
    [place, progress, reduceMotion],
  );

  const pause = useCallback(() => {
    controlsRef.current?.stop();
    setPlaying(false);
  }, []);

  const jump = useCallback(
    (i: number) => {
      controlsRef.current?.stop();
      setPlaying(false);
      setFinished(i === STAGES.length - 1);
      const v = (i + 0.5) / STAGES.length;
      progress.set(v);
      place(v);
    },
    [place, progress],
  );

  /* Auto-play once on entry; static stepping under reduced motion */
  useEffect(() => {
    if (inView && !startedRef.current) {
      startedRef.current = true;
      if (!reduceMotion) {
        const t = setTimeout(() => play(0), 500);
        return () => clearTimeout(t);
      }
    }
  }, [inView, play, reduceMotion]);

  useEffect(() => () => controlsRef.current?.stop(), []);
  useEffect(() => {
    place(progress.get());
  }, [place, progress]);

  const stage = STAGES[idx];

  return (
    <section ref={sectionRef} id="how-i-build" className="py-20 sm:py-28 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl space-y-4 mb-8 sm:mb-10">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>How I build</p>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Watch the loop run.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2)' }}>
            Seven stages, one moving system — the same loop behind StayEase, SplitFin, and the Builder Lab below.
          </p>
        </div>

        {/* Run strip */}
        <div className="mb-4">
          <div className="flex items-center justify-between font-mono" style={{ fontSize: 11.5 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: 'var(--accent)', marginRight: 8, boxShadow: '0 0 8px var(--accent)' }} aria-hidden />
              run · how-i-build {finished ? '· complete' : playing ? '· running' : '· paused'}
            </span>
            <span style={{ color: 'var(--text-4)' }}>
              {String(idx + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
            </span>
          </div>
          <div className="mt-2 rounded-full" style={{ height: 3, background: 'var(--surface-3)' }} aria-hidden>
            <motion.div
              className="rounded-full"
              style={{ height: '100%', background: 'var(--accent)', boxShadow: isDark ? '0 0 12px var(--accent)' : 'none' }}
              animate={{ width: `${((idx + (finished ? 1 : 0.5)) / STAGES.length) * 100}%` }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }}
            />
          </div>
        </div>

        {/* Stage — parallax layers over the track */}
        <ParallaxStage isDark={isDark} disabled={reduceMotion}>
          {/* DESKTOP track */}
          <svg viewBox="0 0 1000 380" className="hidden sm:block w-full h-auto" role="img" aria-label="Build loop diagram: seven stages from understand to ship">
            <path d={dD} fill="none" stroke={isDark ? 'var(--line-dark)' : 'var(--line)'} strokeWidth={2} strokeDasharray="7 8" strokeLinecap="round" opacity={0.9} />
            <path ref={pathDRef} d={dD} fill="none" stroke="none" />
            {dPts.map((p, i) => (
              <Station
                key={STAGES[i].id}
                x={p.x}
                y={p.y}
                i={i}
                idx={idx}
                stage={STAGES[i]}
                accent={accent}
                soft={soft}
                live={!reduceMotion}
                onJump={() => jump(i)}
              />
            ))}
            <circle ref={haloDRef} r={15} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.5} />
            <circle ref={dotDRef} r={8} fill={accent} style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} />
          </svg>

          {/* MOBILE track — vertical run */}
          <svg viewBox="0 0 400 1040" className="sm:hidden w-full h-auto" role="img" aria-label="Build loop diagram: seven stages from understand to ship">
            <path d={mD} fill="none" stroke={isDark ? 'var(--line-dark)' : 'var(--line)'} strokeWidth={2} strokeDasharray="7 8" strokeLinecap="round" opacity={0.9} />
            <path ref={pathMRef} d={mD} fill="none" stroke="none" />
            {mPts.map((p, i) => (
              <Station
                key={STAGES[i].id}
                x={p.x}
                y={p.y}
                i={i}
                idx={idx}
                stage={STAGES[i]}
                accent={accent}
                soft={soft}
                live={!reduceMotion}
                onJump={() => jump(i)}
              />
            ))}
            <circle ref={haloMRef} r={15} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.5} />
            <circle ref={dotMRef} r={8} fill={accent} style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} />
          </svg>
        </ParallaxStage>

        {/* Ticker — one line per station, advances itself */}
        <div className="mt-4 rounded-2xl border" style={{ borderColor: line, background: isDark ? 'var(--surface-1)' : '#fff' }} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              style={{ padding: '13px 16px' }}
            >
              <span className="font-mono shrink-0" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
                {stage.n} · {stage.title}
              </span>
              <span className="flex-1" style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-1)' }}>
                {stage.caption}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-mono rounded-md" style={{ fontSize: 10.5, padding: '3px 8px', color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                  $ {stage.tool}
                </span>
                <span className="tech-label" style={{ color: 'var(--ok)', fontWeight: 700 }}>→ {stage.evidence.ref}</span>
              </span>
            </motion.div>
          </AnimatePresence>
          <div style={{ borderTop: `1px solid ${line}`, padding: '9px 16px', fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>
            {stage.evidence.text}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {!reduceMotion && (
            <button
              onClick={() => (playing ? pause() : play())}
              className="inline-flex items-center gap-2 rounded-xl font-bold"
              style={{
                height: 44, padding: '0 18px', fontSize: 14,
                background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
                boxShadow: isDark ? '0 0 24px color-mix(in srgb, var(--accent) 35%, transparent)' : 'none',
              }}
              aria-label={playing ? 'Pause the build run' : finished ? 'Replay the build run' : 'Play the build run'}
            >
              {playing ? <Pause size={15} /> : finished ? <RotateCcw size={15} /> : <Play size={15} />}
              {playing ? 'Pause' : finished ? 'Replay' : 'Run it'}
            </button>
          )}
          <div className="flex items-center gap-1.5" role="group" aria-label="Jump to stage">
            {STAGES.map((s, i) => {
              const on = i === idx;
              const done = i < idx;
              return (
                <button
                  key={s.id}
                  onClick={() => jump(i)}
                  aria-label={`Stage ${s.n}: ${s.title}`}
                  title={`${s.n} · ${s.title}`}
                  className="rounded-full transition-all"
                  style={{
                    width: on ? 26 : 12,
                    height: 12,
                    background: on ? 'var(--accent)' : done ? 'var(--ok)' : isDark ? 'var(--surface-3)' : 'var(--surface-3)',
                    boxShadow: on && isDark ? '0 0 10px var(--accent)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Station — glyph node on the track                                    */
/* ------------------------------------------------------------------ */

const Station: React.FC<{
  x: number;
  y: number;
  i: number;
  idx: number;
  stage: Stage;
  accent: string;
  soft: string;
  live: boolean;
  onJump: () => void;
}> = ({ x, y, i, idx, stage, accent, soft, live, onJump }) => {
  const isActive = i === idx;
  const isDone = i < idx;
  return (
    <g
      transform={`translate(${x} ${y})`}
      onClick={onJump}
      style={{ cursor: 'pointer', filter: isActive ? 'drop-shadow(0 0 12px var(--accent))' : 'none' }}
      role="button"
      aria-label={`${stage.n} ${stage.title}${isActive ? ' (current)' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onJump();
        }
      }}
    >
      <circle r={30} fill={isActive ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent'} stroke={isActive ? accent : soft} strokeWidth={isActive ? 2 : 1.25} opacity={isActive ? 1 : 0.55} />
      {isDone && !isActive && (
        <g transform="translate(20 -20)">
          <circle r={9} fill="var(--ok)" />
          <path d="M -3.5 0 L -1 2.8 L 4 -3" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      <Glyph id={stage.id} accent={accent} soft={soft} live={live} />
      <text y={50} textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: isActive ? 'var(--text-1)' : soft }}>
        {stage.title}
      </text>
      <text y={66} textAnchor="middle" className="font-mono" style={{ fontSize: 10.5, fill: soft }}>
        {stage.n}
      </text>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* ParallaxStage — mouse-depth layers without a 3D library              */
/* ------------------------------------------------------------------ */

const ParallaxStage: React.FC<{ isDark: boolean; disabled: boolean; children: React.ReactNode }> = ({ isDark, disabled, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      className="relative rounded-2xl border overflow-hidden"
      style={{
        borderColor: isDark ? 'var(--line-dark)' : 'var(--line)',
        background: isDark ? 'rgba(2,6,16,0.55)' : 'rgba(255,255,255,0.7)',
        boxShadow: isDark ? '0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent), 0 0 64px color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--shadow-2)',
      }}
      onMouseMove={(e) => {
        if (disabled || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setTilt({
          x: ((e.clientX - r.left) / r.width - 0.5) * 2,
          y: ((e.clientY - r.top) / r.height - 0.5) * 2,
        });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* Far layer — dot grid drifts most */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${isDark ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.22)'} 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
          transform: disabled ? undefined : `translate(${tilt.x * -10}px, ${tilt.y * -8}px) scale(1.03)`,
          transition: 'transform 0.25s ease-out',
        }}
      />
      {/* Near layer — the track */}
      <div
        className="relative"
        style={{
          transform: disabled ? undefined : `translate(${tilt.x * 6}px, ${tilt.y * 5}px)`,
          transition: 'transform 0.25s ease-out',
          padding: '8px 4px 0',
        }}
      >
        {children}
      </div>
    </div>
  );
};
