/**
 * How I Build — a flight through the loop.
 *
 * No cards, no rows, no terminal. Seven portal gates recede down a tunnel;
 * the camera dollies forward on its own — play, pause, replay, tap a segment
 * or either side to steer. One HUD line narrates (caption ⇄ proof). True CSS
 * 3D (perspective + translateZ), GPU-only motion, frozen offscreen and under
 * reduced motion.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
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
  { id: 'understand', n: '01', title: 'Understand', caption: 'One sentence a user would actually say.', tool: 'frame.problem', evidence: { text: 'SplitFin started from a real mismatch: money is shared constantly, but banking apps, spreadsheets and splitting tools each cover only part of it.', ref: 'SplitFin' } },
  { id: 'model', n: '02', title: 'Model', caption: 'Entities and failure modes, before any code.', tool: 'schema.contract', evidence: { text: 'SplitFin’s model: accounts, transactions, categories, split groups/members — typed once across client, ledger and database so the schema is the contract.', ref: 'SplitFin' } },
  { id: 'design', n: '03', title: 'Design', caption: 'Phone first, thumb reach, nothing decorative.', tool: 'layout.390px', evidence: { text: 'StayEase booking flow: search → hotel detail → rooms → guest info → payment, each step one decision wide.', ref: 'StayEase' } },
  { id: 'build', n: '04', title: 'Build', caption: 'Smallest vertical slice, typed end to end.', tool: 'slice.vertical', evidence: { text: 'Both products share this shape: typed contracts from screen to database — the ledger in SplitFin, live inventory in StayEase — so a contract change breaks at compile time, not in production.', ref: 'StayEase + SplitFin' } },
  { id: 'stress', n: '05', title: 'Stress', caption: 'Break it on purpose; recovery stays boring.', tool: 'chaos.offline', evidence: { text: 'StayEase caches rate-limited external APIs behind a 10-minute enrichment cache; the Builder Lab on this page lets you break a system on purpose and watch it reroute.', ref: 'StayEase + Builder Lab' } },
  { id: 'measure', n: '06', title: 'Measure', caption: 'Instrument questions, never vanity metrics.', tool: 'instrument.question', evidence: { text: 'Every number on this portfolio is either observable in the demo or labeled as a simulation — that standard applies to work too.', ref: 'This site' } },
  { id: 'ship', n: '07', title: 'Ship', caption: 'Smallest useful version, then watch and iterate.', tool: 'release.slice', evidence: { text: 'Both apps are deployed; source and code access are linked from Selected Work — credentials and admin portals gated for teams.', ref: 'Selected Work' } },
];

const STEP_MS = 3200;
const PROOF_MS = 2800;
const GAP = 620;

/* ------------------------------------------------------------------ */
/* Gate glyphs — icons only, no text in 3D space                        */
/* ------------------------------------------------------------------ */

function Glyph({ id, accent, soft }: { id: string; accent: string; soft: string }) {
  switch (id) {
    case 'understand':
      return (
        <g>
          <circle cx={60} cy={60} r={20} fill="none" stroke={accent} strokeWidth={3} />
          <circle cx={60} cy={60} r={10} fill="none" stroke={accent} strokeWidth={2} opacity={0.65} />
          <circle cx={60} cy={60} r={3.5} fill={accent} />
        </g>
      );
    case 'model':
      return (
        <g>
          {[-22, 0, 22].map((dx, i) => (
            <g key={dx}>
              <rect x={60 + dx - 13} y={46} width={26} height={28} rx={5} fill="none" stroke={i === 1 ? accent : soft} strokeWidth={i === 1 ? 2.6 : 1.6} />
              <line x1={60 + dx - 7} y1={58} x2={60 + dx + 7} y2={58} stroke={soft} strokeWidth={1.8} strokeLinecap="round" />
            </g>
          ))}
          <line x1={51} y1={60} x2={59} y2={60} stroke={accent} strokeWidth={2.4} />
          <line x1={61} y1={60} x2={69} y2={60} stroke={accent} strokeWidth={2.4} />
        </g>
      );
    case 'design':
      return (
        <g>
          <rect x={46} y={30} width={28} height={56} rx={8} fill="none" stroke={accent} strokeWidth={3} />
          <line x1={52} y1={44} x2={68} y2={44} stroke={accent} strokeWidth={3} strokeLinecap="round" />
          <line x1={52} y1={52} x2={64} y2={52} stroke={soft} strokeWidth={2.4} strokeLinecap="round" />
          <rect x={52} y={60} width={16} height={8} rx={4} fill={accent} />
        </g>
      );
    case 'build':
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={38 + i * 5} y={76 - i * 16} width={44 - i * 10} height={11} rx={5.5} fill={i === 2 ? accent : 'none'} stroke={i === 2 ? accent : soft} strokeWidth={2.4} />
          ))}
        </g>
      );
    case 'stress':
      return (
        <g>
          <path d="M 66 30 L 50 62 L 60 62 L 54 90" fill="none" stroke={accent} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 40 92 Q 60 100 80 92" fill="none" stroke={soft} strokeWidth={2} strokeDasharray="4 4" />
        </g>
      );
    case 'measure':
      return (
        <g>
          {[22, 36, 30, 46].map((h, i) => (
            <rect key={i} x={34 + i * 14} y={84 - h} width={10} height={h} rx={3} fill={i === 3 ? accent : soft} opacity={i === 3 ? 1 : 0.7} />
          ))}
          <path d="M 34 66 L 62 54 L 76 58 L 90 44" fill="none" stroke={accent} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={90} cy={44} r={3.5} fill={accent} />
        </g>
      );
    case 'ship':
      return (
        <g>
          <circle cx={60} cy={58} r={14} fill={accent} opacity={0.92} />
          <circle cx={60} cy={58} r={22} fill="none" stroke={accent} strokeWidth={1.6} opacity={0.55} />
          <path d="M 44 88 L 76 88 L 70 98 L 50 98 Z" fill="none" stroke={soft} strokeWidth={2.2} strokeLinejoin="round" />
        </g>
      );
    default:
      return <g />;
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
  const [showProof, setShowProof] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: '-20% 0px' });
  const startedRef = useRef(false);

  const accent = 'var(--accent)';
  const soft = isDark ? '#5B6B85' : '#9AA7BC';
  const animating = playing && inView && !reduceMotion;

  const jump = useCallback((i: number) => {
    setIdx(i);
    setFinished(i === STAGES.length - 1);
    setPlaying(false);
  }, []);

  const next = useCallback(() => {
    setIdx((v) => {
      if (v >= STAGES.length - 1) {
        setPlaying(false);
        setFinished(true);
        return v;
      }
      return v + 1;
    });
  }, []);

  const prev = useCallback(() => {
    setFinished(false);
    setPlaying(false);
    setIdx((v) => (v + STAGES.length - 1) % STAGES.length);
  }, []);

  const replay = useCallback(() => {
    setIdx(0);
    setShowProof(false);
    setFinished(false);
    if (!reduceMotion) setPlaying(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (!playing || !inView || reduceMotion) return;
    const t = setTimeout(next, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, idx, next, inView, reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const t = setInterval(() => setShowProof((v) => !v), PROOF_MS);
    return () => clearInterval(t);
  }, [inView, reduceMotion]);

  useEffect(() => {
    if (inView && !startedRef.current && !reduceMotion) {
      startedRef.current = true;
      const t = setTimeout(() => setPlaying(true), 600);
      return () => clearTimeout(t);
    }
  }, [inView, reduceMotion]);

  const stage = STAGES[idx];

  return (
    <section ref={sectionRef} id="how-i-build" className="py-16 sm:py-24 border-b overflow-hidden" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-6 sm:mb-8">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>How I build</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Fly the loop.
          </h2>
        </div>

        {/* Tunnel viewport */}
        <div
          className="relative rounded-2xl border overflow-hidden max-w-4xl mx-auto"
          style={{
            height: 360,
            borderColor: line,
            background: isDark
              ? 'radial-gradient(ellipse 80% 90% at 50% 110%, #0E2150 0%, #05080F 62%)'
              : 'linear-gradient(#EDF1F7, #D9E2EE)',
            boxShadow: isDark ? '0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent), 0 0 64px color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--shadow-2)',
          }}
        >
          <div className="absolute inset-0 sm:top-0" style={{ perspective: '1100px' }}>
            {/* Floor grid */}
            <div
              aria-hidden
              className="absolute inset-x-[-30%] bottom-[-8%] tunnel-floor"
              style={{
                height: '46%',
                transform: 'rotateX(63deg) scale(1.8)',
                transformOrigin: 'bottom center',
                maskImage: 'linear-gradient(transparent, #000 45%)',
                WebkitMaskImage: 'linear-gradient(transparent, #000 45%)',
                opacity: isDark ? 1 : 0.7,
                animationPlayState: animating ? 'running' : 'paused',
              }}
            />
            {/* World */}
            <div
              className="absolute inset-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateZ(${idx * GAP}px)`,
                transition: reduceMotion ? 'none' : 'transform 0.9s cubic-bezier(.22,1,.36,1)',
              }}
            >
              {STAGES.map((s, i) => {
                const d = i - idx;
                const opacity = d === 0 ? 1 : d < 0 ? 0.22 : Math.max(0.55 - d * 0.1, 0.12);
                const active = d === 0;
                return (
                  <div
                    key={s.id}
                    aria-hidden
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '44%',
                      width: 168,
                      height: 168,
                      transform: `translate(-50%,-50%) translateZ(${-i * GAP}px)`,
                      opacity,
                      transition: 'opacity 0.9s ease',
                    }}
                  >
                    <svg viewBox="0 0 120 120" className="w-full h-full" style={{ filter: active ? 'drop-shadow(0 0 18px var(--accent))' : 'none', transition: 'filter 0.5s ease', overflow: 'visible' }}>
                      <circle cx={60} cy={60} r={55} fill="none" stroke={soft} strokeWidth={1.4} strokeDasharray="4 6" opacity={0.8} className={animating && active ? 'tunnel-spin' : undefined} />
                      <circle cx={60} cy={60} r={43} fill={isDark ? 'rgba(8,13,24,0.72)' : 'rgba(255,255,255,0.72)'} stroke={active ? accent : soft} strokeWidth={active ? 2.4 : 1.4} />
                      <Glyph id={s.id} accent={accent} soft={soft} />
                    </svg>
                  </div>
                );
              })}
            </div>
            {/* Fog */}
            <div aria-hidden className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: 90, background: isDark ? 'linear-gradient(rgba(5,8,15,0.9), transparent)' : 'linear-gradient(rgba(237,241,247,0.9), transparent)' }} />
            <div aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: 120, background: isDark ? 'linear-gradient(transparent, rgba(2,6,16,0.92) 60%)' : 'linear-gradient(transparent, rgba(255,255,255,0.95) 60%)' }} />
          </div>

          {/* Segments */}
          <div className="absolute top-0 inset-x-0 flex gap-1" style={{ padding: '10px 12px 0' }} role="group" aria-label="Jump to stage">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => jump(i)}
                aria-label={`Stage ${s.n}: ${s.title}`}
                className="h-1 rounded-full overflow-hidden"
                style={{ flex: 1, background: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.25)', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {i < idx || (finished && i === idx) ? (
                  <span className="block h-full w-full rounded-full" style={{ background: 'var(--accent)' }} />
                ) : i === idx && playing ? (
                  <motion.span
                    key={`seg-${idx}`}
                    className="block h-full rounded-full"
                    style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                  />
                ) : (
                  <span className="block h-full w-full" />
                )}
              </button>
            ))}
          </div>

          {/* Transport */}
          <div className="absolute" style={{ top: 20, right: 12 }}>
            <button
              onClick={() => (finished ? replay() : playing ? setPlaying(false) : setPlaying(true))}
              aria-label={playing ? 'Pause' : finished ? 'Replay' : 'Play'}
              className="flex items-center justify-center rounded-full backdrop-blur-md transition active:scale-95"
              style={{ width: 34, height: 34, background: isDark ? 'rgba(10,15,27,0.8)' : 'rgba(255,255,255,0.85)', color: 'var(--text-1)', border: `1px solid ${line}` }}
            >
              {playing ? <Pause size={14} /> : finished ? <RotateCcw size={14} /> : <Play size={14} />}
            </button>
          </div>

          {/* Steer zones */}
          <button onClick={prev} aria-label="Previous stage" className="absolute left-0" style={{ top: 70, bottom: 110, width: '16%', background: 'transparent', border: 'none', cursor: 'w-resize' }} />
          <button onClick={() => (idx >= STAGES.length - 1 ? replay() : next())} aria-label="Next stage" className="absolute right-0" style={{ top: 70, bottom: 110, width: '16%', background: 'transparent', border: 'none', cursor: 'e-resize' }} />

          {/* HUD */}
          <div className="absolute bottom-0 inset-x-0" style={{ padding: '0 14px 12px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${stage.id}-${showProof}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                aria-live="polite"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono rounded-full" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 10px', color: '#fff', background: 'color-mix(in srgb, var(--accent) 85%, transparent)', boxShadow: '0 4px 14px -4px var(--accent)' }}>
                    {stage.n} · {stage.title.toUpperCase()}
                  </span>
                  <span className="font-mono" style={{ fontSize: 10.5, color: 'var(--accent)' }}>$ {stage.tool}</span>
                  <span className="tech-label" style={{ color: 'var(--ok)', fontWeight: 700 }}>→ {stage.evidence.ref}</span>
                </div>
                {!showProof ? (
                  <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#F1F5F9' : '#0B1220', marginTop: 5 }}>{stage.caption}</p>
                ) : (
                  <p className="line-clamp-2" style={{ fontSize: 12, lineHeight: 1.55, color: isDark ? '#B6C2D6' : '#3D4A61', marginTop: 5 }}>{stage.evidence.text}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
