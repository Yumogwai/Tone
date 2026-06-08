#!/usr/bin/env node
// Stop hook — keeps docs/STATUS.md fresh automatically.
//
// Fires when Claude finishes a turn. If code/config changed this turn but docs/STATUS.md was NOT
// updated, it blocks the stop and tells Claude to update STATUS.md first. The founder never has to
// ask — staleness is prevented at the source. Cross-platform (pure Node, no shell-isms).
//
// Wired via .claude/settings.json -> hooks.Stop. NOTE: hook JSON schema can change between Claude
// Code versions — if it ever stops firing, re-check the current hooks docs.

import { execSync } from "node:child_process";

const input = await readStdin();

// Loop guard: if we already nudged once in this stop-cycle, allow the stop.
if (input.stop_hook_active) process.exit(0);

let changed = [];
try {
  const out = execSync("git status --porcelain", { encoding: "utf8" });
  changed = out.split("\n").map((l) => l.slice(3).trim()).filter(Boolean);
} catch {
  process.exit(0); // not a git repo yet (early scaffold) — nothing to guard
}

const codeRe = /^(src\/|app\/|pages\/|package\.json|.*\.config\.(js|ts|mjs|cjs)|firestore\.rules|apphosting.*\.yaml)/;
const codeChanged = changed.some((f) => codeRe.test(f));
const docsTouched = changed.some((f) => /^(docs\/STATUS\.md|CLAUDE\.md)$/.test(f));

if (codeChanged && !docsTouched) {
  const reason = [
    "Code or config changed this turn, but docs/STATUS.md was not updated.",
    "Before finishing: update docs/STATUS.md — current phase, what is now done, what is next (keep it short).",
    "If the tech stack or the workflow itself changed, also update the relevant section of CLAUDE.md.",
    "Then you may stop.",
  ].join(" ");
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

process.exit(0);

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(safeParse(data)));
    setTimeout(() => resolve(safeParse(data)), 1000); // safety if no stdin arrives
  });
}

function safeParse(s) {
  try {
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}
