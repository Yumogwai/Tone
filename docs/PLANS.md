# Tone — Plans (future / aspirational)

> Keep this separate from shipped reality. Nothing here is built yet.

## Backend / AI
- Replace the canned scenario engine (`src/lib/scenarios.ts`) with a real model call (RAG over the
  user's accumulated context). The UI and types stay the same — `scenarios.ts` is the only swap point.
- Per-user context store (the "RAG as per-user storage" idea from the design brief).
- Expand persona "character" notes into individualized advice wording (data is already captured).
- Detect specific *people* (not only teams) from the chat and offer to add them to the map.
- Let clarifying questions reference a specific person from the company map.

## Product
- Accounts + sync (so history/map aren't tied to one browser's localStorage).
- Let the user reference a specific person directly inside the inline clarify panel.

## Ops (when ready)
- ✅ Pushed to GitHub: https://github.com/Beablod/tone (private). CI + gitleaks run on every push.
- **Go public + enable branch protection** — planned for when the product is genuinely ready. The
  switch to public is the trigger: branch protection on `main` (require PR + passing CI + gitleaks) is
  free once the repo is public, so enable it in the same step. Staying private until then.
- Deploy the static build (GitHub Pages / Vercel / Netlify — all free).
- Analytics once there's a public URL.
