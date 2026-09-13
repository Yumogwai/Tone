# Tone

> _A quiet guide for the moments you overthink at work._

Tone is a calm AI navigator for workplace social situations — it helps newcomers and anxious people
figure out how to act in everyday work moments (whether to follow up, how to introduce themselves,
how to re-ask a manager without looking dumb) and hands back one clear, calibrated "safe move."

This repo is a faithful implementation of the **Tone design system** as a working app: Vite + React +
TypeScript, client-side, light-only.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server (hot reload) |
| `npm run build` | Type-check, then build the static site to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run unit + smoke tests (Vitest) |

## What's inside

- **The app** (`src/`) — the ask → inline clarify → safe move flow, the rethink thread, the Company map
  (org tree + 16 personas), and History. State is in React + `localStorage`.
- **The Tone design system** (`src/styles/`) — tokens (colors / typography / spacing), the base canvas,
  and the component class layer. One muted periwinkle accent, one sage support hue, a warm ink ladder.
- **Docs** (`docs/`) — start at [`docs/INDEX.md`](docs/INDEX.md). Current state lives in
  [`docs/STATUS.md`](docs/STATUS.md); product detail in [`docs/PRODUCT.md`](docs/PRODUCT.md).

## Notes

- **Intelligence is hybrid.** By default Tone uses a calm, hand-authored scenario engine
  (`src/lib/scenarios.ts`) — no setup, no key, nothing leaves the browser. Add your own
  Gemini / OpenAI / Anthropic key under **"Your AI"** (`src/lib/ai/`) and Tone uses the real model
  instead, calling the provider directly from your browser — the key only ever lives in your
  browser's storage. A hosted / RAG backend is still a future step.
- No deployment is set up yet (not needed at this stage). The build output in `dist/` is a static site
  that can be hosted for free (GitHub Pages / Vercel / Netlify) whenever you want.

## Repository

https://github.com/Yumogwai/tone — CI (lint + typecheck + tests + build) and gitleaks secret
scanning run on every push.

## License

[MIT](LICENSE) © 2026 Yumogwai
