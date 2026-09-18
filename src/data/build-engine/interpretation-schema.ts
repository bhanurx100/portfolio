/**
 * Builder Lab — Interpretation Schema (Mode B validation)
 *
 * The LLM never writes UI. It returns a SignalBundle — the same shape Mode A
 * extracts with regex — which is validated here before it may touch the
 * composer. Anything invalid is rejected wholesale and the client falls back
 * to the deterministic extractor. No partial trust.
 */

import type { SignalBundle } from './signals';

const VERBS: SignalBundle['primaryVerb'][] = ['manage', 'process', 'track', 'qualify', 'book', 'settle', 'support'];
const DOMAINS: SignalBundle['domain'][] = ['support', 'finance', 'operations', 'logistics', 'knowledge'];
const CHANNEL_IDS = ['voice', 'whatsapp', 'chat', 'email', 'form', 'sms', 'app'];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

function asStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isStr).map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= 80).slice(0, max);
}

function asChannelList(v: unknown): { id: string; label: string }[] {
  if (!Array.isArray(v)) return [];
  const out: { id: string; label: string }[] = [];
  for (const item of v) {
    if (!isObj(item)) continue;
    const id = item.id;
    const label = item.label;
    if (isStr(id) && CHANNEL_IDS.includes(id) && isStr(label) && label.trim().length > 0) {
      out.push({ id, label: label.trim().slice(0, 40) });
    }
  }
  // De-duplicate by id.
  return [...new Map(out.map((c) => [c.id, c])).values()].slice(0, 3);
}

/**
 * Validate an unknown payload as a SignalBundle. Returns null on any
 * structural violation — the caller must fall back to Mode A.
 */
export function validateSignalBundle(raw: unknown): SignalBundle | null {
  if (!isObj(raw)) return null;

  const entityRaw = raw.entity;
  if (!isObj(entityRaw)) return null;
  const { id: entId, label: entLabel, pluralLabel: entPlural } = entityRaw;
  if (!isStr(entId) || !/^[a-z][a-z0-9_-]{0,30}$/.test(entId)) return null;
  if (!isStr(entLabel) || entLabel.trim().length === 0 || entLabel.length > 40) return null;
  if (!isStr(entPlural) || entPlural.trim().length === 0 || entPlural.length > 40) return null;

  const modifiersRaw = raw.modifiers;
  if (!isObj(modifiersRaw)) return null;
  const m = modifiersRaw;
  const modifiers = {
    humanGate: isBool(m.humanGate) ? m.humanGate : false,
    aiAgent: isBool(m.aiAgent) ? m.aiAgent : false,
    multiChannel: isBool(m.multiChannel) ? m.multiChannel : false,
    offline: isBool(m.offline) ? m.offline : false,
    payments: isBool(m.payments) ? m.payments : false,
    analytics: isBool(m.analytics) ? m.analytics : false,
  };

  const primaryVerb = raw.primaryVerb;
  if (!isStr(primaryVerb) || !VERBS.includes(primaryVerb as SignalBundle['primaryVerb'])) return null;

  const domain = raw.domain;
  if (!isStr(domain) || !DOMAINS.includes(domain as SignalBundle['domain'])) return null;

  const channels = asChannelList(raw.channels);
  const pains = asStringArray(raw.pains, 3);
  const matchedSignals = asStringArray(raw.matchedSignals, 8);

  return {
    entity: { id: entId, label: entLabel.trim(), pluralLabel: entPlural.trim() },
    channels,
    pains,
    primaryVerb: primaryVerb as SignalBundle['primaryVerb'],
    modifiers,
    domain: domain as SignalBundle['domain'],
    matchedSignals,
  };
}
