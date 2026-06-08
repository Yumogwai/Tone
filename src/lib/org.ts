/* Company-map helpers — structure options, role suggestions, and the
   keyword→team inference that lets the chat quietly grow the org chart.
   Ported from the prototype's company.jsx. */

export const uid = (p: string): string =>
  p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

export interface StructureOption {
  id: string
  name: string
  desc: string
}

export const STRUCTURES: StructureOption[] = [
  { id: 'func', name: 'Functional', desc: 'by department' },
  { id: 'matrix', name: 'Matrix', desc: 'project + department' },
  { id: 'project', name: 'Project-based', desc: 'teams around projects' },
  { id: 'hybrid', name: 'Hybrid', desc: 'a mix' },
  { id: 'custom', name: 'Custom', desc: 'ours is its own thing' },
]

export const ROLE_SUGGEST = [
  'Manager', 'Team lead', 'Peer', 'Designer', 'Engineer',
  'Analyst', 'PM', 'Support', 'HR', 'Marketing',
]

// keyword → canonical team name, for inferring structure from chat
const TEAM_KW: [string, RegExp][] = [
  ['Support', /support|helpdesk|customer success|\bcs\b/i],
  ['Engineering', /engineer|\bdev\b|developer|backend|frontend|programmer/i],
  ['Design', /design|\bux\b|\bui\b/i],
  ['Marketing', /marketing|growth|\bsmm\b|\bpr\b|brand team/i],
  ['Product', /product team|product manager|\bpm\b/i],
  ['Sales', /sales|account exec|business development|biz dev/i],
  ['QA', /\bqa\b|tester|testing|quality/i],
  ['Analytics', /analyt|data team|data scien/i],
  ['HR', /\bhr\b|people team|recruit|talent/i],
  ['Finance', /finance|accounting|bookkeep/i],
  ['Legal', /legal|lawyer|counsel/i],
  ['Leadership', /leadership|\bexec\b|c-level|director|founder/i],
]

export function detectTeams(text: string): string[] {
  const t = text || ''
  const found: string[] = []
  for (const [name, re] of TEAM_KW) if (re.test(t)) found.push(name)
  return found
}
