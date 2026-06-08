# Tone — Product Overview

> _A quiet guide for the moments you overthink at work._

## What it is

Tone is an AI navigator for workplace social situations. It helps newcomers and anxious people figure
out how to behave in everyday work moments — whether to send a follow-up, introduce themselves in a
busy channel, re-ask a manager, how not to seem pushy (or, the other way, passive). The user arrives
with a knot of worry; they should leave with calm clarity.

## The flow (where the design landed)

1. **No onboarding.** The app opens straight on the ask screen — context is gathered in-flow, only when
   the answer depends on it.
2. **Ask.** One clean field, plus "common starting points" to tap.
3. **Inline clarify (the centerpiece).** Instead of answering with water or a modal, Tone shows 1–3
   clarifying questions *above the composer*, Claude-Code style — each with tappable options and a
   "write your own" input.
4. **The "safe move".** A structured answer: the recommended action, a short *why* tuned to the
   situation, a wait↔act tilt meter, the two-sided risk balance (cost of overdoing it / cost of doing
   nothing), and a ready-to-send message draft you can copy.
5. **Rethink.** Add a follow-up note and Tone appends a "Reconsidered" card that adapts the move
   (softer if you say it feels pushy; firmer if it's urgent).
6. **Company map.** A separate tab: an editable org tree of teams + personas (16 calm avatars), an
   optional structure choice, and chat-inferred teams ("you mentioned Support — add them?").
7. **History.** Every question and its advice, saved locally.

## Design language

Built on the **Tone design system** (authored from scratch, light-only). One muted periwinkle accent,
one sage support hue, a warm ink ladder on warm paper. Generous radii, soft diffuse shadows, gentle
transform-only motion, one slow "breathing" orb while it thinks. Two Google families: Syne (display,
used gently) + Outfit (text/UI). Sentence case everywhere; no emoji in product chrome.

See `src/styles/` for the tokens and component layer.

## What Tone is _not_

- Not a cold corporate tool. Not clinical therapy-app blue. Not a hype SaaS dashboard.
- Not dark-mode (light only). Not loud — no big gradients, no glass-on-everything, no decorative imagery.
- Not multi-accent: one periwinkle, one sage, a warm ink ladder.
