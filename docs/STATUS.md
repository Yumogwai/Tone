# Tone — Project Status

> **Living state file.** CLAUDE.md holds the stable *rules*; this file holds *what's happening right
> now*. Safe to edit as often as needed — it does NOT live in the cached prompt header. A Stop hook
> reminds Claude to keep this fresh whenever code changes (`.claude/hooks/freshness-guard.mjs`).

**Current phase:** Hybrid AI shipped (BYOK + canned fallback) · CI + gitleaks green · public on GitHub · not deployed
**Last updated:** 2026-06-12

> Repo: https://github.com/Yumogwai/tone (public). CI (lint+typecheck+test+build) and gitleaks
> secret-scanning run on every push/PR and are passing.
> **Update (2026-06-12):** the repo is now **public**. A security pass on going public found no leaks —
> full git history clean of secrets and of the personal email; BYOK keys only ever go to the official
> provider endpoints. Branch protection on `main` is now free but **not yet enabled** — flip it on in
> GitHub Settings (block force-pushes + require the CI and Security checks), and enable the free
> Dependabot alerts + secret-scanning push protection while there.

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

## 🔨 In progress
- (nothing active)

## ⏭️ Next
- Enable branch protection on `main` + the free security toggles (Dependabot alerts, secret-scanning
  push protection) — a few clicks in GitHub Settings.
- Optional: deploy the static `dist/` (GitHub Pages / Vercel / Netlify — all free).
- Product follow-ups: see `docs/PLANS.md`.

## ❓ Open decisions / parking lot
- **Server-side AI / RAG** — still parked. Client-side BYOK now covers "real AI, free for us"; a hosted
  backend with per-user RAG memory is the bigger future step (`src/lib/ai/advisor.ts` is the seam).
- Persona "character" notes are captured in the data model but not yet expanded into individualized
  advice text (waits on the real model).
- Hosting target not chosen yet (no deploy needed at this stage).
