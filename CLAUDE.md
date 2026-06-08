# Tone — Development Guidelines

## Project Overview

Tone is a calm AI navigator for workplace social situations. It helps newcomers and anxious people
figure out how to act in everyday work moments — whether to send a follow-up, introduce themselves in
a busy channel, re-ask a manager, how not to seem pushy (or, the other way, passive). The user arrives
with a knot of worry; they should leave with calm clarity. Light-only, low-stimulation, "experienced
colleague" tone.

- **Stage:** pre-launch — design implemented as a working client-side app; AI/RAG backend parked for later
- **Audience:** newcomers and anxious people navigating workplace social moments
- **Monetization:** none yet

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Vite + React 18 | client-side SPA, static build |
| Language | TypeScript (strict) | |
| Styling | Hand-authored CSS design tokens — the **Tone design system** (`src/styles/`) | no Tailwind, no CSS-in-JS |
| State | React local state + `localStorage` | `src/lib/storage.ts` |
| Database | none (localStorage only) | |
| Auth | none | |
| AI | Optional **BYOK** — user's own Gemini / OpenAI / Anthropic key, called client-side (`src/lib/ai/`); calm canned engine (`src/lib/scenarios.ts`) is the no-key default + fallback | RAG/server still parked |
| Payments | none | |
| Monitoring | none | |
| Hosting | none yet — GitHub repo only; deploy is a later, free step | static `dist/` builds anywhere |

> This table is the source of truth for the stack. If it changes, update it in the same commit.

## Project Structure

```
src/
  main.tsx            # entry — mounts <App>, imports the design system CSS
  App.tsx             # app shell: rail nav + state-driven screen routing
  index.css           # design-system entry (@imports tokens + base + components)
  styles/             # the Tone design system (tokens/, base.css, components.css)
  lib/                # icons, avatars, scenarios, org helpers, storage, history, types
    ai/               # BYOK: settings, providers (Gemini/OpenAI/Anthropic), advisor (+canned fallback)
  components/         # small shared UI (Thinking, ReadingStrip, ErrorBoundary)
  features/
    ask/              # Home + InlineClarify (the Claude-Code-style centerpiece)
    answer/           # AnswerView + AdviceCard (safe move, tilt meter, risks, rethink)
    company/          # CompanyTab (org tree, personas, modals, structure dropdown)
    history/          # History
    settings/         # SettingsView — the "Your AI" (bring-your-own-key) screen
  test/               # vitest setup
docs/                 # all project documentation (Markdown)
public/               # static assets (logo.svg)
```

## How we work (orchestration)

The main session is the **orchestrator**: understands the task, decides scope, delegates, reviews,
reports. Two sub-agents live in `.claude/agents/`:

- **implementer** — writes code AND verifies it (lint, typecheck, tests, build). Use for all code changes.
- **reviewer** — read-only quality gate after changes. Use for anything touching data or user input.

Small change (<15 lines, 1–2 files) → just do it and verify yourself.
Bigger/riskier change → implementer, then reviewer, then synthesize.

## Communication style

The founder is **non-technical**. In every report:

- Plain language, lead with the result. No file paths or jargon unless asked.
- Explain changes in terms of what the user will SEE, not what code changed.
- Brief: what changed, anything to know, build/run status.
- The founder prefers discussion in Russian / Ukrainian — mirror the language they write in.

## Design fidelity (this project's core rule)

The UI is a faithful port of the **Tone design system** (a from-scratch system the founder authored in
Claude Design). The class names and CSS in `src/styles/` are lifted verbatim from that system. When
changing UI: reuse the existing classes and tokens — do not invent new colors, type, spacing, or
shadows outside `src/styles/tokens/`. One muted periwinkle accent, one sage support hue, a warm ink
ladder. Sentence case everywhere. No emoji in product chrome (only inside a drafted message).

## Confirm before irreversible

Just do reversible code/UI/copy changes. **Confirm first** for: anything that spends money, deletes or
renames user data, or changes a public/auth flow. Quote the exact action, get a yes, then proceed.

## Never fabricate status

"Build passed", "tests pass", "it works" — only after the action actually ran this session and you saw
the result. If a step was skipped or unverified, say so plainly. An honest "not verified" beats a
fabricated "done".

## Definition of Done

- [ ] `npm run typecheck` clean (`tsc --noEmit`, no new errors)
- [ ] `npm run lint` — no new errors
- [ ] `npm test` green (`vitest run`)
- [ ] `npm run build` succeeds
- [ ] UI changes visually verified (`npm run dev` and look)
- [ ] Committed (push once a GitHub remote exists)
- [ ] Founder informed in plain language
- [ ] `docs/STATUS.md` reflects the new state (phase / done / next)
- [ ] Docs updated in the same commit if the change made any doc inaccurate

## Docs trail reality

`CLAUDE.md` and `docs/` describe **what is shipped and working now** — not plans. Don't document a
feature/vendor before it's actually in the code. Plans go in `docs/PLANS.md`.

## Living status (where "current state" lives)

This file (`CLAUDE.md`) holds the **stable rules** and changes rarely. The **current phase, what's
done, and what's next** live in `docs/STATUS.md`.

- Keep volatile progress/state OUT of `CLAUDE.md` (editing it invalidates the prompt cache).
- A Stop hook (`.claude/hooks/freshness-guard.mjs`) reminds you to update `docs/STATUS.md` whenever
  code changed but the status didn't.
- Update `CLAUDE.md` only when the **stack or the workflow itself** changes (then update the table above).

## Project-specific rules

<!-- Grow this section over time, or via dedicated skills (security, i18n, etc.).
     Keep the core above lightweight. -->

- Intelligence is **hybrid**: a calm **canned** engine (`src/lib/scenarios.ts`) is the zero-setup
  default, and an optional **bring-your-own-key** path (`src/lib/ai/`) calls the user's chosen LLM
  directly from the browser. The key lives only in `localStorage` and is never sent anywhere but the
  provider. Everything resolves to the same `Advice` shape, so the UI never changes — a future
  RAG/server backend would slot in behind the same interface.
