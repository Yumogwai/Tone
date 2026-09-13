/* AI settings — "bring your own key" (BYOK).
   The key is the USER's own and lives ONLY in their browser's localStorage.
   It is never sent anywhere except directly to the provider they choose, and
   never to us (there is no server). Tone works fully without it (canned engine). */

export type AiProviderId = 'gemini' | 'openai' | 'anthropic'

export interface AiSettings {
  enabled: boolean
  provider: AiProviderId
  apiKey: string
  model: string
}

export interface ProviderMeta {
  id: AiProviderId
  name: string
  defaultModel: string
  keyUrl: string
  keyPlaceholder: string
  /** Has a genuinely free API tier. */
  free: boolean
  blurb: string
}

export const PROVIDERS: Record<AiProviderId, ProviderMeta> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyPlaceholder: 'AIza…',
    free: true,
    blurb: 'Has a genuinely free tier — the easiest way to use Tone for free.',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-…',
    free: false,
    blurb: 'Pay-as-you-go — usually a fraction of a cent per question.',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    defaultModel: 'claude-haiku-4-5',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-…',
    free: false,
    blurb: 'Pay-as-you-go. Calm, careful writing.',
  },
}

export const PROVIDER_IDS = Object.keys(PROVIDERS) as AiProviderId[]

const AI_LS = 'tone_ai_v1'

export const DEFAULT_AI: AiSettings = {
  enabled: false,
  provider: 'gemini',
  apiKey: '',
  model: PROVIDERS.gemini.defaultModel,
}

export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(AI_LS)
    if (!raw) return { ...DEFAULT_AI }
    const o = JSON.parse(raw) as Partial<AiSettings>
    const provider: AiProviderId = o.provider && o.provider in PROVIDERS ? o.provider : 'gemini'
    return {
      enabled: Boolean(o.enabled),
      provider,
      apiKey: typeof o.apiKey === 'string' ? o.apiKey : '',
      model: typeof o.model === 'string' && o.model.trim() ? o.model : PROVIDERS[provider].defaultModel,
    }
  } catch {
    return { ...DEFAULT_AI }
  }
}

export function saveAiSettings(s: AiSettings): void {
  try {
    localStorage.setItem(AI_LS, JSON.stringify(s))
  } catch {
    /* ignore quota / private-mode failures */
  }
}

/** True when AI is switched on AND has the bits it needs to make a call. */
export function isAiConfigured(s: AiSettings): boolean {
  return s.enabled && s.apiKey.trim().length > 0 && s.model.trim().length > 0
}
