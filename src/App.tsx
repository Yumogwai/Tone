/* ───────────────────────────────────────────────
   Tone — main app
   · no onboarding (context grows in-flow)
   · Claude-Code-style inline clarifying questions
   · follow-up notes that re-think the advice
   Ported from the prototype's main.jsx.
─────────────────────────────────────────────── */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { I } from './lib/icons'
import { LS, load, save } from './lib/storage'
import { uid } from './lib/org'
import { lastAdvice } from './lib/history'
import { refineAnswer } from './lib/scenarios'
import type { ClarifyAnswers, HistoryEntry, Org, Scenario } from './lib/types'
import { Home } from './features/ask/Home'
import { AnswerView } from './features/answer/AnswerView'
import { History } from './features/history/History'
import { CompanyTab } from './features/company/CompanyTab'
import { Thinking } from './components/Thinking'

type Screen = 'home' | 'thinking' | 'answer' | 'company' | 'history'
type AnswerFrom = 'home' | 'history'

export default function App() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => load<HistoryEntry[]>(LS.hist, []))
  const [org, setOrg] = useState<Org>(() => load<Org>(LS.org, { structure: null, teams: [], people: [] }))
  const [screen, setScreen] = useState<Screen>('home')
  const [thinkText, setThinkText] = useState('')
  const [current, setCurrent] = useState<HistoryEntry | null>(null)
  const [answerFrom, setAnswerFrom] = useState<AnswerFrom>('home')

  useEffect(() => {
    save(LS.hist, history)
  }, [history])
  useEffect(() => {
    save(LS.org, org)
  }, [org])

  const generate = (question: string, scenario: Scenario, answers: ClarifyAnswers) => {
    setThinkText('Finding the safe move…')
    setScreen('thinking')
    setTimeout(() => {
      const answer = scenario.build(answers, { org })
      const entry: HistoryEntry = {
        id: 'e' + Date.now(),
        ts: Date.now(),
        question,
        scenarioId: scenario.id,
        answers,
        thread: [{ role: 'advice', answer }],
      }
      setHistory((h) => [entry, ...h])
      setCurrent(entry)
      setAnswerFrom('home')
      setScreen('answer')
    }, 950)
  }

  const refine = (comment: string) => {
    if (!current) return
    const prev = lastAdvice(current)
    if (!prev) return
    const refined = refineAnswer(prev, comment)
    const updated: HistoryEntry = {
      ...current,
      thread: [...current.thread, { role: 'you', text: comment }, { role: 'advice', answer: refined }],
    }
    setCurrent(updated)
    setHistory((h) => h.map((e) => (e.id === updated.id ? updated : e)))
  }

  const addTeams = (names: string[]) =>
    setOrg((o) => ({
      ...o,
      teams: [...o.teams, ...names.map((n) => ({ id: uid('t'), name: n, parent: null, mine: false }))],
    }))
  const openHistoryItem = (it: HistoryEntry) => {
    setCurrent(it)
    setAnswerFrom('history')
    setScreen('answer')
  }
  const goHome = () => {
    setCurrent(null)
    setScreen('home')
  }

  const navActive = (s: Screen) =>
    screen === s || (s === 'home' && screen === 'thinking') || (s === answerFrom && screen === 'answer')

  let body: ReactNode
  if (screen === 'thinking') body = <Thinking text={thinkText} />
  else if (screen === 'answer' && current)
    body = (
      <AnswerView
        entry={current}
        org={org}
        onAddTeams={addTeams}
        onRefine={refine}
        backLabel={answerFrom === 'history' ? 'Back to history' : 'Back'}
        onBack={() => setScreen(answerFrom === 'history' ? 'history' : 'home')}
        onAgain={goHome}
      />
    )
  else if (screen === 'company') body = <CompanyTab org={org} setOrg={setOrg} />
  else if (screen === 'history') body = <History items={history} onOpen={openHistoryItem} />
  else body = <Home onGenerate={generate} />

  const peopleCount = org.people.length

  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-brand">
          <div className="mark">
            <I.compass size={20} />
          </div>
          <span className="wordmark">Tone</span>
        </div>
        <button className={'nav-item' + (navActive('home') ? ' active' : '')} onClick={goHome}>
          <span className="ic">
            <I.message size={19} />
          </span>{' '}
          New question
        </button>
        <button className={'nav-item' + (navActive('company') ? ' active' : '')} onClick={() => setScreen('company')}>
          <span className="ic">
            <I.network size={19} />
          </span>{' '}
          Company map
          {org.teams.length + peopleCount > 0 && <span className="nav-count">{org.teams.length + peopleCount}</span>}
        </button>
        <button className={'nav-item' + (navActive('history') ? ' active' : '')} onClick={() => setScreen('history')}>
          <span className="ic">
            <I.history size={19} />
          </span>{' '}
          History
          {history.length > 0 && <span className="nav-count">{history.length}</span>}
        </button>

        <div className="rail-foot">
          <div className="calm-note">
            <span className="cn-ic">
              <I.wind size={16} />
            </span>
            <p>Anxiety is normal. Take a breath. No one here is rushing you or keeping score.</p>
          </div>
        </div>
      </aside>

      <main className="main">{body}</main>
    </div>
  )
}
