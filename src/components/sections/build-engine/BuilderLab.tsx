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
  StatTile,
} from './LabPanels';

const MARQUEE = ['UNDERSTAND', 'MODEL', 'DESIGN', 'BUILD', 'STRESS', 'MEASURE', 'SHIP'];

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

  const hairline = 'rgba(148,163,184,0.16)';

  return (
    <section
      id="builder-lab"
      aria-label="Builder Lab — interactive system experience"
      className="relative overflow-hidden border-b"
      style={{ borderColor: hairline, background: isDark ? '#020409' : '#070D1D' }}
    >
      {/* Atmosphere */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute lab-aurora-a rounded-full" style={{ width: 560, height: 560, left: '-140px', top: '-160px', background: 'radial-gradient(circle, rgba(59,130,246,0.16), transparent 65%)', filter: 'blur(50px)' }} />
        <div className="absolute lab-aurora-b rounded-full" style={{ width: 620, height: 620, right: '-180px', top: '22%', background: 'radial-gradient(circle, rgba(139,92,246,0.13), transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full" style={{ width: 480, height: 480, left: '32%', bottom: '-260px', background: 'radial-gradient(circle, rgba(34,211,238,0.09), transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(148,163,184,0.10) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 30%, transparent 100%)' }} />
        <div className="absolute inset-0 lab-noise" style={{ opacity: 0.05 }} />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28 space-y-8 sm:space-y-10">
        {/* Ghost word */}
        <div aria-hidden className="lab-ghost font-display select-none pointer-events-none absolute right-2 sm:right-6 top-12 sm:top-16" style={{ fontSize: 'clamp(90px, 16vw, 220px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
          LAB
        </div>

        {/* Giant header */}
        <div className="relative max-w-3xl space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-lg border px-2.5 py-1 text-[11px] font-mono" style={{ borderColor: 'rgba(148,163,184,0.3)', color: 'var(--accent)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
              Builder Lab
            </span>
            <span className="text-[11px] font-mono" style={{ color: '#7C8DB0' }}>
              live · runs in your browser
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F8FAFC', lineHeight: 1.02 }}>
            Describe a problem.
            <br />
            <span style={{ background: 'linear-gradient(100deg, #60A5FA, #A78BFA 60%, #22D3EE)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Watch the system form.
            </span>
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: '#AEBBCE', maxWidth: 560 }}>
            The same loop as How I Build, made touchable: drop an idea, see a typed system
            assemble itself, run it, break it, and read the shape of the software underneath —
            the recovery behavior is the point.
          </p>
          {!showWorkspace && (
            <div className="flex flex-wrap gap-2">
              {['deterministic engine', 'optional AI interpretation', 'no account · no key'].map((b) => (
                <span key={b} className="font-mono rounded-full border" style={{ fontSize: 11, padding: '5px 12px', color: '#AEBBCE', borderColor: 'rgba(148,163,184,0.28)', background: 'rgba(148,163,184,0.06)' }}>
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stage marquee */}
        <div aria-hidden className="relative overflow-hidden" style={{ borderTop: `1px solid ${hairline}`, borderBottom: `1px solid ${hairline}` }}>
          <div className="lab-marquee flex w-max items-center gap-8 font-mono whitespace-nowrap" style={{ padding: '10px 0', fontSize: 11.5, letterSpacing: '0.14em', color: '#5B6B85' }}>
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-8">
                <span>{m}</span>
                <span style={{ color: 'var(--accent)' }}>◆</span>
              </span>
            ))}
          </div>
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
                <IdeaInput deck onSubmit={actions.submitIdea} suggestions={scenarioMeta.map((s) => ({ chip: s.chip, example: s.example }))} />
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
                <span className="hidden md:inline" style={{ color: '#7C8DB0' }}>
                  {state.nodes.length} nodes · {state.edges.length} edges
                </span>
                <span className="flex-1" />
                <span className="hidden sm:inline" style={{ color: '#7C8DB0' }}>
                  lens · {state.activeLens}
                </span>
              </div>

              {/* Stage */}
              <div className="relative">
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
            </div>

            {/* Live rail */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-2 gap-3">
              <StatTile label="nodes" value={state.nodes.length} accent />
              <StatTile label="edges" value={state.edges.length} />
              <StatTile label="steps" value={state.trace.length} />
              <StatTile label="events" value={state.events.length} />
              <div className="col-span-2 space-y-3">
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
            className="max-w-3xl mx-auto rounded-2xl border p-5 text-center space-y-3"
            style={{ borderColor: 'rgba(148,163,184,0.25)', background: 'rgba(148,163,184,0.05)' }}
          >
            <div className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>
              Ready to build the real version of this?
            </div>
            <p className="text-xs" style={{ color: '#AEBBCE' }}>
              {state.idea ? `Idea: “${state.idea}”` : 'Every system above maps to patterns I have shipped.'} — interested in{' '}
              {state.system?.domain ?? 'this class of system'}? Let's talk.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
              style={{ background: '#F8FAFC', color: '#0B1120' }}
            >
              Start a conversation
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};
