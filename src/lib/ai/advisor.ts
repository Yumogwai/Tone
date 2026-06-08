/* Advisor — the bridge between the UI and either the real model (BYOK) or the
   canned scenario engine. It builds Tone-voiced prompts, asks the model for a
   structured "safe move" as JSON, validates it into the Advice shape, and falls
   back to the canned engine on any error. The UI never changes. */
import type { Advice, ClarifyAnswers, Org, RiskSide, Scenario } from '../types'
import { refineAnswer } from '../scenarios'
import { STRUCTURES } from '../org'
import type { AiSettings } from './settings'
import { isAiConfigured, PROVIDERS } from './settings'
import { chat } from './providers'

export interface AdviceResult {
  advice: Advice
  source: 'ai' | 'canned'
  /** Set when AI was requested but we fell back to canned (e.g. bad key / offline). */
  note?: string
}

const SYSTEM = `You are Tone — a calm, experienced colleague who helps anxious people handle everyday workplace social moments (sending a follow-up, introducing themselves, re-asking a manager, breaking a silence). The person is worried. Your job is to lower their heart rate and hand them ONE clear, calibrated next step — never judgment, never hype, never therapy-speak.

How you write:
- Warm, second person ("you" / "your team"). Sentence case everywhere. No headings.
- Lead with the move, then the reason. Normalise the worry in a line. Reassure briefly, not gushingly.
- Short: the action is ONE sentence; the why is 2-3 sentences, tuned to their specifics and workplace.
- Two-sided honesty is the heart of Tone: always name the cost of OVERDOING it (too pushy) AND the cost of DOING NOTHING (too passive). Be concrete about each.
- The "tilt" is where the safe move sits on a wait<->act line: 0 = pure wait, 1 = act now. Pick it honestly.
- No emoji anywhere EXCEPT optionally one (a wave or smile) inside the message draft, since that's how people actually text.
- The message draft ("template") is a ready-to-send message using [square-bracket slots] the person fills in, e.g. "[the task]", "[your answer]". Use "" if a draft doesn't fit.
- Never invent facts about their workplace or the people in it. Use only what they tell you.

Respond with ONLY a JSON object — no markdown fences, no extra text — in exactly this shape:
{
  "action": "the recommended move, one sentence",
  "why": "2-3 sentences explaining why, tuned to their situation",
  "over": { "label": "short label, e.g. If you overdo it", "text": "the cost of overdoing it" },
  "under": { "label": "short label, e.g. If you keep waiting", "text": "the cost of doing nothing" },
  "template": "ready-to-send message with [slots], or an empty string",
  "tilt": 0.0
}`

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5
  return Math.max(0, Math.min(1, n))
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function orgContext(org: Org): string {
  if (!org.teams.length && !org.people.length) return ''
  const lines: string[] = []
  if (org.structure) {
    const name = STRUCTURES.find((s) => s.id === org.structure)?.name ?? org.structure
    lines.push(`- Org structure: ${name}`)
  }
  if (org.teams.length) {
    lines.push(`- Teams: ${org.teams.map((t) => t.name + (t.mine ? " (the user's own team)" : '')).join(', ')}`)
  }
  for (const p of org.people) {
    const bits = [p.role, p.relation, p.traits.join('/'), p.note].filter(Boolean).join('; ')
    lines.push(`- ${p.name}${bits ? ` — ${bits}` : ''}`)
  }
  return 'About their workplace (use it to tailor the advice, but never invent beyond it):\n' + lines.join('\n')
}

export function buildGenerateUser(
  question: string,
  answers: ClarifyAnswers,
  scenario: Scenario,
  org: Org,
): string {
  const qa = scenario.clarify
    .map((q) => `- ${q.q} ${answers[q.id] ? '→ ' + answers[q.id] : '(skipped)'}`)
    .join('\n')
  const ctx = orgContext(org)
  return [
    `The situation: ${question}`,
    qa ? `\nA few details they gave:\n${qa}` : '',
    ctx ? `\n${ctx}` : '',
    `\nReturn the safe move as JSON.`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildRethinkUser(question: string, prev: Advice, comment: string): string {
  return [
    `The situation: ${question}`,
    `\nThe advice you gave earlier:\n- Move: ${prev.action}\n- Why: ${prev.why}\n- Wait<->act tilt: ${prev.tilt}`,
    `\nThey pushed back with: "${comment}"`,
    `\nReconsider and return JSON in the same shape, PLUS a "revisedNote" field: one warm sentence acknowledging their note and how you adjusted. Shift the tilt toward 0 (wait) if they feel it's too pushy or anxious, toward 1 (act) if it's urgent.`,
  ].join('\n')
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function extractJson(s: string): string {
  const a = s.indexOf('{')
  const b = s.lastIndexOf('}')
  if (a === -1 || b === -1 || b < a) throw new Error('no JSON object in the response')
  return s.slice(a, b + 1)
}

/** Validate a model's raw text into the Advice shape, or throw. */
export function parseAdvice(raw: string): Advice {
  const parsed = JSON.parse(extractJson(raw)) as unknown
  const o = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>
  const side = (v: unknown, fallbackLabel: string): RiskSide => {
    const s = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
    return { label: str(s.label) || fallbackLabel, text: str(s.text) }
  }
  const advice: Advice = {
    action: str(o.action),
    why: str(o.why),
    over: side(o.over, 'If you overdo it'),
    under: side(o.under, 'If you do nothing'),
    template: str(o.template),
    tilt: clamp01(Number(o.tilt)),
  }
  const revised = str(o.revisedNote)
  if (revised) advice.revisedNote = revised
  if (!advice.action || !advice.why) throw new Error('the response was missing the action or the why')
  return advice
}

export async function generateAdvice(
  input: { question: string; answers: ClarifyAnswers; scenario: Scenario; org: Org },
  settings: AiSettings,
): Promise<AdviceResult> {
  const { question, answers, scenario, org } = input
  if (!isAiConfigured(settings)) {
    await delay(650) // keep the calm "thinking" beat even when the canned answer is instant
    return { advice: scenario.build(answers, { org }), source: 'canned' }
  }
  try {
    const raw = await chat(SYSTEM, buildGenerateUser(question, answers, scenario, org), settings)
    return { advice: parseAdvice(raw), source: 'ai' }
  } catch (e) {
    return {
      advice: scenario.build(answers, { org }),
      source: 'canned',
      note: `Couldn't reach your AI (${errMsg(e)}). Here's Tone's built-in take — you can check your key in Your AI.`,
    }
  }
}

export async function rethinkAdvice(
  input: { question: string; prev: Advice; comment: string },
  settings: AiSettings,
): Promise<AdviceResult> {
  const { question, prev, comment } = input
  if (!isAiConfigured(settings)) {
    await delay(650)
    return { advice: refineAnswer(prev, comment), source: 'canned' }
  }
  try {
    const raw = await chat(SYSTEM, buildRethinkUser(question, prev, comment), settings)
    const advice = parseAdvice(raw)
    if (!advice.revisedNote) advice.revisedNote = "Here's the same move, tuned to what you added."
    return { advice, source: 'ai' }
  } catch (e) {
    return {
      advice: refineAnswer(prev, comment),
      source: 'canned',
      note: `Couldn't reach your AI (${errMsg(e)}). Here's a reconsidered built-in take.`,
    }
  }
}

/** A tiny round-trip to confirm the key + model work, for the settings screen. */
export async function testConnection(settings: AiSettings): Promise<{ ok: boolean; message: string }> {
  try {
    await chat('You are a connection test. Reply with a tiny JSON object.', 'Return {"ok": true} as JSON.', settings)
    return { ok: true, message: `Connected — ${PROVIDERS[settings.provider].name} (${settings.model}) responded.` }
  } catch (e) {
    return { ok: false, message: errMsg(e) }
  }
}
