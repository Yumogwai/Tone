import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_AI, PROVIDERS, isAiConfigured, loadAiSettings, saveAiSettings } from './settings'

beforeEach(() => localStorage.clear())

describe('AI settings storage', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadAiSettings()).toEqual(DEFAULT_AI)
  })

  it('round-trips through localStorage', () => {
    const s = { enabled: true, provider: 'openai' as const, apiKey: 'sk-x', model: 'gpt-4o-mini' }
    saveAiSettings(s)
    expect(loadAiSettings()).toEqual(s)
  })

  it('repairs an unknown provider and a missing model', () => {
    localStorage.setItem('tone_ai_v1', JSON.stringify({ enabled: true, provider: 'bogus', apiKey: 'x' }))
    const s = loadAiSettings()
    expect(s.provider).toBe('gemini')
    expect(s.model).toBe(PROVIDERS.gemini.defaultModel)
  })
})

describe('isAiConfigured', () => {
  it('needs enabled + a key + a model', () => {
    expect(isAiConfigured({ enabled: false, provider: 'gemini', apiKey: 'k', model: 'm' })).toBe(false)
    expect(isAiConfigured({ enabled: true, provider: 'gemini', apiKey: '   ', model: 'm' })).toBe(false)
    expect(isAiConfigured({ enabled: true, provider: 'gemini', apiKey: 'k', model: '' })).toBe(false)
    expect(isAiConfigured({ enabled: true, provider: 'gemini', apiKey: 'k', model: 'm' })).toBe(true)
  })
})
