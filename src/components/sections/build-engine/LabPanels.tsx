/**
 * Builder Lab — Side Panels
 *
 * Progressive disclosure lives here: casual visitors see the event timeline
 * and inspector; technical visitors open lenses, the simulation trace,
 * decisions, add-ons and project evidence. Every panel is real DOM text —
 * nothing lives only in the canvas.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  GitBranch,
  Layers,
  Plus,
  Trash2,
  X,
  ShieldCheck,
  ShieldAlert,
  Check,
  ChevronRight,
  ExternalLink,
  Terminal,
  Scale,
  ChevronDown,
  Play,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import type {
  GeneratedSystem,
  LabEvent,
  LensId,
  PositionedNode,
  SimulationStep,
  SimulationTraceEntry,
  SystemLens,
} from '../../../data/build-engine/types';

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

export interface LabActions {
  submitIdea: (idea: string) => void;
  selectNode: (id: string | null) => void;
  setLens: (lens: LensId) => void;
  startSim: () => void;
  pauseSim: () => void;
  resumeSim: () => void;
  resetSim: () => void;
  approveGate: () => void;
  rejectGate: () => void;
  recover: (optionId: string) => void;
  removeNode: (id: string) => void;
  applyAddOn: (id: string) => void;
  openDecisions: () => void;
  chooseDecision: (decisionId: string, optionId: string) => void;
  nextDecision: () => void;
  closeDecisions: () => void;
  reset: () => void;
}

const chip = (isDark: boolean, active = false) =>
  `px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors ${
    active
      ? isDark
        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.35)]'
        : 'bg-blue-50 border-blue-300 text-blue-700'
      : isDark
      ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
  }`;

const panel = (isDark: boolean) =>
  `rounded-xl border ${
    isDark
      ? 'bg-[var(--surface-1)] border-[var(--line-strong-dark)] shadow-[0_10px_32px_-14px_rgba(0,0,0,0.7)]'
      : 'bg-white border-[var(--line)] shadow-[var(--shadow-1)]'
  }`;

const panelTitle = (isDark: boolean) =>
  `text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`;

/* ------------------------------------------------------------------ */
/* Idea input (IDLE)                                                   */
/* ------------------------------------------------------------------ */

export const IdeaInput: React.FC<{
  onSubmit: (idea: string) => void;
  suggestions: { chip: string; example: string }[];
}> = ({ onSubmit, suggestions }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [value, setValue] = React.useState('');

  return (
    <div className="max-w-xl mx-auto w-full space-y-4">
      {/* Command line of the portfolio */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-4 ${
          isDark ? 'bg-[var(--surface-1)] border-[var(--line-strong-dark)]' : 'bg-white border-[var(--line-strong)]'
        }`}
        style={{ boxShadow: isDark ? 'var(--shadow-2-dark), 0 0 44px color-mix(in srgb, var(--accent) 14%, transparent)' : 'var(--shadow-2)' }}
      >
        <div className={`mb-2.5 flex items-center justify-between text-[10.5px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <span style={{ color: 'var(--accent)' }}>What should this system do?</span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>engine: deterministic · optional AI</span>
        </div>
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
          style={{
            borderColor: isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)',
            background: isDark ? 'rgba(2,6,16,0.5)' : 'rgba(248,250,252,0.6)',
          }}
        >
          <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>$</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) onSubmit(value.trim());
            }}
            placeholder="Describe a problem — what should we build?"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 16, color: isDark ? '#F1F5F9' : '#0F172A' }}
            aria-label="Describe the system to build"
          />
          <button
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim()}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-40"
            style={{
              background: 'var(--accent)',
              color: '#fff',
            }}
          >
            Form system <Play size={14} />
          </button>
        </div>
        <p className={`mt-2.5 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Runs in your browser — every system is composed from typed patterns, no account or API key required. Or try a starter:
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s.chip}
            onClick={() => onSubmit(s.example)}
            className={chip(isDark)}
            title={s.example}
            style={{ fontSize: 12.5, padding: '6px 12px', minHeight: 36 }}
          >
            {s.chip}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Understanding banner (UNDERSTANDING)                                */
/* ------------------------------------------------------------------ */

export const UnderstandingBanner: React.FC<{ idea: string; rationale: string; matchedSignals: string[] }> = ({
  idea,
  rationale,
  matchedSignals,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-xl mx-auto rounded-xl border px-4 py-3.5 space-y-2 ${
        isDark ? 'bg-[var(--surface-1)] border-[var(--line-strong-dark)]' : 'bg-white border-[var(--line-strong)]'
      }`}
    >
      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        <span className="tech-label" style={{ color: 'var(--accent)' }}>reading idea</span>
        <span style={{ marginLeft: 8 }}>“{idea}”</span>
      </div>
      <div className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{rationale}</div>
      {matchedSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matchedSignals.slice(0, 4).map((s) => (
            <span key={s} className={`text-[11.5px] px-2 py-0.5 rounded font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Lens switcher                                                       */
/* ------------------------------------------------------------------ */

export const LensSwitcher: React.FC<{
  lenses: SystemLens[];
  active: LensId;
  onChange: (l: LensId) => void;
}> = ({ lenses, active, onChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto scrollbar-none rounded-full border"
      style={{
        padding: '4px 8px 4px 10px',
        borderColor: isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)',
        background: isDark ? 'rgba(2,6,16,0.5)' : '#fff',
      }}
      role="tablist"
      aria-label="System lens"
    >
      <Eye className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
      {lenses.map((l) => (
        <button
          key={l.id}
          role="tab"
          aria-selected={active === l.id}
          onClick={() => onChange(l.id)}
          className={chip(isDark, active === l.id)}
          title={l.question}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Event ticker — the last event always visible; full timeline on demand
/* ------------------------------------------------------------------ */

export const EventTicker: React.FC<{
  events: LabEvent[];
  expanded: boolean;
  onToggle: () => void;
}> = ({ events, expanded, onToggle }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const latest = events[events.length - 1];
  const recent = events.slice(-8).reverse();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  /* Terminal follows the run */
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [events.length, expanded]);

  const tone = (kind: string) =>
    kind === 'input'
      ? isDark ? 'text-blue-300' : 'text-blue-700'
      : kind === 'warn'
      ? 'text-amber-500'
      : kind === 'error'
      ? 'text-rose-500'
      : kind === 'ok'
      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
      : isDark ? 'text-slate-300' : 'text-slate-600';

  const prompt = (kind: string) =>
    kind === 'error' ? '✕' : kind === 'warn' ? '!' : kind === 'ok' ? '✓' : kind === 'input' ? '$' : '›';

  return (
    <div className={`${panel(isDark)} overflow-hidden`}>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span className="flex gap-1" aria-hidden>
          {['#F87171', '#FBBF24', '#34D399'].map((c) => (
            <span key={c} style={{ width: 7, height: 7, borderRadius: 999, background: c, opacity: 0.8 }} />
          ))}
        </span>
        <span className={`${panelTitle(isDark)} flex-1`}>Terminal — system events</span>
        <span className={`font-mono text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          {events.length} events
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'} transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={scrollRef}
        className="mx-2 mb-2 rounded-lg overflow-y-auto scrollbar-thin"
        style={{
          background: isDark ? '#04070D' : '#F6F8FB',
          border: `1px solid ${isDark ? '#141D31' : '#E6EBF2'}`,
          maxHeight: expanded ? 190 : 64,
          transition: 'max-height 0.25s ease',
        }}
      >
        <div className="px-3 py-2 space-y-1.5">
          {(expanded ? recent : latest ? [latest] : []).map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs leading-snug font-mono ${tone(e.kind)}`}
            >
              <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>{prompt(e.kind)}</span> {e.text}
            </motion.div>
          ))}
          {events.length === 0 && (
            <div className={`text-xs font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              <span>$</span> awaiting first event…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Node inspector                                                      */
/* ------------------------------------------------------------------ */

export const NodeInspector: React.FC<{
  node: PositionedNode | null;
  onClose: () => void;
  onRemove: (id: string) => void;
}> = ({ node, onClose, onRemove }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!node) {
    return (
      <div className={`${panel(isDark)} p-3`}>
        <div className={`${panelTitle(isDark)} mb-2 flex items-center gap-1.5`}>
          <GitBranch className="w-3 h-3" /> Inspector
        </div>
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Click any node to inspect its role. Some can be removed — watch what the system does.
        </p>
      </div>
    );
  }

  const locked = node.locked;

  return (
    <div className={`${panel(isDark)} p-3 space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className={`${panelTitle(isDark)} flex items-center gap-1.5`}>
            <GitBranch className="w-3 h-3" /> Inspector
          </div>
          <div className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{node.label}</div>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
          aria-label="Close inspector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{node.role}</p>
      {node.detail && (
        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{node.detail}</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
          {node.kind}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
          {node.layer}
        </span>
      </div>

      {locked ? (
        <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          structural root — cannot be removed
        </div>
      ) : (
        <button
          onClick={() => onRemove(node.id)}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
            isDark
              ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
              : 'border-rose-300 text-rose-600 hover:bg-rose-50'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove {node.label}
        </button>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Simulation controls + gate                                          */
/* ------------------------------------------------------------------ */

export const SimulationPanel: React.FC<{
  simState: 'idle' | 'running' | 'paused' | 'gate' | 'done';
  currentGate: SimulationStep | null;
  trace: SimulationTraceEntry[];
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRecover: (optionId: string) => void;
}> = ({ simState, currentGate, trace, onStart, onPause, onResume, onReset, onApprove, onReject, onRecover }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`${panel(isDark)} p-3 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className={`${panelTitle(isDark)} flex items-center gap-1.5`}>
          <Terminal className="w-3 h-3" /> Runtime
        </div>
        {simState !== 'idle' && (
          <div className="flex items-center gap-1.5">
            {simState === 'running' && (
              <button onClick={onPause} className={`px-3 py-1 rounded-lg text-xs border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}`}>
                Pause
              </button>
            )}
            {simState === 'paused' && (
              <button onClick={onResume} className={`px-3 py-1 rounded-lg text-xs ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
                Resume
              </button>
            )}
            {simState !== 'idle' && (
              <button onClick={onReset} className={`px-3 py-1 rounded-lg text-xs border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Idle: the one obvious next step */}
      {simState === 'idle' && (
        <div className="space-y-1.5">
          <button
            onClick={onStart}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition active:scale-[0.99]"
            style={{
              height: 46,
              background: 'linear-gradient(135deg, var(--accent), #7C3AED)',
              color: '#fff',
              boxShadow: isDark ? '0 10px 28px -10px color-mix(in srgb, var(--accent) 70%, transparent)' : '0 10px 24px -12px rgba(37,99,235,0.5)',
            }}
          >
            <Play size={15} /> Run the system
          </button>
          <p className={`text-[11px] text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Replays the blueprint as a working system — gates, failures, recovery included.
          </p>
        </div>
      )}

      {/* Running: live step counter */}
      {(simState === 'running' || simState === 'paused') && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono"
          style={{
            fontSize: 11,
            background: isDark ? '#04070D' : '#F6F8FB',
            border: `1px solid ${isDark ? '#141D31' : '#E6EBF2'}`,
            color: isDark ? 'var(--text-3)' : 'var(--text-2)',
          }}
          aria-live="polite"
        >
          <span className="relative flex" style={{ width: 8, height: 8 }} aria-hidden>
            {simState === 'running' && (
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: 'var(--accent)', opacity: 0.5 }} />
            )}
            <span className="relative inline-flex rounded-full" style={{ width: 8, height: 8, background: simState === 'running' ? 'var(--accent)' : 'var(--warn)', boxShadow: simState === 'running' ? '0 0 8px var(--accent)' : 'none' }} />
          </span>
          {simState === 'running' ? 'executing' : 'paused'} · {trace.length} step{trace.length === 1 ? '' : 's'}
          {simState === 'running' && (
            <span className="flex-1 rounded-full overflow-hidden" style={{ height: 3, background: isDark ? '#141D31' : '#E6EBF2' }} aria-hidden>
              <span className="block h-full rounded-full" style={{ width: '38%', background: 'var(--accent)', animation: 'lab-scan 1.4s ease-in-out infinite' }} />
            </span>
          )}
        </div>
      )}

      {/* Interrupt gate */}
      <AnimatePresence>
        {currentGate?.gate === 'interrupt' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`rounded-lg border p-2.5 space-y-2 ${
              isDark ? 'bg-amber-500/5 border-amber-500/30' : 'bg-amber-50 border-amber-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-snug">
                <div className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Human gate</div>
                <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>{currentGate.gatePrompt}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onApprove} className={`flex-1 px-2.5 py-2 rounded-lg text-xs font-bold ${isDark ? 'bg-emerald-500 text-emerald-950' : 'bg-emerald-600 text-white'}`} style={isDark ? { boxShadow: '0 8px 22px -8px rgba(52,211,153,0.7)' } : undefined}>
                <Check className="w-3 h-3 inline mr-1" /> Approve
              </button>
              <button onClick={onReject} className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${isDark ? 'border-rose-500/40 text-rose-400' : 'border-rose-300 text-rose-600'}`}>
                Reject
              </button>
            </div>
          </motion.div>
        )}

        {currentGate?.gate === 'failure' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`rounded-lg border p-2.5 space-y-2 ${
              isDark ? 'bg-rose-500/5 border-rose-500/30' : 'bg-rose-50 border-rose-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-snug">
                <div className={`font-semibold ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>System failure</div>
                <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>{currentGate.label}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {currentGate.recoveryOptions?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onRecover(opt.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs border transition ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/5'
                      : 'border-slate-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {opt.label} <ChevronRight className="w-3 h-3 inline opacity-50" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trace — timeline */}
      {trace.length > 0 && (
        <div className="relative pl-4 max-h-44 overflow-y-auto scrollbar-thin" style={{ paddingTop: 2 }}>
          <span aria-hidden className="absolute left-[5px] top-2 bottom-2 rounded-full" style={{ width: 2, background: isDark ? '#1B2740' : '#E2E8F0' }} />
          <div className="space-y-2">
            {trace.map((t) => {
              const dot = t.step.kind === 'error' ? '#F87171' : t.step.kind === 'tool-call' ? '#3B82F6' : t.step.kind === 'complete' ? '#34D399' : t.step.kind === 'warn' ? '#FBBF24' : isDark ? '#475569' : '#94A3B8';
              return (
                <div key={t.index} className="relative text-[11px] font-mono flex items-start gap-2">
                  <span
                    aria-hidden
                    className="absolute rounded-full"
                    style={{ left: -13.5, top: 4, width: 7, height: 7, background: dot, boxShadow: `0 0 6px ${dot}` }}
                  />
                  <span className="flex-1 leading-snug" style={{ color: isDark ? 'var(--text-3)' : 'var(--text-2)' }}>
                    <span style={{ color: dot, fontWeight: 700 }}>{t.step.kind}</span>{' '}
                    <span style={{ color: isDark ? '#E2E8F0' : '#0F172A' }}>{t.step.label}</span>
                    {t.step.invocation && <span style={{ color: isDark ? 'var(--text-4)' : 'var(--text-3)' }}> · {t.step.invocation}</span>}
                    {t.outcomeNote && <span style={{ color: 'var(--warn)' }}> — {t.outcomeNote}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Manipulation strip — add-ons                                        */
/* ------------------------------------------------------------------ */

export const AddOnStrip: React.FC<{
  system: GeneratedSystem;
  applied: Set<string>;
  onApply: (id: string) => void;
}> = ({ system, applied, onApply }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`${panel(isDark)} p-3`}>
      <div className={`${panelTitle(isDark)} mb-2 flex items-center gap-1.5`}>
        <Plus className="w-3 h-3" /> Add components
      </div>
      <div className="flex flex-wrap gap-1.5">
        {system.addOns.map((a) => (
          <button
            key={a.id}
            onClick={() => onApply(a.id)}
            disabled={applied.has(a.id)}
            className={chip(isDark, applied.has(a.id))}
            title={a.description}
          >
            {applied.has(a.id) ? '✓ ' : '+ '}
            {a.chip}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Decisions — tradeoffs, never scores                                 */
/* ------------------------------------------------------------------ */

export const DecisionPanel: React.FC<{
  system: GeneratedSystem;
  decisionIndex: number | null;
  choices: Record<string, string>;
  highlights: Set<string>;
  onChoose: (decisionId: string, optionId: string) => void;
  onNext: () => void;
  onClose: () => void;
}> = ({ system, decisionIndex, choices, highlights, onChoose, onNext, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const decision = decisionIndex !== null ? system.decisions[decisionIndex] : null;

  return (
    <div className={`${panel(isDark)} p-3 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className={`${panelTitle(isDark)} flex items-center gap-1.5`}>
          <Scale className="w-3 h-3" /> Decision mode
        </div>
        {decision && (
          <button onClick={onClose} className={`p-1 rounded ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`} aria-label="Close decisions">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {decision ? (
        <>
          <div>
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{decision.question}</div>
            <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{decision.dimension} · contextual — no wrong answer</div>
          </div>

          <div className="space-y-2">
            {decision.options.map((opt) => {
              const chosen = choices[decision.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChoose(decision.id, opt.id)}
                  className={`w-full text-left rounded-lg border p-2.5 transition ${
                    chosen
                      ? isDark ? 'border-blue-500/50 bg-blue-500/5' : 'border-blue-400 bg-blue-50'
                      : isDark ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{opt.label}</span>
                    {chosen && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                  <div className={`mt-1 text-[11px] leading-snug ${isDark ? 'text-emerald-400/90' : 'text-emerald-600'}`}>+ {opt.advantage}</div>
                  <div className={`text-[11px] leading-snug ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>− {opt.tradeoff}</div>
                  <div className={`mt-1 text-[11px] font-mono leading-snug ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{opt.consequence}</div>
                </button>
              );
            })}
          </div>

          {highlights.size > 0 && (
            <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              canvas highlights the affected subsystem — compare the tradeoff spatially
            </div>
          )}

          <button
            onClick={onNext}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              isDark ? 'border-slate-700 text-slate-200 hover:border-slate-500' : 'border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            {decisionIndex !== null && decisionIndex < system.decisions.length - 1 ? 'Next decision' : 'Done — close decision mode'}
          </button>
        </>
      ) : (
        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Choose an option — the system visibly changes with each tradeoff.
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Production journey — idea → honest toolchain                        */
/* ------------------------------------------------------------------ */

const DOMAIN_MAP: Record<string, { human: string; project: string }> = {
  finance: { human: 'finance & settlement', project: 'SplitFin' },
  operations: { human: 'operations & logistics', project: 'StayEase' },
  logistics: { human: 'operations & logistics', project: 'StayEase' },
  support: { human: 'service & support', project: 'StayEase + SplitFin' },
  knowledge: { human: 'knowledge & search', project: 'StayEase + SplitFin' },
};

const JOURNEY_STEPS = [
  { n: '01', label: 'Blueprint', detail: 'composed from typed patterns — deterministic, no account' },
  { n: '02', label: 'Native core', detail: 'Expo SDK 52 · React Native, one codebase both stores' },
  { n: '03', label: 'Realtime data', detail: 'Supabase · Postgres · PostGIS, offline-first sync' },
  { n: '04', label: 'Quality', detail: 'Maestro E2E on iOS + Android simulators' },
] as const;

export const ProductionJourney: React.FC<{ domain?: string }> = ({ domain }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const map = domain ? DOMAIN_MAP[domain] : undefined;
  const project = map?.project ?? 'StayEase + SplitFin';

  return (
    <div className={`${panel(isDark)} p-4`}>
      <div className={`${panelTitle(isDark)} mb-3 flex items-center gap-1.5`}>
        <Layers className="w-3 h-3" /> From idea to production
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {JOURNEY_STEPS.map((s) => (
          <div key={s.n} className={`rounded-lg border p-2.5 ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/60'}`}>
            <div className="text-[10px] font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{s.n}</div>
            <div className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.label}</div>
            <div className={`mt-0.5 text-[10.5px] leading-snug ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.detail}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px]" style={{ color: isDark ? 'var(--text-4)' : 'var(--text-3)' }}>
        {map ? `This class of system — ${map.human} — uses patterns I have actually shipped in ` : 'The patterns above are shaped and proven in '}
        <span className="tech-label" style={{ color: 'var(--accent)', textTransform: 'none', letterSpacing: 0 }}>{project}</span>.
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Evidence — connect claims to real work                              */
/* ------------------------------------------------------------------ */

export const EvidencePanel: React.FC<{ system: GeneratedSystem }> = ({ system }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`${panel(isDark)} p-3`}>
      <div className={`${panelTitle(isDark)} mb-2 flex items-center gap-1.5`}>
        <Layers className="w-3 h-3" /> Relevant work — not the same system
      </div>
      <div className="space-y-2">
        {system.projectEvidence.map((ev) => (
          <a
            key={ev.projectId}
            href={ev.url ?? '#work'}
            target={ev.url ? '_blank' : undefined}
            rel="noreferrer"
            className={`block rounded-lg border p-2.5 transition group ${
              isDark ? 'border-slate-800 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{ev.name}</span>
              <span className="flex items-center gap-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  ev.tag === 'BUILT'
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : ev.tag === 'PROTOTYPE'
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-slate-500/15 text-slate-400'
                }`}>
                  {ev.tag}
                </span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition" />
              </span>
            </div>
            <p className={`mt-1 text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ev.relevance}</p>
          </a>
        ))}
      </div>
    </div>
  );
};


