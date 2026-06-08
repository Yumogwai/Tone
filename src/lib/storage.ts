/* Tiny localStorage helpers. Persistence is fully client-side for now;
   when the AI/RAG backend arrives, these become the only swap point. */

export const LS = {
  hist: 'tone_history_v3',
  org: 'tone_org_v3',
} as const

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / private-mode failures */
  }
}
