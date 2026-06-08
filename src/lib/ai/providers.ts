/* Provider transport — turns a (system, user) prompt into a text response by
   calling the chosen provider's REST API directly from the browser with the
   user's own key. No SDK, no server. Each call returns the raw text (expected
   to be JSON, parsed by advisor.ts) or throws with a readable error. */
import type { AiSettings } from './settings'

/** Strip the user's key (and any key-shaped token) from provider text, and bound its
    length — this text can end up persisted in history, so keep it safe + small. */
function redact(text: string, apiKey: string): string {
  let t = text
  // Only redact the literal key when it's realistically long, so a trivially short
  // key can't blank out common letters in the message.
  if (apiKey.length >= 8) t = t.split(apiKey).join('***')
  t = t.replace(/\b(sk-[A-Za-z0-9_-]{8,}|AIza[A-Za-z0-9_-]{8,})\b/g, '***')
  return t.length > 300 ? t.slice(0, 300) + '…' : t
}

async function errText(res: Response, apiKey: string): Promise<string> {
  let detail = ''
  try {
    const j = (await res.json()) as { error?: { message?: string } | string }
    detail =
      (typeof j?.error === 'object' && j.error?.message) ||
      (typeof j?.error === 'string' ? j.error : '') ||
      ''
  } catch {
    try {
      detail = await res.text()
    } catch {
      /* ignore */
    }
  }
  detail = redact(detail, apiKey)
  return `${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`.trim()
}

export async function chat(system: string, user: string, settings: AiSettings): Promise<string> {
  const { provider, apiKey, model } = settings
  if (provider === 'openai') return chatOpenAI(system, user, apiKey, model)
  if (provider === 'anthropic') return chatAnthropic(system, user, apiKey, model)
  return chatGemini(system, user, apiKey, model)
}

async function chatGemini(system: string, user: string, apiKey: string, model: string): Promise<string> {
  // Gemini's documented browser shape passes the key as a `?key=` query param (not a header).
  // The key is the user's own and goes only to Google; we never log the URL.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.6, responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) throw new Error(await errText(res, apiKey))
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const parts = data?.candidates?.[0]?.content?.parts
  const text = Array.isArray(parts) ? parts.map((p) => p?.text ?? '').join('') : ''
  if (!text.trim()) throw new Error('Gemini returned an empty response')
  return text
}

async function chatOpenAI(system: string, user: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw new Error(await errText(res, apiKey))
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const text = data?.choices?.[0]?.message?.content ?? ''
  if (!text.trim()) throw new Error('OpenAI returned an empty response')
  return text
}

async function chatAnthropic(system: string, user: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for direct browser calls. The key is the user's own.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature: 0.6,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(await errText(res, apiKey))
  const data = (await res.json()) as { content?: { text?: string }[] }
  const blocks = data?.content
  const text = Array.isArray(blocks) ? blocks.map((b) => b?.text ?? '').join('') : ''
  if (!text.trim()) throw new Error('Claude returned an empty response')
  return text
}
