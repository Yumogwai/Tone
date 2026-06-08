import { describe, expect, it } from 'vitest'
import { GENERIC, SCENARIOS, pickScenario, refineAnswer } from './scenarios'

describe('pickScenario', () => {
  it('routes a "went quiet" question to the followup scenario', () => {
    expect(pickScenario('I went quiet on a coworker for a day').id).toBe('followup')
  })
  it('routes an intro question to the intro scenario', () => {
    expect(pickScenario('should I introduce myself in the group chat').id).toBe('intro')
  })
  it('falls back to the generic scenario for an unmatched question', () => {
    expect(pickScenario('what color should the logo be').id).toBe('generic')
  })
})

describe('scenario.build', () => {
  it('produces a complete, well-formed advice object', () => {
    const followup = SCENARIOS.find((s) => s.id === 'followup')
    expect(followup).toBeDefined()
    const advice = followup!.build({ gap: 'A day or two', kind: 'Pure work', who: 'A peer' })
    expect(advice.action).toBeTruthy()
    expect(advice.why).toBeTruthy()
    expect(advice.over.label).toBeTruthy()
    expect(advice.under.label).toBeTruthy()
    expect(advice.template).toContain('[')
    expect(advice.tilt).toBeGreaterThanOrEqual(0)
    expect(advice.tilt).toBeLessThanOrEqual(1)
  })
})

describe('refineAnswer', () => {
  const base = GENERIC.build({ rel: "We're fine", urgency: 'Within the day', register: 'Work' })

  it('softens (lowers tilt) and adds a note on a cautious follow-up', () => {
    const r = refineAnswer(base, 'it still feels too pushy')
    expect(r.tilt).toBeLessThan(base.tilt)
    expect(r.revisedNote).toBeTruthy()
  })

  it('firms up (raises tilt) on an urgent follow-up', () => {
    const r = refineAnswer(base, 'this is actually urgent now, I need it today')
    expect(r.tilt).toBeGreaterThan(base.tilt)
  })

  it('keeps the core move but adds context on a neutral follow-up', () => {
    const r = refineAnswer(base, 'just so you know, it is a design review')
    expect(r.tilt).toBe(base.tilt)
    expect(r.why).toContain(base.why)
  })
})
