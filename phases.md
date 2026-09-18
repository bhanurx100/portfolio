# Portfolio Redesign — Phase Plan

Goal: turn the current portfolio into a premium, client-attracting product experience with the **Builder Lab / Build Engine** as the flagship interactive section, and a content-truthful, native-mobile-first project narrative. Derived from a full audit of the codebase (App shell, Builder Lab engine, sections, data, config). Every phase is gated by: `npm run lint`, `npm run build`, a dev-server smoke test (port 3001), and a Hero / Projects / GitHub / Contact regression check.

## Guardrails (non-negotiable)

- **Content truth**: never display invented metrics, features, credentials, or performance claims. Anything unverifiable is either removed or explicitly labeled `Prototype / Concept`.
- **No blur-as-design**: sharp solid surfaces (`--surface-1..3`, `--text-1..4`, `--line`, `--accent` tokens). Glass/backdrop-blur only where unavoidable.
- **Mobile-first**: every new layout is designed at 393pt first, then scaled up.
- **Accessibility**: every node/cell focusable, visible label text, keyboard navigable, `prefers-reduced-motion` respected, WCAG-AA contrast.
- **Performance**: keep the dev bundle healthy (baseline JS 653.70 kB / gzip 181.15 kB as of audit); lazy-load heavy visuals; no new dependencies unless justified — **no unneeded deps**.
- **No duplicate components/folders**: reconcile `src/types/build-engine.ts` (dead draft) with `src/data/build-engine/types.ts` (live).
- **Protected**: the restored two-device Hero, Projects, GitHub, Experience, and Contact sections must keep working after every phase.
- No git commits unless explicitly requested or approved at a milestone checkpoint.

## Current state (audit snapshot, 2026-09)

- **Builder Lab is feature-complete at the code level**: `useLabMachine` reducer state machine (`IDLE → UNDERSTANDING → FORMING → READY → SIMULATING → INTERRUPTED → RESULT`) with hook-owned timers; Mode A deterministic composer (`signals.ts` → `composer.ts`) that is instant/offline, and Mode B LLM (`server/index.ts` POST `/api/interpret`, gemini-3.6-flash, Vite proxied) **verified end-to-end 2026-09 (STATUS=200, valid bundle)** with silent Mode A fallback; curated scenarios win on exact match; lenses, simulation gates, decision room, add-ons, remove effects, evidence panel all exist. Problem: the **visual/UX layer reads as dense/basic/dashboard-like**, not demo.png-level.
- **Content**: `portfolio-data.ts` positions both products as *web* platforms (Next.js/Hono/Drizzle for SplitFin; MERN for StayEase) and `personalInfo` says "web applications… React.js, Next.js". The user's chosen story is **native mobile (Expo SDK 52 / React Native, offline-first MMKV + SQLite, Supabase realtime, PostGIS map, Playwright + Maestro)** — a reparenting is required, done truthfully.
- **Dead code**: `src/types/build-engine.ts` (unused draft types), `src/components/sections/AboutSection.tsx` (not imported), `capabilityLayers`/`skillsCategories`/`skillsList` (defined, never imported), `canvas-confetti` + `@types/canvas-confetti` (no imports).
- **Nav integrity**: Header links Work / How I Build / Builder Lab / Experience / GitHub / Contact (all valid). Footer + CommandPalette may reference dead anchors (`#capabilities`, `#about`) — to verify and fix.
- **CTA problem**: StayEase/SplitFin cards link straight to GitHub + live demo; the mandated flow is "View Code / Contact me" + "Code access available on request".

## Phases

### P0 — Baseline checkpoint
- Verify `npm run lint` and `npm run build` pass on the current tree; smoke-test dev server.
- Create the recovery **checkpoint commit** of the current working tree (only on explicit approval; there is no git history in this repo).
- Exit: clean lint/build, baseline committed.

### P1 — Data truth & hygiene (no visual risk)
- `personalInfo`: refresh positioning string to the native-mobile + applied-AI story; keep name/contact/location exact; remove "web applications" leftover language; keep `resumeUrl: '#contact'`.
- Delete dead code: `src/types/build-engine.ts`, `src/components/sections/AboutSection.tsx`, unused `capabilityLayers`/`skillsCategories`/`skillsList` exports, and `canvas-confetti` deps (after grep-confirming zero imports).
- Fix dead anchors in Footer / CommandPalette / any leftover `#capabilities`/`#about` references.
- Keep `projectsData` fields but audited: no invented benchmarks (`coreMetrics`/`benchmarks` stay empty or are removed); flag check.
- Exit: lint + build green; grep shows zero dead references.

### P2 — Project narrative & CTA reposition
- Reparent StayEase and SplitFin as **native mobile products** (Expo/React Native) per the user's stated stack — honest, metric-free descriptions; web remains the secondary surface where real.
- Update `caseStudy`/`ProjectCardDesktop`/`ProjectReelMobile` category lines, taglines, and capability bullets to match.
- Change primary CTAs from bare GitHub/Live links to **"View Code → / Contact me"** with a **"Code access available on request"** note.
- Recheck Hero screens (StayEase/SplitFin) text consistency with the new narrative.
- Exit: lint + build green; no stale "web-only" or dead-demo-labelled copy remains; user verifies narrative is factually theirs.

### P3 — Builder Lab UX/visual rebuild (flagship)
Target: demo.png-quality presentation. Keep the engine untouched; rework only the presentation layer.
- **Input-first**: the Builder Lab header becomes a large, focused problem-input surface (one bold question: "What should this system do?"), not a dashboard.
- **Progressive disclosure**: casual users get event timeline + system canvas + inspector only; simulated "Run" is one obvious button; advanced users expand lenses / interaction trace / decision room / add-ons.
- **System Canvas**: larger primary canvas, sharp solid node surfaces, cleaner edges/arrows, kind-aware accents (user/interface/automation/data/integration), gap-aware traffic animation, empty/forming/ready states that tell a story.
- **Typography**: strong display hierarchy for the "what I'd build" blueprint; labels read as a systems thesis, not a log.
- Remove the dashboard feel: dedupe the simultaneous panels (add-ons strip + evidence), move secondary info behind explicit tabs.
- Exit: lint + build green; manual pass at 393 / 768 / 1280 px; reduced-motion check.

### P4 — Builder Lab experiences (depth)
- **Lenses**: verified end-to-end (Flow, Roles, Data, Risk, External) with distinct per-lens canvas and legend.
- **Idea → Production**: a compact journey strip that maps any interpreted idea to the user's honest toolchain with a real-project resonance chip.
- **Meet the Builder / tech-stack → project graph**: interactive map from stack nodes (Expo, React Native, Supabase, Postgres…, React, Node) to the projects each one powered, using live data from `portfolio-data`.
- **Agent Playground**: optional Mode-B "direct the agent" affordance (turn the AI interpretation on/off, see Mode A vs B), avoiding a chatbot feel.
- Exit: lint + build green; every new control keyboard-reachable and labelled.

### P5 — How I Build redesign
- Replace the single-column accordion with an interactive staged journey (Research → Model → Design → Build → Ship), each stage backed by a **real example** (StayEase/SplitFin evidence refs), previewing a system fragment where valuable.
- Exit: lint + build green; content matches real project stories.

### P6 — Mobile-first pass
- Audit every rebuilt surface at 393pt; Builder Lab mobile segmented control (Graph/Run/Inspect) polished; touch targets ≥ 44px; horizontal overflow removed.
- Exit: no horizontal scrolling at 320 / 393 widths; tap targets verified.

### P7 — Accessibility & performance
- Keyboard path through Builder Lab + CommandPalette; `prefers-reduced-motion` tones down canvas traffic and device swap.
- Lazy-load and code-split heavy visuals; re-measure bundle; remove unneeded deps; IL quantization check for new text nodes.
- Exit: axe-driven manual checks pass; lint + build green; bundle not regressed meaningfully.

### P8 — Final QA & delivery report
- Full `npm run lint` + `npm run build` + dev-server smoke.
- Write the delivery report: recovery performed, files changed/removed, deps changed, claims corrected, limitations (demo.png not viewable by model; live repos not auditable), and route/interaction maps.
- Exit: user walks the finished page; any P-blockers resolved.

## Verification commands
- `npm run lint` — TypeScript type check (`tsc --noEmit`).
- `npm run build` — production build (watch the >500 kB chunk warning; now clear after P7).
- `npm run dev` — dev server on port **3000** (the dev script is `vite --port=3000`; 3001 was only used while 3000 was occupied).
- `npm run server` — Mode B `/api/interpret` (needs `GEMINI_API_KEY` in `.env`; engine falls back to Mode A silently without it).

## Progress log (2026-09)

- **P0** — `570dc4f` recovery checkpoint (63 files); lint/build/dev-smoke green.
- **P1** — `570dc4f` data truth & hygiene: `personalInfo` → native-mobile + applied-AI; deleted `src/types/build-engine.ts`, `AboutSection.tsx`, `CapabilityLayer` type, `capabilityLayers`/`skillsCategories`/`skillsList`, confetti deps; Footer dead anchors fixed.
- **P2** — `6b1ed31` native-first narrative + content-truth CTAs (View Code / Contact me + code-access note) across projects, case study, data.
- **P3** — `6b1ed31` Builder Lab presentation polish (terminal-style idea input, Run CTA, editorial header, SYSTEM BLUEPRINT frame, earned evidence strip).
- **P4** — `445033b` Idea→Production journey strip in the Lab (domain-matched, project resonance) + interactive stack→project map. Agent Playground deferred (chatbot-feel guardrail).
- **P5** — `445033b` How I Build: tabbed staged journey kept (already interactive), stale "live builds" copy corrected, closing toolchain map added.
- **P6** — `a9c67e3` mobile pass at 393pt: audit found no horizontal overflow (GlobalBackground contained, GitHub graph `overflow-x-auto`, all grids collapse); header drawer email truncated.
- **P7** — `8a30842` code-split `GitHubSection`, `CommandPalette`, `CaseStudyModal` → main chunk 526 kB → **485.73 kB** (under the 500 kB warning); global `:focus-visible` + `prefers-reduced-motion` confirmed.
- **P8** — lint + build + dev smoke green (STATUS=200, "Builder Lab" present); this report. Remaining user action: walk the page; `demo.png` still not viewable by the model and live repos not independently auditable.

## Follow-ups (post-P8, user-requested)
- Removed the "tech stack behind the work" map from How I Build; redesigned How I Build as an **agent run** (run strip + plan with done/running/queued states + output card with goal/actions/artifact), dark-neon accents from measured demo.png pixels (near-black canvas, blue/cyan glow).
- Rebuilt the SplitFin demo: orbit of who owes you, tap-to-inspect **donut cashflow**, transaction feed with category filters, split composer (equal/custom + live math + request sheet). Home fits without scrolling.
- New shared `deviceTheme.ts` palette fixes device legibility (dark text was washing out, light text was dull); bumped in-device type sizes.
- Hero: removed the "Available for Full-Stack & Frontend Engineering Roles" pill row (desktop + mobile) so the headline sits higher; devices shortened (248/228pt wide).
- Builder Lab: dark-mode neon glow on the blueprint frame (desktop + mobile), terminal input, and kicker dot — light mode untouched.