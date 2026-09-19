/**
 * Builder Lab — Deterministic Scenario Engine
 *
 * Phase 1 of the experience: no LLM, no network. Arbitrary visitor input is
 * classified against weighted keyword signals and resolved into a structured
 * product system. Everything the visitor sees is derived from this data.
 */

import type {
  ClassificationResult,
  GeneratedSystem,
  LensId,
  ScenarioMeta,
  SystemEdge,
  SystemNode,
} from './types';

/* ------------------------------------------------------------------ */
/* Classifier — weighted signals over arbitrary input                  */
/* ------------------------------------------------------------------ */

interface ScenarioSignals {
  /** Higher-specificity signals first; weights accumulate per match. */
  signals: { pattern: RegExp; weight: number; label: string }[];
}

const SIGNALS: Record<string, ScenarioSignals> = {
  voiceSupport: {
    signals: [
      { pattern: /\b(call|calls|calling|phone|voice|inbox|chat|chatbot|support|ticket|tickets)\b/i, weight: 2, label: 'voice/support channel' },
      { pattern: /\b(lead|leads|crm|sales|customer|customers|client|clients)\b/i, weight: 2, label: 'customer pipeline' },
      { pattern: /\b(manual|manually|repeat|repeated|same questions|handl(e|ing)|enter|typing)\b/i, weight: 2, label: 'manual repetition' },
      { pattern: /\b(agent|automate|automation|workflow)\b/i, weight: 1, label: 'automation intent' },
    ],
  },
  invoices: {
    signals: [
      { pattern: /\b(invoice|invoices|billing|bill|bills|payment|payments|receipt|receipts|expense|expenses|finance|financial)\b/i, weight: 3, label: 'billing/finance documents' },
      { pattern: /\b(email|emails|mail|inbox|scan|scanned|pdf|pdfs|paper)\b/i, weight: 2, label: 'document intake' },
      { pattern: /\b(manual|manually|enter|entering|data entry|reconcile|reconciliation|match|matching|approve|approval)\b/i, weight: 2, label: 'manual processing' },
      { pattern: /\b(ocr|extract|parse|vendor|vendors)\b/i, weight: 1, label: 'extraction' },
    ],
  },
  operations: {
    signals: [
      { pattern: /\b(pg|pgs|hostel|hostels|rent|rental|rentals|property|properties|lease|leases|tenant|tenants|construction|inventory|stock|warehouse|field|field teams|operations|booking|bookings|stay|stays|hotel|hotels|travel)\b/i, weight: 3, label: 'operations platform' },
      { pattern: /\b(manage|managing|management|track|tracking|monitor|dashboard|catalog|catalogue|list|listing)\b/i, weight: 2, label: 'tracking surface' },
      { pattern: /\b(booking|bookings|reservation|reservations|payment|payments|checkout|availability|calendar|schedule)\b/i, weight: 2, label: 'transactional flow' },
      { pattern: /\b(offline|mobile|app|field|map)\b/i, weight: 1, label: 'mobile context' },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Scenario metadata (chips shown in the input stage)                  */
/* ------------------------------------------------------------------ */

export const scenarioMeta: ScenarioMeta[] = [
  {
    id: 'voiceSupport',
    chip: 'Support & lead follow-up',
    example: 'Our sales team manually calls leads and logs results in the CRM.',
    title: 'AI Support & Lead Follow-Up System',
    domain: 'AI Automation',
  },
  {
    id: 'invoices',
    chip: 'Invoice & document intake',
    example: 'We receive invoices by email and enter them manually.',
    title: 'Invoice Intelligence Pipeline',
    domain: 'Document Automation',
  },
  {
    id: 'operations',
    chip: 'Operations & booking platform',
    example: 'Managing PGs means tracking occupancy and availability, with field staff updating records from mobile.',
    title: 'Operations & Booking Platform',
    domain: 'Full-Stack Product',
  },
];

/* ------------------------------------------------------------------ */
/* Generated systems                                                   */
/* ------------------------------------------------------------------ */

function sys(id: string, scenarioId: string, data: Omit<GeneratedSystem, 'id' | 'scenarioId'>): GeneratedSystem {
  return { id, scenarioId, ...data };
}

export const generatedSystems: Record<string, GeneratedSystem> = {
  voiceSupport: sys('sys-voice', 'voiceSupport', {
    domain: 'support',
    title: 'AI Support & Lead Follow-Up System',
    problem: 'Support and sales conversations arrive through voice and chat. Reps manually log every outcome into the CRM, so follow-ups slip and nothing is measurable.',
    actors: ['Customer', 'Support Rep', 'Team Lead'],
    intakeId: 'customer',
    addOns: [
      {
        id: 'whatsapp',
        label: 'WhatsApp Channel',
        chip: 'WhatsApp',
        description: 'Customers reach the same agent through WhatsApp instead of voice only.',
        message: 'WhatsApp channel added — same agent, new entry surface.',
        node: { id: 'whatsapp', label: 'WhatsApp Channel', kind: 'interface', role: 'Async messaging entry surface', tone: 'emerald', layer: 'product', anchor: false, parent: 'voice' },
        edges: [{ id: 'e-wa-1', from: 'customer', to: 'whatsapp', flow: 'signal', label: 'message' }],
        rewireRemoveEdgeIds: ['e2'],
        rewireAddEdges: [{ id: 'e-wa-2', from: 'whatsapp', to: 'agent', flow: 'data', label: 'transcript' }],
      },
      {
        id: 'approval',
        label: 'Human Approval Gate',
        chip: 'Approval gate',
        description: 'A human confirms every CRM write before it persists.',
        message: 'Approval gate injected — every CRM write now waits for a human.',
        node: { id: 'approval', label: 'Human Approval', kind: 'actor', role: 'Confirms or rejects proposed CRM writes', tone: 'slate', layer: 'product', anchor: false, parent: 'crm' },
        edges: [],
        rewireRemoveEdgeIds: ['e4'],
        rewireAddEdges: [
          { id: 'e-ap-1', from: 'tools', to: 'approval', flow: 'approval', label: 'proposed write' },
          { id: 'e-ap-2', from: 'approval', to: 'crm', flow: 'approval', label: 'on approve' },
        ],
      },
      {
        id: 'voiceoutbound',
        label: 'Outbound Voice Agent',
        chip: 'Outbound calls',
        description: 'The agent places follow-up calls instead of only scheduling them.',
        message: 'Outbound voice added — follow-ups execute as calls.',
        node: { id: 'outbound', label: 'Outbound Voice', kind: 'automation', role: 'Places scheduled follow-up calls', tone: 'violet', layer: 'ai', anchor: false, parent: 'followup' },
        edges: [{ id: 'e-ob-1', from: 'followup', to: 'outbound', flow: 'action', label: 'dial' }],
      },
    ],
    buildOrder: ['problem', 'customer', 'voice', 'agent', 'tools', 'crm', 'followup', 'analytics'],
    nodes: [
      { id: 'problem', label: 'Problem', kind: 'actor', role: 'Manual logging after every conversation', detail: 'The workflow depends on memory: rep finishes a call, then types what happened into the CRM.', tone: 'rose', layer: 'product', anchor: true, locked: true },
      { id: 'customer', label: 'Customer', kind: 'actor', role: 'Initiates voice or chat conversations', tone: 'slate', layer: 'product', anchor: true },
      { id: 'voice', label: 'Voice / Chat Intake', kind: 'interface', role: 'Captures conversations and transcripts', detail: 'Single entry surface so nothing bypasses the system.', tone: 'blue', layer: 'product', anchor: true },
      { id: 'agent', label: 'Conversation Agent', kind: 'automation', role: 'Classifies intent, drafts the outcome summary', detail: 'Observable behavior only: input → selected action → tool → result. No hidden reasoning is shown.', tone: 'violet', layer: 'ai', anchor: true },
      { id: 'tools', label: 'Tool Layer', kind: 'automation', role: 'Structured functions the agent may call', detail: 'The agent never acts directly — every action is a validated tool call.', tone: 'violet', layer: 'ai', anchor: true },
      { id: 'crm', label: 'CRM Sync', kind: 'integration', role: 'System of record for leads and outcomes', tone: 'amber', layer: 'data', anchor: true },
      { id: 'followup', label: 'Follow-Up Scheduler', kind: 'automation', role: 'Schedules next actions from conversation outcomes', tone: 'emerald', layer: 'ai', anchor: true },
      { id: 'analytics', label: 'Outcome Analytics', kind: 'data', role: 'Measures response, resolution and follow-through', tone: 'blue', layer: 'data', anchor: true },
    ],
    edges: [
      { id: 'e1', from: 'customer', to: 'voice', flow: 'signal', label: 'conversation' },
      { id: 'e2', from: 'voice', to: 'agent', flow: 'data', label: 'transcript' },
      { id: 'e3', from: 'agent', to: 'tools', flow: 'action', label: 'tool call' },
      { id: 'e4', from: 'tools', to: 'crm', flow: 'data', label: 'write outcome' },
      { id: 'e5', from: 'crm', to: 'followup', flow: 'signal', label: 'next action' },
      { id: 'e6', from: 'followup', to: 'analytics', flow: 'data', label: 'results' },
    ],
    simulation: {
      steps: [
        { kind: 'trigger', nodeId: 'customer', label: 'Lead conversation received via voice intake' },
        { kind: 'agent-state', nodeId: 'agent', label: 'Agent loads conversation context and available tools' },
        { kind: 'tool-call', nodeId: 'agent', label: 'Agent classifies intent', invocation: 'CRM.searchLead', payload: 'query: caller phone identity' },
        { kind: 'tool-result', nodeId: 'tools', label: 'Lead record found', payload: 'lead#4821 · status: new · owner: sales' },
        { kind: 'tool-call', nodeId: 'agent', label: 'Agent updates pipeline stage', invocation: 'CRM.updateLead', payload: 'status: qualified · summary attached', gate: 'interrupt', gatePrompt: 'The agent proposes a CRM write. Approve, or change what happens next.', rejectJumpTo: 9 },
        { kind: 'tool-result', nodeId: 'tools', label: 'CRM write confirmed', payload: 'lead#4821 · status: qualified' },
        { kind: 'state-change', nodeId: 'followup', label: 'Follow-up scheduled from outcome', payload: 'T+48h · channel: email' },
        { kind: 'tool-call', nodeId: 'agent', label: 'Agent logs follow-through metric', invocation: 'Analytics.record', payload: 'event: lead_qualified' },
        { kind: 'error', nodeId: 'crm', label: 'CRM write failed — connection timeout', gate: 'failure', recoveryOptions: [
          { id: 'retry', label: 'Retry with backoff', outcome: 'Attempt 2 succeeded — idempotency key prevented a duplicate write.' },
          { id: 'fallback', label: 'Queue offline & fallback', outcome: 'Write queued locally. CRM will reconcile on reconnect — no data lost.' },
          { id: 'escalate', label: 'Escalate to human', outcome: 'Rep notified with full conversation context. Human completes the update.' },
        ] },
        { kind: 'complete', nodeId: 'analytics', label: 'Outcome recorded — conversation fully processed' },
      ],
    },
    decisions: [
      {
        id: 'd-knowledge',
        question: 'Where does the agent\'s knowledge live?',
        dimension: 'AI',
        options: [
          { id: 'rag', label: 'RAG over docs', advantage: 'Answers stay current without redeploying the agent', tradeoff: 'Retrieval quality gates answer quality — bad sources, bad answers', consequence: 'A retrieval step appears before every tool call', highlights: ['agent', 'tools'] },
          { id: 'apitools', label: 'API tools only', advantage: 'Every claim is verifiable against a real system of record', tradeoff: 'Agent is only as good as the tool surface you expose', consequence: 'Tool layer becomes the critical path — validation tightens', highlights: ['tools'] },
          { id: 'hybrid', label: 'Hybrid', advantage: 'Covers both factual lookup and open-ended questions', tradeoff: 'More surface to test; failure modes multiply', consequence: 'Agent shows a fallback path when retrieval misses', highlights: ['agent', 'tools', 'followup'] },
        ],
      },
      {
        id: 'd-approval',
        question: 'Should the agent write to the CRM autonomously?',
        dimension: 'Reliability',
        options: [
          { id: 'auto', label: 'Autonomous writes', advantage: 'Zero rep overhead — the system runs itself', tradeoff: 'One bad extraction propagates to your system of record', consequence: 'Direct tool → CRM edge; faster but riskier', highlights: ['tools', 'crm'] },
          { id: 'gate', label: 'Human approval gate', advantage: 'A human confirms before anything touches the CRM', tradeoff: 'Adds latency to every write', consequence: 'An approval gate node is injected before CRM sync', highlights: ['agent', 'crm'], effect: { applyAddOn: 'approval' } },
          { id: 'channels', label: 'Multi-channel intake', advantage: 'Voice, chat and WhatsApp share one agent brain', tradeoff: 'Channel quirks multiply the edge cases you must test', consequence: 'A WhatsApp surface joins voice intake', highlights: ['voice', 'agent'], effect: { applyAddOn: 'whatsapp' } },
        ],
      },
    ],
    projectEvidence: [
      { projectId: 'splitfin', name: 'SplitFin', relevance: 'Idempotent offline-first sync queue with UUID idempotency keys — the same pattern this system needs for reliable CRM writes.', tag: 'ACTIVE'
      },
      { projectId: 'stayease', name: 'StayEase', relevance: 'Real-time availability via Supabase WebSockets — same event-driven backbone for live conversation intake.', tag: 'ACTIVE'
      },
    ],
  }),

  invoices: sys('sys-invoice', 'invoices', {
    domain: 'finance',
    title: 'Invoice Intelligence Pipeline',
    problem: 'Invoices arrive as email attachments. Someone reads each one, extracts fields, and re-types them into the finance system — slow, error-prone, and invisible until something breaks.',
    actors: ['Vendor', 'Finance Ops', 'Approver'],
    intakeId: 'inbox',
    addOns: [
      {
        id: 'ocrqueue',
        label: 'Burst Queue',
        chip: 'Burst queue',
        description: 'A queue buffers email bursts so extraction never backs up intake.',
        message: 'Burst queue added — intake and extraction decoupled.',
        node: { id: 'queue', label: 'Burst Queue', kind: 'automation', role: 'Buffers attachments between intake and extraction', tone: 'emerald', layer: 'engineering', anchor: false, parent: 'inbox' },
        edges: [],
        rewireRemoveEdgeIds: ['e1'],
        rewireAddEdges: [
          { id: 'e-q-1', from: 'inbox', to: 'queue', flow: 'data', label: 'enqueue' },
          { id: 'e-q-2', from: 'queue', to: 'extract', flow: 'data', label: 'dequeue' },
        ],
      },
      {
        id: 'vendorportal',
        label: 'Vendor Self-Serve Portal',
        chip: 'Vendor portal',
        description: 'Vendors submit structured forms — no PDF parsing at all.',
        message: 'Vendor portal added — structured input replaces PDF parsing.',
        node: { id: 'portal', label: 'Vendor Portal', kind: 'interface', role: 'Structured submission form for vendors', tone: 'blue', layer: 'product', anchor: false, parent: 'inbox' },
        edges: [{ id: 'e-vp-1', from: 'portal', to: 'extract', flow: 'data', label: 'structured fields' }],
      },
      {
        id: 'notify',
        label: 'Vendor Status Notifications',
        chip: 'Status emails',
        description: 'Vendors hear acceptance or rejection immediately.',
        message: 'Notifications added — vendors get instant status.',
        node: { id: 'notify', label: 'Status Notifications', kind: 'integration', role: 'Emails vendors on accept/reject/exception', tone: 'amber', layer: 'product', anchor: false, parent: 'reporting' },
        edges: [{ id: 'e-nt-1', from: 'reporting', to: 'notify', flow: 'signal', label: 'status change' }],
      },
    ],
    buildOrder: ['problem', 'inbox', 'extract', 'agent', 'validate', 'ledger', 'approval', 'reporting'],
    nodes: [
      { id: 'problem', label: 'Problem', kind: 'actor', role: 'Re-typing every invoice by hand', detail: 'Fields live in free-form PDFs; humans are the OCR.', tone: 'rose', layer: 'product', anchor: true, locked: true },
      { id: 'inbox', label: 'Email Intake', kind: 'interface', role: 'Captures invoices from shared inbox', tone: 'blue', layer: 'product', anchor: true },
      { id: 'extract', label: 'Extraction Engine', kind: 'automation', role: 'Parses vendor, amount, date, line items', tone: 'violet', layer: 'ai', anchor: true },
      { id: 'agent', label: 'Matching Agent', kind: 'automation', role: 'Matches invoice to purchase order', detail: 'Observable trace only: candidate POs → confidence → decision. No fabricated confidence scores.', tone: 'violet', layer: 'ai', anchor: true },
      { id: 'validate', label: 'Validation Rules', kind: 'automation', role: 'Schema + business rules before anything persists', tone: 'emerald', layer: 'data', anchor: true },
      { id: 'ledger', label: 'Finance Ledger', kind: 'data', role: 'System of record for booked invoices', tone: 'amber', layer: 'data', anchor: true },
      { id: 'approval', label: 'Approval Queue', kind: 'actor', role: 'Human gate for exceptions and mismatches', tone: 'slate', layer: 'product', anchor: true },
      { id: 'reporting', label: 'Status Reporting', kind: 'data', role: 'Pipeline health: received → booked → paid', tone: 'blue', layer: 'data', anchor: true },
    ],
    edges: [
      { id: 'e1', from: 'inbox', to: 'extract', flow: 'data', label: 'attachment' },
      { id: 'e2', from: 'extract', to: 'agent', flow: 'data', label: 'parsed fields' },
      { id: 'e3', from: 'agent', to: 'validate', flow: 'action', label: 'matched pair' },
      { id: 'e4', from: 'validate', to: 'ledger', flow: 'approval', label: 'on pass' },
      { id: 'e5', from: 'validate', to: 'approval', flow: 'escalation', label: 'on mismatch' },
      { id: 'e6', from: 'ledger', to: 'reporting', flow: 'data', label: 'booked state' },
    ],
    simulation: {
      steps: [
        { kind: 'trigger', nodeId: 'inbox', label: 'Invoice attachment received from vendor' },
        { kind: 'tool-call', nodeId: 'extract', label: 'Extraction run', invocation: 'Doc.extract', payload: 'vendor · amount · due date · 6 line items' },
        { kind: 'tool-result', nodeId: 'extract', label: 'Fields parsed', payload: '₹1,42,800 · PO referenced: PO-2291' },
        { kind: 'agent-state', nodeId: 'agent', label: 'Matching agent evaluates candidates' },
        { kind: 'tool-call', nodeId: 'agent', label: 'Agent books the invoice', invocation: 'Ledger.book', payload: 'invoice#8841 → PO-2291', gate: 'interrupt', gatePrompt: 'The agent proposes booking this invoice. Approve, reject, or escalate.', rejectJumpTo: 8 },
        { kind: 'tool-result', nodeId: 'validate', label: 'Validation passed', payload: 'totals match · no duplicates' },
        { kind: 'error', nodeId: 'ledger', label: 'Ledger rejected write — duplicate invoice number', gate: 'failure', recoveryOptions: [
          { id: 'retry', label: 'Re-validate & retry', outcome: 'Duplicate check traced to a re-sent email. Original retained, duplicate dropped.' },
          { id: 'fallback', label: 'Route to approval queue', outcome: 'Invoice parked for human review with the conflict attached.' },
          { id: 'escalate', label: 'Escalate to finance ops', outcome: 'Ops informed with both invoice versions side by side.' },
        ] },
        { kind: 'complete', nodeId: 'reporting', label: 'Pipeline state updated — invoice fully processed' },
      ],
    },
    decisions: [
      {
        id: 'd-data',
        question: 'How should extracted invoices be stored?',
        dimension: 'Data',
        options: [
          { id: 'sql', label: 'Relational (SQL)', advantage: 'Ledger totals and foreign keys stay provably consistent', tradeoff: 'Schema changes on messy real-world documents hurt', consequence: 'Validation node becomes the strict gateway', highlights: ['validate', 'ledger'] },
          { id: 'doc', label: 'Document store', advantage: 'Raw vendor documents flex without migrations', tradeoff: 'Reporting needs a careful projection layer', consequence: 'Reporting node gains a transform step', highlights: ['ledger', 'reporting'] },
          { id: 'hybridd', label: 'Hybrid', advantage: 'Structured core + flexible raw archive', tradeoff: 'Two sources of truth need a clear owner', consequence: 'Both persistence paths are highlighted', highlights: ['validate', 'ledger', 'reporting'] },
        ],
      },
      {
        id: 'd-arch',
        question: 'Where should extraction run?',
        dimension: 'Architecture',
        options: [
          { id: 'sync', label: 'Inline (synchronous)', advantage: 'Vendor gets an immediate acceptance/rejection receipt', tradeoff: 'Pipeline latency couples to email delivery', consequence: 'Direct inbox → extract edge, no queue', highlights: ['inbox', 'extract'] },
          { id: 'queue', label: 'Queued worker', advantage: 'Bursts of 200 invoices don\'t take the pipeline down', tradeoff: 'Eventually-consistent status; ops needs monitoring', consequence: 'A queue buffer appears between intake and extraction', highlights: ['inbox', 'extract', 'agent'], effect: { applyAddOn: 'ocrqueue' } },
          { id: 'structured', label: 'Structured intake', advantage: 'No parsing uncertainty — validation is deterministic', tradeoff: 'Every vendor must change how they submit', consequence: 'A vendor portal replaces email PDFs', highlights: ['inbox', 'validate'], effect: { applyAddOn: 'vendorportal' } },
        ],
      },
    ],
    projectEvidence: [
      { projectId: 'splitfin', name: 'SplitFin', relevance: 'MMKV-backed offline ledger with background sync — the same reliability model for queue-then-book finance writes.', tag: 'ACTIVE'
      },
      { projectId: 'stayease', name: 'StayEase', relevance: 'Payment-sheet → booking state machine — mirrors the invoice → ledger state transitions.', tag: 'ACTIVE'
      },
    ],
  }),

  operations: sys('sys-ops', 'operations', {
    domain: 'operations',
    title: 'Operations & Booking Platform',
    problem: 'Inventory, availability and bookings are managed across spreadsheets and phone calls. Nobody has one truthful, current view of what is bookable right now.',
    actors: ['Owner', 'Staff', 'Customer'],
    intakeId: 'surface',
    addOns: [
      {
        id: 'payments',
        label: 'Payment Sheet',
        chip: 'Payments',
        description: 'Deposits are collected at booking time via a native payment sheet.',
        message: 'Payments added — deposits collected at booking time.',
        node: { id: 'payments', label: 'Payment Sheet', kind: 'integration', role: 'Collects deposits at reservation time', tone: 'emerald', layer: 'product', anchor: false, parent: 'booking' },
        edges: [
          { id: 'e-pm-1', from: 'booking', to: 'payments', flow: 'action', label: 'charge' },
          { id: 'e-pm-2', from: 'payments', to: 'store', flow: 'data', label: 'receipt' },
        ],
      },
      {
        id: 'staffconsole',
        label: 'Staff Console',
        chip: 'Staff console',
        description: 'Staff get a live desk for exceptions and walk-ins.',
        message: 'Staff console added — exceptions and walk-ins get an owner.',
        node: { id: 'staffconsole', label: 'Staff Console', kind: 'interface', role: 'Live desk for exceptions and walk-ins', tone: 'blue', layer: 'product', anchor: false, parent: 'store' },
        edges: [{ id: 'e-sc-1', from: 'store', to: 'staffconsole', flow: 'data', label: 'live state' }],
      },
      {
        id: 'reminders',
        label: 'Guest Reminders',
        chip: 'Reminders',
        description: 'Automated check-in and payment reminders to guests.',
        message: 'Reminders added — guests nudged before check-in.',
        node: { id: 'reminders', label: 'Guest Reminders', kind: 'automation', role: 'Scheduled check-in and payment nudges', tone: 'violet', layer: 'ai', anchor: false, parent: 'insights' },
        edges: [{ id: 'e-rm-1', from: 'insights', to: 'reminders', flow: 'signal', label: 'upcoming stay' }],
      },
    ],
    buildOrder: ['problem', 'catalog', 'surface', 'booking', 'rules', 'store', 'sync', 'insights'],
    nodes: [
      { id: 'problem', label: 'Problem', kind: 'actor', role: 'Source of truth scattered across sheets and calls', tone: 'rose', layer: 'product', anchor: true, locked: true },
      { id: 'catalog', label: 'Inventory Catalog', kind: 'data', role: 'Single record per unit with live status', tone: 'amber', layer: 'data', anchor: true },
      { id: 'surface', label: 'Customer Surface', kind: 'interface', role: 'Browse, filter, select — works offline', detail: 'Progressive disclosure: casual visitors see the journey, technical visitors see the depth.', tone: 'blue', layer: 'product', anchor: true },
      { id: 'booking', label: 'Booking Engine', kind: 'automation', role: 'Reservations with conflict prevention', tone: 'emerald', layer: 'product', anchor: true },
      { id: 'rules', label: 'Policy Rules', kind: 'automation', role: 'Deposit, cancellation, capacity constraints', tone: 'violet', layer: 'engineering', anchor: true },
      { id: 'store', label: 'Operational Store', kind: 'data', role: 'Bookings, payments, customer history', tone: 'amber', layer: 'data', anchor: true },
      { id: 'sync', label: 'Sync Layer', kind: 'integration', role: 'Offline queue with idempotent reconciliation', tone: 'blue', layer: 'engineering', anchor: true },
      { id: 'insights', label: 'Occupancy Insights', kind: 'data', role: 'Utilization trends for owners', tone: 'blue', layer: 'data', anchor: true },
    ],
    edges: [
      { id: 'e1', from: 'surface', to: 'booking', flow: 'action', label: 'reservation' },
      { id: 'e2', from: 'booking', to: 'rules', flow: 'signal', label: 'policy check' },
      { id: 'e3', from: 'rules', to: 'store', flow: 'data', label: 'persist' },
      { id: 'e4', from: 'store', to: 'catalog', flow: 'data', label: 'availability' },
      { id: 'e5', from: 'catalog', to: 'surface', flow: 'data', label: 'live inventory' },
      { id: 'e6', from: 'store', to: 'insights', flow: 'data', label: 'history' },
      { id: 'e7', from: 'surface', to: 'sync', flow: 'data', label: 'offline queue' },
      { id: 'e8', from: 'sync', to: 'store', flow: 'data', label: 'reconcile' },
    ],
    simulation: {
      steps: [
        { kind: 'trigger', nodeId: 'surface', label: 'Customer opens booking surface (offline-capable)' },
        { kind: 'tool-call', nodeId: 'booking', label: 'Availability query', invocation: 'Store.searchInventory', payload: 'geo radius · dates · capacity' },
        { kind: 'tool-result', nodeId: 'store', label: '3 units available', payload: 'nearest match 2.1km · ₹1,200/night' },
        { kind: 'tool-call', nodeId: 'booking', label: 'Reserve unit', invocation: 'Booking.reserve', payload: 'unit#12 · 3 nights · 2 guests', gate: 'interrupt', gatePrompt: 'The engine proposes a reservation. Approve it, or route through policy rules first.', rejectJumpTo: 7 },
        { kind: 'state-change', nodeId: 'rules', label: 'Policy check passed', payload: 'deposit OK · capacity OK' },
        { kind: 'error', nodeId: 'sync', label: 'Sync conflict — unit reserved simultaneously', gate: 'failure', recoveryOptions: [
          { id: 'retry', label: 'Re-reserve with new unit', outcome: 'Conflict resolved by server-side monotonic timestamps; alternate unit confirmed.' },
          { id: 'fallback', label: 'Hold & notify', outcome: 'Customer notified of near-match alternative with one-tap switch.' },
          { id: 'escalate', label: 'Escalate to staff', outcome: 'Staff console flags the double-booking with full context.' },
        ] },
        { kind: 'complete', nodeId: 'insights', label: 'Occupancy updated — booking cycle complete' },
      ],
    },
    decisions: [
      {
        id: 'd-state',
        question: 'Where should booking state live first?',
        dimension: 'State',
        options: [
          { id: 'client', label: 'Client-first (local)', advantage: 'Booking works in an elevator with zero signal', tradeoff: 'Conflicts need idempotent reconciliation', consequence: 'Sync layer becomes critical path', highlights: ['surface', 'sync'] },
          { id: 'server', label: 'Server-first', advantage: 'One truth, no conflicts by construction', tradeoff: 'Dead zones break the core journey', consequence: 'Direct surface → store edge; offline support drops', highlights: ['surface', 'store'] },
          { id: 'paid', label: 'Deposit at booking', advantage: 'No-shows stop being free', tradeoff: 'Payment friction can cost marginal bookings', consequence: 'A payment sheet joins the booking flow', highlights: ['booking', 'store'], effect: { applyAddOn: 'payments' } },
        ],
      },
      {
        id: 'd-geo',
        question: 'How should inventory be searched geographically?',
        dimension: 'Data',
        options: [
          { id: 'postgis', label: 'Spatial index (PostGIS)', advantage: 'Sub-25ms radius queries at 500+ units', tradeoff: 'Infrastructure and modeling cost upfront', consequence: 'Catalog node annotated as spatially indexed', highlights: ['catalog', 'store'] },
          { id: 'naive', label: 'In-memory filter', advantage: 'Trivially simple for <100 units', tradeoff: 'Degrades linearly with catalog size', consequence: 'Catalog marked as scan-based (no index)', highlights: ['catalog'] },
        ],
      },
    ],
    projectEvidence: [
      { projectId: 'stayease', name: 'StayEase', relevance: 'This is the closest real system: PostGIS spatial queries, offline MMKV passes, native booking flow.', tag: 'ACTIVE'
      },
      { projectId: 'splitfin', name: 'SplitFin', relevance: 'DAG debt-minimization — the same algorithmic core if this platform settles payouts between parties.', tag: 'ACTIVE'
      },
    ],
  }),
};

/* ------------------------------------------------------------------ */
/* Lenses                                                              */
/* ------------------------------------------------------------------ */

export const systemLenses: SystemLensLike[] = [
  { id: 'product', label: 'Product', question: 'What problem does this solve, for whom?', description: 'Problem → actors → journey → outcome.' },
  { id: 'engineering', label: 'Engineering', question: 'How is it built and where can it break?', description: 'Surfaces → services → data → infrastructure.' },
  { id: 'ai', label: 'AI', question: 'What does the machine do, observably?', description: 'Context → action → tool → result → state change.' },
  { id: 'data', label: 'Data', question: 'What is the shape of the truth?', description: 'Input → validation → transformation → storage → output.' },
  { id: 'business', label: 'Business', question: 'What work changes for people?', description: 'Manual process → automation opportunity → system → operational outcome.' },
];

type SystemLensLike = import('./types').SystemLens;

/* ------------------------------------------------------------------ */
/* Lens transforms                                                     */
/* ------------------------------------------------------------------ */

/**
 * Lens presentation: which nodes are emphasized, which are dimmed, and what
 * annotation each emphasized node carries under this lens. The graph itself
 * never changes — only the perspective on it.
 */
export interface LensTransform {
  emphasize: string[];
  annotations: Record<string, string>;
}

export const lensTransforms: Record<string, Record<LensId, LensTransform>> = {
  voiceSupport: {
    product: { emphasize: ['problem', 'customer', 'voice', 'followup'], annotations: { problem: 'Manual logging after every call', customer: 'Starts the journey', voice: 'One entry surface', followup: 'No lead slips' } },
    engineering: { emphasize: ['voice', 'tools', 'crm', 'analytics'], annotations: { voice: 'Webhook intake', tools: 'Validated tool surface', crm: 'System of record', analytics: 'Event pipeline' } },
    ai: { emphasize: ['agent', 'tools', 'followup'], annotations: { agent: 'Intent → action selection', tools: 'SearchLead · UpdateLead · Record', followup: 'Scheduled action from outcome' } },
    data: { emphasize: ['voice', 'crm', 'analytics'], annotations: { voice: 'Raw transcript in', crm: 'Normalized lead state', analytics: 'Aggregated outcomes out' } },
    business: { emphasize: ['problem', 'agent', 'crm', 'followup'], annotations: { problem: 'Reps as data-entry clerks', agent: 'Replaces re-typing', crm: 'Trustworthy record', followup: 'Consistent follow-through' } },
  },
  invoices: {
    product: { emphasize: ['problem', 'inbox', 'approval', 'reporting'], annotations: { problem: 'Humans as OCR', inbox: 'Zero-change intake', approval: 'Exceptions go to people', reporting: 'Pipeline visibility' } },
    engineering: { emphasize: ['inbox', 'extract', 'validate', 'ledger'], annotations: { inbox: 'Ingestion boundary', extract: 'Parsing service', validate: 'Rule gateway', ledger: 'Transactional core' } },
    ai: { emphasize: ['extract', 'agent'], annotations: { extract: 'Structured extraction', agent: 'PO matching with observable trace' } },
    data: { emphasize: ['extract', 'validate', 'ledger', 'reporting'], annotations: { extract: 'Free-form → fields', validate: 'Schema + business rules', ledger: 'Normalized storage', reporting: 'Projections' } },
    business: { emphasize: ['problem', 'extract', 'ledger', 'approval'], annotations: { problem: 'Hours of re-typing weekly', extract: 'Automation opportunity', ledger: 'Faster books close', approval: 'People handle only exceptions' } },
  },
  operations: {
    product: { emphasize: ['problem', 'surface', 'booking', 'insights'], annotations: { problem: 'Spreadsheets + phone calls', surface: 'The customer journey', booking: 'Conflict-free reservations', insights: 'Owner decisions' } },
    engineering: { emphasize: ['surface', 'sync', 'store', 'rules'], annotations: { surface: 'Offline-capable client', sync: 'Idempotent queue', store: 'Postgres + indexes', rules: 'Domain constraints' } },
    ai: { emphasize: ['booking', 'rules'], annotations: { booking: 'Deterministic availability logic', rules: 'Constraint evaluation — boring on purpose' } },
    data: { emphasize: ['catalog', 'store', 'insights'], annotations: { catalog: 'Inventory entities', store: 'Bookings + payments', insights: 'Utilization rollups' } },
    business: { emphasize: ['problem', 'booking', 'sync', 'insights'], annotations: { problem: 'Double-bookings by phone', booking: 'Self-serve reservations', sync: 'Works where networks don\'t', insights: 'Utilization becomes visible' } },
  },
};

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

const FALLBACK_ID = 'operations';

/**
 * Deterministically classify arbitrary visitor input into a scenario.
 * Weighted keyword signals — transparent, inspectable, and honest about
 * why it matched. This is the Phase-1 engine; a real LLM can replace it
 * behind the same interface later (Phase 2).
 */
export function classifyIdea(input: string): ClassificationResult {
  const text = input.toLowerCase();

  const scores = Object.entries(SIGNALS).map(([id, cfg]) => {
    const matched: string[] = [];
    let score = 0;
    for (const s of cfg.signals) {
      if (s.pattern.test(text)) {
        score += s.weight;
        matched.push(s.label);
      }
    }
    return { id, score, matched };
  });

  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const hasAnySignal = best.score > 0;
  const clearWinner = best.score >= 3 && best.score >= scores[1].score + 2;

  if (!hasAnySignal || !clearWinner) {
    return {
      scenarioId: FALLBACK_ID,
      rationale: hasAnySignal
        ? 'Signals were mixed, so I resolved this to the closest operational pattern — reframe it and the system rebuilds.'
        : 'No domain signals detected, so I resolved this to a general operations pattern — the structure still adapts.',
      matchedSignals: best.matched,
    };
  }

  return {
    scenarioId: best.id,
    rationale: `Matched signals: ${[...new Set(best.matched)].join(', ')}.`,
    matchedSignals: best.matched,
  };
}

/** Resolve the generated system for a scenario id. */
export function getSystem(scenarioId: string): GeneratedSystem {
  return generatedSystems[scenarioId] ?? generatedSystems[FALLBACK_ID];
}
