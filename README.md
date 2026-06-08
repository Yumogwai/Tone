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

- The "intelligence" is currently a hand-authored scenario engine (`src/lib/scenarios.ts`). The
  AI/RAG backend is parked for later — that file is the single swap point; the UI and types stay the same.
- No deployment is set up yet (not needed at this stage). The build output in `dist/` is a static site
  that can be hosted for free (GitHub Pages / Vercel / Netlify) whenever you want.

## Push to GitHub

```bash
gh repo create tone --private --source=. --remote=origin --push
```

## License

[MIT](LICENSE) © 2026 Andrii Kuratov
