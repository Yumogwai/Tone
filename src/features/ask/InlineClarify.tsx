/* The centerpiece: Claude-Code-style clarifying questions that appear inline
   above the composer — tappable options plus a "write your own" input per
   question. Ported from the prototype's InlineClarify. */
import { useState } from 'react'
import { I } from '../../lib/icons'
import type { ClarifyAnswers, Scenario } from '../../lib/types'

interface Props {
  scenario: Scenario
  onCancel: () => void
  onSubmit: (answers: ClarifyAnswers) => void
}

export function InlineClarify({ scenario, onCancel, onSubmit }: Props) {
  const [ans, setAns] = useState<ClarifyAnswers>({})
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({})
  const qs = scenario.clarify
  const answered = qs.filter((q) => ans[q.id] && String(ans[q.id]).trim()).length
  const allDone = answered === qs.length

  const pick = (qid: string, v: string) => {
    setAns((s) => ({ ...s, [qid]: v }))
    setCustomOpen((s) => ({ ...s, [qid]: false }))
  }
  const openCustom = (qid: string) => {
    setCustomOpen((s) => ({ ...s, [qid]: true }))
    setAns((s) => ({ ...s, [qid]: '' }))
  }

  return (
    <div className="inline-clarify fade-up">
      <div className="ic-head">
        <span className="ic-spark">
          <I.sparkle size={14} />
        </span>
        <div>
          <div className="ic-title">A couple of quick things</div>
          <div className="ic-sub">Tap an option, or write your own — then I'll give you the safe move.</div>
        </div>
        <button className="mini-btn" onClick={onCancel} title="Dismiss">
          <I.x size={14} />
        </button>
      </div>
      <div className="ic-body">
        {qs.map((q, i) => (
          <div className="ic-q" key={q.id}>
            <div className="ic-qtext">
              <b>{i + 1}</b>
              <span>{q.q}</span>
            </div>
            <div className="opt-row">
              {q.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={'opt' + (ans[q.id] === o ? ' on' : '')}
                  onClick={() => pick(q.id, o)}
                >
                  {o}
                </button>
              ))}
              <button
                type="button"
                className={'opt custom-trigger' + (customOpen[q.id] ? ' on' : '')}
                onClick={() => openCustom(q.id)}
              >
                <I.pen size={12} style={{ marginRight: 5, display: 'inline-block', verticalAlign: '-2px' }} /> Write your own
              </button>
            </div>
            {customOpen[q.id] && (
              <div className="custom-wrap">
                <input
                  className="soft-input"
                  autoFocus
                  placeholder="In a few words…"
                  value={ans[q.id] || ''}
                  onChange={(e) => setAns((s) => ({ ...s, [q.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && allDone) onSubmit(ans)
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="ic-foot">
        <span className="foot-prog">
          {answered} of {qs.length}
        </span>
        <div className="spacer" />
        <button className="btn btn-primary btn-sm" disabled={!allDone} onClick={() => onSubmit(ans)}>
          Get the safe move <I.arrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
