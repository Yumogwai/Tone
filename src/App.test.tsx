import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => localStorage.clear())

  it('opens straight on the ask screen (no onboarding) with the greeting and brand', () => {
    render(<App />)
    expect(screen.getByText('How can I help?')).toBeInTheDocument()
    expect(screen.getByText('Tone')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /New question/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Company map/i })).toBeInTheDocument()
  })

  it('shows the common starting points on first run', () => {
    render(<App />)
    expect(screen.getByText('Common starting points')).toBeInTheDocument()
  })
})
