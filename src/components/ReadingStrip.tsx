import type { CSSProperties } from 'react'
import { I } from '../lib/icons'

interface Props {
  label?: string
  style?: CSSProperties
}

/** The small "breathing orb" strip shown while Tone is reading or rethinking. */
export function ReadingStrip({ label = 'Reading the situation…', style }: Props) {
  return (
    <div className="reading-strip fade-up" style={style}>
      <span className="rs-orb">
        <I.sparkle size={14} />
      </span>
      <span>{label}</span>
    </div>
  )
}
