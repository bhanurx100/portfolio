/**
 * Builder Lab — Section Composition
 *
 * The flagship experience: drop an idea → watch the system form → run it →
 * interrupt it → manipulate it → view it through lenses → connect it to real
 * work. Mounted once, between Hero and Selected Work, per the compact
 * homepage target structure.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useLabMachine, selectCurrentGate } from '../../../hooks/useLabMachine';
import { scenarioMeta, lensTransforms, systemLenses } from '../../../data/build-engine/scenarios';
import { composedLensTransforms } from '../../../data/build-engine/composer';
import { SystemCanvas } from './SystemCanvas';
import {
  IdeaInput,
  UnderstandingBanner,
  LensSwitcher,
  EventTicker,
  NodeInspector,
  RunDock,
  TraceTimeline,
  GateCard,
  AddOnStrip,
  DecisionPanel,
  EvidencePanel,
  ProductionJourney,
} from './LabPanels';

export const BuilderLabSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { state, actions } = useLabMachine();

  const gate = useMemo(() => selectCurrentGate(state), [state]);
  const lensDef = useMemo(() => {
    if (!state.system) return undefined;
    if (state.system.scenarioId === 'composed') return composedLensTransforms(state.system)[state.activeLens];
    return lensTransforms[state.system.scenarioId]?.[state.activeLens];
  }, [state.system, state.activeLens]);
  const lensMeta = systemLenses.find((l) => l.id === state.activeLens);
  const selectedNode = state.nodes.find((n) => n.id === state.selectedNodeId) ?? null;
  const showWorkspace = state.phase !== 'idle' && state.phase !== 'understanding';
  const [eventsOpen, setEventsOpen] = useState(false);

  return (
    <section
      id="builder-lab"
      className="py-20 sm:py-28 border-b"
      style={{ borderColor: isDark ? 'var(--line-dark)' : 'var(--line)' }}
      aria-label="Builder Lab — interactive system experience"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial header — the thesis of the section */}
        <div className="max-w-2xl space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-lg border px-2.5 py-1 text-[11px] font-mono" style={{ borderColor: isDark ? 'var(--line-dark)' : 'var(--line)', color: 'var(--accent)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
              Builder Lab
            </span>
            <span className="text-[11px] font-mono" style={{ color: isDark ? 'var(--text-4)' : 'var(--text-3)' }}>
              live · runs in your browser
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1.05 }}>
            Describe a problem.
            <br />
            Watch the system form.
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: 'var(--text-2)', maxWidth: 520 }}>
            The same loop as How I Build, made touchable: drop an idea, see a typed system
            assemble itself, run it, break it, and read the shape of the software underneath —
            the recovery behavior is the point.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[11.5px] font-mono" style={{ color: 'var(--text-3)' }}>
            <span className="inline-flex items-center gap-1.5"><span style={{ color: 'var(--accent)', fontWeight: 700 }}>01</span> Form</span>
            <span className="inline-flex items-center gap-1.5"><span style={{ color: 'var(--accent)', fontWeight: 700 }}>02</span> Run</span>
            <span className="inline-flex items-center gap-1.5"><span style={{ color: 'var(--accent)', fontWeight: 700 }}>03</span> Break</span>
            <span className="inline-flex items-center gap-1.5"><span style={{ color: 'var(--accent)', fontWeight: 700 }}>04</span> Connect to real work</span>
          </div>
        </div>

        {/* IDLE / UNDERSTANDING: centered input */}
        <AnimatePresence mode="wait">
          {(state.phase === 'idle' || state.phase === 'understanding') && (
            <motion.div
              key={state.phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6"
            >
              {state.phase === 'idle' ? (
                <IdeaInput onSubmit={actions.submitIdea} suggestions={scenarioMeta.map((s) => ({ chip: s.chip, example: s.example }))} />
              ) : (
                <UnderstandingBanner idea={state.idea} rationale={state.rationale} matchedSignals={state.matchedSignals} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE: system console */}
        {showWorkspace && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)',
              background: isDark ? 'rgba(2,6,16,0.35)' : 'var(--surface-2)',
              boxShadow: isDark ? '0 0 0 1px color-mix(in srgb, var(--accent) 14%, transparent), 0 24px 64px -24px rgba(0,0,0,0.7)' : 'var(--shadow-2)',
            }}
          >
            {/* Console header */}
            <div
              className="flex items-center gap-3 font-mono"
              style={{
                padding: '9px 14px',
                fontSize: 11,
                borderBottom: `1px solid ${isDark ? 'var(--line-dark)' : 'var(--line)'}`,
                background: isDark ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.85)',
              }}
              aria-live="polite"
            >
              <span className="flex gap-1.5" aria-hidden>
                {['#F87171', '#FBBF24', '#34D399'].map((c) => (
                  <span key={c} style={{ width: 8, height: 8, borderRadius: 999, background: c, opacity: 0.85 }} />
                ))}
              </span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>SYSTEM CONSOLE</span>
              <span
                className="rounded-full"
                style={{
                  padding: '2px 9px',
                  fontWeight: 700,
                  color: state.simState === 'running' ? 'var(--accent)' : state.simState === 'gate' ? 'var(--warn)' : state.simState === 'done' ? 'var(--ok)' : isDark ? 'var(--text-3)' : 'var(--text-2)',
                  background: state.simState === 'running' ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : state.simState === 'gate' ? 'color-mix(in srgb, var(--warn) 12%, transparent)' : state.simState === 'done' ? 'color-mix(in srgb, var(--ok) 12%, transparent)' : 'transparent',
                  border: `1px solid ${state.simState === 'idle' ? (isDark ? 'var(--line-dark)' : 'var(--line)') : 'transparent'}`,
                }}
              >
                {state.simState === 'running' ? '● running' : state.simState === 'gate' ? '◆ decision' : state.simState === 'done' ? '■ complete' : state.phase}
              </span>
              <span className="hidden md:inline" style={{ color: isDark ? 'var(--text-4)' : 'var(--text-3)' }}>
                {state.nodes.length} nodes · {state.edges.length} edges
              </span>
              <span className="flex-1" />
              <span className="hidden sm:inline" style={{ color: isDark ? 'var(--text-4)' : 'var(--text-3)' }}>
                lens · {state.activeLens}
              </span>
            </div>
            {/* Console body */}
            <div className="p-3 sm:p-4">
            {/* MOBILE (<lg): one major idea per viewport — segmented switcher */}
            {/* STAGE: one console for every viewport — canvas with floating HUD */}
            <div
              className="relative rounded-2xl border overflow-hidden"
              style={{
                borderColor: isDark ? 'var(--line-dark)' : 'var(--line)',
                background: isDark ? '#05080F' : '#EDF1F7',
              }}
            >
              <SystemCanvas
                nodes={state.nodes}
                edges={state.edges}
                activeEdgeIds={state.activeEdgeIds}
                lensEmphasis={new Set(lensDef?.emphasize ?? [])}
                lensAnnotations={lensDef?.annotations ?? {}}
                decisionHighlights={state.decisionHighlights}
                selectedNodeId={state.selectedNodeId}
                starvedIds={state.starvedIds}
                simState={state.simState}
                variant={state.layoutVariant}
                onVariantChange={actions.setLayoutVariant}
                onSelectNode={actions.selectNode}
              />

              {/* Lens dock — top-left */}
              <div className="absolute left-3 top-3 z-20 max-w-[calc(100%-110px)]" title={lensMeta?.question}>
                <LensSwitcher lenses={systemLenses} active={state.activeLens} onChange={actions.setLens} />
              </div>

              {/* New idea — top-right */}
              <div className="absolute right-3 top-3 z-20">
                <button
                  onClick={actions.reset}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-mono border backdrop-blur-xl transition"
                  style={{
                    borderColor: isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)',
                    background: isDark ? 'rgba(10,15,27,0.9)' : 'rgba(255,255,255,0.92)',
                    color: isDark ? 'var(--text-3)' : 'var(--text-2)',
                  }}
                >
                  <RotateCcw className="w-3 h-3" /> New idea
                </button>
              </div>

              {/* Trace timeline — bottom-left, above the dock */}
              <div className="absolute left-3 bottom-[78px] sm:bottom-3 z-20">
                <TraceTimeline trace={state.trace} />
              </div>

              {/* Inspector — floating card */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div
                    key="inspector"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-20 left-3 right-3 bottom-[78px] sm:left-auto sm:right-3 sm:top-14 sm:bottom-auto sm:w-[300px]"
                  >
                    <NodeInspector
                      node={selectedNode}
                      onClose={() => actions.selectNode(null)}
                      onRemove={actions.removeNode}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Run dock — bottom-center */}
              <div className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-24px)]">
                <RunDock
                  simState={state.simState}
                  steps={state.trace.length}
                  onStart={actions.startSim}
                  onPause={actions.pauseSim}
                  onResume={actions.resumeSim}
                  onReset={actions.resetSim}
                />
              </div>

              {/* Gate spotlight */}
              <AnimatePresence>
                {gate && (
                  <motion.div
                    key="gate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 z-30 flex items-center justify-center p-4"
                    style={{
                      background: isDark ? 'rgba(2,6,16,0.62)' : 'rgba(15,23,42,0.45)',
                      backdropFilter: 'blur(3px)',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.94, y: 12 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.96, y: 8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                      className="w-full max-w-sm"
                    >
                      <GateCard
                        gate={gate}
                        onApprove={actions.approveGate}
                        onReject={actions.rejectGate}
                        onRecover={actions.recover}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Under-stage: add-ons + events + decision entry */}
            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_340px]">
              <div className="space-y-3 min-w-0">
                {state.system && (
                  <AddOnStrip system={state.system} applied={state.appliedAddOns} onApply={actions.applyAddOn} />
                )}
                <EventTicker
                  events={state.events}
                  expanded={eventsOpen}
                  onToggle={() => setEventsOpen((v) => !v)}
                />
              </div>
              <div>
                {state.system && state.system.decisions.length > 0 && state.decisionIndex === null && (
                  <button
                    onClick={actions.openDecisions}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                      isDark ? 'border-slate-700 text-slate-200 hover:border-slate-500' : 'border-slate-300 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    Open decision mode — real tradeoffs
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Journey — only once a system has a shape (earned, like evidence) */}
        {state.system && state.phase !== 'understanding' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <ProductionJourney domain={state.system.domain} />
          </motion.div>
        )}

        {/* Decision panel (inline expansion, full width under workspace) */}
        {state.decisionIndex !== null && state.system && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <DecisionPanel
              system={state.system}
              decisionIndex={state.decisionIndex}
              choices={state.decisionChoices}
              highlights={state.decisionHighlights}
              onChoose={actions.chooseDecision}
              onNext={actions.nextDecision}
              onClose={actions.closeDecisions}
            />
          </motion.div>
        )}

        {/* Evidence — earned, not permanent: appears once the system has
            been run or manipulated, as a full-width strip beneath the lab */}
        {(state.phase === 'result' || state.manipulationLog.length > 0) && state.system && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <EvidencePanel system={state.system} />
          </motion.div>
        )}

        {/* Emergent contact CTA — next state of the experience, not a pasted button */}
        {(state.phase === 'result' || state.manipulationLog.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-2xl mx-auto rounded-2xl border p-5 text-center space-y-3 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ready to build the real version of this?
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {state.idea ? `Idea: “${state.idea}”` : 'Every system above maps to patterns I have shipped.'} — interested in{' '}
              {state.system?.domain ?? 'this class of system'}? Let's talk.
            </p>
            <a
              href="#contact"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Start a conversation
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};
