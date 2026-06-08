/* Personas — a calm, cohesive avatar set.
   Soft duotone heads, minimal serene faces, a few gentle accessories.
   Ported verbatim from the prototype's avatars.jsx — now typed + exported. */
import type { CSSProperties } from 'react'

export type Accessory = 'none' | 'leaf' | 'glasses' | 'freckles'

export interface AvatarData {
  id: string
  /** gradient top */
  c1: string
  /** gradient bottom */
  c2: string
  /** accent (accessory) */
  ac: string
  /** face expression index (0–3) */
  face: number
  acc: Accessory
}

export const AVATARS: AvatarData[] = [
  { id: 'av1', c1: '#c7c2f3', c2: '#9c95e1', ac: '#6f66c4', face: 0, acc: 'none' },
  { id: 'av2', c1: '#dccdef', c2: '#bb9fe1', ac: '#8c66c2', face: 1, acc: 'leaf' },
  { id: 'av3', c1: '#bedcc6', c2: '#90c19f', ac: '#5f9a78', face: 3, acc: 'none' },
  { id: 'av4', c1: '#bfd8f0', c2: '#91b8e0', ac: '#5f8fc4', face: 2, acc: 'glasses' },
  { id: 'av5', c1: '#c0e4db', c2: '#90cabc', ac: '#5fa593', face: 1, acc: 'none' },
  { id: 'av6', c1: '#eedcbb', c2: '#dac08d', ac: '#b89a5c', face: 0, acc: 'freckles' },
  { id: 'av7', c1: '#f4d4c1', c2: '#e5af91', ac: '#cd8b63', face: 3, acc: 'none' },
  { id: 'av8', c1: '#f1ccd6', c2: '#e0a2b4', ac: '#c4798e', face: 1, acc: 'freckles' },
  { id: 'av9', c1: '#ecc2c9', c2: '#d597a2', ac: '#bb6f7e', face: 0, acc: 'glasses' },
  { id: 'av10', c1: '#e8c9b8', c2: '#d2a288', ac: '#b67c5f', face: 2, acc: 'none' },
  { id: 'av11', c1: '#d8c8f0', c2: '#b8a0e1', ac: '#9276c4', face: 3, acc: 'leaf' },
  { id: 'av12', c1: '#c5cbe2', c2: '#9ca6cb', ac: '#737ea8', face: 1, acc: 'glasses' },
  { id: 'av13', c1: '#cfe6c4', c2: '#a3cd92', ac: '#79a85f', face: 0, acc: 'none' },
  { id: 'av14', c1: '#f0dcc0', c2: '#e0bd90', ac: '#c39e5f', face: 2, acc: 'freckles' },
  { id: 'av15', c1: '#cdc6ef', c2: '#a59ce0', ac: '#7d72c8', face: 3, acc: 'none' },
  { id: 'av16', c1: '#bfe0ec', c2: '#90c4d9', ac: '#5f9bb6', face: 1, acc: 'none' },
]

const AV_MAP: Record<string, AvatarData> = Object.fromEntries(AVATARS.map((a) => [a.id, a]))
const FEAT = 'rgba(40,36,58,0.50)'

function Face({ v }: { v: number }) {
  // eyes
  const eyes =
    v === 1
      ? [
          <path key="el" d="M35 53 q3.5 3 7 0" fill="none" stroke={FEAT} strokeWidth="2.4" strokeLinecap="round" />,
          <path key="er" d="M58 53 q3.5 3 7 0" fill="none" stroke={FEAT} strokeWidth="2.4" strokeLinecap="round" />,
        ]
      : [
          <circle key="el" cx="38.5" cy="54" r="2.7" fill={FEAT} />,
          <circle key="er" cx="61.5" cy="54" r="2.7" fill={FEAT} />,
        ]
  // mouth
  const mouth =
    v === 2 ? (
      <path d="M43 66 q7 3 14 0" fill="none" stroke={FEAT} strokeWidth="2.4" strokeLinecap="round" />
    ) : v === 3 ? (
      <path d="M41 64 q9 8 18 0" fill="none" stroke={FEAT} strokeWidth="2.6" strokeLinecap="round" />
    ) : (
      <path d="M44 65 q6 5 12 0" fill="none" stroke={FEAT} strokeWidth="2.5" strokeLinecap="round" />
    )
  return (
    <g>
      {eyes}
      {mouth}
    </g>
  )
}

export interface AvatarProps {
  id: string
  size?: number
  style?: CSSProperties
}

export function Avatar({ id, size = 44, style }: AvatarProps) {
  const a = AV_MAP[id] || AVATARS[0]
  const gid = 'ag_' + a.id
  const cid = 'ac_' + a.id
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: '50%', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a.c1} />
          <stop offset="1" stopColor={a.c2} />
        </linearGradient>
        <clipPath id={cid}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={'url(#' + cid + ')'}>
        <rect width="100" height="100" fill={'url(#' + gid + ')'} />
        <Face v={a.face} />
        {a.acc === 'glasses' && (
          <g fill="none" stroke={FEAT} strokeWidth="2">
            <circle cx="38.5" cy="54" r="6.5" />
            <circle cx="61.5" cy="54" r="6.5" />
            <path d="M45 53 h10" strokeLinecap="round" />
          </g>
        )}
        {a.acc === 'freckles' && (
          <g fill="rgba(40,36,58,0.18)">
            <circle cx="31" cy="61" r="1.7" />
            <circle cx="36" cy="63" r="1.7" />
            <circle cx="64" cy="61" r="1.7" />
            <circle cx="69" cy="63" r="1.7" />
          </g>
        )}
        {a.acc === 'leaf' && (
          <g>
            <path
              d="M50 16 C45 8 36 8 33 13 C39 14 44 18 50 24 C56 18 61 14 67 13 C64 8 55 8 50 16 Z"
              fill={a.ac}
              opacity="0.9"
            />
            <path d="M50 24 V14" stroke={a.ac} strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  )
}

export const TRAITS = [
  'Friendly', 'Warm', 'Busy', 'Direct', 'Patient',
  'Cautious', 'Formal', 'Demanding', 'New here',
  'Team player', 'Introvert', 'Loyal',
]

export const RELATIONS = [
  'My manager', 'Peer', 'From another team',
  'Department head', 'Adjacent role', 'My report',
]
