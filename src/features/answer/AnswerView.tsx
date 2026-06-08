/* The answer thread: the original question, one or more advice cards, the
   user's follow-up notes, an optional "add to company map" nudge, and the
   composer to push back and have Tone rethink. Ported from the prototype. */
import { useState } from 'react'
import { I } from '../../lib/icons'
import { detectTeams } from '../../lib/org'
import type { HistoryEntry, Org } from '../../lib/types'
import { AdviceCard } from './AdviceCard'
import { ReadingStrip } from '../../components/ReadingStrip'

interface Props {
  entry: HistoryEntry
  org: Org
  onBack: () => void
  onAgain: () => void
  onAddTeams: (names: string[]) => void
  onRefine: (comment: string) => void | Promise<void>
  backLabel: string
}

export function AnswerView({ entry, org, onBack, onAgain, onAddTeams, onRefine, backLabel }: Props) {
  const [comment, setComment] = useState('')
  const [refining, setRefining] = useState(false)
  const suggest = detectTeams(entry.question).filter(
    (n) => !org.teams.some((t) => t.name.toLowerCase() === n.toLowerCase()),
  )

  const send = async () => {
    const c = comment.trim()
    if (!c || refining) return
    setComment('')
    setRefining(true)
    try {
      await onRefine(c)
    } finally {
      setRefining(false)
    }
  }

  return (
    <div className="main-pad fade-up">
      <button className="ans-back" onClick={onBack}>
        <I.arrowLeft size={15} /> {backLabel}
      </button>
      <div className="ans-question">
        <b style={{ color: 'var(--ink-2)' }}>You asked: </b>
        {entry.question}
      </div>

      {entry.thread.map((m, i) =>
        m.role === 'advice' ? (
          <AdviceCard key={i} answer={m.answer} revised={i > 0} source={m.source} note={m.note} />
        ) : (
          <div className="you-note fade-up" key={i}>
            <span className="yn-ic">
              <I.user size={14} />
            </span>
            <p>{m.text}</p>
          </div>
        ),
      )}

      {refining && <ReadingStrip label="Rethinking with your note…" style={{ marginTop: 16 }} />}

      {suggest.length > 0 && (
        <div className="infer-card fade-up">
          <span className="infer-ic">
            <I.network size={18} />
          </span>
          <div className="infer-txt">
            Looks like <b>{suggest.join(', ')}</b> {suggest.length === 1 ? 'is' : 'are'} involved here. Add to your
            company map?
          </div>
          <button className="btn btn-sage btn-sm" onClick={() => onAddTeams(suggest)}>
            <I.plus size={15} /> Add
          </button>
        </div>
      )}

      <div className="followup card fade-up">
        <div className="fu-head">
          <I.message size={14} /> Not quite right? Add context and I'll rethink it
        </div>
        <textarea
          className="fu-area"
          rows={2}
          placeholder="e.g. it still feels too pushy… / they're my manager… / it's actually urgent now…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <div className="fu-bar">
          <span className="ask-hint">
            <I.heart size={13} /> Say it however it comes out.
          </span>
          <div className="spacer" />
          <button className="btn btn-primary btn-sm" disabled={!comment.trim() || refining} onClick={send}>
            Rethink <I.refresh size={14} />
          </button>
        </div>
      </div>

      <div className="ans-actions">
        <button className="btn btn-ghost" onClick={onAgain}>
          <I.plus size={16} /> New question
        </button>
        <button className="btn btn-quiet" onClick={onBack}>
          {backLabel}
        </button>
      </div>
    </div>
  )
}
