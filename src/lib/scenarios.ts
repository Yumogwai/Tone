/* ───────────────────────────────────────────────
   Scenario engine. Each scenario asks 1–3 clarifying
   questions (each with tappable options), then builds
   a calm "safe move". refineAnswer() lets the advice
   be reconsidered after the user adds a follow-up.

   Ported verbatim from the prototype's data.jsx — now typed.
   When the AI/RAG backend lands, these canned builders are
   the swap point; the UI does not change.
─────────────────────────────────────────────── */
import type { Advice, Scenario } from './types'

// tilt: where the safe move sits on the wait↔act axis (0 = wait, 1 = act)
export const EXAMPLES = [
  'I went quiet on a coworker for a whole day — is it okay to message “sorry I dropped off”?',
  "Should I introduce myself in the team's group chat?",
  "I didn't fully get a task from my manager — can I re-ask without looking dumb?",
  "I posted a question in the chat an hour ago and it's still silent — what now?",
]

export const SCENARIOS: Scenario[] = [
  {
    id: 'followup',
    kw: ['went quiet', 'dropped off', 'disappear', 'sorry i', "didn't reply", "haven't replied", "didn't get back", 'follow up', 'followup', 'ghosted'],
    clarify: [
      { id: 'gap', q: 'How long has it gone unanswered?', options: ['Less than a day', 'A day or two', 'Almost a week', 'Over a week'] },
      { id: 'kind', q: 'Was it work, or more personal?', options: ['Pure work', 'Semi-work', 'Casual'] },
      { id: 'who', q: 'Who is this person to you?', options: ['A peer', 'Senior / my manager', 'From another team'] },
    ],
    build: (a) => {
      const short = a.gap === 'Less than a day' || a.gap === 'A day or two'
      const senior = a.who === 'Senior / my manager'
      return {
        action: short
          ? 'Just reply on the substance — no apology for “disappearing.”'
          : 'Briefly come back to the thread, name the gap in one light phrase, then go straight to the point.',
        why: short
          ? 'A day or two is normal rhythm, not a missed deadline. An apology here draws attention to a pause nobody was counting. In most teams that kind of silence reads as completely fine.'
          : 'A long pause is worth a light touch — but not a full explanation. One warm phrase clears the awkwardness, and moving to the task shows you\'re on it.' +
            (senior ? ' With a manager, brevity and outcomes are valued far more than reasons.' : ''),
        over: { label: 'If you overdo it', text: 'A long apology with reasons turns a non-event into an event — they\'ll start wondering if something is actually wrong.' },
        under: { label: 'If you keep waiting', text: 'A few more days of silence and a short pause starts to look like a ghost. Better to close it now, while it\'s still nothing.' },
        template: short
          ? 'Hey! On [the task] — [your actual answer]. Happy to hop on a quick call today if useful.'
          : 'Hey! Sorry I dropped off — circling back on [the topic]. [your answer]. We can move at whatever pace works for you.',
        tilt: short ? 0.7 : 0.55,
      }
    },
  },
  {
    id: 'intro',
    kw: ['introduce', 'introduc', 'group chat', "i'm new", 'im new', 'new here', 'say hi', 'newcomer', 'first message'],
    clarify: [
      { id: 'live', q: "What's the team chat like?", options: ['Lively, lots of chatter', 'Calm, business only', 'Almost silent'] },
      { id: 'invited', q: 'Has anyone nudged you to say hi?', options: ['Yes, they did', 'No, on my own', 'Not sure'] },
    ],
    build: (a) => {
      const lively = a.live === 'Lively, lots of chatter'
      const quiet = a.live === 'Almost silent'
      return {
        action: quiet
          ? 'Skip a big “hi everyone” in a quiet channel — introduce yourself one-on-one to the people you\'ll actually work with.'
          : 'Post a short, warm intro: name, role, and one human detail. Keep it light, no formalities.',
        why: quiet
          ? 'In a silent channel a loud intro hangs in the void and feels awkward. In that culture, introductions happen in DMs and on calls — warmer and better placed there.'
          : lively
            ? 'A lively chat loves new people — a short intro almost always gets a wave of hellos. One detail about you gives people a hook to reply to.'
            : 'In a work-focused but calm chat, a brief intro on the substance fits well. People will appreciate knowing what you do — it makes you easier to reach.',
        over: { label: 'If you overdo it', text: 'A long life story with hobbies and emoji in a reserved channel reads as “too much” and draws the wrong kind of attention.' },
        under: { label: 'If you stay silent', text: 'With no intro at all, you\'ll be “the new person” for a while. People help those they know, even a little, far more readily.' },
        template: quiet
          ? "Hi [name]! I'm [your name], now working on [area]. Messaging directly since it looks like we'll cross paths — glad to meet you!"
          : "Hey everyone! I'm [your name], just joined as [role], working on [area]. [one human detail]. Feel free to ping me anytime — glad to be here 👋",
        tilt: quiet ? 0.4 : 0.75,
      }
    },
  },
  {
    id: 'reask',
    kw: ['re-ask', 'reask', "didn't get the", "don't understand", "didn't understand", 'not sure what', 'clarif', 'look dumb', 'look stupid', 'ask again', 'confused'],
    clarify: [
      { id: 'tried', q: 'Have you tried figuring it out yourself?', options: ['Yes, but stuck', 'Looked a little', 'Not yet'] },
      { id: 'stakes', q: 'How costly is a mistake here?', options: ['Critical', 'Medium', 'Easy to redo'] },
      { id: 'channel', q: 'How do you usually reach your manager?', options: ['Text', 'Calls', 'Both'] },
    ],
    build: (a) => {
      const tried = a.tried === 'Yes, but stuck'
      const high = a.stakes === 'Critical'
      return {
        action: tried
          ? 'Re-ask — but not “I don\'t get it.” Lead with your best guess and ask about the one fork you\'re unsure on.'
          : 'Spend 10–15 minutes on your own attempt first, then ask one specific question instead of “how do I do this?”',
        why:
          'Re-asking isn\'t weakness — it\'s how you avoid driving in the wrong direction. ' +
          (high ? 'When a mistake is expensive, a quick check saves everyone hours of rework — your manager will be glad, not annoyed. ' : '') +
          'A question with a hypothesis (“I read it as X — right?”) shows you thought it through, and makes it easy for them to say “yes” or correct one detail.',
        over: { label: 'If you re-ask everything', text: 'A stream of tiny questions on every step makes it feel like you need hand-holding. Better to batch them into one pass.' },
        under: { label: 'If you silently guess', text: 'Guessing wrong costs far more than one question: you\'ll redo the work, and that doesn\'t build trust — especially when stakes are high.' },
        template: 'Hey! On [the task], I want to sanity-check before I run with it. I read it as: [your version]. Is that right, or is there a nuance on [the fork]?',
        tilt: 0.65,
      }
    },
  },
  {
    id: 'silence',
    kw: ['no one', 'no-one', 'nobody', 'ignored', 'ignoring', 'no reply', 'no response', 'still nothing', 'posted', 'an hour', 'radio silence', 'unanswered'],
    clarify: [
      { id: 'elapsed', q: 'How long since you posted?', options: ['Under an hour', 'A few hours', 'Since yesterday', 'A couple of days'] },
      { id: 'urgent', q: 'How urgent is it for you?', options: ['Burning now', 'Ideally today', 'Can wait'] },
    ],
    build: (a) => {
      const fresh = a.elapsed === 'Under an hour' || a.elapsed === 'A few hours'
      const urgent = a.urgent === 'Burning now'
      return {
        action:
          fresh && !urgent
            ? 'Wait — nothing to do yet. A couple of hours of quiet almost always means “people are busy,” not “you\'re being ignored.”'
            : urgent
              ? 'Gently bump the message and flag the urgency — better aimed at one person than the whole channel.'
              : 'Calmly nudge with one short line, no reproach. Tagging a specific person helps.',
        why:
          fresh && !urgent
            ? 'In work chats, replies rarely land instantly. Silence here is almost never about you. Give people time to get to the message.'
            : 'A reminder is fine when it carries no blame and a clear “what I need.” A direct ping beats a broadcast: the message gets a specific owner.',
        over: { label: 'If you push', text: 'Several reminders in a row, or a “??”, read as impatience and put people on the defensive. One careful ping is the ceiling.' },
        under: {
          label: 'If you just wait',
          text: urgent
            ? 'When it\'s burning, silent waiting hurts you — the deadline creeps closer with no movement. A nudge here is responsibility, not pushiness.'
            : 'Messages do sometimes sink. With no reminder at all, the question can hang for days.',
        },
        template: urgent
          ? 'Hi [name]! Bumping my message — [the topic] is time-sensitive for [deadline]. Is it realistic to make it, or should I find another route?'
          : 'Hey! Just floating this back up — could use your eyes on [the topic] whenever you get a minute. No rush 🙂',
        tilt: fresh && !urgent ? 0.2 : 0.55,
      }
    },
  },
]

export const GENERIC: Scenario = {
  id: 'generic',
  clarify: [
    { id: 'rel', q: 'How close are you with this person?', options: ['Just met', "We're fine", 'Close / friendly'] },
    { id: 'urgency', q: 'How urgent is it?', options: ['Not pressing', 'Within the day', 'Right now'] },
    { id: 'register', q: 'Is it work or personal?', options: ['Work', 'In between', 'Personal'] },
  ],
  build: (a) => {
    const close = a.rel === 'Close / friendly'
    const urgent = a.urgency === 'Right now'
    return {
      action: urgent
        ? 'Act briefly and directly: one clear message with a specific ask.'
        : close
          ? 'Keep it plain and human — formalities would feel off here.'
          : 'Write calmly and to the point, a touch warmer than usual — enough to read as neither cold nor pushy.',
      why:
        'For most team cultures the safest bet is the middle path: state clearly what you need, and leave the other person room to respond. ' +
        (close
          ? 'Since you\'re already close, extra distance would read as strange.'
          : 'While you\'re still settling in, a bit more warmth removes the risk of landing wrong.'),
      over: { label: 'If you push too hard', text: 'Too long, too insistent, or too emotional — and the other person feels pressure where there wasn\'t any.' },
      under: { label: 'If you do nothing', text: 'Silence rarely resolves itself. More often it just leaves you anxious and the question open. A small step almost always beats a pause.' },
      template: 'Hi! [the gist in a line]. [exactly what you need from them]? Thanks!',
      tilt: urgent ? 0.7 : 0.5,
    }
  },
}

export function pickScenario(text: string): Scenario {
  const t = (text || '').toLowerCase()
  for (const s of SCENARIOS) if (s.kw && s.kw.some((k) => t.includes(k))) return s
  return GENERIC
}

/** Reconsider an answer after the user adds a follow-up note. */
export function refineAnswer(prev: Advice, comment: string): Advice {
  const c = (comment || '').toLowerCase()
  const cautious = /(too much|pushy|aggress|nervous|anxious|scared|worried|awkward|don'?t want|hesitant|shy|overthink|nag)/.test(c)
  const direct = /(no time|urgent|asap|deadline|still nothing|ignored|already waited|too slow|need.*(now|today)|day(s)? now|burning)/.test(c)
  const senior = /(boss|manager|senior|ceo|lead|director|head of|exec|vp)/.test(c)

  let tilt = prev.tilt
  let action = prev.action
  let lead = ''
  let addWhy = ''

  if (direct && !cautious) {
    tilt = Math.min(0.92, prev.tilt + 0.22)
    action = 'Go ahead and follow up directly now — one clear message that names what you need and by when.'
    lead = 'Heard — since time is the real pressure here, leaning in a little is worth the small risk of seeming eager.'
    addWhy = 'A specific, kind nudge moves things; waiting longer mostly costs you, not them.'
  } else if (cautious) {
    tilt = Math.max(0.12, prev.tilt - 0.22)
    action = 'Dial it back: wait a beat, then send something low-key and short — a light touch, zero pressure.'
    lead = "Totally fair — let's take the softer read. There's no need to force this."
    addWhy = 'A gentle, no-pressure version protects the relationship and still keeps the door open.'
  } else {
    lead = 'Got it — thanks for the extra context. Here\'s the same move, tuned to what you added.'
    addWhy = 'Nothing here changes the core advice; it mostly sharpens the wording for your situation.'
  }
  if (senior) addWhy += ' With someone senior, keep it short and outcome-first — they\'ll read brevity as respect for their time.'

  return { ...prev, tilt, action, revisedNote: lead, why: addWhy + ' ' + prev.why }
}
