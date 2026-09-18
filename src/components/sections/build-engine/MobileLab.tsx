/**
 * Builder Lab — Mobile Experience
 *
 * Mobile is the primary experience, not a shrunken desktop. One major idea
 * per viewport: a segmented control (Graph / Run / Inspect) keeps the canvas
 * readable and the controls reachable with a thumb. No hover dependency, no
 * horizontal overflow, no giant diagram.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitBranch, Play, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { systemLenses, type LensTransform } from '../../../data/build-engine/scenarios';
import type { LabState, LabActionsType } from '../../../hooks/useLabMachine';
import type { SimulationStep } from '../../../data/build-engine/types';
import {
  LensSwitcher,
  EventTicker,
  SimulationPanel,
  NodeInspector,
  AddOnStrip,
  EvidencePanel,
} from './LabPanels';
import { SystemCanvas } from './SystemCanvas';

interface MobileLabProps {
  state: LabState;
  gate: SimulationStep | null;
  lensDef?: LensTransform;
  lensMeta?: { question: string };
  selectedNode: LabState['nodes'][number] | null;
  actions: LabActionsType;
}

type Segment = 'graph' | 'run' | 'inspect';

const SEGMENTS: { id: Segment; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'graph', label: 'Graph', icon: GitBranch },
  { id: 'run', label: 'Run', icon: Play },
  { id: 'inspect', label: 'Inspect', icon: SlidersHorizontal },
];

export const MobileLab: React.FC<MobileLabProps> = ({ state, gate, lensDef, selectedNode, actions }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [segment, setSegment] = React.useState<Segment>('graph');

  /* Context-aware nudge: when a gate opens, guide the visitor to Run. */
  React.useEffect(() => {
    if (gate) setSegment('run');
  }, [gate]);

  return (
    <div className="space-y-3">
      {/* Segmented control */}
      <div
        className={`flex items-center gap-1 p-1 rounded-xl border ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}
        role="tablist"
        aria-label="Lab views"
      >
        {SEGMENTS.map((s) => {
          const Icon = s.icon;
          const active = segment === s.id;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              onClick={() => setSegment(s.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                active ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="lab-mobile-segment"
                  className={`absolute inset-0 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {s.label}
                {s.id === 'run' && gate && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-label="decision pending" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* GRAPH segment */}
        {segment === 'graph' && (
          <motion.div
            key="graph"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            <LensSwitcher lenses={systemLenses} active={state.activeLens} onChange={actions.setLens} />
            <div className={`relative rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`} style={isDark ? { boxShadow: '0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent), 0 0 40px color-mix(in srgb, var(--accent) 10%, transparent)' } : undefined}>
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
            {state.system && <AddOnStrip system={state.system} applied={state.appliedAddOns} onApply={actions.applyAddOn} />}
            <EventTicker events={state.events} expanded={false} onToggle={() => setSegment('run')} />
          </motion.div>
        )}

        {/* RUN segment */}
        {segment === 'run' && (
          <motion.div
            key="run"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
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
            <EventTicker events={state.events} expanded onToggle={() => {}} />
          </motion.div>
        )}

        {/* INSPECT segment */}
        {segment === 'inspect' && (
          <motion.div
            key="inspect"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            <NodeInspector
              node={selectedNode}
              onClose={() => actions.selectNode(null)}
              onRemove={actions.removeNode}
            />
            {state.system && state.system.decisions.length > 0 && (
              <button
                onClick={actions.openDecisions}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  isDark ? 'border-slate-700 text-slate-200 hover:border-slate-500' : 'border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                Open decision mode — real tradeoffs
              </button>
            )}
            {state.system && <EvidencePanel system={state.system} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New idea always reachable */}
      <button
        onClick={actions.reset}
        className={`w-full px-3 py-2 rounded-xl text-xs font-mono border transition ${
          isDark ? 'border-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:text-slate-800'
        }`}
      >
        ↺ Start with a new idea
      </button>
    </div>
  );
};
