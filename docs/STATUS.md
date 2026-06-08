# Tone — Project Status

> **Living state file.** CLAUDE.md holds the stable *rules*; this file holds *what's happening right
> now*. Safe to edit as often as needed — it does NOT live in the cached prompt header. A Stop hook
> reminds Claude to keep this fresh whenever code changes (`.claude/hooks/freshness-guard.mjs`).

**Current phase:** Live on GitHub (private) · CI green · branch-protected · not deployed
**Last updated:** 2026-06-08

> Repo: https://github.com/Beablod/tone (private). `main` requires a PR + passing CI + gitleaks.

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

## 🔨 In progress
- (nothing active)

## ⏭️ Next
- Push to a GitHub repo (free) when ready — `gh repo create`.
- Optional: deploy the static `dist/` (GitHub Pages / Vercel / Netlify — all free).
- Product follow-ups: see `docs/PLANS.md`.

## ❓ Open decisions / parking lot
- **AI/RAG backend** — parked. The canned scenario engine (`src/lib/scenarios.ts`) is the swap point.
- Persona "character" notes are captured in the data model but not yet expanded into individualized
  advice text (waits on the real model).
- Hosting target not chosen yet (no deploy needed at this stage).
