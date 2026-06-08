/* Home / ask screen — one clean field in focus, common starting points,
   and the inline clarify panel that rises above the composer.
   Ported from the prototype's Home. */
import { useState } from 'react'
import { I } from '../../lib/icons'
import { EXAMPLES, pickScenario } from '../../lib/scenarios'
import type { ClarifyAnswers, Scenario } from '../../lib/types'
import { ReadingStrip } from '../../components/ReadingStrip'
import { InlineClarify } from './InlineClarify'

type Stage = 'idle' | 'reading' | 'clarify'

interface Props {
  onGenerate: (question: string, scenario: Scenario, answers: ClarifyAnswers) => void
}

export function Home({ onGenerate }: Props) {
  const [text, setText] = useState('')
  const [question, setQuestion] = useState('')
  const [focus, setFocus] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const [scenario, setScenario] = useState<Scenario | null>(null)

  const start = (q: string) => {
    const qq = q.trim()
    if (!qq) return
    setText(qq)
    setQuestion(qq)
    setScenario(pickScenario(qq))
    setStage('reading')
    setTimeout(() => setStage('clarify'), 750)
  }
  const reset = () => {
    setStage('idle')
    setScenario(null)
  }

  return (
    <div className="main-pad">
      <div className="ask-hero fade-up">
        <div className="mark lg" style={{ margin: '0 auto' }}>
          <I.compass size={30} />
        </div>
        <h1 className="greet">How can I help?</h1>
        <p className="ask-lede">
          Describe the situation in your own words — where you're unsure how to act. I'll ask a couple of quick
          things, then give you a calm, safe move. No judgment here.
        </p>
      </div>

      {stage === 'reading' && <ReadingStrip />}
      {stage === 'clarify' && scenario && (
        <InlineClarify scenario={scenario} onCancel={reset} onSubmit={(answers) => onGenerate(question, scenario, answers)} />
      )}

      <div className={'ask-box fade-up' + (focus ? ' focus' : '') + (stage !== 'idle' ? ' locked' : '')}>
        <textarea
          className="ask-area"
          rows={3}
          readOnly={stage !== 'idle'}
          placeholder="e.g. I went quiet on a coworker for a whole day — is it okay to say “sorry I dropped off”?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) start(text)
          }}
        />
        <div className="ask-bar">
          {stage === 'idle' ? (
            <>
              <span className="ask-hint">
                <I.heart size={13} /> Take your time. Anything goes.
              </span>
              <div className="spacer" />
              <button className="btn btn-primary btn-sm" disabled={!text.trim()} onClick={() => start(text)}>
                Ask <I.send size={15} />
              </button>
            </>
          ) : (
            <>
              <span className="ask-hint">
                <I.arrowRight size={13} style={{ transform: 'rotate(-90deg)' }} /> Answer the quick questions above
              </span>
              <div className="spacer" />
              <button className="btn btn-quiet btn-sm" onClick={reset}>
                Start over
              </button>
            </>
          )}
        </div>
      </div>

      {stage === 'idle' && (
        <div className="examples fade-up">
          <div className="examples-label">Common starting points</div>
          <div className="example-list">
            {EXAMPLES.map((ex) => (
              <button key={ex} className="example" onClick={() => start(ex)}>
                <span className="q-ic">
                  <I.message size={17} />
                </span>
                <span>{ex}</span>
                <span className="arr">
                  <I.arrowRight size={16} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
