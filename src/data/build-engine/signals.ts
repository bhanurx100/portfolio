/**
 * Builder Lab — Signal Extraction
 *
 * Parses arbitrary visitor input into structured signals: the domain entities,
 * channels, pains, and modifiers the visitor actually mentioned. This is the
 * honest part of "the system responds to YOUR idea": the composed system is
 * built from what was said, not from picking a canned scenario.
 *
 * Deliberately regex-based (Mode A: zero dependencies, instant, inspectable).
 * Mode B (LLM) produces the same SignalBundle shape behind the same interface.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface DetectedChannel {
  id: string;
  label: string;
}

export interface SignalBundle {
  /** Primary entity being managed/processed/monitored. */
  entity: { id: string; label: string; pluralLabel: string };
  /** Intake channels present in the input. */
  channels: DetectedChannel[];
  /** Pain phrases the visitor mentioned, kept verbatim-ish for the problem statement. */
  pains: string[];
  /** Primary verb the visitor used for their own role/action. */
  primaryVerb: 'manage' | 'process' | 'track' | 'qualify' | 'book' | 'settle' | 'support';
  /** Modifiers that change the composed system. */
  modifiers: {
    humanGate: boolean;
    aiAgent: boolean;
    multiChannel: boolean;
    offline: boolean;
    payments: boolean;
    analytics: boolean;
  };
  /** Domain classification (used for evidence + domain-tagged fallback shapes). */
  domain: 'support' | 'finance' | 'operations' | 'logistics' | 'knowledge';
  /** Human-readable signals for the understanding banner. */
  matchedSignals: string[];
}

/* ------------------------------------------------------------------ */
/* Signal tables                                                       */
/* ------------------------------------------------------------------ */

const ENTITY_TABLE: { pattern: RegExp; id: string; label: string; pluralLabel: string; domain: SignalBundle['domain'] }[] = [
  { pattern: /\b(lead|leads|prospect|prospects)\b/i, id: 'lead', label: 'Lead', pluralLabel: 'Leads', domain: 'support' },
  { pattern: /\b(ticket|tickets)\b/i, id: 'ticket', label: 'Ticket', pluralLabel: 'Tickets', domain: 'support' },
  { pattern: /\b(invoice|invoices|bill|bills)\b/i, id: 'invoice', label: 'Invoice', pluralLabel: 'Invoices', domain: 'finance' },
  { pattern: /\b(expense|expenses|payment|payments|settle|settlement)\b/i, id: 'expense', label: 'Expense', pluralLabel: 'Expenses', domain: 'finance' },
  { pattern: /\b(pg|pgs|hostel|hostels|property|properties|listing|listings|stay|stays|booking|bookings|reservation|reservations|hotel|hotels|room|rooms|unit|units)\b/i, id: 'unit', label: 'Unit', pluralLabel: 'Units', domain: 'operations' },
  { pattern: /\b(order|orders|shipment|shipments|inventory|stock|warehouse|field teams?|delivery|deliveries)\b/i, id: 'order', label: 'Order', pluralLabel: 'Orders', domain: 'logistics' },
  { pattern: /\b(document|documents|contract|contracts|resume|resumes|resume screening|policy|policies)\b/i, id: 'document', label: 'Document', pluralLabel: 'Documents', domain: 'knowledge' },
  { pattern: /\b(patient|patients|appointment|appointments|clinic|clinics)\b/i, id: 'appointment', label: 'Appointment', pluralLabel: 'Appointments', domain: 'operations' },
  { pattern: /\b(customer|customers|client|clients)\b/i, id: 'customer', label: 'Customer', pluralLabel: 'Customers', domain: 'support' },
];

const CHANNEL_TABLE: { pattern: RegExp; id: string; label: string }[] = [
  { pattern: /\b(voice|calls?|calling|phone)\b/i, id: 'voice', label: 'Voice / Calls' },
  { pattern: /\b(whatsapp)\b/i, id: 'whatsapp', label: 'WhatsApp' },
  { pattern: /\b(chat|live chat|chatbot|messenger)\b/i, id: 'chat', label: 'Chat' },
  { pattern: /\b(email|emails|inbox|mail)\b/i, id: 'email', label: 'Email' },
  { pattern: /\b(form|forms|web form|submission|submissions)\b/i, id: 'form', label: 'Web Form' },
  { pattern: /\b(sms|text message|text messages)\b/i, id: 'sms', label: 'SMS' },
  { pattern: /\b(app|mobile app|in-?person|walk-?in|onsite|field)\b/i, id: 'app', label: 'Mobile App' },
];

const PAIN_TABLE: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(manual|manually|by hand|re-?typing|re-?enter|re-?entering|data entry)\b/i, label: 'manual entry' },
  { pattern: /\b(same questions|repetitive questions|repeated questions|faq)\b/i, label: 'repetitive questions' },
  { pattern: /\b(slip|slips|slipped|fall through the cracks|missed follow-?ups?|forgotten)\b/i, label: 'follow-ups slip' },
  { pattern: /\b(spreadsheet|spreadsheets|excel|sheets)\b/i, label: 'spreadsheet chaos' },
  { pattern: /\b(double-?book|double-?booked|conflict|conflicts|overbook)\b/i, label: 'booking conflicts' },
  { pattern: /\b(error|errors|error-?prone|mistake|mistakes|wrong entries?)\b/i, label: 'error-prone' },
  { pattern: /\b(slow|delay|delays|late|lag|backlog|backlogged)\b/i, label: 'slow turnaround' },
  { pattern: /\b(no visibility|no track|lost track|invisible|unclear|scattered)\b/i, label: 'no visibility' },
  { pattern: /\b(scale|scaling|too many|volume|bursts?\b)/i, label: 'volume pressure' },
];

const VERB_TABLE: { pattern: RegExp; verb: SignalBundle['primaryVerb'] }[] = [
  { pattern: /\b(qualif(y|ies|ying|ication))\b/i, verb: 'qualify' },
  { pattern: /\b(book|booking|reserve|reserv(e|ing|ation))\b/i, verb: 'book' },
  { pattern: /\b(settle|settlement|split|splitting)\b/i, verb: 'settle' },
  { pattern: /\b(support|help|respond|response)\b/i, verb: 'support' },
  { pattern: /\b(process|processing|intake|parse|extract)\b/i, verb: 'process' },
  { pattern: /\b(track|tracking|monitor)\b/i, verb: 'track' },
  { pattern: /\b(manage|managing|management|run|operate|operating)\b/i, verb: 'manage' },
];

/* ------------------------------------------------------------------ */
/* Extraction                                                          */
/* ------------------------------------------------------------------ */

export function extractSignals(input: string): SignalBundle {
  const text = input.toLowerCase();

  /* Entity — first table hit wins (most specific first). */
  const entityHit = ENTITY_TABLE.find((e) => e.pattern.test(text));
  const entity = entityHit
    ? { id: entityHit.id, label: entityHit.label, pluralLabel: entityHit.pluralLabel }
    : { id: 'request', label: 'Request', pluralLabel: 'Requests' };

  /* Channels — all hits, capped at 3. */
  const channels = CHANNEL_TABLE.filter((c) => c.pattern.test(text))
    .slice(0, 3)
    .map((c) => ({ id: c.id, label: c.label }));

  /* Pains — unique labels, capped at 3. */
  const pains = [...new Set(PAIN_TABLE.filter((p) => p.pattern.test(text)).map((p) => p.label))].slice(0, 3);

  /* Verb — first hit wins. */
  const primaryVerb = (VERB_TABLE.find((v) => v.pattern.test(text))?.verb ?? 'manage');

  /* Modifiers. */
  const modifiers = {
    humanGate: /\b(approv(e|al|als)|before any|human (confirm|review|approval)|sign-?off)\b/i.test(text),
    aiAgent: /\b(agent|ai|automat(e|ic|ically|ion)|intelligen(t|ce)|llm|bot)\b/i.test(text),
    multiChannel: channels.length > 1,
    offline: /\b(offline|no signal|elevator|dead zone|without internet|patchy)\b/i.test(text),
    payments: /\b(payment|payments|deposit|deposits|stripe|upi|checkout|pay)\b/i.test(text),
    analytics: /\b(report|reports|insight|insights|dashboard|metric|metrics|analytics|visibility)\b/i.test(text),
  };

  const domain = entityHit?.domain ?? 'operations';

  /* Human-readable matched signals. */
  const matchedSignals: string[] = [];
  if (entityHit) matchedSignals.push(`entity: ${entityHit.label.toLowerCase()}s`);
  for (const c of channels) matchedSignals.push(`channel: ${c.label.toLowerCase()}`);
  for (const p of pains) matchedSignals.push(`pain: ${p}`);
  if (modifiers.humanGate) matchedSignals.push('modifier: human approval');
  if (modifiers.aiAgent) matchedSignals.push('modifier: automation intent');
  if (modifiers.offline) matchedSignals.push('modifier: offline context');
  if (modifiers.payments) matchedSignals.push('modifier: payments');
  if (modifiers.analytics) matchedSignals.push('modifier: reporting');

  return { entity, channels, pains, primaryVerb, modifiers, domain, matchedSignals };
}
