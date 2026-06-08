import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildGenerateUser, generateAdvice, parseAdvice, rethinkAdvice, testConnection } from './advisor'
import { DEFAULT_AI } from './settings'
import type { AiSettings } from './settings'
import { GENERIC, SCENARIOS } from '../scenarios'
import type { Org } from '../types'

const emptyOrg: Org = { structure: null, teams: [], people: [] }
const followup = SCENARIOS.find((s) => s.id === 'followup')!
const answers = { gap: 'A day or two', kind: 'Pure work', who: 'A peer' }
const cfg: AiSettings = { enabled: true, provider: 'gemini', apiKey: 'k', model: 'm' }

function stubFetch(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok,
        status: ok ? 200 : 500,
        statusText: ok ? 'OK' : 'Error',
        json: async () => body,
        text: async () => JSON.stringify(body),
      } as unknown as Response),
    ),
  )
}
// A well-formed Gemini-shaped response carrying the given advice JSON.
const gemini = (advice: object) => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(advice) }] } }] })

afterEach(() => vi.unstubAllGlobals())

describe('parseAdvice', () => {
  it('parses a clean JSON object', () => {
    const a = parseAdvice(
      '{"action":"reply now","why":"it is fine","over":{"label":"O","text":"OT"},"under":{"label":"U","text":"UT"},"template":"hi [x]","tilt":0.7}',
    )
    expect(a.action).toBe('reply now')
    expect(a.tilt).toBe(0.7)
    expect(a.over.label).toBe('O')
  })

  it('tolerates prose / code fences around the JSON and clamps tilt', () => {
    const a = parseAdvice('Sure!\n```json\n{"action":"a","why":"w","tilt":2}\n```\nhope it helps')
    expect(a.action).toBe('a')
    expect(a.tilt).toBe(1)
  })

  it('throws when the action or why is missing', () => {
    expect(() => parseAdvice('{"tilt":0.5}')).toThrow()
    expect(() => parseAdvice('not json at all')).toThrow()
  })
})

describe('buildGenerateUser', () => {
  it('includes the question, the answers, and org context when present', () => {
    const org: Org = {
      structure: 'func',
      teams: [{ id: 't1', name: 'Support', parent: null, mine: false }],
      people: [],
    }
    const u = buildGenerateUser('how do I follow up', answers, followup, org)
    expect(u).toContain('how do I follow up')
    expect(u).toContain('A day or two')
    expect(u).toContain('Support')
    expect(u).toContain('Functional') // structure id mapped to its name
  })

  it('omits the workplace block when the map is empty', () => {
    const u = buildGenerateUser('q', answers, followup, emptyOrg)
    expect(u).not.toContain('About their workplace')
  })
})

describe('generateAdvice', () => {
  it('uses the canned engine when AI is off', async () => {
    const r = await generateAdvice({ question: 'q', answers, scenario: followup, org: emptyOrg }, DEFAULT_AI)
    expect(r.source).toBe('canned')
    expect(r.advice).toEqual(followup.build(answers, { org: emptyOrg }))
  })

  it('uses the model when configured', async () => {
    stubFetch(
      gemini({
        action: 'AI move',
        why: 'AI why',
        over: { label: 'o', text: 'ot' },
        under: { label: 'u', text: 'ut' },
        template: '',
        tilt: 0.5,
      }),
    )
    const r = await generateAdvice({ question: 'q', answers, scenario: followup, org: emptyOrg }, cfg)
    expect(r.source).toBe('ai')
    expect(r.advice.action).toBe('AI move')
  })

  it('falls back to canned with a note when the model call fails', async () => {
    stubFetch({ error: { message: 'nope' } }, false)
    const r = await generateAdvice({ question: 'q', answers, scenario: followup, org: emptyOrg }, cfg)
    expect(r.source).toBe('canned')
    expect(r.note).toMatch(/Couldn't reach your AI/)
  })
})

describe('rethinkAdvice', () => {
  it('falls back to the canned refine when AI is off', async () => {
    const prev = GENERIC.build({ rel: 'Just met', urgency: 'Not pressing', register: 'Work' })
    const r = await rethinkAdvice({ question: 'q', prev, comment: 'too pushy' }, DEFAULT_AI)
    expect(r.source).toBe('canned')
    expect(r.advice.revisedNote).toBeTruthy()
  })
})

describe('testConnection', () => {
  it('reports ok on a successful round-trip', async () => {
    stubFetch(gemini({ ok: true }))
    expect((await testConnection(cfg)).ok).toBe(true)
  })

  it('reports the error on failure', async () => {
    stubFetch({ error: { message: 'bad key' } }, false)
    const r = await testConnection(cfg)
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/bad key/)
  })
})
