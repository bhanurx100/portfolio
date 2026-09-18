/**
 * Builder Lab — Typed System Model
 *
 * The entire experience is data-driven: adding a new scenario means adding
 * data to `scenarios.ts`, not rewriting UI. These types are the contract
 * between the deterministic engine, the visual canvas and the UI panels.
 */

import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Core graph model                                                    */
/* ------------------------------------------------------------------ */

export type SystemNodeKind =
  | 'actor'        // humans / organizations in the loop
  | 'interface'    // product surfaces
  | 'automation'   // AI / rules / agents
  | 'data'         // persistence & models
  | 'integration'; // external systems

export type NodeStatus = 'pending' | 'forming' | 'active' | 'failing' | 'removed' | 'halted';

export interface SystemNode {
  id: string;
  /** Human-readable label rendered on the canvas. */
  label: string;
  kind: SystemNodeKind;
  /** One-line purpose shown when the node is inspected. */
  role: string;
  /** Optional short detail revealed via progressive disclosure. */
  detail?: string;
  /** Data-driven accent for node styling. */
  tone: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';
  /** Semantic layer this node belongs to (used by lenses). */
  layer: LensId;
  /** Anchors are the structural spine of the layout; satellites orbit their anchor. */
  anchor: boolean;
  /** Anchor this satellite is drawn from (satellites only). */
  parent?: string;
  /** Nodes that cannot be removed without breaking the system (e.g. the problem actor). */
  locked?: boolean;
}

export interface SystemEdge {
  id: string;
  from: string;
  to: string;
  /** What actually flows across this edge. */
  flow: 'signal' | 'data' | 'action' | 'approval' | 'escalation';
  label?: string;
}

/* ------------------------------------------------------------------ */
/* Generated system                                                    */
/* ------------------------------------------------------------------ */

export interface GeneratedSystem {
  id: string;
  scenarioId: string;
  title: string;
  /** Restatement of the visitor's idea as a crisp problem statement. */
  problem: string;
  actors: string[];
  /** Node where work enters the system — the reachability root for starvation analysis. */
  intakeId: string;
  /** Manipulable components the visitor can bolt onto the system. */
  addOns: AddOnDefinition[];
  /** Order in which nodes materialize during SYSTEM_FORMING. */
  buildOrder: string[];
  nodes: SystemNode[];
  edges: SystemEdge[];
  /** Executable, deterministic event script for the runtime simulation. */
  simulation: SimulationScript;
  /** Product decisions surfaced in DECISION MODE for this system. */
  decisions: DecisionScenario[];
  /** Real portfolio work that demonstrates this class of system. */
  projectEvidence: ProjectEvidence[];
}

/* ------------------------------------------------------------------ */
/* Lenses — one system, several perspectives                           */
/* ------------------------------------------------------------------ */

export type LensId = 'product' | 'engineering' | 'ai' | 'data' | 'business';

export interface SystemLens {
  id: LensId;
  label: string;
  /** Question this lens answers. */
  question: string;
  /** Description of what the lens reveals. */
  description: string;
}

/* ------------------------------------------------------------------ */
/* Simulation — a deterministic, inspectable runtime                   */
/* ------------------------------------------------------------------ */

export type SimulationStepKind =
  | 'trigger'
  | 'agent-state'
  | 'tool-call'
  | 'tool-result'
  | 'state-change'
  | 'action'
  | 'error'
  | 'recovery'
  | 'human-gate'
  | 'complete';

export interface SimulationStep {
  kind: SimulationStepKind;
  /** Node executing this step. */
  nodeId: string;
  /** Meaningful system event — never fake terminal noise. */
  label: string;
  /** e.g. `CRM.searchLead` — shown for tool calls. */
  invocation?: string;
  /** Payload/result summary of the step. */
  payload?: string;
  /** Step pauses here and requires a visitor decision. */
  gate?: 'interrupt' | 'failure';
  /** If the visitor rejects at a gate, jump to this step index. */
  rejectJumpTo?: number;
  /** Message shown while the step is paused at a gate. */
  gatePrompt?: string;
  /** Recovery options offered at a failure gate. */
  recoveryOptions?: SimulationRecoveryOption[];
}

export interface SimulationRecoveryOption {
  id: string;
  label: string;
  /** Outcome text shown after choosing this option. */
  outcome: string;
  /** Optional follow-up step index to jump to after recovery. */
  jumpTo?: number;
}

export type SimulationRecoveryId = string;

export interface SimulationScript {
  steps: SimulationStep[];
}

export type SimulationState = 'idle' | 'running' | 'paused' | 'gate' | 'done';

export interface SimulationTraceEntry {
  index: number;
  step: SimulationStep;
  outcomeNote?: string;
}

/* ------------------------------------------------------------------ */
/* Decision mode — tradeoffs, never scores                             */
/* ------------------------------------------------------------------ */

export interface DecisionOption {
  id: string;
  label: string;
  /** The advantage of this option in this system's context. */
  advantage: string;
  /** The honest tradeoff. */
  tradeoff: string;
  /** What visibly changes in the system when this is chosen. */
  consequence: string;
  /** Node ids highlighted on the canvas while this option is active. */
  highlights: string[];
  /** Optional structural consequence applied to the graph. */
  effect?: DecisionEffect;
}

export interface DecisionScenario {
  id: string;
  /** Question frame, e.g. "Where does the agent's knowledge live?" */
  question: string;
  dimension: string;
  options: DecisionOption[];
}

/* ------------------------------------------------------------------ */
/* Deterministic scenario library                                      */
/* ------------------------------------------------------------------ */

export interface ScenarioMeta {
  id: string;
  /** Short trigger shown as a suggestion chip. */
  chip: string;
  /** Full example idea the visitor can type. */
  example: string;
  title: string;
  domain: string;
}

/** Classifier output — the bridge between arbitrary input and scenarios. */
export interface ClassificationResult {
  scenarioId: string;
  /** Human-readable interpretation shown in the UI. */
  rationale: string;
  matchedSignals: string[];
}

/* ------------------------------------------------------------------ */
/* Project evidence                                                    */
/* ------------------------------------------------------------------ */

export interface ProjectEvidence {
  projectId: 'splitfin' | 'stayease';
  name: string;
  /** What specifically transfers from the generated system to the real one. */
  relevance: string;
  tag: 'BUILT' | 'PROTOTYPE' | 'SIMULATION';
  url?: string;
}

/* ------------------------------------------------------------------ */
/* Lab state machine                                                   */
/* ------------------------------------------------------------------ */

export type LabPhase =
  | 'idle'
  | 'understanding'
  | 'forming'
  | 'ready'
  | 'simulating'
  | 'interrupted'
  | 'result';

export interface LabEvent {
  id: string;
  phase: LabPhase;
  /** Real system event text — observable behavior only. */
  text: string;
  kind: 'system' | 'input' | 'warn';
}

/* ------------------------------------------------------------------ */
/* Derived graph — what the canvas renders                             */
/* ------------------------------------------------------------------ */

export interface PositionedNode extends SystemNode {
  x: number;
  y: number;
  /** False while the node has not yet materialized during SYSTEM_FORMING. */
  appeared: boolean;
  /** Cut off from intake by a removal — visible but inert. */
  starved: boolean;
}

export interface DerivedEdge extends SystemEdge {
  /** Both endpoints are present in the current graph. */
  visible: boolean;
  /** True while simulation traffic flows across this edge. */
  active: boolean;
}

/* ------------------------------------------------------------------ */
/* Manipulation — add-ons, removal effects, decision consequences      */
/* ------------------------------------------------------------------ */

/**
 * A component the visitor can add to the running system. Fully data-driven:
 * the engine rewires the graph from this definition without special-casing.
 */
export interface AddOnDefinition {
  id: string;
  label: string;
  /** Short chip label in the manipulation strip. */
  chip: string;
  description: string;
  message: string;
  node: SystemNode;
  edges: SystemEdge[];
  /** Existing edges removed when this add-on is applied (rewiring). */
  rewireRemoveEdgeIds?: string[];
  /** Replacement edges added when this add-on is applied. */
  rewireAddEdges?: SystemEdge[];
}

export type AddEffect = {
  message: string;
  node: SystemNode;
  edges: SystemEdge[];
};

export type RemoveEffect = {
  message: string;
  /** Nodes removed as a consequence (cascade). */
  removedNodes: string[];
  removedEdges: string[];
  /** Nodes cut off from intake — still present, but starved of input. */
  starvedNodeIds?: string[];
};

/** What visibly happens to the system when a decision option is chosen. */
export interface DecisionEffect {
  /** Apply one of the scenario's add-ons as a consequence of this choice. */
  applyAddOn?: string;
  /** Remove one of the scenario's add-ons as a consequence of this choice. */
  removeAddOn?: string;
  /** Add a standalone node (composed systems use this for "AI decides"). */
  addNode?: SystemNode;
  /** Edges to attach when addNode is used (from/to existing node ids). */
  addEdges?: SystemEdge[];
}
