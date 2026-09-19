/**
 * Builder Lab — Mission-control stage.
 *
 * A full-bleed dark instrument, always: aurora atmosphere, giant display
 * type, a stage marquee, a command-deck input, and a bento workspace —
 * console canvas with floating HUD beside a live-stat rail. The engine,
 * machine, and every interaction underneath are untouched; only the
 * composition changed.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useLabMachine, selectCurrentGate } from '../../../hooks/useLabMachine';
import { scenarioMeta, lensTransforms, systemLenses } from '../../../data/build-engine/scenarios';
import { composedLensTransforms } from '../../../data/build-engine/composer';
import { SystemBoard } from './SystemBoard';
import { AgentRun } from './AgentRun';
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
  StatTile,
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
  const [view, setView] = useState<'system' | 'agent'>('system');
  const showAgentView = view === 'agent' && state.system != null;

  /* New idea → land on the system view, not a stale agent run. */
  React.useEffect(() => {
    if (state.phase === 'understanding' || state.phase === 'forming') setView('system');
  }, [state.phase]);

  const hairline = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section
      id="builder-lab"
      aria-label="Builder Lab — interactive system experience"
      className="py-12 sm:py-16 border-b"
      style={{ borderColor: hairline }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Editorial header — same language as every other section */}
        <div className="max-w-2xl space-y-4">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>Builder Lab</p>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Describe a problem. Watch the system form.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2)' }}>
            The same loop as How I Build, made touchable: drop an idea, see a typed system
            assemble itself, run it, break it, and read the shape of the software underneath —
            the recovery behavior is the point.
            <span className="font-mono" style={{ fontSize: 12.5, color: 'var(--text-4)' }}> · live · runs in your browser</span>
          </p>
          {!showWorkspace && (
            <div className="flex flex-wrap gap-2">
              {['deterministic engine', 'optional AI interpretation', 'no account · no key'].map((b) => (
                <span key={b} className="font-mono rounded-full border" style={{ fontSize: 11, padding: '5px 12px', color: 'var(--text-2)', borderColor: hairline }}>
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* IDLE / UNDERSTANDING: command deck */}
        <AnimatePresence mode="wait">
          {(state.phase === 'idle' || state.phase === 'understanding') && (
            <motion.div
              key={state.phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-2"
            >
              {state.phase === 'idle' ? (
                <IdeaInput onSubmit={actions.submitIdea} suggestions={scenarioMeta.map((s) => ({ chip: s.chip, example: s.example }))} />
              ) : (
                <UnderstandingBanner idea={state.idea} rationale={state.rationale} matchedSignals={state.matchedSignals} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE: bento — console + live rail */}
        {showWorkspace && (
          <div className="grid gap-4 lg:grid-cols-12 items-start">
            {/* Console */}
            <div
              className="lg:col-span-8 rounded-2xl border overflow-hidden"
              style={{
                borderColor: isDark ? 'var(--line-strong-dark)' : 'rgba(148,163,184,0.35)',
                background: isDark ? 'rgba(2,6,16,0.55)' : 'rgba(255,255,255,0.6)',
                boxShadow: isDark ? '0 0 0 1px color-mix(in srgb, var(--accent) 14%, transparent), 0 24px 64px -24px rgba(0,0,0,0.7)' : '0 24px 64px -28px rgba(7,13,29,0.5)',
              }}
            >
              {/* Console header */}
              <div
                className="flex items-center gap-3 font-mono"
                style={{
                  padding: '9px 14px',
                  fontSize: 11,
                  borderBottom: `1px solid ${isDark ? 'var(--line-dark)' : 'rgba(148,163,184,0.3)'}`,
                  background: isDark ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.75)',
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
                    color: state.simState === 'running' ? 'var(--accent)' : state.simState === 'gate' ? 'var(--warn)' : state.simState === 'done' ? 'var(--ok)' : '#AEBBCE',
                    background: state.simState === 'running' ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : state.simState === 'gate' ? 'color-mix(in srgb, var(--warn) 12%, transparent)' : state.simState === 'done' ? 'color-mix(in srgb, var(--ok) 12%, transparent)' : 'transparent',
                    border: `1px solid ${state.simState === 'idle' ? hairline : 'transparent'}`,
                  }}
                >
                  {state.simState === 'running' ? '● running' : state.simState === 'gate' ? '◆ decision' : state.simState === 'done' ? '■ complete' : state.phase}
                </span>
                <span className="hidden md:inline" style={{ color: 'var(--text-3)' }}>
                  {state.nodes.length} nodes · {state.edges.length} edges
                </span>
                <span className="flex-1" />
                <span className="hidden sm:inline" style={{ color: 'var(--text-3)' }}>
                  lens · {state.activeLens}
                </span>
                {/* View toggle — System graph or Agent run */}
                <div className="flex items-center gap-0.5 rounded-full border font-mono" style={{ borderColor: hairline, padding: 2 }} role="tablist" aria-label="Builder view">
                  {(['system', 'agent'] as const).map((v) => (
                    <button
                      key={v}
                      role="tab"
                      aria-selected={view === v}
                      onClick={() => setView(v)}
                      className="rounded-full transition font-bold"
                      style={{
                        padding: '4px 11px',
                        fontSize: 10.5,
                        color: view === v ? (isDark ? '#0B1120' : '#fff') : 'var(--text-3)',
                        background: view === v ? (isDark ? '#F1F5F9' : '#0F172A') : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {v === 'system' ? 'SYSTEM' : 'AGENT'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={actions.reset}
                  className="flex items-center gap-1.5 rounded-full font-mono border transition"
                  style={{ padding: '4px 11px', fontSize: 10.5, borderColor: hairline, color: 'var(--text-2)', background: 'transparent' }}
                  title="Start over with a new idea"
                >
                  <RotateCcw className="w-3 h-3" /> <span className="hidden sm:inline">New idea</span>
                </button>
              </div>

              {/* Stage */}
              <div className="relative">
                {state.system && (showAgentView ? (
                  <div style={{ padding: 8 }} className="sm:p-4">
                    <AgentRun
                      system={state.system}
                      phase={state.phase}
                      simState={state.simState}
                      simIndex={state.simIndex}
                      trace={state.trace}
                      gate={gate}
                      chaos={state.chaos}
                      onStart={actions.startSim}
                      onBreak={actions.breakSim}
                      onPause={actions.pauseSim}
                      onResume={actions.resumeSim}
                      onApprove={actions.approveGate}
                      onReject={actions.rejectGate}
                      onRecover={actions.recover}
                      onReset={actions.resetSim}
                    />
                  </div>
                ) : (
                  <div style={{ padding: 8 }} className="sm:p-4">
                    <SystemBoard
                      system={state.system}
                      nodes={state.nodes}
                      edges={state.edges}
                      activeEdgeIds={state.activeEdgeIds}
                      lensEmphasis={new Set(lensDef?.emphasize ?? [])}
                      lensAnnotations={lensDef?.annotations}
                      lensQuestion={lensMeta?.question}
                      decisionHighlights={state.decisionHighlights}
                      selectedNodeId={state.selectedNodeId}
                      starvedIds={state.starvedIds}
                      simState={state.simState}
                      onSelectNode={actions.selectNode}
                      onRemoveNode={actions.removeNode}
                    />
                  </div>
                ))}

                {/* Lens dock — top-left: full chips on sm+, single cycler on phones */}
                {!showAgentView && (
                  <div className="absolute left-3 top-3 z-20 max-w-[calc(100%-24px)]" title={lensMeta?.question}>
                    <div className="hidden min-[480px]:block">
                      <LensSwitcher lenses={systemLenses} active={state.activeLens} onChange={actions.setLens} />
                    </div>
                    <button
                      className="min-[480px]:hidden rounded-full border font-mono backdrop-blur-xl"
                      style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, borderColor: isDark ? 'var(--line-strong-dark)' : 'var(--line-strong)', background: isDark ? 'rgba(10,15,27,0.9)' : 'rgba(255,255,255,0.92)', color: 'var(--accent)' }}
                      onClick={() => {
                        const order = systemLenses.map((l) => l.id);
                        actions.setLens(order[(order.indexOf(state.activeLens) + 1) % order.length]);
                      }}
                      aria-label={`Lens: ${state.activeLens}. Tap for next lens.`}
                    >
                      ◉ {state.activeLens} ›
                    </button>
                  </div>
                )}

                {/* Trace timeline — bottom-left, above the dock */}
                {!showAgentView && (
                  <div className="absolute left-3 bottom-[78px] sm:bottom-3 z-20">
                    <TraceTimeline trace={state.trace} />
                  </div>
                )}

                {/* Inspector — floating card */}
                <AnimatePresence>
                  {!showAgentView && selectedNode && (
                    <motion.div
                      key="inspector"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-20 left-3 right-3 top-14 sm:left-auto sm:right-3 sm:w-[300px]"
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
                {!showAgentView && (
                  <div className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-24px)]">
                    <RunDock
                      simState={state.simState}
                      steps={state.trace.length}
                      onStart={actions.startSim}
                      onBreak={actions.breakSim}
                      onPause={actions.pauseSim}
                      onResume={actions.resumeSim}
                      onReset={actions.resetSim}
                    />
                  </div>
                )}

                {/* Gate spotlight — only in System view; the Agent view decides inline */}
                <AnimatePresence>
                  {!showAgentView && gate && (
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
            </div>

            {/* Live rail */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-2 gap-2">
              <StatTile label="nodes" value={state.nodes.length} accent />
              <StatTile label="edges" value={state.edges.length} />
              <StatTile label="steps" value={state.trace.length} />
              <StatTile label="events" value={state.events.length} />
              <div className="col-span-2 space-y-2">
                {state.system && (
                  <AddOnStrip system={state.system} applied={state.appliedAddOns} onApply={actions.applyAddOn} />
                )}
                {state.system && state.system.decisions.length > 0 && state.decisionIndex === null && (
                  <button
                    onClick={actions.openDecisions}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition"
                    style={{ borderColor: 'rgba(148,163,184,0.3)', color: '#E2E8F0', background: 'rgba(148,163,184,0.06)' }}
                  >
                    Open decision mode — real tradeoffs
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events terminal — full width */}
        {showWorkspace && (
          <EventTicker
            events={state.events}
            expanded={eventsOpen}
            onToggle={() => setEventsOpen((v) => !v)}
          />
        )}

        {/* Journey — only once a system has a shape (earned, like evidence) */}
        {state.system && state.phase !== 'understanding' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <ProductionJourney domain={state.system.domain} />
          </motion.div>
        )}

        {/* Decision panel (inline expansion, full width under workspace) */}
        {state.decisionIndex !== null && state.system && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
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

        {/* Evidence — earned, not permanent */}
        {(state.phase === 'result' || state.manipulationLog.length > 0) && state.system && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <EvidencePanel system={state.system} />
          </motion.div>
        )}

        {/* Emergent contact CTA */}
        {(state.phase === 'result' || state.manipulationLog.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto rounded-2xl border p-4 text-center space-y-3"
            style={{ borderColor: hairline, background: isDark ? 'var(--surface-1)' : '#fff' }}
          >
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              Ready to build the real version of this?
            </div>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              {state.idea ? `Idea: “${state.idea}”` : 'Every system above maps to patterns I build with.'} — interested in{' '}
              {state.system?.domain ?? 'this class of system'}? Let's talk.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
              style={{ background: isDark ? '#F1F5F9' : '#0F172A', color: isDark ? '#0B1120' : '#F8FAFC' }}
            >
              Start a conversation
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};
