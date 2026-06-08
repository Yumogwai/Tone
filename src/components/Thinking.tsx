import { I } from '../lib/icons'

/** Full-height "thinking" state with the slow breathing orb. */
export function Thinking({ text }: { text: string }) {
  return (
    <div className="thinking fade-in">
      <div className="think-orb">
        <I.sparkle size={24} />
      </div>
      <div className="think-txt">{text}</div>
    </div>
  )
}
