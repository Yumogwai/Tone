#!/usr/bin/env node
// SessionStart hook — injects the current project status into context at the start of every session,
// so Claude always begins already aware of the phase and what's left. Stdout becomes context.
// Wired via .claude/settings.json -> hooks.SessionStart.

import { readFileSync } from "node:fs";

try {
  const status = readFileSync("docs/STATUS.md", "utf8");
  process.stdout.write("Current project status (docs/STATUS.md):\n\n" + status);
} catch {
  // No status file yet — stay silent.
}
