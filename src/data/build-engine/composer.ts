/**
 * Builder Lab — Input-Responsive System Composer
 *
 * Mode A of the two-mode architecture. Instead of returning one of three
 * canned answers, this composes a bespoke GeneratedSystem from the signals
 * actually present in the visitor's idea: their entity, their channels,
 * their pains, their modifiers. Two visitors typing different problems get
 * visibly different systems.
 *
 * Curated scenarios still win on an exact strong match (they carry richer
 * hand-tuned simulations); everything else is composed here.
 */

import type {
  AddOnDefinition,
  DecisionScenario,
  DerivedEdge,
  GeneratedSystem,
  SimulationStep,
  SystemEdge,
  SystemNode,
} from './types';
import type { SignalBundle } from './signals';
import { extractSignals } from './signals';
import { classifyIdea, getSystem } from './scenarios';

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

const VERB_TITLES: Record<SignalBundle['primaryVerb'], string> = {
  manage: 'Management',
  process: 'Processing',
  track: 'Tracking',
  qualify: 'Qualification',
  book: 'Booking',
  settle: 'Settlement',
  support: 'Support',
};

const CHANNEL_FLOW_WORD: Record<string, string> = {
  voice: 'call',
  whatsapp: 'message',
  chat: 'message',
  email: 'attachment',
  form: 'submission',
  sms: 'text',
  app: 'entry',
};

const DOMAIN_HUMAN: Record<SignalBundle['domain'], string> = {
  support: 'Support Rep',
  finance: 'Finance Ops',
  operations: 'Ops Staff',
  logistics: 'Field Staff',
  knowledge: 'Reviewer',
};

const EVIDENCE_BY_DOMAIN: GeneratedSystem['projectEvidence'] = [
  {
    projectId: 'splitfin',
    name: 'SplitFin',
    relevance: 'Idempotent offline-first sync queue with UUID idempotency keys — the same reliability pattern this system needs for safe writes.',
    tag: 'BUILT',
    url: 'https://github.com/bhanurx100/splitfin-expense-platform',
  },
  {
    projectId: 'stayease',
    name: 'StayEase',
    relevance: 'Real-time availability via Supabase WebSockets and PostGIS spatial queries — the same event-driven backbone for live intake.',
    tag: 'BUILT',
    url: 'https://github.com/bhanurx100/stayease-hotel-booking-platform',
  },
];

/* ------------------------------------------------------------------ */
/* Composer                                                            */
/* ------------------------------------------------------------------ */

export function composeSystem(idea: string, s: SignalBundle): GeneratedSystem {
  const e = s.entity;
  const channels = s.channels.length > 0 ? s.channels : [{ id: 'intake', label: 'Intake Surface' }];
  const firstChannel = channels[0];
  const useAgent = s.modifiers.aiAgent;
  const human = DOMAIN_HUMAN[s.domain];

  /* ---------- Nodes ---------- */
  const nodes: SystemNode[] = [
    {
      id: 'problem', label: 'Problem', kind: 'actor',
      role: s.pains.length > 0
        ? `Today: ${s.pains.join(' · ')}.`
        : 'Handled ad hoc — no single source of truth, nothing measurable.',
      detail: 'This node is the floor of the system: remove everything else and the problem remains.',
      tone: 'rose', layer: 'product', anchor: true, locked: true,
    },
    ...channels.map<SystemNode>((c, i) => ({
      id: `in-${c.id}`,
      label: c.label,
      kind: 'interface',
      role: `Entry surface — ${e.pluralLabel.toLowerCase()} arrive here first`,
      tone: 'blue',
      layer: 'product',
      anchor: i === 0,
      parent: i === 0 ? undefined : `in-${firstChannel.id}`,
    })),
    {
      id: 'bus', label: `${e.pluralLabel} Intake`, kind: 'data',
      role: `Normalizes every channel into one ${e.label.toLowerCase()} record`,
      detail: 'One validated record shape, whatever the entry surface — this is what makes the rest of the system channel-agnostic.',
      tone: 'blue', layer: 'data', anchor: true,
    },
  ];

  if (useAgent) {
    nodes.push(
      {
        id: 'agent', label: 'Agent Layer', kind: 'automation',
        role: 'Selects actions and calls tools — behavior is observable, reasoning is not',
        detail: 'Only the observable trace is exposed: input → selected action → tool → result → state change.',
        tone: 'violet', layer: 'ai', anchor: true,
      },
      {
        id: 'tools', label: 'Tool Surface', kind: 'automation',
        role: `Validated functions the agent may call — nothing acts on ${e.pluralLabel.toLowerCase()} directly`,
        tone: 'violet', layer: 'ai', anchor: true,
      },
    );
  }

  nodes.push(
    {
      id: 'logic', label: `${VERB_TITLES[s.primaryVerb]} Engine`, kind: 'automation',
      role: `Deterministic ${s.primaryVerb} logic — boring on purpose`,
      detail: 'The rules that must be auditable stay in code, not in a model.',
      tone: 'emerald', layer: 'engineering', anchor: true,
    },
    {
      id: 'store', label: `${e.label} Store`, kind: 'data',
      role: `System of record for ${e.pluralLabel.toLowerCase()} — normalized, queryable, auditable`,
      tone: 'amber', layer: 'data', anchor: true,
    },
    {
      id: 'human', label: human, kind: 'actor',
      role: 'Handles exceptions the system is not confident about',
      detail: 'People stay in the loop for judgment calls — the system routes work to them, it does not hide it.',
      tone: 'slate', layer: 'product', anchor: true,
    },
    {
      id: 'insights', label: 'Outcome Analytics', kind: 'data',
      role: 'Measures throughput, exceptions and follow-through',
      tone: 'blue', layer: 'data', anchor: true,
    },
  );

  if (s.modifiers.humanGate) {
    nodes.push({
      id: 'approval', label: 'Human Approval', kind: 'actor',
      role: 'Confirms proposed writes before they persist',
      detail: 'Present because the idea mentioned approval — the workflow routes every write through it.',
      tone: 'slate', layer: 'product', anchor: true,
    });
  }
  if (s.modifiers.payments) {
    nodes.push({
      id: 'payments', label: 'Payment Rail', kind: 'integration',
      role: 'Collects money at the moment the workflow demands it',
      tone: 'emerald', layer: 'product', anchor: true,
    });
  }
  if (s.modifiers.offline) {
    nodes.push({
      id: 'sync', label: 'Offline Sync', kind: 'integration',
      role: 'Queues writes locally, replays idempotently on reconnect',
      detail: 'No data loss in dead zones — the client keeps working when the network does not.',
      tone: 'blue', layer: 'engineering', anchor: true,
    });
  }

  /* ---------- Edges ---------- */
  const edges: SystemEdge[] = [
    ...channels.map<SystemEdge>((c) => ({
      id: `e-in-${c.id}`,
      from: `in-${c.id}`,
      to: 'bus',
      flow: 'data',
      label: CHANNEL_FLOW_WORD[c.id] ?? 'record',
    })),
  ];

  if (useAgent) {
    edges.push(
      { id: 'e-bus-agent', from: 'bus', to: 'agent', flow: 'data', label: 'context' },
      { id: 'e-agent-tools', from: 'agent', to: 'tools', flow: 'action', label: 'tool call' },
      { id: 'e-tools-logic', from: 'tools', to: 'logic', flow: 'data', label: 'results' },
    );
  } else {
    edges.push({ id: 'e-bus-logic', from: 'bus', to: 'logic', flow: 'data', label: 'records' });
  }

  if (s.modifiers.humanGate) {
    edges.push(
      { id: 'e-logic-approval', from: 'logic', to: 'approval', flow: 'approval', label: 'proposed write' },
      { id: 'e-approval-store', from: 'approval', to: 'store', flow: 'approval', label: 'on approve' },
    );
  } else {
    edges.push({ id: 'e-logic-store', from: 'logic', to: 'store', flow: 'data', label: 'persist' });
  }

  if (s.modifiers.payments) {
    edges.push(
      { id: 'e-logic-payments', from: 'logic', to: 'payments', flow: 'action', label: 'charge' },
      { id: 'e-payments-store', from: 'payments', to: 'store', flow: 'data', label: 'receipt' },
    );
  }

  edges.push(
    { id: 'e-logic-human', from: 'logic', to: 'human', flow: 'escalation', label: 'on exception' },
    { id: 'e-human-store', from: 'human', to: 'store', flow: 'data', label: 'manual fix' },
  );

  if (s.modifiers.offline) {
    edges.push({ id: 'e-sync-store', from: 'sync', to: 'store', flow: 'data', label: 'idempotent replay' });
  }

  edges.push({ id: 'e-store-insights', from: 'store', to: 'insights', flow: 'data', label: 'history' });

  /* ---------- Build order (dramatic formation follows the chain) ---------- */
  const buildOrder = [
    'problem',
    ...channels.map((c) => `in-${c.id}`),
    'bus',
    ...(useAgent ? ['agent', 'tools'] : []),
    'logic',
    ...(s.modifiers.humanGate ? ['approval'] : []),
    ...(s.modifiers.payments ? ['payments'] : []),
    'store',
    ...(s.modifiers.offline ? ['sync'] : []),
    'human',
    'insights',
  ];

  /* ---------- Simulation ---------- */
  const Entity = e.label;
  const simulation: SimulationStep[] = [
    {
      kind: 'trigger', nodeId: `in-${firstChannel.id}`,
      label: `New ${e.label.toLowerCase()} arrives via ${firstChannel.label.toLowerCase()}`,
      payload: `source: ${firstChannel.label.toLowerCase()} · validated at intake`,
    },
    ...(useAgent
      ? [{
          kind: 'agent-state' as const, nodeId: 'agent',
          label: 'Agent loads context and available tools',
          payload: `${e.pluralLabel.toLowerCase()} record + 3 tools`,
        }]
      : []),
    {
      kind: 'tool-call', nodeId: useAgent ? 'agent' : 'logic',
      label: `Looks up matching ${e.label.toLowerCase()}`,
      invocation: `${Entity}.lookup`,
      payload: `query: ${e.label.toLowerCase()} reference`,
    },
    {
      kind: 'tool-result', nodeId: useAgent ? 'tools' : 'logic',
      label: `${Entity} record found`,
      payload: `${e.label.toLowerCase()}#4821 · status: new · owner: ${human.toLowerCase()}`,
    },
    {
      kind: 'tool-call', nodeId: 'logic',
      label: `Prepares ${s.primaryVerb} decision`,
      invocation: `${Entity}.${s.primaryVerb}`,
      payload: 'decision prepared · awaiting gate' + (s.modifiers.humanGate ? ' (approval required)' : ''),
      gate: 'interrupt',
      gatePrompt: `The system proposes to ${s.primaryVerb} this ${e.label.toLowerCase()}. Approve it, or reject and watch the pipeline continue without the write.`,
      rejectJumpTo: 8,
    },
    {
      kind: 'tool-result', nodeId: 'store',
      label: `${Entity} store updated`,
      payload: `${e.label.toLowerCase()}#4821 · status: ${s.primaryVerb === 'book' ? 'reserved' : s.primaryVerb + 'ed'}`,
    },
    {
      kind: 'state-change', nodeId: 'insights',
      label: 'Outcome recorded',
      payload: `event: ${e.label.toLowerCase()}_${s.primaryVerb}ed`,
    },
    {
      kind: 'error', nodeId: 'store',
      label: `${Entity} store rejected a write — constraint violation`,
      gate: 'failure',
      recoveryOptions: [
        { id: 'retry', label: 'Retry with backoff', outcome: 'Attempt 2 succeeded — idempotency key prevented a duplicate write.' },
        { id: 'fallback', label: 'Queue & reconcile later', outcome: 'Write queued locally with full context — no data lost, reconciles on reconnect.' },
        { id: 'escalate', label: 'Escalate to human', outcome: `${human} notified with the failed payload attached. Human completes the update.` },
      ],
    },
    {
      kind: 'complete', nodeId: 'insights',
      label: `${e.pluralLabel} pipeline settled — outcome fully traceable`,
    },
  ];

  // Fix rejectJumpTo: rejection skips the write chain and jumps to completion.
  const completeIdx = simulation.findIndex((st) => st.kind === 'complete');
  const gateIdx = simulation.findIndex((st) => st.gate === 'interrupt');
  if (gateIdx >= 0 && completeIdx > gateIdx) simulation[gateIdx].rejectJumpTo = completeIdx;

  /* ---------- Decisions ---------- */
  const decisions: DecisionScenario[] = [
    {
      id: 'd-logic',
      question: 'Where should the decision logic live?',
      dimension: 'Architecture',
      options: [
        {
          id: 'rules', label: 'Deterministic rules',
          advantage: 'Predictable, auditable, cheap to run — every decision is explainable',
          tradeoff: 'Every edge case becomes code someone maintains',
          consequence: 'Rules engine is the critical path — validation tightens',
          highlights: ['logic'],
        },
        {
          id: 'ai', label: 'AI decides',
          advantage: `Handles open-ended ${e.pluralLabel.toLowerCase()} that rules never anticipated`,
          tradeoff: 'Needs evaluation sets and guardrails before it touches real records',
          consequence: useAgent ? 'Agent path becomes the critical path' : 'An agent layer joins the pipeline',
          highlights: useAgent ? ['agent', 'tools'] : ['logic'],
          effect: useAgent ? undefined : { addNode: { id: 'agent', label: 'Agent Layer', kind: 'automation', role: 'Selects actions and calls tools — observable behavior only', tone: 'violet', layer: 'ai', anchor: true } },
        },
        {
          id: 'hybrid', label: 'Rules decide, AI assists',
          advantage: 'Boring paths stay deterministic; weird cases get machine help',
          tradeoff: 'Two surfaces to test; the boundary must be explicit',
          consequence: 'Both paths highlighted — the boundary is the design',
          highlights: useAgent ? ['logic', 'agent'] : ['logic'],
        },
      ],
    },
    {
      id: 'd-reliability',
      question: 'What happens when a write fails?',
      dimension: 'Reliability',
      options: [
        {
          id: 'retry', label: 'Queue & retry with idempotency',
          advantage: 'Transient failures self-heal — no human woken up',
          tradeoff: 'Needs idempotency keys or duplicates will bite you',
          consequence: 'Retry path emphasized on the store',
          highlights: ['store'],
        },
        {
          id: 'park', label: 'Park & surface to a human',
          advantage: 'Nothing silently disappears; people own the exceptions',
          tradeoff: 'Throughput is bounded by human attention',
          consequence: 'Human node becomes the recovery path',
          highlights: ['human', 'store'],
        },
      ],
    },
  ];

  /* ---------- Add-ons (universal, composed per-system) ---------- */
  const addOns: AddOnDefinition[] = [];

  if (!channels.some((c) => c.id === 'whatsapp')) {
    addOns.push({
      id: 'addon-whatsapp',
      label: 'WhatsApp Channel',
      chip: 'WhatsApp',
      description: 'Same pipeline, one more entry surface — because customers are already there.',
      message: 'WhatsApp channel added — records now arrive from one more surface.',
      node: { id: 'in-whatsapp', label: 'WhatsApp', kind: 'interface', role: 'Async messaging entry surface', tone: 'emerald', layer: 'product', anchor: false, parent: `in-${firstChannel.id}` },
      edges: [{ id: 'e-in-whatsapp', from: 'in-whatsapp', to: 'bus', flow: 'data', label: 'message' }],
    });
  }

  if (!s.modifiers.humanGate) {
    addOns.push({
      id: 'addon-approval',
      label: 'Human Approval Gate',
      chip: 'Approval gate',
      description: 'Every write waits for a human before it persists.',
      message: 'Approval gate injected — the direct write path now routes through a human.',
      node: { id: 'approval', label: 'Human Approval', kind: 'actor', role: 'Confirms proposed writes before they persist', tone: 'slate', layer: 'product', anchor: true },
      edges: [],
      rewireRemoveEdgeIds: ['e-logic-store'],
      rewireAddEdges: [
        { id: 'e-logic-approval', from: 'logic', to: 'approval', flow: 'approval', label: 'proposed write' },
        { id: 'e-approval-store', from: 'approval', to: 'store', flow: 'approval', label: 'on approve' },
      ],
    });
  }

  if (!s.modifiers.payments) {
    addOns.push({
      id: 'addon-payments',
      label: 'Payment Rail',
      chip: 'Payments',
      description: 'Collect money at the moment the workflow demands it.',
      message: 'Payments added — the engine can charge, not just record.',
      node: { id: 'payments', label: 'Payment Rail', kind: 'integration', role: 'Collects money at the moment the workflow demands it', tone: 'emerald', layer: 'product', anchor: true },
      edges: [
        { id: 'e-logic-payments', from: 'logic', to: 'payments', flow: 'action', label: 'charge' },
        { id: 'e-payments-store', from: 'payments', to: 'store', flow: 'data', label: 'receipt' },
      ],
    });
  }

  addOns.push({
    id: 'addon-notify',
    label: 'Status Notifications',
    chip: 'Notifications',
    description: 'The humans upstream hear what happened to their request.',
    message: 'Notifications added — status changes reach the people who care.',
    node: { id: 'notify', label: 'Notifications', kind: 'integration', role: 'Tells humans when their request changes state', tone: 'amber', layer: 'product', anchor: false, parent: 'insights' },
    edges: [{ id: 'e-insights-notify', from: 'insights', to: 'notify', flow: 'signal', label: 'status change' }],
  });

  /* ---------- Problem statement ---------- */
  const channelText = channels.map((c) => c.label.toLowerCase()).join(' & ');
  const painText = s.pains.length > 0 ? s.pains.join(', ') : 'handled ad hoc with no single source of truth';
  const problem = `${e.pluralLabel} arrive via ${channelText}. Today the work is ${painText} — so exceptions depend on memory and nothing is measurable.`;

  /* ---------- Assemble ---------- */
  const system: GeneratedSystem = {
    id: `sys-composed-${e.id}-${s.primaryVerb}`,
    scenarioId: 'composed',
    title: `${e.pluralLabel} ${VERB_TITLES[s.primaryVerb]} System`,
    problem,
    actors: [human, 'Requester', ...(s.modifiers.humanGate ? ['Approver'] : [])],
    intakeId: `in-${firstChannel.id}`,
    addOns,
    buildOrder,
    nodes,
    edges,
    simulation: { steps: simulation },
    decisions,
    projectEvidence: EVIDENCE_BY_DOMAIN,
  };

  // Drop add-ons that would collide with composed edge ids.
  const edgeIds = new Set(system.edges.map((ed) => ed.id));
  system.addOns = addOns.map((a) => ({
    ...a,
    edges: a.edges.filter((ed) => !edgeIds.has(ed.id)),
    rewireAddEdges: a.rewireAddEdges?.filter((ed) => !edgeIds.has(ed.id)),
  })).filter((a) => a.edges.length > 0 || (a.rewireAddEdges?.length ?? 0) > 0);

  return system;
}

/* ------------------------------------------------------------------ */
/* Lens transforms for composed systems                                */
/* ------------------------------------------------------------------ */

/**
 * Composed systems share a stable node vocabulary (problem / in-* / bus /
 * agent / tools / logic / store / human / insights / approval / payments /
 * sync), so one lens map serves every composed output.
 */
export function composedLensTransforms(system: GeneratedSystem): Record<string, { emphasize: string[]; annotations: Record<string, string> }> {
  const e = system.id.startsWith('sys-composed-') ? system : null;
  const has = (id: string) => (e ? system.nodes.some((n) => n.id === id) : false);
  const channelIds = system.nodes.filter((n) => n.id.startsWith('in-')).map((n) => n.id);

  return {
    product: {
      emphasize: ['problem', ...channelIds, 'human'],
      annotations: {
        problem: 'Where the work breaks today',
        human: 'People handle only exceptions',
        ...(channelIds.length > 0 ? { [channelIds[0]]: 'The journey starts here' } : {}),
      },
    },
    engineering: {
      emphasize: [...(has('sync') ? ['sync'] : []), 'logic', 'store'],
      annotations: {
        logic: 'Deterministic core',
        store: 'System of record',
        ...(has('sync') ? { sync: 'Idempotent offline queue' } : {}),
      },
    },
    ai: has('agent')
      ? {
          emphasize: ['agent', 'tools'],
          annotations: { agent: 'Intent → action selection', tools: 'Validated tool surface' },
        }
      : {
          emphasize: ['logic'],
          annotations: { logic: 'Boring on purpose — rules, not models' },
        },
    data: {
      emphasize: [...channelIds, 'bus', 'store'],
      annotations: {
        bus: 'Every channel → one record shape',
        store: 'Normalized, auditable',
      },
    },
    business: {
      emphasize: ['problem', has('agent') ? 'agent' : 'logic', 'human'],
      annotations: {
        problem: 'Manual process today',
        human: 'Works only on judgment calls',
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/* Interpret — the single Mode-A entry point                           */
/* ------------------------------------------------------------------ */

export interface Interpretation {
  system: GeneratedSystem;
  rationale: string;
  matchedSignals: string[];
  /** True when a curated scenario matched strongly enough to be used verbatim. */
  curated: boolean;
}

/**
 * Interpret an arbitrary idea. A strong curated-scenario match (the featured
 * chips) uses the hand-tuned system; everything else is composed from the
 * visitor's own signals — so the output genuinely reflects their input.
 */
export function interpretIdea(idea: string): Interpretation {
  const classification = classifyIdea(idea);
  const signals = extractSignals(idea);

  if (classification.matchedSignals.length >= 2) {
    const system = getSystem(classification.scenarioId);
    return {
      system,
      rationale: classification.rationale,
      matchedSignals: signals.matchedSignals,
      curated: true,
    };
  }

  const system = composeSystem(idea, signals);
  const ch = signals.channels.length > 0 ? signals.channels.map((c) => c.label.toLowerCase()).join(' + ') : 'no explicit channel';
  return {
    system,
    rationale: `Composed from your input: ${signals.entity.pluralLabel.toLowerCase()} · ${ch} · ${signals.pains.length > 0 ? signals.pains.join(', ') : 'general workflow'}.`,
    matchedSignals: signals.matchedSignals,
    curated: false,
  };
}
