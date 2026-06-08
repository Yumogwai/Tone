/* Top-level error boundary — a calm fallback instead of a blank white screen
   if anything throws during render. Saved questions/map are untouched (localStorage). */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { I } from '../lib/icons'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where a monitoring hook (e.g. Sentry) would go.
    console.error('Tone hit an unexpected error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <div className="mark lg" style={{ margin: '0 auto' }}>
            <I.compass size={30} />
          </div>
          <h1>Something went a little sideways</h1>
          <p>Sorry — Tone hit a snag. A refresh usually sorts it out, and your saved questions are safe on this device.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <I.refresh size={15} /> Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
