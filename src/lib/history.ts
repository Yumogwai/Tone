/* Small helpers for the history thread. */
import type { Advice, HistoryEntry } from './types'

export function whenLabel(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)
  if (Date.now() - ts < 60000) return 'just now'
  if (d.toDateString() === now.toDateString())
    return 'today, ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (d.toDateString() === yest.toDateString()) return 'yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** The most recent advice in an entry's thread (or null if somehow none). */
export function lastAdvice(entry: HistoryEntry): Advice | null {
  for (let i = entry.thread.length - 1; i >= 0; i--) {
    const item = entry.thread[i]
    if (item.role === 'advice') return item.answer
  }
  return null
}
