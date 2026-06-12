# Tone — Project Status

> **Living state file.** CLAUDE.md holds the stable *rules*; this file holds *what's happening right
> now*. Safe to edit as often as needed — it does NOT live in the cached prompt header. A Stop hook
> reminds Claude to keep this fresh whenever code changes (`.claude/hooks/freshness-guard.mjs`).

**Current phase:** Hybrid AI shipped (BYOK + canned fallback) · CI + gitleaks green · public on GitHub · not deployed
**Last updated:** 2026-06-12

> Repo: https://github.com/Yumogwai/tone (public). CI (lint+typecheck+test+build) and gitleaks
> secret-scanning run on every push/PR and are passing.
> **Branch ruleset on `main` created (2026-06-12), enforcement being finalized:** a test direct push
> still landed afterwards, so the ruleset isn't blocking yet — re-check in Settings → Rules: Enforcement
> status = Active, target = default branch, plus the "Require a pull request" and "Require status
> checks" (ci, Detect secrets) boxes. Advanced Security (verified 2026-06-12): Dependabot alerts,
> security updates, malware alerts, secret scanning and **push protection** are all enabled. Optional
> remaining toggle: **CodeQL** code scanning (Set up → Default).

## ✅ Done
- Scaffolded Vite + React 18 + TypeScript (strict) project, client-side only.
- Ported the **Tone design system** verbatim into `src/styles/` (tokens, base canvas, component layer).
- Ported the full prototype (`ui_kits/tone/index.html`) to typed React: ask flow, the inline
  Claude-Code-style clarify panel, the "safe move" answer (tilt meter + risk balance + copyable draft),
  the rethink/reconsider thread, the Company map (org tree, 16 personas, modals, structure dropdown),
  and History — all persisted to `localStorage`.
- Wired the project system from the New Project Template: `CLAUDE.md`, `docs/`, `.claude/` hooks +
  implementer/reviewer agents, `.github/workflows` (CI + gitleaks), `.gitignore`/`.gitattributes`/
  `.env.example`/`.mcp.json`.
- Unit tests (scenario engine) + a render smoke test (Vitest + Testing Library).
- Pre-public hardening: MIT `LICENSE`, **self-hosted fonts** (no Google-CDN call / no IP leak),
  an in-UI privacy note, a top-level error boundary, OG/social + theme-color meta, and the personal
  email scrubbed from all git history (commits now use a GitHub noreply address).
- **Hybrid AI (bring-your-own-key):** a new "Your AI" screen (`src/features/settings/`) lets a user add
  their own Gemini / OpenAI / Anthropic key — stored only in their browser, calls go straight to the
  provider, never through us. When set, Tone uses the real model for the safe move + the rethink;
  otherwise the calm canned engine runs. Graceful fallback on any error, the key is redacted from error
  text, reviewer-approved (APPROVE WITH NITS, nits fixed). Lives in `src/lib/ai/`. 30 tests green.
- **Public-release pass (2026-06-12):** repo public at github.com/Yumogwai/tone; LICENSE/README switched
  from the real name to the **Yumogwai** pseudonym (the name still exists in older commits — full removal
  would need a history rewrite); docs point at the public address; the implementer/reviewer sub-agents
  moved from Opus to **Sonnet** (cheaper); BYOK Anthropic default replaced — `claude-3-5-haiku-latest`
  was retired by Anthropic in Feb 2026 — with `claude-haiku-4-5` (their cheapest current model).
- **Dev-toolchain security bump (2026-06-12):** right after going public, Dependabot flagged dev-only
  vulnerabilities (1 critical, in vitest); production deps were clean. Upgraded Vite 5→8, Vitest 2→4,
  plugin-react 4→6 — `npm audit` now reports 0 vulnerabilities; 30/30 tests + build green on the new
  toolchain.
- **Went public + security pass (2026-06-12):** full git history verified clean of secrets and of the
  personal email; BYOK keys only ever go to the official provider endpoints. Founder created a branch
  ruleset on `main` (enforcement being finalized — see the note above).

## 🔨 In progress
- (nothing active)

## ⏭️ Next
- Optional: set up **CodeQL** code scanning (Settings → Advanced Security → Code scanning → Set up →
  Default) — free static analysis on every push.
- Optional: deploy the static `dist/` (GitHub Pages / Vercel / Netlify — all free).
- Product follow-ups: see `docs/PLANS.md`.

## ❓ Open decisions / parking lot
- **Server-side AI / RAG** — still parked. Client-side BYOK now covers "real AI, free for us"; a hosted
  backend with per-user RAG memory is the bigger future step (`src/lib/ai/advisor.ts` is the seam).
- Persona "character" notes are captured in the data model but not yet expanded into individualized
  advice text (waits on the real model).
- Hosting target not chosen yet (no deploy needed at this stage).
