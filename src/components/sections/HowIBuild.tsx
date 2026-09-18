/**
 * How I Build — a build reel.
 *
 * Stories format, not documents: one viewport, seven living scenes, segmented
 * progress you can tap, caption and evidence alternating on their own. All
 * motion is GPU CSS (transforms, opacity, offset-path) — no SMIL, no per-frame
 * JS — so it stays smooth on phones. Pauses offscreen and under reduced
 * motion; everything is tappable and keyboard reachable.
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

const STEP_MS = 3600;
const PROOF_MS = 2400;

/* ------------------------------------------------------------------ */
/* Scenes — CSS motion only                                             */
/* ------------------------------------------------------------------ */

interface SceneProps {
  accent: string;
  soft: string;
  live: boolean;
  isDark: boolean;
}

const cssVar = (dur: string) => ({ '--dur': dur } as React.CSSProperties);

function Scene({ id, accent, soft, live, isDark }: SceneProps & { id: string }) {
  switch (id) {
    case 'understand':
      return (
        <g>
          <circle cx={110} cy={72} r={46} fill="none" stroke={soft} strokeWidth={1} opacity={0.4} strokeDasharray="2 5" />
          <circle cx={110} cy={72} r={26} fill="none" stroke={accent} strokeWidth={2.5} />
          <circle cx={110} cy={72} r={12} fill="none" stroke={accent} strokeWidth={2} opacity={0.6} />
          <circle cx={110} cy={72} r={3.5} fill={accent} />
          {live && (
            <line x1={110} y1={46} x2={110} y2={98} stroke={accent} strokeWidth={2} strokeLinecap="round" opacity={0.75} className="sc-spin" style={cssVar('3s')} />
          )}
          <circle cx={132} cy={58} r={3} fill={accent} opacity={0.9} className={live ? 'sc-blink' : undefined} style={live ? cssVar('1.6s') : undefined} />
          <circle cx={92} cy={88} r={2.2} fill={accent} opacity={0.7} />
        </g>
      );
    case 'model':
      return (
        <g>
          {[70, 110, 150].map((x, i) => (
            <g key={x}>
              <rect x={x - 15} y={58} width={30} height={28} rx={5} fill={isDark ? 'rgba(21,31,51,0.9)' : '#fff'} stroke={i === 1 ? accent : soft} strokeWidth={i === 1 ? 2.2 : 1.4} />
              <line x1={x - 8} y1={68} x2={x + 8} y2={68} stroke={soft} strokeWidth={1.6} strokeLinecap="round" />
              <line x1={x - 8} y1={75} x2={x + 3} y2={75} stroke={soft} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
            </g>
          ))}
          <line x1={85} y1={72} x2={95} y2={72} stroke={accent} strokeWidth={2} />
          <line x1={125} y1={72} x2={135} y2={72} stroke={accent} strokeWidth={2} />
          {live && (
            <g>
              <circle cx={55} cy={72} r={3} fill={accent} className="sc-offset-go" style={{ offsetPath: "path('M 55 72 L 165 72')", ...cssVar('1.8s') } as React.CSSProperties} />
              <circle cx={165} cy={72} r={2.2} fill={accent} opacity={0.7} className="sc-offset-go" style={{ offsetPath: "path('M 165 72 L 55 72')", animationDelay: '0.9s', ...cssVar('1.8s') } as React.CSSProperties} />
            </g>
          )}
        </g>
      );
    case 'design':
      return (
        <g>
          <rect x={94} y={34} width={32} height={64} rx={8} fill="none" stroke={accent} strokeWidth={2.5} />
          <line x1={101} y1={48} x2={119} y2={48} stroke={accent} strokeWidth={3} strokeLinecap="round" className={live ? 'sc-blink' : undefined} style={live ? cssVar('2.4s') : undefined} />
          <line x1={101} y1={56} x2={114} y2={56} stroke={soft} strokeWidth={2.4} strokeLinecap="round" opacity={0.8} />
          <rect x={101} y={66} width={18} height={8} rx={4} fill={accent} opacity={0.9} />
          <line x1={101} y1={82} x2={119} y2={82} stroke={soft} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <path d="M 140 96 Q 158 96 162 78" fill="none" stroke={accent} strokeWidth={1.6} strokeDasharray="3 3" opacity={0.8} />
          <circle cx={162} cy={76} r={3} fill={accent} className={live ? 'sc-blink' : undefined} style={live ? cssVar('1.4s') : undefined} />
        </g>
      );
    case 'build':
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={78 + i * 4}
              y={96 - i * 14}
              width={64 - i * 8}
              height={10}
              rx={5}
              fill={i === 3 ? accent : 'none'}
              stroke={i === 3 ? accent : soft}
              strokeWidth={2}
              opacity={i === 3 ? 0.95 : 0.8}
              className={live ? 'sc-float' : undefined}
              style={live ? { animationDelay: `${i * 0.18}s`, ...cssVar('2.2s') } : undefined}
            />
          ))}
          {live && (
            <g stroke={accent} strokeWidth={1.6} strokeLinecap="round" className="sc-blink" style={cssVar('1.6s')}>
              <line x1={62} y1={52} x2={56} y2={44} />
              <line x1={158} y1={52} x2={164} y2={44} />
            </g>
          )}
        </g>
      );
    case 'stress':
      return (
        <g>
          <path d="M 92 40 L 78 58 L 90 58 L 84 76" fill="none" stroke={soft} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <path d="M 128 38 L 112 62 L 122 62 L 116 86" fill="none" stroke={accent} strokeWidth={3} strokeLinejoin="round" className={live ? 'sc-flicker' : undefined} style={live ? cssVar('1.2s') : undefined} />
          <path d="M 60 100 Q 110 116 160 96" fill="none" stroke={accent} strokeWidth={2} strokeDasharray="5 4" opacity={0.85} className={live ? 'sc-dash-march' : undefined} />
          {live && (
            <circle cx={60} cy={100} r={3.2} fill={accent} className="sc-offset-go" style={{ offsetPath: "path('M 60 100 Q 110 116 160 96')", ...cssVar('1.6s') } as React.CSSProperties} />
          )}
          <rect x={150} y={86} width={22} height={16} rx={4} fill="none" stroke={soft} strokeWidth={1.6} />
          <path d="M 156 94 L 159 96.5 L 164 91" fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case 'measure':
      return (
        <g>
          {[26, 44, 34, 56, 48].map((h, i) => (
            <rect
              key={i}
              x={58 + i * 21}
              y={104 - h}
              width={13}
              height={h}
              rx={3.5}
              fill={i === 3 ? accent : soft}
              opacity={i === 3 ? 0.95 : 0.65}
              className={live ? 'sc-grow' : undefined}
              style={live ? { animationDelay: `${i * 0.2}s`, ...cssVar('1.9s') } : undefined}
            />
          ))}
          <path d="M 58 84 L 100 66 L 121 71 L 163 48" fill="none" stroke={accent} strokeWidth={2.2} strokeLinecap="round" />
          <circle cx={163} cy={48} r={5} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.7} className={live ? 'sc-ping-soft' : undefined} style={live ? cssVar('1.9s') : undefined} />
          <circle cx={163} cy={48} r={3} fill={accent} />
        </g>
      );
    case 'ship':
      return (
        <g>
          {[30, 52].map((y) => (
            <ellipse key={y} cx={110} cy={y + 60} rx={46} ry={7} fill="none" stroke={soft} strokeWidth={1} opacity={0.4} strokeDasharray="2 5" />
          ))}
          <path d="M 88 118 L 132 118 L 124 132 L 96 132 Z" fill="none" stroke={soft} strokeWidth={2} strokeLinejoin="round" />
          <circle cx={110} cy={92} r={11} fill={accent} opacity={0.92} className={live ? 'sc-rise' : undefined} style={live ? cssVar('2.6s') : undefined} />
          <circle cx={110} cy={92} r={11} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.6} className={live ? 'sc-ping-soft' : undefined} style={live ? cssVar('2.6s') : undefined} />
          {[[58, 40], [162, 34], [146, 108]].map(([x, y], i) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill={accent} opacity={0.7} className={live ? 'sc-blink' : undefined} style={live ? { animationDelay: `${i * 0.5}s`, ...cssVar('2s') } : undefined} />
          ))}
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
  const soft = isDark ? '#94A3B8' : '#64748B';
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

  /* Advance while playing and visible */
  useEffect(() => {
    if (!playing || !inView || reduceMotion) return;
    const t = setTimeout(next, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, idx, next, inView, reduceMotion]);

  /* Caption ⇄ evidence ticker */
  useEffect(() => {
    if (!inView || reduceMotion) return;
    const t = setInterval(() => setShowProof((v) => !v), PROOF_MS);
    return () => clearInterval(t);
  }, [inView, reduceMotion]);

  /* Auto-play once on entry */
  useEffect(() => {
    if (inView && !startedRef.current) {
      startedRef.current = true;
      if (!reduceMotion) {
        const t = setTimeout(() => setPlaying(true), 600);
        return () => clearTimeout(t);
      }
    }
  }, [inView, reduceMotion]);

  const stage = STAGES[idx];

  return (
    <section ref={sectionRef} id="how-i-build" className="py-16 sm:py-24 border-b overflow-hidden" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-6 sm:mb-8">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>How I build</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Watch the loop run.
          </h2>
        </div>

        {/* Reel */}
        <div
          className="rounded-2xl border overflow-hidden max-w-4xl mx-auto"
          style={{
            borderColor: line,
            background: isDark ? 'rgba(2,6,16,0.6)' : '#fff',
            boxShadow: isDark ? '0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent), 0 0 64px color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--shadow-2)',
          }}
        >
          {/* Stage */}
          <div className={`relative ${animating ? '' : 'sc-paused'}`} style={{ height: 300 }}>
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(${isDark ? 'rgba(148,163,184,0.13)' : 'rgba(100,116,139,0.18)'} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.id}
                className="absolute inset-0"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              >
                <svg viewBox="0 0 220 150" preserveAspectRatio="xMidYMid meet" className="sc-svg w-full h-full" role="img" aria-label={`${stage.title}: ${stage.caption}`}>
                  <Scene id={stage.id} accent={accent} soft={soft} live={animating} isDark={isDark} />
                </svg>
              </motion.div>
            </AnimatePresence>

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
                      key={`seg-${idx}-${finished}`}
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

            {/* Stage chip + transport */}
            <div className="absolute flex items-center gap-2" style={{ top: 22, left: 12 }}>
              <span className="font-mono rounded-full backdrop-blur-md" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', padding: '4px 11px', color: '#fff', background: 'color-mix(in srgb, var(--accent) 85%, transparent)', boxShadow: '0 4px 16px -4px var(--accent)' }}>
                {stage.n} · {stage.title.toUpperCase()}
              </span>
            </div>
            <div className="absolute flex items-center gap-1.5" style={{ top: 20, right: 12 }}>
              <button
                onClick={() => (finished ? replay() : playing ? setPlaying(false) : setPlaying(true))}
                aria-label={playing ? 'Pause' : finished ? 'Replay' : 'Play'}
                className="flex items-center justify-center rounded-full backdrop-blur-md transition active:scale-95"
                style={{ width: 34, height: 34, background: isDark ? 'rgba(10,15,27,0.8)' : 'rgba(255,255,255,0.85)', color: 'var(--text-1)', border: `1px solid ${line}` }}
              >
                {playing ? <Pause size={14} /> : finished ? <RotateCcw size={14} /> : <Play size={14} />}
              </button>
            </div>

            {/* Tap zones */}
            <button onClick={prev} aria-label="Previous stage" className="absolute left-0" style={{ top: 64, bottom: 96, width: '18%', background: 'transparent', border: 'none', cursor: 'w-resize' }} />
            <button onClick={() => (idx >= STAGES.length - 1 ? replay() : next())} aria-label="Next stage" className="absolute right-0" style={{ top: 64, bottom: 96, width: '18%', background: 'transparent', border: 'none', cursor: 'e-resize' }} />

            {/* Caption scrim */}
            <div
              className="absolute bottom-0 inset-x-0"
              style={{ padding: '34px 14px 12px', background: isDark ? 'linear-gradient(transparent, rgba(2,6,16,0.88) 55%)' : 'linear-gradient(transparent, rgba(255,255,255,0.94) 55%)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${stage.id}-${showProof}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  aria-live="polite"
                >
                  {!showProof ? (
                    <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#F1F5F9' : '#0B1220' }}>
                      {stage.caption}{' '}
                      <span className="font-mono font-medium" style={{ fontSize: 11, color: 'var(--accent)' }}>$ {stage.tool}</span>
                    </p>
                  ) : (
                    <p style={{ fontSize: 12.5, lineHeight: 1.55, color: isDark ? '#B6C2D6' : '#3D4A61' }}>
                      <span className="font-mono font-bold" style={{ color: 'var(--ok)' }}>→ {stage.evidence.ref} · </span>
                      {stage.evidence.text}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
