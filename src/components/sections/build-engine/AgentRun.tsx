/**
 * Builder Lab — Agent Run
 *
 * A controlled agent mission, not a chatbot. The visitor watches a system
 * agent walk its own plan: mission in, staged execution (understand → plan →
 * tool → result → decide → action → recover → verify), with human authority
 * at the gates. All of it is deterministic and driven by the SAME machine as
 * the canvas — flipping to System view mid-run pauses this panel, not the
 * system. Failures are opt-in (the Break run); recovery is a real decision.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  BadgeCheck,
  Check,
  ChevronRight,
  CircleCheck,
  GitBranch,
  ListChecks,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import type {
  GeneratedSystem,
  LabPhase,
  SimulationState,
  SimulationStep,
  SimulationTraceEntry,
} from '../../../data/build-engine/types';

/* ------------------------------------------------------------------ */
/* Stage vocabulary                                                    */
/* ------------------------------------------------------------------ */

const STAGES = [
  { id: 'understand', label: 'Understand', icon: Search },
  { id: 'plan', label: 'Plan', icon: ListChecks },
  { id: 'tool', label: 'Tool', icon: Wrench },
  { id: 'result', label: 'Result', icon: CircleCheck },
  { id: 'decide', label: 'Decide', icon: GitBranch },
  { id: 'action', label: 'Action', icon: Zap },
  { id: 'recover', label: 'Recover', icon: RefreshCw },
  { id: 'verify', label: 'Verify', icon: BadgeCheck },
] as const;

type StageId = (typeof STAGES)[number]['id'];

const STAGE_OF_KIND: Record<string, StageId> = {
  trigger: 'understand',
  'agent-state': 'plan',
  'tool-call': 'tool',
  'tool-result': 'result',
  action: 'action',
  'human-gate': 'decide',
  'state-change': 'action',
  error: 'recover',
  recovery: 'recover',
  complete: 'verify',
};

const stageFor = (step: SimulationStep): StageId => STAGE_OF_KIND[step.kind] ?? 'understand';

const STAGE_COLOR: Record<StageId, string> = {
  understand: '#60A5FA',
  plan: '#818CF8',
  tool: '#34D399',
  result: '#2DD4BF',
  decide: '#FBBF24',
  action: '#FB7185',
  recover: '#F472B6',
  verify: '#A3E635',
};

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export interface AgentRunProps {
  system: GeneratedSystem;
  phase: LabPhase;
  simState: SimulationState;
  simIndex: number;
  trace: SimulationTraceEntry[];
  gate: SimulationStep | null;
  chaos: boolean;
  onStart: () => void;
  onBreak: () => void;
  onPause: () => void;
  onResume: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRecover: (optionId: string) => void;
  onReset: () => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const AgentRun: React.FC<AgentRunProps> = ({
  system,
  phase,
  simState,
  simIndex,
  trace,
  gate,
  chaos,
  onStart,
  onBreak,
  onPause,
  onResume,
  onApprove,
  onReject,
  onRecover,
  onReset,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();

  const planned = system.simulation.steps;
  const current = trace[trace.length - 1] ?? null;
  const currentStage = current ? stageFor(current.step) : null;

  const mission = system.problem || system.title;

  /* Stage progress derived from the trace index (not from timers). */
  const stageStates = useStageStates(planned, simIndex);

  const running = simState === 'running';
  const statusLabel =
    simState === 'idle'
      ? 'IDLE'
      : simState === 'paused'
      ? 'PAUSED'
      : simState === 'gate'
      ? gate?.gate === 'failure'
        ? 'DEGRADED'
        : 'HUMAN GATE'
      : simState === 'done'
      ? 'COMPLETE'
      : 'RUNNING';
  const statusColor = simState === 'done' ? 'var(--ok)' : simState === 'gate' ? (gate?.gate === 'failure' ? '#FB7185' : '#FBBF24') : simState === 'paused' ? '#FBBF24' : running ? 'var(--accent)' : isDark ? '#7C8DB0' : '#64748B';

  const shell: React.CSSProperties = {
    borderColor: isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)',
    background: isDark ? 'rgba(2,6,16,0.55)' : 'rgba(255,255,255,0.65)',
  };

  const btnPrimary: React.CSSProperties = {
    height: 46,
    minWidth: 44,
    background: 'linear-gradient(135deg, var(--accent), #7C3AED)',
    color: '#fff',
    fontWeight: 700,
    padding: '0 18px',
  };

  const btnGhost: React.CSSProperties = {
    height: 46,
    minWidth: 44,
    border: `1px solid ${isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)'}`,
    color: 'var(--text-1)',
    fontWeight: 600,
    background: 'transparent',
    padding: '0 14px',
  };

  return (
    <div className="min-w-0">
      {/* Mission header */}
      <div style={shell} className="rounded-2xl border p-3 flex items-start gap-3">
        <span
          className="shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            boxShadow: '0 8px 22px -8px rgba(59,130,246,0.7)',
          }}
        >
          <Sparkles size={18} color="#fff" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-3)' }}>
              AGENT MISSION
            </span>
            <span className="flex-1" />
            <span
              className="font-mono rounded-full"
              style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 10px',
                color: statusColor,
                background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${statusColor} 45%, transparent)`,
              }}
              aria-live="polite"
            >
              {statusLabel}
            </span>
          </div>
          <div className="truncate" style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: '-0.015em', color: 'var(--text-1)', marginTop: 3 }}>
            {system.title}
          </div>
          <p className="line-clamp-2" style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-2)', marginTop: 2 }}>
            {mission}
          </p>
          {chaos && currentStage === 'recover' && (
            <div className="inline-flex items-center gap-1.5 font-mono rounded-full" style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', marginTop: 6, color: '#F472B6', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.35)' }}>
              <ShieldAlert size={11} /> failure injected — recovery is a decision, not an animation
            </div>
          )}
        </div>
      </div>

      {/* Stage rail */}
      <div className="mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none" role="list" aria-label="Agent mission stages" style={{ paddingBottom: 2 }}>
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const st = stageStates[s.id];
          const color = STAGE_COLOR[s.id];
          return (
            <div key={s.id} role="listitem" className="flex items-center shrink-0">
              {i > 0 && (
                <span style={{ width: 14, height: 1.5, background: st === 'pending' ? (isDark ? '#1B2740' : '#E2E8F0') : color, opacity: st === 'pending' ? 0.5 : 0.9 }} aria-hidden />
              )}
              <div
                className="flex flex-col items-center rounded-xl border"
                aria-current={st === 'current' ? 'step' : undefined}
                style={{
                  padding: '5px 10px',
                  minWidth: 64,
                  borderColor: st === 'current' ? `color-mix(in srgb, ${color} 55%, transparent)` : st === 'done' ? `color-mix(in srgb, ${color} 30%, transparent)` : isDark ? 'var(--line)' : 'var(--line)',
                  background: st === 'current' ? `color-mix(in srgb, ${color} 12%, transparent)` : st === 'done' ? `color-mix(in srgb, ${color} 8%, transparent)` : 'transparent',
                }}
              >
                <Icon size={13} color={st === 'pending' ? (isDark ? '#475569' : '#94A3B8') : color} />
                <span className="font-mono" style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.05em', marginTop: 2, color: st === 'pending' ? (isDark ? '#64748B' : '#94A3B8') : 'var(--text-1)' }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current action */}
      <div className="mt-3 min-h-[120px]">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.index}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={shell}
              className="rounded-2xl border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono rounded-full inline-flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', padding: '3px 10px', color: STAGE_COLOR[currentStage ?? 'understand'], background: `color-mix(in srgb, ${STAGE_COLOR[currentStage ?? 'understand']} 12%, transparent)` }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: STAGE_COLOR[currentStage ?? 'understand'], display: 'inline-block' }} />
                  {currentStage?.toUpperCase()}
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  step {current.step.kind} · {current.index + 1}/{planned.length}
                </span>
              </div>
              <p className="mt-2 text-sm" style={{ fontWeight: 700, color: 'var(--text-1)' }}>{current.step.label}</p>
              {current.step.invocation && (
                <code className="mt-1.5 block rounded-lg font-mono" style={{ fontSize: 11, padding: '5px 9px', color: isDark ? '#A5B4FC' : '#4F46E5', background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)' }}>
                  {current.step.invocation}
                </code>
              )}
              {current.step.payload && (
                <p className="mt-1.5 font-mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>λ {current.step.payload}</p>
              )}
              {current.outcomeNote && (
                <p className="mt-1.5 font-mono" style={{ fontSize: 10.5, color: 'var(--warn)' }}>→ {current.outcomeNote}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={shell}
              className="rounded-2xl border p-4 flex items-center justify-center"
            >
              <p className="font-mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>Mission armed. Start the run to watch the agent execute its plan.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls / decision surface */}
      <div className="mt-3">
        {simState === 'idle' && (
          <div className="flex flex-wrap gap-2">
            <button onClick={onStart} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={btnPrimary} aria-label="Start the agent run">
              <Play size={15} /> Run the mission
            </button>
            <button onClick={onBreak} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={{ ...btnGhost, borderColor: 'color-mix(in srgb, var(--warn) 55%, transparent)', color: 'var(--warn)' }} title="Run once with a failure injected — watch the agent decide how to recover">
              <ShieldAlert size={14} /> Break run
            </button>
            <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={btnGhost}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        )}

        {running && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 font-mono" style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 700 }}>
              <span className="relative flex" style={{ width: 8, height: 8 }} aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: 'var(--accent)', opacity: 0.5 }} />
                <span className="relative inline-flex rounded-full" style={{ width: 8, height: 8, background: 'var(--accent)' }} />
              </span>
              agent executing
            </span>
            <span className="flex-1" />
            <button onClick={onPause} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={btnGhost} aria-label="Interrupt the run">
              <Pause size={14} /> Interrupt
            </button>
          </div>
        )}

        {simState === 'paused' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono rounded-full" style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.4)' }}>
              ⏸ run interrupted
            </span>
            <span className="flex-1" />
            <button onClick={onResume} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={btnPrimary} aria-label="Resume the run">
              <Play size={14} /> Resume
            </button>
            <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={btnGhost}>
              <RotateCcw size={14} />
            </button>
          </div>
        )}

        {simState === 'gate' && gate && (
          gate.gate === 'failure' ? (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(244,63,94,0.5)', background: isDark ? 'rgba(8,12,22,0.96)' : 'rgba(255,255,255,0.97)', boxShadow: isDark ? '0 0 0 1px rgba(244,63,94,0.2), 0 20px 48px -16px rgba(244,63,94,0.4)' : '0 20px 48px -18px rgba(244,63,94,0.35)' }}>
              <div style={{ padding: '13px 15px', borderBottom: `1px solid ${isDark ? 'var(--line-dark)' : 'var(--line)'}` }}>
                <div className="flex items-center gap-2.5">
                  <ShieldAlert size={18} color="#FB7185" />
                  <div>
                    <div className="font-mono" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#FB7185' }}>AGENT DECISION — TOOL UNRELIABLE</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginTop: 1 }}>{gate.label}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 12 }} className="space-y-2">
                {gate.recoveryOptions?.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onRecover(opt.id)}
                    className="w-full text-left flex items-center gap-2 rounded-xl border transition active:scale-[0.99]"
                    style={{ padding: '11px 13px', minHeight: 44, fontSize: 13, fontWeight: 600, color: 'var(--text-1)', borderColor: isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)', background: 'color-mix(in srgb, #F43F5E 4%, transparent)' }}
                  >
                    {opt.label}
                    <ChevronRight size={15} className="ml-auto opacity-50" />
                  </button>
                ))}
                <p className="font-mono text-center" style={{ fontSize: 10, color: 'var(--text-3)' }}>choosing a recovery path changes the system — watch the trace</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.5)', background: isDark ? 'rgba(8,12,22,0.96)' : 'rgba(255,255,255,0.97)', boxShadow: isDark ? '0 0 0 1px rgba(245,158,11,0.2), 0 20px 48px -16px rgba(245,158,11,0.4)' : '0 20px 48px -18px rgba(245,158,11,0.35)' }}>
              <div style={{ padding: '13px 15px', borderBottom: `1px solid ${isDark ? 'var(--line-dark)' : 'var(--line)'}` }}>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} color="#FBBF24" />
                  <div>
                    <div className="font-mono" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#FBBF24' }}>HUMAN GATE — PAUSE FOR APPROVAL</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginTop: 1 }}>{gate.gatePrompt}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 12 }} className="flex flex-wrap gap-2">
                <button onClick={onApprove} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition active:scale-[0.98]" style={{ minHeight: 46, background: isDark ? '#34D399' : '#059669', color: isDark ? '#052E22' : '#fff', boxShadow: '0 10px 26px -10px rgba(52,211,153,0.8)' }}>
                  <Check size={15} strokeWidth={3} /> Approve
                </button>
                <button onClick={onReject} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition active:scale-[0.98]" style={{ minHeight: 46, borderColor: 'rgba(251,113,133,0.5)', color: '#FB7185', background: 'transparent' }}>
                  <X size={15} strokeWidth={3} /> Reject
                </button>
              </div>
            </div>
          )
        )}

        {simState === 'done' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono rounded-full inline-flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', color: 'var(--ok)', background: 'color-mix(in srgb, var(--ok) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--ok) 45%, transparent)' }}>
              <Scale size={12} /> mission complete — outcome fully traceable
            </span>
            <span className="flex-1" />
            <button onClick={onStart} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={btnPrimary}>
              <Play size={14} /> Run again
            </button>
            <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl transition active:scale-[0.98]" style={btnGhost}>
              <RotateCcw size={14} /> New run
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Stage progress                                                      */
/* ------------------------------------------------------------------ */

function useStageStates(planned: SimulationStep[], simIndex: number): Record<StageId, 'pending' | 'current' | 'done'> {
  return React.useMemo(() => {
    const result: Record<StageId, 'pending' | 'current' | 'done'> = {
      understand: 'pending',
      plan: 'pending',
      tool: 'pending',
      result: 'pending',
      decide: 'pending',
      action: 'pending',
      recover: 'pending',
      verify: 'pending',
    };
    if (simIndex < 0) return result;

    const current = planned[simIndex];
    const currentId = current ? stageFor(current) : 'verify';
    for (const s of STAGES) result[s.id] = 'pending';

    /* A stage is "done" once its last planned step index is behind us. */
    const lastIndex: Record<string, number> = {};
    planned.forEach((step, i) => {
      lastIndex[stageFor(step)] = i;
    });
    for (const s of STAGES) {
      const last = lastIndex[s.id];
      if (last !== undefined && last < simIndex) result[s.id] = 'done';
    }
    if (simIndex >= planned.length - 1 && planned[planned.length - 1]?.kind === 'complete') {
      for (const s of STAGES) result[s.id] = 'done';
    } else {
      result[currentId] = 'current';
    }
    return result;
  }, [planned, simIndex]);
}