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
import { FlaskConical, RotateCcw, ChevronDown } from 'lucide-react';
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
  SimulationPanel,
  AddOnStrip,
  DecisionPanel,
  EvidencePanel,
} from './LabPanels';
import { MobileLab } from './MobileLab';

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
  const simActive = state.simState === 'running' || state.simState === 'paused' || state.simState === 'gate';
  const railMode: 'runtime' | 'inspector' = simActive || !selectedNode ? 'runtime' : 'inspector';
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
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
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

        {/* WORKSPACE: canvas + panels */}
        {showWorkspace && (
          <>
            {/* MOBILE (<lg): one major idea per viewport — segmented switcher */}
            <div className="lg:hidden">
              <MobileLab
                state={state}
                gate={gate}
                lensDef={lensDef}
                lensMeta={lensMeta}
                selectedNode={selectedNode}
                actions={actions}
              />
            </div>

            {/* DESKTOP (lg+): spatial two-column workspace */}
            <div className="hidden lg:grid grid-cols-[1fr_340px] gap-5 items-start">
              {/* Left: canvas + lens bar */}
              <div className="space-y-3 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <LensSwitcher lenses={systemLenses} active={state.activeLens} onChange={actions.setLens} />
                  <div className="flex items-center gap-2">
                    {lensMeta && (
                      <span className={`hidden xl:inline text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`} title={lensDef ? Object.keys(lensDef.annotations).length + ' annotations' : ''}>
                        {lensMeta.question}
                      </span>
                    )}
                    <button
                      onClick={actions.reset}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                        isDark ? 'border-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" /> New idea
                    </button>
                  </div>
                </div>

                <div
                  className={`relative rounded-2xl border overflow-hidden ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Blueprint header — the canvas reads as an instrument, not a widget */}
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-2 border-b"
                    style={{
                      borderColor: isDark ? 'var(--line-dark)' : 'var(--line)',
                      background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.7)',
                    }}
                  >
                    <span className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: isDark ? 'var(--text-4)' : 'var(--text-3)' }}>
                      System blueprint
                    </span>
                    {lensMeta && (
                      <span className="hidden xl:inline text-[11px] font-mono truncate" style={{ color: 'var(--accent)' }} title={lensMeta.question}>
                        {lensMeta.label} · {lensMeta.question}
                      </span>
                    )}
                  </div>
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
                </div>

                {/* Add-on strip under canvas */}
                {state.system && (
                  <AddOnStrip system={state.system} applied={state.appliedAddOns} onApply={actions.applyAddOn} />
                )}
              </div>

              {/* Right: ONE contextual panel — progressive disclosure.
                  While the system runs (or a gate is open) the runtime owns
                  the rail; otherwise a selected node owns it; when nothing
                  is active the rail offers the next step. */}
              <div className="space-y-3 lg:sticky lg:top-20">
                <AnimatePresence mode="wait" initial={false}>
                  {railMode === 'runtime' ? (
                    <motion.div
                      key="runtime"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <SimulationPanel
                        simState={state.simState}
                        currentGate={gate}
                        trace={state.trace}
                        onStart={actions.startSim}
                        onPause={actions.pauseSim}
                        onResume={actions.resumeSim}
                        onReset={actions.resetSim}
                        onApprove={actions.approveGate}
                        onReject={actions.rejectGate}
                        onRecover={actions.recover}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inspector"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <NodeInspector
                        node={selectedNode}
                        onClose={() => actions.selectNode(null)}
                        onRemove={actions.removeNode}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Events: collapsed to a live ticker, expandable on demand */}
                <EventTicker
                  events={state.events}
                  expanded={eventsOpen}
                  onToggle={() => setEventsOpen((v) => !v)}
                />

                {/* Decision mode — only offered when the system has real
                    tradeoffs; opens inline below the workspace */}
                {state.system && state.system.decisions.length > 0 && state.decisionIndex === null && (
                  <button
                    onClick={actions.openDecisions}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      isDark ? 'border-slate-700 text-slate-200 hover:border-slate-500' : 'border-slate-300 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    Open decision mode — real tradeoffs
                  </button>
                )}
              </div>
            </div>
          </>
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
