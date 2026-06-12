import { afterEach, describe, expect, it, vi } from 'vitest'
import { chat } from './providers'
import type { AiSettings } from './settings'

let lastUrl = ''
let lastInit: RequestInit = {}

function fakeResponse(body: unknown, ok = true, status = 200, statusText = 'OK'): Response {
  return {
    ok,
    status,
    statusText,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

function stubFetch(body: unknown, ok = true, status = 200, statusText = 'OK') {
  const fn = vi.fn((url: string | URL, init?: RequestInit) => {
    lastUrl = String(url)
    lastInit = init ?? {}
    return Promise.resolve(fakeResponse(body, ok, status, statusText))
  })
  vi.stubGlobal('fetch', fn)
}

afterEach(() => {
  vi.unstubAllGlobals()
  lastUrl = ''
  lastInit = {}
})

const base = (over: Partial<AiSettings>): AiSettings => ({
  enabled: true,
  provider: 'gemini',
  apiKey: 'k',
  model: 'm',
  ...over,
})

const headers = () => (lastInit.headers ?? {}) as Record<string, string>
const body = () => JSON.parse((lastInit.body as string) ?? '{}')

describe('chat — Gemini', () => {
  it('calls the Gemini endpoint with the key in the URL and returns the text', async () => {
    stubFetch({ candidates: [{ content: { parts: [{ text: '{"ok":1}' }] } }] })
    const out = await chat('sys', 'usr', base({ provider: 'gemini', apiKey: 'KEY', model: 'gemini-2.0-flash' }))
    expect(out).toBe('{"ok":1}')
    expect(lastUrl).toContain('generativelanguage.googleapis.com')
    expect(lastUrl).toContain('gemini-2.0-flash')
    expect(lastUrl).toContain('key=KEY')
    expect(body().systemInstruction.parts[0].text).toBe('sys')
    expect(body().contents[0].parts[0].text).toBe('usr')
  })
})

describe('chat — OpenAI', () => {
  it('uses the bearer header and chat/completions endpoint', async () => {
    stubFetch({ choices: [{ message: { content: '{"ok":1}' } }] })
    const out = await chat('sys', 'usr', base({ provider: 'openai', apiKey: 'sk-x', model: 'gpt-4o-mini' }))
    expect(out).toBe('{"ok":1}')
    expect(lastUrl).toBe('https://api.openai.com/v1/chat/completions')
    expect(headers().Authorization).toBe('Bearer sk-x')
    expect(body().model).toBe('gpt-4o-mini')
    expect(body().messages[0]).toEqual({ role: 'system', content: 'sys' })
  })
})

describe('chat — Anthropic', () => {
  it('sets the api-key + browser-access headers and a user message', async () => {
    stubFetch({ content: [{ text: '{"ok":1}' }] })
    const out = await chat('sys', 'usr', base({ provider: 'anthropic', apiKey: 'sk-ant', model: 'claude-haiku-4-5' }))
    expect(out).toBe('{"ok":1}')
    expect(lastUrl).toBe('https://api.anthropic.com/v1/messages')
    expect(headers()['x-api-key']).toBe('sk-ant')
    expect(headers()['anthropic-dangerous-direct-browser-access']).toBe('true')
    expect(body().system).toBe('sys')
    expect(body().messages[0]).toEqual({ role: 'user', content: 'usr' })
  })
})

describe('chat — errors', () => {
  it('throws with the provider error message on a non-ok response', async () => {
    stubFetch({ error: { message: 'bad key' } }, false, 401, 'Unauthorized')
    await expect(chat('s', 'u', base({ provider: 'gemini' }))).rejects.toThrow(/401.*bad key/)
  })

  it('throws on an empty response', async () => {
    stubFetch({ candidates: [{ content: { parts: [{ text: '' }] } }] })
    await expect(chat('s', 'u', base({ provider: 'gemini' }))).rejects.toThrow(/empty/i)
  })

  it('redacts the key if a provider echoes it back in an error body', async () => {
    stubFetch({ error: { message: 'invalid key sk-secret123456789 supplied' } }, false, 400, 'Bad Request')
    let msg = ''
    try {
      await chat('s', 'u', base({ provider: 'openai', apiKey: 'sk-secret123456789', model: 'gpt-4o-mini' }))
    } catch (e) {
      msg = (e as Error).message
    }
    expect(msg).toContain('***')
    expect(msg).not.toContain('sk-secret123456789')
  })
})
