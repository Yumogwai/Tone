/* Shared domain types for Tone.
   Ported from the original prototype's implicit shapes (data.jsx / company.jsx / main.jsx). */

export type ClarifyAnswers = Record<string, string>

export interface ClarifyQuestion {
  id: string
  q: string
  options: string[]
}

export interface RiskSide {
  label: string
  text: string
}

/** A "safe move" — the structured advice Tone returns. */
export interface Advice {
  action: string
  why: string
  over: RiskSide
  under: RiskSide
  template: string
  /** Where the move sits on the wait↔act axis (0 = wait, 1 = act). */
  tilt: number
  /** Present only on a reconsidered ("revised") answer. */
  revisedNote?: string
}

export interface Scenario {
  id: string
  /** Keywords that route a free-text question to this scenario (absent on the generic fallback). */
  kw?: string[]
  clarify: ClarifyQuestion[]
  build: (answers: ClarifyAnswers, ctx?: { org: Org }) => Advice
}

/* ── Company map ── */

export interface Team {
  id: string
  name: string
  parent: string | null
  mine: boolean
}

export interface Person {
  id: string
  name: string
  role: string
  avatarId: string
  teamId: string | null
  relation: string
  traits: string[]
  note: string
}

export interface Org {
  structure: string | null
  teams: Team[]
  people: Person[]
}

/* ── History ── */

export type ThreadItem =
  | { role: 'advice'; answer: Advice }
  | { role: 'you'; text: string }

export interface HistoryEntry {
  id: string
  ts: number
  question: string
  scenarioId: string
  answers: ClarifyAnswers
  thread: ThreadItem[]
}
