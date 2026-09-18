/**
 * Builder Lab — Interpret Endpoint (Mode B)
 *
 * Browser → this server → LLM → validated SignalBundle → composer.
 * The LLM acts as a system interpreter: it maps the visitor's arbitrary
 * business problem onto a strict schema. It never writes UI text, and the
 * API key never leaves the server. Any invalid or missing response falls
 * back to Mode A on the client.
 *
 * The endpoint is dependency-light on purpose: if the key is absent the
 * route returns 503 and the client silently uses the deterministic engine.
 */

import 'dotenv/config';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { validateSignalBundle } from '../src/data/build-engine/interpretation-schema';

const app = express();
app.use(express.json({ limit: '16kb' }));

const MODEL = 'gemini-3.6-flash';

/* ------------------------------------------------------------------ */
/* Prompt — interpreter, not chatbot                                   */
/* ------------------------------------------------------------------ */

const SYSTEM_INSTRUCTION = `You are a system interpreter inside an interactive product-engineering demo.
The visitor describes a business problem in one or two sentences. Your only job is to extract
STRUCTURED SIGNALS from their text. You do not chat, you do not give advice, you do not write UI.

Return JSON with exactly this shape:
{
  "entity": { "id": "snake_case_id", "label": "SingularLabel", "pluralLabel": "PluralLabel" },
  "channels": [{ "id": "voice|whatsapp|chat|email|form|sms|app", "label": "Short label" }],
  "pains": ["short pain phrase", "..."],
  "primaryVerb": "manage|process|track|qualify|book|settle|support",
  "domain": "support|finance|operations|logistics|knowledge",
  "modifiers": {
    "humanGate": false,   // true ONLY if the input implies a human must approve/confirm actions
    "aiAgent": false,     // true if the input mentions AI/agents/automation intent
    "multiChannel": false,
    "offline": false,     // true if offline/no-signal context is mentioned
    "payments": false,    // true if collecting money is part of the workflow
    "analytics": false    // true if reporting/insights/visibility is mentioned
  },
  "matchedSignals": ["human-readable", "signals", "you found"]
}

Rules:
- entity: the core thing being managed/processed/tracked. If unclear, use id "request", label "Request".
- channels: only channels actually present in the text; [] if none.
- pains: short phrases (<= 6 words) from the visitor's own words.
- primaryVerb: the visitor's dominant action verb, mapped to the closest enum value — sales/lead/follow-up/reminder ideas are "qualify", service/help/reply ideas are "support", money-splitting/collecting is "settle".
- domain discipline: sales/leads/CRM/support/ticket ideas are "support"; invoices/bills/expenses/payments are "finance"; property/stay/booking/appointment ideas are "operations"; stock/warehouse/delivery/field-team ideas are "logistics"; documents/contracts/resume/policy ideas are "knowledge". Use "operations" only for inventory/property/booking/logistics ideas, never as a default.
- Never invent business metrics, users, revenue, or outcomes.
- Output ONLY the JSON object.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entity: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        label: { type: Type.STRING },
        pluralLabel: { type: Type.STRING },
      },
      required: ['id', 'label', 'pluralLabel'],
    },
    channels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { id: { type: Type.STRING }, label: { type: Type.STRING } },
      },
    },
    pains: { type: Type.ARRAY, items: { type: Type.STRING } },
    primaryVerb: { type: Type.STRING },
    domain: { type: Type.STRING },
    modifiers: {
      type: Type.OBJECT,
      properties: {
        humanGate: { type: Type.BOOLEAN },
        aiAgent: { type: Type.BOOLEAN },
        multiChannel: { type: Type.BOOLEAN },
        offline: { type: Type.BOOLEAN },
        payments: { type: Type.BOOLEAN },
        analytics: { type: Type.BOOLEAN },
      },
    },
    matchedSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['entity', 'channels', 'pains', 'primaryVerb', 'domain', 'modifiers', 'matchedSignals'],
} as const;

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

const MAX_INPUT = 280;

app.post('/api/interpret', async (req: express.Request, res: express.Response) => {
  const idea = typeof req.body?.idea === 'string' ? req.body.idea.trim() : '';
  if (!idea) {
    res.status(400).json({ error: 'missing idea' });
    return;
  }
  if (idea.length > MAX_INPUT) {
    res.status(400).json({ error: 'idea too long' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'interpretation service unavailable' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: idea,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.2,
      },
    });

    const text = response.text ?? '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(502).json({ error: 'invalid model output' });
      return;
    }

    const bundle = validateSignalBundle(parsed);
    if (!bundle) {
      res.status(502).json({ error: 'invalid model output' });
      return;
    }

    res.json({ bundle });
  } catch (err) {
    console.error('interpret error:', err instanceof Error ? err.message : err);
    res.status(502).json({ error: 'interpretation failed' });
  }
});

export default app;

/* ------------------------------------------------------------------ */
/* Standalone boot — `npm run server`. Skipped when imported (tests).  */
/* ------------------------------------------------------------------ */

if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.INTERPRET_PORT ?? 4000);
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[builder-lab] interpret server listening on 127.0.0.1:${PORT}`);
  });
}
