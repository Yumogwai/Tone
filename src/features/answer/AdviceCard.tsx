/* A single "safe move" advice card — action, why, the wait↔act tilt meter,
   the two-sided risk balance, and a copyable draft. Ported from the prototype. */
import { useState } from 'react'
import { I } from '../../lib/icons'
import type { Advice } from '../../lib/types'

/** Render a message template, highlighting [bracketed slots]. */
function renderTemplate(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((s, i) =>
    /^\[[^\]]+\]$/.test(s) ? (
      <span className="slot" key={i}>
        {s.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{s}</span>
    ),
  )
}

interface Props {
  answer: Advice
  revised: boolean
  source?: 'ai' | 'canned'
  note?: string
}

export function AdviceCard({ answer, revised, source, note }: Props) {
  const [copied, setCopied] = useState(false)
  const a = answer
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(a.template).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }
  return (
    <div className="safe-card card fade-up">
      <div className="safe-head">
        <span className={'safe-tag' + (revised ? ' revised' : '')}>
          {revised ? (
            <>
              <I.refresh size={13} /> Reconsidered
            </>
          ) : (
            <>
              <I.shield size={13} /> Safe move
            </>
          )}
        </span>
        {source === 'ai' && (
          <span className="safe-source">
            <I.sparkle size={12} /> your AI
          </span>
        )}
      </div>
      {note && <div className="ai-note">{note}</div>}
      {a.revisedNote && <div className="revised-note">{a.revisedNote}</div>}
      <h2 className="safe-action">{a.action}</h2>
      <p className="safe-why">{a.why}</p>

      <div className="tilt-wrap">
        <div className="tilt-labels">
          <span>Wait</span>
          <span>Act</span>
        </div>
        <div className="tilt-track">
          <div className="tilt-dot" style={{ left: a.tilt * 100 + '%' }} />
        </div>
      </div>

      <div className="risk-grid">
        <div className="risk over">
          <div className="risk-head">
            <span className="risk-ic">
              <I.arrowRight size={14} />
            </span>
            {a.over.label}
          </div>
          <p>{a.over.text}</p>
        </div>
        <div className="risk under">
          <div className="risk-head">
            <span className="risk-ic">
              <I.clock size={14} />
            </span>
            {a.under.label}
          </div>
          <p>{a.under.text}</p>
        </div>
      </div>

      {a.template && (
        <div className="tmpl">
          <div className="tmpl-head">
            <I.message size={14} /> Ready-to-send draft
          </div>
          <div className="tmpl-box">
            <div className="tmpl-text">{renderTemplate(a.template)}</div>
          </div>
          <button className={'btn btn-ghost btn-sm copy-btn' + (copied ? ' done' : '')} onClick={copy}>
            {copied ? (
              <>
                <I.check size={15} /> Copied
              </>
            ) : (
              <>
                <I.copy size={15} /> Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
