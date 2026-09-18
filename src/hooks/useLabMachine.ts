/**
 * Builder Lab — State Machine
 *
 * One reducer owns the entire lab lifecycle:
 *   IDLE → UNDERSTANDING → FORMING → READY → SIMULATING → INTERRUPTED → RESULT
 *
 * Manipulation (remove / add / decide / inspect) happens against the derived
 * graph and can occur in any phase after FORMING. Timers are owned by the
 * hook (not the reducer) so reducers stay pure and testable.
 */

import { useEffect, useMemo, useReducer, useRef } from 'react';
import { applyAddOnToGraph, computeRemoveEffect, getAddOn, layoutSystem, reachableFromIntake, type CanvasVariant } from '../data/build-engine/engine';
import { systemLenses } from '../data/build-engine/scenarios';
import { interpretWithFallback } from '../services/interpretClient';
import type {
  DecisionScenario,
  GeneratedSystem,
  LabEvent,
  LabPhase,
  LensId,
  PositionedNode,
  SimulationState,
  SimulationStep,
  SimulationTraceEntry,
} from '../data/build-engine/types';

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export interface LabState {
  phase: LabPhase;
  idea: string;
  system: GeneratedSystem | null;
  /** Classification rationale shown during/after UNDERSTANDING. */
  rationale: string;
  matchedSignals: string[];

  /** Derived graph pieces. */
  presentIds: Set<string>;
  removedIds: Set<string>;
  starvedIds: Set<string>;
  nodes: PositionedNode[];
  edges: GeneratedSystem['edges'];
  activeEdgeIds: Set<string>;

  /** FORMING progress: how many of buildOrder have materialized. */
  formedCount: number;

  /** Simulation. */
  simState: SimulationState;
  simIndex: number;
  trace: SimulationTraceEntry[];

  /** Lenses. */
  activeLens: LensId;

  /** Real system events — the observable timeline. */
  events: LabEvent[];

  /** Canvas layout variant — owned here so panels and canvas agree. */
  layoutVariant: CanvasVariant;

  /** How the last idea was interpreted — 'A' deterministic, 'B' AI-assisted. */
  interpretationMode: 'A' | 'B';

  /** Decision mode. */
  decisionIndex: number | null;
  decisionChoices: Record<string, string>;
  decisionHighlights: Set<string>;

  /** Manipulation log + applied add-ons. */
  manipulationLog: string[];
  appliedAddOns: Set<string>;

  /** Inspector. */
  selectedNodeId: string | null;
}

export type LabAction =
  | {
      type: 'SUBMIT_IDEA';
      idea: string;
      system: GeneratedSystem;
      rationale: string;
      matchedSignals: string[];
      mode: 'A' | 'B';
    }
  | { type: 'BEGIN_FORMING' }
  | { type: 'FORM_TICK' }
  | { type: 'FORM_DONE' }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'SET_LAYOUT_VARIANT'; variant: CanvasVariant }
  | { type: 'SET_LENS'; lens: import('../data/build-engine/types').LensId }
  | { type: 'SIM_START' }
  | { type: 'SIM_STEP' }
  | { type: 'SIM_PAUSE' }
  | { type: 'SIM_RESUME' }
  | { type: 'SIM_RESET' }
  | { type: 'SIM_GATE_APPROVE' }
  | { type: 'SIM_GATE_REJECT' }
  | { type: 'SIM_RECOVER'; optionId: string }
  | { type: 'REMOVE_NODE'; nodeId: string }
  | { type: 'APPLY_ADDON'; addOnId: string }
  | { type: 'OPEN_DECISIONS' }
  | { type: 'CHOOSE_DECISION'; decisionId: string; optionId: string }
  | { type: 'NEXT_DECISION' }
  | { type: 'CLOSE_DECISIONS' }
  | { type: 'RESET' };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let eventSeq = 0;
const labEvent = (phase: LabPhase, text: string, kind: LabEvent['kind'] = 'system'): LabEvent => ({
  id: `evt-${++eventSeq}`,
  phase,
  text,
  kind,
});

function deriveGraph(state: LabState): Pick<LabState, 'nodes' | 'edges'> {
  const { system, presentIds, removedIds } = state;
  if (!system) return { nodes: [], edges: [] };

  const nodes = layoutSystem(system, presentIds, state.layoutVariant).map((n) => ({
    ...n,
    appeared: state.formedCount > system.buildOrder.indexOf(n.id),
    starved: state.starvedIds.has(n.id),
  }));

  const edges = system.edges.map((e) => ({
    ...e,
    visible: presentIds.has(e.from) && presentIds.has(e.to) && !removedIds.has(e.from) && !removedIds.has(e.to),
  }));

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* Reducer                                                             */
/* ------------------------------------------------------------------ */

export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case 'SUBMIT_IDEA': {
      const idea = action.idea.trim();
      if (!idea || action.system == null) return state;
      const system = action.system;
      const presentIds = new Set([system.buildOrder[0]]);
      return {
        ...state,
        phase: 'understanding',
        idea,
        system,
        rationale: action.rationale,
        matchedSignals: action.matchedSignals,
        interpretationMode: action.mode,
        presentIds,
        removedIds: new Set(),
        starvedIds: new Set(),
        formedCount: 0,
        simState: 'idle',
        simIndex: -1,
        trace: [],
        activeLens: 'product',
        decisionIndex: null,
        decisionChoices: {},
        decisionHighlights: new Set(),
        manipulationLog: [],
        appliedAddOns: new Set(),
        selectedNodeId: null,
        events: [labEvent('understanding', `Idea received: "${idea}"`, 'input')],
      };
    }

    case 'BEGIN_FORMING':
      return {
        ...state,
        phase: 'forming',
        events: [...(state.events ?? []), labEvent('forming', `Resolved: ${state.system?.title ?? 'system'} — structure forming`)],
      };

    case 'FORM_TICK': {
      const system = state.system;
      if (!system) return state;
      const nextCount = Math.min(state.formedCount + 1, system.buildOrder.length);
      const nodeId = system.buildOrder[nextCount - 1];
      const node = system.nodes.find((n) => n.id === nodeId);
      const presentIds = new Set(state.presentIds);
      if (nodeId) presentIds.add(nodeId);

      const nextState: LabState = {
        ...state,
        formedCount: nextCount,
        presentIds,
        events: [...(state.events ?? []), labEvent('forming', `${node?.label ?? nodeId} materialized`)],
      };
      return { ...nextState, ...deriveGraph(nextState) };
    }

    case 'FORM_DONE':
      return { ...state, phase: 'ready', events: [...(state.events ?? []), labEvent('ready', 'System ready — inspect, manipulate, or run it')] };

    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.nodeId };

    case 'SET_LAYOUT_VARIANT': {
      if (state.layoutVariant === action.variant) return state;
      const next: LabState = { ...state, layoutVariant: action.variant };
      return { ...next, ...deriveGraph(next) };
    }

    case 'SET_LENS':
      return { ...state, activeLens: action.lens };

    case 'SIM_START': {
      if (!state.system) return state;
      const first = state.system.simulation.steps[0];
      const nextState: LabState = {
        ...state,
        phase: 'simulating',
        simState: 'running',
        simIndex: 0,
        trace: [{ index: 0, step: first }],
        events: [...(state.events ?? []), labEvent('simulating', first.label)],
      };
      return { ...nextState, ...applySimEdges(nextState, first) };
    }

    case 'SIM_STEP': {
      if (state.simState !== 'running' || !state.system) return state;
      const nextIndex = state.simIndex + 1;
      const steps = state.system.simulation.steps;
      if (nextIndex >= steps.length) {
        return { ...state, simState: 'done', phase: 'result', events: [...(state.events ?? []), labEvent('result', 'Simulation complete — trace preserved above')] };
      }
      const step = steps[nextIndex];
      const nextState: LabState = {
        ...state,
        simIndex: nextIndex,
        trace: [...state.trace, { index: nextIndex, step }],
        simState: step.gate ? 'gate' : 'running',
        phase: step.gate ? 'interrupted' : 'simulating',
        events: [...(state.events ?? []), labEvent('simulating', step.label, step.kind === 'error' ? 'warn' : 'system')],
      };
      return { ...nextState, ...applySimEdges(nextState, step) };
    }

    case 'SIM_PAUSE':
      return state.simState === 'running' ? { ...state, simState: 'paused' } : state;

    case 'SIM_RESUME':
      return state.simState === 'paused' ? { ...state, simState: 'running' } : state;

    case 'SIM_RESET':
      return { ...state, simState: 'idle', simIndex: -1, trace: [], phase: 'ready', activeEdgeIds: new Set() };

    case 'SIM_GATE_APPROVE': {
      const step = state.system?.simulation.steps[state.simIndex];
      if (!step?.gate) return state;
      const nextIndex = state.simIndex + 1;
      const steps = state.system!.simulation.steps;
      if (nextIndex >= steps.length) return { ...state, simState: 'done', phase: 'result' };
      const nextStep = steps[nextIndex];
      const nextState: LabState = {
        ...state,
        simIndex: nextIndex,
        trace: [...state.trace, { index: nextIndex, step: nextStep, outcomeNote: 'Approved by visitor' }],
        simState: nextStep.gate ? 'gate' : 'running',
        phase: nextStep.gate ? 'interrupted' : 'simulating',
        events: [...(state.events ?? []), labEvent('simulating', nextStep.label)],
      };
      return { ...nextState, ...applySimEdges(nextState, nextStep) };
    }

    case 'SIM_GATE_REJECT': {
      const step = state.system?.simulation.steps[state.simIndex];
      if (!step?.gate) return state;
      const jumpTo = step.rejectJumpTo ?? state.system!.simulation.steps.length;
      const steps = state.system!.simulation.steps;
      if (jumpTo >= steps.length) {
        return { ...state, simState: 'done', phase: 'result', events: [...(state.events ?? []), labEvent('result', 'Action rejected — simulation ended without the proposed write', 'warn')] };
      }
      const nextStep = steps[jumpTo];
      const nextState: LabState = {
        ...state,
        simIndex: jumpTo,
        trace: [...state.trace, { index: jumpTo, step: nextStep, outcomeNote: 'Proposed action rejected — workflow re-routed' }],
        simState: nextStep.gate ? 'gate' : 'running',
        phase: nextStep.gate ? 'interrupted' : 'simulating',
        events: [...(state.events ?? []), labEvent('simulating', 'Proposed action rejected — pipeline continues without the write', 'warn')],
      };
      return { ...nextState, ...applySimEdges(nextState, nextStep) };
    }

    case 'SIM_RECOVER': {
      const step = state.system?.simulation.steps[state.simIndex];
      const option = step?.recoveryOptions?.find((o) => o.id === action.optionId);
      if (!step?.gate || !option) return state;
      const jumpTo = option.jumpTo ?? state.simIndex + 1;
      const steps = state.system!.simulation.steps;
      if (jumpTo >= steps.length) return { ...state, simState: 'done', phase: 'result' };
      const nextStep = steps[jumpTo];
      const nextState: LabState = {
        ...state,
        simIndex: jumpTo,
        trace: [...state.trace, { index: jumpTo, step: nextStep, outcomeNote: option.outcome }],
        simState: nextStep.gate ? 'gate' : 'running',
        phase: nextStep.gate ? 'interrupted' : 'simulating',
        events: [...(state.events ?? []), labEvent('simulating', option.outcome)],
      };
      return { ...nextState, ...applySimEdges(nextState, nextStep) };
    }

    case 'REMOVE_NODE': {
      if (!state.system) return state;
      const effect = computeRemoveEffect(state.system, state.removedIds, action.nodeId);
      if (!effect) return state;
      const removedIds = new Set(state.removedIds);
      effect.removedNodes.forEach((id) => removedIds.add(id));

      const presentIds = new Set(
        [...state.presentIds].filter((id) => !removedIds.has(id)),
      );
      const edges = state.system.edges
        .filter((e) => !removedIds.has(e.from) && !removedIds.has(e.to))
        .map((e) => ({ ...e, visible: presentIds.has(e.from) && presentIds.has(e.to) }));

      const presentForStarvation = new Set(presentIds);
      const stillReachable = reachableFromIntake(state.system, state.system.edges, presentForStarvation);
      const starvedIds = new Set([...presentIds].filter((id) => !stillReachable.has(id) && id !== state.system!.intakeId));

      const nextState: LabState = {
        ...state,
        removedIds,
        presentIds,
        edges,
        starvedIds,
        selectedNodeId: state.selectedNodeId && removedIds.has(state.selectedNodeId) ? null : state.selectedNodeId,
        events: [...(state.events ?? []), labEvent('ready', effect.message, 'warn')],
        manipulationLog: [...state.manipulationLog, effect.message],
      };
      return { ...nextState, nodes: layoutSystem(state.system, presentIds, state.layoutVariant).map((n) => ({ ...n, appeared: true, starved: starvedIds.has(n.id) })) };
    }

    case 'APPLY_ADDON': {
      if (!state.system) return state;
      const addOn = getAddOn(state.system, action.addOnId);
      if (!addOn || state.appliedAddOns.has(addOn.id)) return state;

      const systemCopy: GeneratedSystem = {
        ...state.system,
        nodes: [...state.system.nodes],
        edges: state.edges.map((e) => ({ id: e.id, from: e.from, to: e.to, flow: e.flow, label: e.label })),
      };
      const merged = applyAddOnToGraph(state.system, systemCopy.nodes, systemCopy.edges, addOn);
      const mergedSystem: GeneratedSystem = { ...state.system, nodes: merged.nodes, edges: merged.edges as GeneratedSystem['edges'] };

      const presentIds = new Set([...state.presentIds, addOn.node.id]);
      const removedIds = new Set(state.removedIds);

      const stillReachable = reachableFromIntake(mergedSystem, mergedSystem.edges, presentIds);
      const starvedIds = new Set([...presentIds].filter((id) => !stillReachable.has(id) && id !== mergedSystem.intakeId));

      const nextState: LabState = {
        ...state,
        system: mergedSystem,
        appliedAddOns: new Set(state.appliedAddOns).add(addOn.id),
        presentIds,
        removedIds,
        starvedIds,
        events: [...(state.events ?? []), labEvent('ready', addOn.message)],
        manipulationLog: [...state.manipulationLog, addOn.message],
      };
      const laid = layoutSystem(mergedSystem, presentIds, state.layoutVariant).map((n) => ({
        ...n,
        appeared: state.formedCount > mergedSystem.buildOrder.indexOf(n.id) || n.id === addOn.node.id,
        starved: starvedIds.has(n.id),
      }));
      return { ...nextState, nodes: laid };
    }

    case 'OPEN_DECISIONS':
      return { ...state, decisionIndex: state.decisionIndex ?? 0 };

    case 'CHOOSE_DECISION': {
      if (!state.system) return state;
      const decision: DecisionScenario | undefined = state.system.decisions[state.decisionIndex ?? 0];
      const option = decision?.options.find((o) => o.id === action.optionId);
      if (!decision || !option) return state;

      let nextState: LabState = {
        ...state,
        decisionChoices: { ...state.decisionChoices, [decision.id]: option.id },
        decisionHighlights: new Set(option.highlights),
        events: [...(state.events ?? []), labEvent('ready', `Decision — ${decision.question} → ${option.label}`)],
      };

      if (option.effect?.applyAddOn) {
        nextState = labReducer(nextState, { type: 'APPLY_ADDON', addOnId: option.effect.applyAddOn });
      }
      if (option.effect?.addNode) {
        const newNode = option.effect.addNode;
        const newEdges = option.effect.addEdges ?? [];
        const mergedSystem: GeneratedSystem = {
          ...state.system,
          nodes: state.system!.nodes.some((n) => n.id === newNode.id)
            ? state.system!.nodes
            : [...state.system!.nodes, newNode],
          edges: [...state.system!.edges, ...newEdges],
        };
        const presentIds = new Set([...state.presentIds, newNode.id]);
        const stillReachable = reachableFromIntake(mergedSystem, mergedSystem.edges, presentIds);
        const starvedIds = new Set([...presentIds].filter((id) => !stillReachable.has(id) && id !== mergedSystem.intakeId));
        nextState = {
          ...nextState,
          system: mergedSystem,
          presentIds,
          starvedIds,
          nodes: layoutSystem(mergedSystem, presentIds, state.layoutVariant).map((n) => ({
            ...n,
            appeared: true,
            starved: starvedIds.has(n.id),
          })),
          events: [...(nextState.events ?? []), labEvent('ready', `${newNode.label} joined the system — decision consequence applied`)],
          manipulationLog: [...nextState.manipulationLog, `${newNode.label} added via decision consequence`],
        };
      }
      return nextState;
    }

    case 'NEXT_DECISION': {
      if (!state.system) return state;
      const next = (state.decisionIndex ?? 0) + 1;
      if (next >= state.system.decisions.length) return { ...state, decisionIndex: null, decisionHighlights: new Set() };
      return { ...state, decisionIndex: next, decisionHighlights: new Set() };
    }

    case 'CLOSE_DECISIONS':
      return { ...state, decisionIndex: null, decisionHighlights: new Set() };

    case 'RESET':
      return initialLabState;

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Sim edge highlighting                                               */
/* ------------------------------------------------------------------ */

function applySimEdges(state: LabState, step: SimulationStep): Pick<LabState, 'activeEdgeIds'> {
  if (!state.system) return { activeEdgeIds: new Set() };
  const active = new Set<string>();
  for (const e of state.system.edges) {
    if (e.from === step.nodeId || e.to === step.nodeId) active.add(e.id);
    if (step.kind === 'tool-call' && e.from === step.nodeId) active.add(e.id);
  }
  return { activeEdgeIds: active };
}

/* ------------------------------------------------------------------ */
/* Hook — owns timers                                                  */
/* ------------------------------------------------------------------ */

export const initialLabState: LabState = {
  phase: 'idle',
  idea: '',
  system: null,
  rationale: '',
  matchedSignals: [],
  presentIds: new Set(),
  removedIds: new Set(),
  starvedIds: new Set(),
  nodes: [],
  edges: [],
  activeEdgeIds: new Set(),
  formedCount: 0,
  simState: 'idle',
  simIndex: -1,
  trace: [],
  activeLens: 'product',
  decisionIndex: null,
  decisionChoices: {},
  decisionHighlights: new Set(),
  manipulationLog: [],
  appliedAddOns: new Set(),
  selectedNodeId: null,
  events: [],
  layoutVariant: 'landscape',
  interpretationMode: 'A',
};

const FORM_TICK_MS = 420;
const SIM_STEP_MS = 1500;

export function useLabMachine() {
  const [state, dispatch] = useReducer(labReducer, initialLabState);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // UNDERSTANDING → FORMING: a short beat while the idea is "read".
  useEffect(() => {
    if (state.phase !== 'understanding') return;
    const t = window.setTimeout(() => dispatch({ type: 'BEGIN_FORMING' }), 1400);
    timers.current.push(t);
    return () => window.clearTimeout(t);
  }, [state.phase]);

  // FORMING ticker.
  useEffect(() => {
    if (state.phase !== 'forming') return;
    const system = state.system;
    if (!system) return;
    if (state.formedCount >= system.buildOrder.length) {
      const t = window.setTimeout(() => dispatch({ type: 'FORM_DONE' }), 300);
      timers.current.push(t);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => dispatch({ type: 'FORM_TICK' }), FORM_TICK_MS);
    timers.current.push(t);
    return () => window.clearTimeout(t);
  }, [state.phase, state.formedCount, state.system]);

  // SIMULATION stepper.
  useEffect(() => {
    if (state.simState !== 'running' || state.phase !== 'simulating') return;
    const t = window.setTimeout(() => dispatch({ type: 'SIM_STEP' }), SIM_STEP_MS);
    timers.current.push(t);
    return () => window.clearTimeout(t);
  }, [state.simState, state.phase, state.simIndex]);

  // Cleanup on unmount.
  useEffect(() => clearTimers, []);

  const actions = useMemo(
    () => ({
      submitIdea: (idea: string) => {
        void interpretWithFallback(idea).then((result) => {
          dispatch({
            type: 'SUBMIT_IDEA',
            idea,
            system: result.system,
            rationale: result.rationale,
            matchedSignals: result.matchedSignals,
            mode: result.mode,
          });
        });
      },
      selectNode: (nodeId: string | null) => dispatch({ type: 'SELECT_NODE', nodeId }),
      setLayoutVariant: (variant: CanvasVariant) => dispatch({ type: 'SET_LAYOUT_VARIANT', variant }),
      setLens: (lens: LensId) => dispatch({ type: 'SET_LENS', lens }),
      startSim: () => dispatch({ type: 'SIM_START' }),
      pauseSim: () => dispatch({ type: 'SIM_PAUSE' }),
      resumeSim: () => dispatch({ type: 'SIM_RESUME' }),
      resetSim: () => dispatch({ type: 'SIM_RESET' }),
      approveGate: () => dispatch({ type: 'SIM_GATE_APPROVE' }),
      rejectGate: () => dispatch({ type: 'SIM_GATE_REJECT' }),
      recover: (optionId: string) => dispatch({ type: 'SIM_RECOVER', optionId }),
      removeNode: (nodeId: string) => dispatch({ type: 'REMOVE_NODE', nodeId }),
      applyAddOn: (addOnId: string) => dispatch({ type: 'APPLY_ADDON', addOnId }),
      openDecisions: () => dispatch({ type: 'OPEN_DECISIONS' }),
      chooseDecision: (decisionId: string, optionId: string) => dispatch({ type: 'CHOOSE_DECISION', decisionId, optionId }),
      nextDecision: () => dispatch({ type: 'NEXT_DECISION' }),
      closeDecisions: () => dispatch({ type: 'CLOSE_DECISIONS' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [],
  );

  return { state, actions, lenses: systemLenses };
}

export type LabActionsType = ReturnType<typeof useLabMachine>['actions'];

/* ------------------------------------------------------------------ */
/* Convenience selectors                                               */
/* ------------------------------------------------------------------ */

export function selectCurrentGate(state: LabState): SimulationStep | null {
  if (state.simState !== 'gate') return null;
  return state.system?.simulation.steps[state.simIndex] ?? null;
}

export function selectCurrentDecision(state: LabState): DecisionScenario | null {
  if (state.decisionIndex === null || !state.system) return null;
  return state.system.decisions[state.decisionIndex] ?? null;
}
