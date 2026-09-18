/**
 * How I Build — a build console.
 *
 * No tabs, no cards to read. A self-playing console: seven living scenes
 * (radar, schema flow, phone draw, layer stack, lightning, bars, launch),
 * a one-line narration, and a scrubber. The scene is the explanation.
 * Compact by design — the whole console fits a phone viewport.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion } from 'motion/react';
import { Play, Pause, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';

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

/* ------------------------------------------------------------------ */
/* Scenes — each stage performing itself                                */
/* ------------------------------------------------------------------ */

interface SceneProps {
  accent: string;
  soft: string;
  faint: string;
  live: boolean;
  isDark: boolean;
}

const SceneChrome: React.FC<{ children: React.ReactNode; soft: string }> = ({ children, soft }) => (
  <g>
    {[46, 64].map((r) => (
      <circle key={r} cx={110} cy={72} r={r} fill="none" stroke={soft} strokeWidth={1} opacity={0.35} strokeDasharray="2 5" />
    ))}
    {children}
  </g>
);

function Scene({ id, accent, soft, faint, live, isDark }: SceneProps & { id: string }) {
  switch (id) {
    case 'understand':
      return (
        <SceneChrome soft={soft}>
          <circle cx={110} cy={72} r={26} fill="none" stroke={accent} strokeWidth={2.5} />
          <circle cx={110} cy={72} r={12} fill="none" stroke={accent} strokeWidth={2} opacity={0.6} />
          <circle cx={110} cy={72} r={3.5} fill={accent} />
          {live && (
            <g>
              <line x1={110} y1={72} x2={110} y2={46} stroke={accent} strokeWidth={2} strokeLinecap="round" opacity={0.8}>
                <animateTransform attributeName="transform" type="rotate" from="0 110 72" to="360 110 72" dur="3s" repeatCount="indefinite" />
              </line>
              <circle cx={132} cy={58} r={3} fill={accent} opacity={0.9} />
              <circle cx={92} cy={88} r={2.2} fill={accent} opacity={0.7} />
            </g>
          )}
        </SceneChrome>
      );
    case 'model':
      return (
        <SceneChrome soft={soft}>
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
              <circle r={3} fill={accent}>
                <animateMotion dur="1.8s" repeatCount="indefinite" path="M 55 72 L 95 72 L 125 72 L 165 72" />
              </circle>
              <circle r={2.2} fill={accent} opacity={0.7}>
                <animateMotion dur="1.8s" begin="0.9s" repeatCount="indefinite" path="M 165 72 L 125 72 L 95 72 L 55 72" />
              </circle>
            </g>
          )}
        </SceneChrome>
      );
    case 'design':
      return (
        <SceneChrome soft={soft}>
          <rect x={94} y={34} width={32} height={64} rx={8} fill="none" stroke={accent} strokeWidth={2.5} />
          <line x1={101} y1={48} x2={119} y2={48} strokeLinecap="round" strokeWidth={3}>
            <animate attributeName="stroke" values={`${soft};${accent};${soft}`} dur="2.4s" repeatCount="indefinite" />
          </line>
          <line x1={101} y1={56} x2={114} y2={56} stroke={soft} strokeWidth={2.4} strokeLinecap="round" opacity={0.8} />
          <rect x={101} y={66} width={18} height={8} rx={4} fill={accent} opacity={0.9} />
          <line x1={101} y1={82} x2={119} y2={82} stroke={soft} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <path d="M 140 96 Q 158 96 162 78" fill="none" stroke={accent} strokeWidth={1.6} strokeDasharray="3 3" opacity={0.8} />
          <circle cx={162} cy={76} r={3} fill={accent}>
            {live && <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />}
          </circle>
        </SceneChrome>
      );
    case 'build':
      return (
        <SceneChrome soft={soft}>
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
            >
              {live && <animate attributeName="y" values={`${96 - i * 14};${92 - i * 14};${96 - i * 14}`} dur="2.2s" begin={`${i * 0.18}s`} repeatCount="indefinite" />}
            </rect>
          ))}
          {live && (
            <g stroke={accent} strokeWidth={1.6} strokeLinecap="round" opacity={0.8}>
              <line x1={62} y1={52} x2={56} y2={44}><animate attributeName="opacity" values="0.8;0;0.8" dur="1.6s" repeatCount="indefinite" /></line>
              <line x1={158} y1={52} x2={164} y2={44}><animate attributeName="opacity" values="0;0.8;0" dur="1.6s" repeatCount="indefinite" /></line>
            </g>
          )}
        </SceneChrome>
      );
    case 'stress':
      return (
        <SceneChrome soft={soft}>
          <path d="M 92 40 L 78 58 L 90 58 L 84 76" fill="none" stroke={soft} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <path d="M 128 38 L 112 62 L 122 62 L 116 86" fill="none" stroke={accent} strokeWidth={3} strokeLinejoin="round">
            {live && <animate attributeName="opacity" values="1;0.3;1;0.6;1" dur="1.2s" repeatCount="indefinite" />}
          </path>
          <path d="M 60 100 Q 110 116 160 96" fill="none" stroke={accent} strokeWidth={2} strokeDasharray="5 4" opacity={0.85} />
          {live && (
            <circle r={3.2} fill={accent}>
              <animateMotion dur="1.6s" repeatCount="indefinite" path="M 60 100 Q 110 116 160 96" />
            </circle>
          )}
          <rect x={150} y={86} width={22} height={16} rx={4} fill="none" stroke={soft} strokeWidth={1.6} />
          <path d="M 156 94 L 159 96.5 L 164 91" fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" />
        </SceneChrome>
      );
    case 'measure':
      return (
        <SceneChrome soft={soft}>
          {[26, 44, 34, 56, 48].map((h, i) => (
            <rect key={i} x={58 + i * 21} y={104 - h} width={13} height={h} rx={3.5} fill={i === 3 ? accent : soft} opacity={i === 3 ? 0.95 : 0.65}>
              {live && <animate attributeName="height" values={`${h};${h + 7};${h}`} dur="1.9s" begin={`${i * 0.2}s`} repeatCount="indefinite" />}
              {live && <animate attributeName="y" values={`${104 - h};${97 - h};${104 - h}`} dur="1.9s" begin={`${i * 0.2}s`} repeatCount="indefinite" />}
            </rect>
          ))}
          <path d="M 58 84 L 100 66 L 121 71 L 163 48" fill="none" stroke={accent} strokeWidth={2.2} strokeLinecap="round" />
          <circle cx={163} cy={48} r={3.5} fill={accent}>
            {live && <animate attributeName="r" values="3.5;5;3.5" dur="1.9s" repeatCount="indefinite" />}
          </circle>
        </SceneChrome>
      );
    case 'ship':
      return (
        <g>
          {[30, 52].map((y) => (
            <ellipse key={y} cx={110} cy={y + 60} rx={46} ry={7} fill="none" stroke={soft} strokeWidth={1} opacity={0.4} strokeDasharray="2 5" />
          ))}
          <path d="M 88 118 L 132 118 L 124 132 L 96 132 Z" fill="none" stroke={soft} strokeWidth={2} strokeLinejoin="round" />
          <circle cx={110} cy={92} r={11} fill={accent} opacity={0.92}>
            {live && <animate attributeName="cy" values="98;66;98" dur="2.6s" repeatCount="indefinite" />}
          </circle>
          <circle cx={110} cy={92} r={11} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.6}>
            {live && <animate attributeName="r" values="11;24" dur="2.6s" repeatCount="indefinite" />}
            {live && <animate attributeName="opacity" values="0.6;0" dur="2.6s" repeatCount="indefinite" />}
          </circle>
          {[[58, 40], [162, 34], [146, 108]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill={accent} opacity={0.7}>
              {live && <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />}
            </circle>
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
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-25% 0px' });
  const startedRef = useRef(false);

  const accent = 'var(--accent)';
  const soft = isDark ? '#94A3B8' : '#64748B';
  const faint = isDark ? '#5B6B85' : '#9AA7BC';

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

  const replay = useCallback(() => {
    setIdx(0);
    setFinished(false);
    if (!reduceMotion) setPlaying(true);
  }, [reduceMotion]);

  /* Auto-advance while playing */
  useEffect(() => {
    if (!playing || reduceMotion) return;
    const t = setTimeout(next, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, idx, next, reduceMotion]);

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
  const status = finished ? 'COMPLETE' : playing ? 'LIVE' : 'PAUSED';

  return (
    <section ref={sectionRef} id="how-i-build" className="py-20 sm:py-28 border-b" style={{ borderColor: line }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-4 mb-8 sm:mb-10">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>How I build</p>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Watch the loop run.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2)' }}>
            Seven stages, one moving system — the same loop behind StayEase, SplitFin, and the Builder Lab below.
          </p>
        </div>

        {/* Console */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            borderColor: line,
            background: isDark ? 'rgba(2,6,16,0.6)' : '#fff',
            boxShadow: isDark ? '0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent), 0 0 64px color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--shadow-2)',
          }}
        >
          {/* Console header */}
          <div className="flex items-center gap-3" style={{ padding: '10px 14px', borderBottom: `1px solid ${line}` }}>
            <span className="flex gap-1.5" aria-hidden>
              {['#F87171', '#FBBF24', '#34D399'].map((c) => (
                <span key={c} style={{ width: 9, height: 9, borderRadius: 999, background: c, opacity: 0.85 }} />
              ))}
            </span>
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-4)' }}>BUILD LOOP</span>
            <span
              className="font-mono rounded-full"
              style={{
                fontSize: 10, fontWeight: 700, padding: '2px 9px',
                color: finished ? 'var(--ok)' : playing ? 'var(--accent)' : 'var(--text-3)',
                background: finished ? 'color-mix(in srgb, var(--ok) 12%, transparent)' : playing ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                border: `1px solid ${finished ? 'color-mix(in srgb, var(--ok) 35%, transparent)' : playing ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : line}`,
              }}
            >
              ● {status}
            </span>
            <span className="flex-1" />
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-4)' }}>
              {String(idx + 1).padStart(2, '0')}/07
            </span>
          </div>

          <div className="sm:grid sm:grid-cols-[1fr_264px]">
            {/* Scene */}
            <div className="relative" style={{ borderBottom: `1px solid ${line}` }}>
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(${isDark ? 'rgba(148,163,184,0.13)' : 'rgba(100,116,139,0.18)'} 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
              />
              <AnimatePresence mode="wait">
                <motion.svg
                  key={stage.id}
                  viewBox="0 0 220 150"
                  className="relative w-full h-auto"
                  style={{ maxHeight: 240 }}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  role="img"
                  aria-label={`${stage.title}: ${stage.caption}`}
                >
                  <Scene id={stage.id} accent={accent} soft={soft} faint={faint} live={!reduceMotion} isDark={isDark} />
                </motion.svg>
              </AnimatePresence>
              {/* Per-stage progress */}
              {!reduceMotion && playing && (
                <motion.div
                  key={`bar-${stage.id}`}
                  className="absolute bottom-0 left-0"
                  style={{ height: 2, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                />
              )}
            </div>

            {/* Rail — desktop stage list */}
            <div className="hidden sm:flex flex-col" style={{ borderLeft: `1px solid ${line}` }} role="listbox" aria-label="Build stages">
              {STAGES.map((s, i) => {
                const on = i === idx;
                const done = i < idx;
                return (
                  <button
                    key={s.id}
                    role="option"
                    aria-selected={on}
                    onClick={() => jump(i)}
                    className="flex-1 flex items-center gap-2.5 text-left"
                    style={{
                      padding: '9px 14px',
                      background: on ? 'color-mix(in srgb, var(--accent) 9%, transparent)' : 'transparent',
                      border: 'none',
                      borderBottom: i < STAGES.length - 1 ? `1px solid ${line}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span className="shrink-0 flex items-center justify-center" style={{ width: 18 }} aria-hidden>
                      {done ? (
                        <span className="rounded-full flex items-center justify-center" style={{ width: 16, height: 16, background: 'color-mix(in srgb, var(--ok) 16%, transparent)' }}>
                          <Check size={10} strokeWidth={3.5} color="var(--ok)" />
                        </span>
                      ) : on ? (
                        <span className="relative flex" style={{ width: 9, height: 9 }}>
                          {!reduceMotion && <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: 'var(--accent)', opacity: 0.5 }} />}
                          <span className="relative inline-flex rounded-full" style={{ width: 9, height: 9, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                        </span>
                      ) : (
                        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{s.n}</span>
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate" style={{ fontSize: 13.5, fontWeight: on ? 800 : 600, color: on ? 'var(--text-1)' : done ? 'var(--text-2)' : 'var(--text-3)' }}>
                        {s.title}
                      </span>
                      <span className="block font-mono truncate" style={{ fontSize: 10, color: 'var(--text-4)' }}>$ {s.tool}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Narration */}
          <div style={{ padding: '12px 14px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                aria-live="polite"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{stage.n} · {stage.title}</span>
                  <span className="font-mono rounded-md" style={{ fontSize: 10, padding: '2px 7px', color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                    $ {stage.tool}
                  </span>
                  <span className="tech-label" style={{ color: 'var(--ok)', fontWeight: 700 }}>→ {stage.evidence.ref}</span>
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-1)', marginTop: 5 }}>{stage.caption}</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-2)', marginTop: 3 }}>{stage.evidence.text}</p>
              </motion.div>
            </AnimatePresence>

            {/* Scrubber */}
            <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
              {!reduceMotion && (
                <button
                  onClick={() => (finished ? replay() : playing ? setPlaying(false) : setPlaying(true))}
                  className="shrink-0 inline-flex items-center justify-center rounded-lg"
                  style={{ width: 34, height: 34, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: isDark ? '0 0 16px color-mix(in srgb, var(--accent) 40%, transparent)' : 'none' }}
                  aria-label={playing ? 'Pause' : finished ? 'Replay' : 'Play'}
                >
                  {playing ? <Pause size={14} /> : finished ? <RotateCcw size={14} /> : <Play size={14} />}
                </button>
              )}
              <button
                onClick={() => jump((idx + STAGES.length - 1) % STAGES.length)}
                className="shrink-0 inline-flex items-center justify-center rounded-lg sm:hidden"
                style={{ width: 34, height: 34, background: 'transparent', color: 'var(--text-2)', border: `1px solid ${line}`, cursor: 'pointer' }}
                aria-label="Previous stage"
              >
                <ChevronLeft size={15} />
              </button>
              <div className="flex-1 flex items-center gap-1.5" role="group" aria-label="Jump to stage">
                {STAGES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => jump(i)}
                    aria-label={`Stage ${s.n}: ${s.title}`}
                    title={`${s.n} · ${s.title}`}
                    className="rounded-full transition-all"
                    style={{
                      flex: 1, height: i === idx ? 8 : 5,
                      background: i === idx ? 'var(--accent)' : i < idx ? 'var(--ok)' : isDark ? 'var(--surface-3)' : 'var(--surface-3)',
                      boxShadow: i === idx && isDark ? '0 0 8px var(--accent)' : 'none',
                      border: 'none', cursor: 'pointer', minWidth: 12,
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => jump((idx + 1) % STAGES.length)}
                className="shrink-0 inline-flex items-center justify-center rounded-lg sm:hidden"
                style={{ width: 34, height: 34, background: 'transparent', color: 'var(--text-2)', border: `1px solid ${line}`, cursor: 'pointer' }}
                aria-label="Next stage"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
