/* History — past questions and their advice, saved to localStorage.
   Ported from the prototype's History. */
import { I } from '../../lib/icons'
import { lastAdvice, whenLabel } from '../../lib/history'
import type { HistoryEntry } from '../../lib/types'

interface Props {
  items: HistoryEntry[]
  onOpen: (entry: HistoryEntry) => void
}

export function History({ items, onOpen }: Props) {
  if (!items.length) {
    return (
      <div className="main-pad">
        <div className="page-head fade-up">
          <h1 className="page-title">History</h1>
          <p className="page-sub">Every question and its advice lands here — you can come back to any of them.</p>
        </div>
        <div className="empty card fade-up">
          <div className="ei">
            <I.history size={28} />
          </div>
          <h3>Nothing here yet</h3>
          <p>Ask your first question and the advice will be saved here. Over time I factor in what I've learned about you.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="main-pad">
      <div className="page-head fade-up">
        <h1 className="page-title">History</h1>
        <p className="page-sub">
          {items.length} {items.length === 1 ? 'question' : 'questions'} · revisit any of them
        </p>
      </div>
      <div className="hist-list">
        {items.map((it) => (
          <button key={it.id} className="hist-item fade-up" onClick={() => onOpen(it)}>
            <span className="hist-ic">
              <I.shield size={18} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div className="hist-q">{it.question}</div>
              <div className="hist-a">{lastAdvice(it)?.action}</div>
            </span>
            <span className="hist-meta">{whenLabel(it.ts)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
