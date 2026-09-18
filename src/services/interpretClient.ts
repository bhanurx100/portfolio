/**
 * Builder Lab — Interpretation Client (Mode B)
 *
 * Attempts AI interpretation through the server endpoint; on any failure
 * (no server, no key, timeout, invalid output) it silently falls back to the
 * deterministic extractor. Mode A is the floor — Mode B only ever makes the
 * understanding better, never blocks the experience.
 */

import { composeSystem, interpretIdea } from '../data/build-engine/composer';
import type { Interpretation } from '../data/build-engine/composer';

const ENDPOINT = '/api/interpret';
const TIMEOUT_MS = 6000;
const MAX_INPUT = 280;

/**
 * Interpret an arbitrary idea with Mode B-first, Mode A-fallback semantics.
 * Returns the same Interpretation shape the machine already consumes.
 */
export async function interpretWithFallback(idea: string): Promise<Interpretation & { mode: 'A' | 'B' }> {
  const trimmed = idea.trim();
  if (!trimmed || trimmed.length > MAX_INPUT) {
    return { ...interpretationFromModeA(trimmed), mode: 'A' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: trimmed }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`interpret endpoint ${res.status}`);

    const data: unknown = await res.json();
    const bundle = (data as { bundle?: unknown })?.bundle;
    if (!bundle) throw new Error('missing bundle');

    // Validated server-side, re-validated client-side — never trust the wire.
    const { validateSignalBundle } = await import('../data/build-engine/interpretation-schema');
    const safe = validateSignalBundle(bundle);
    if (!safe) throw new Error('invalid bundle');

    const system = composeSystem(trimmed, safe);
    return {
      system,
      rationale: `Interpreted by AI: ${safe.entity.pluralLabel.toLowerCase()} · ${
        safe.channels.length > 0 ? safe.channels.map((c) => c.label.toLowerCase()).join(' + ') : 'no explicit channel'
      }${safe.pains.length > 0 ? ` · ${safe.pains.join(', ')}` : ''}.`,
      matchedSignals: safe.matchedSignals,
      curated: false,
      mode: 'B',
    };
  } catch {
    return { ...interpretationFromModeA(trimmed), mode: 'A' };
  }
}

/**
 * Mode A: curated featured scenarios win on a strong signal match (the
 * suggestion chips land here); everything else is composed from the
 * visitor's own extracted signals.
 */
function interpretationFromModeA(idea: string): Interpretation {
  return interpretIdea(idea);
}
