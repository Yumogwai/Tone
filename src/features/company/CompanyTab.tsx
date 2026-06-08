/* Company map — an editable org tree of teams + personas, growing from the
   user's own inputs (and quietly from chat inference). Ported from the
   prototype's company.jsx, kept as one cohesive module. */
import { useState } from 'react'
import type { Dispatch, ReactElement, SetStateAction } from 'react'
import { I } from '../../lib/icons'
import { Avatar, AVATARS, RELATIONS, TRAITS } from '../../lib/avatars'
import { ROLE_SUGGEST, STRUCTURES, uid } from '../../lib/org'
import type { Org, Person, Team } from '../../lib/types'

interface NodeHandlers {
  onEditTeam: (team: Team) => void
  onAddPerson: (teamId: string | null) => void
  onEditPerson: (person: Person) => void
}

/* ── Structure dropdown ─────────────────────── */
function StructureDropdown({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false)
  const cur = STRUCTURES.find((s) => s.id === value)
  return (
    <div className="dd">
      <button className={'dd-btn' + (open ? ' open' : '')} onClick={() => setOpen((o) => !o)}>
        <span className="dd-cur">
          {cur ? (
            <>
              <b>{cur.name}</b>
              <em> · {cur.desc}</em>
            </>
          ) : (
            <span style={{ color: 'var(--ink-5)' }}>Not set — optional</span>
          )}
        </span>
        <I.chevronDown
          size={16}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms', color: 'var(--ink-4)' }}
        />
      </button>
      {open && (
        <>
          <div className="dd-backdrop" onMouseDown={() => setOpen(false)} />
          <div className="dd-menu fade-in">
            <button
              className={'dd-item' + (!value ? ' on' : '')}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              <span className="dd-name">Not set</span>
            </button>
            {STRUCTURES.map((s) => (
              <button
                key={s.id}
                className={'dd-item' + (value === s.id ? ' on' : '')}
                onClick={() => {
                  onChange(s.id)
                  setOpen(false)
                }}
              >
                <span className="dd-name">{s.name}</span>
                <span className="dd-desc">{s.desc}</span>
                {value === s.id && (
                  <span className="dd-check">
                    <I.checkSm size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Avatar picker ──────────────────────────── */
function AvatarPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="avatar-grid">
      {AVATARS.map((a) => (
        <button
          key={a.id}
          type="button"
          className={'avatar-pick' + (value === a.id ? ' on' : '')}
          onClick={() => onChange(a.id)}
        >
          <Avatar id={a.id} size={40} />
        </button>
      ))}
    </div>
  )
}

/* ── Persona modal ──────────────────────────── */
function PersonaModal({
  initial,
  teams,
  onSave,
  onDelete,
  onClose,
}: {
  initial: Person
  teams: Team[]
  onSave: (p: Person) => void
  onDelete: (() => void) | null
  onClose: () => void
}) {
  const [p, setP] = useState<Person>(initial)
  const set = (patch: Partial<Person>) => setP((s) => ({ ...s, ...patch }))
  const toggleTrait = (t: string) =>
    setP((s) => ({ ...s, traits: s.traits.includes(t) ? s.traits.filter((x) => x !== t) : [...s.traits, t] }))
  const valid = p.name.trim().length > 0

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="popup modal-wide" role="dialog" aria-modal="true">
        <div className="popup-head">
          <div className="persona-hero">
            <Avatar id={p.avatarId} size={52} />
            <div>
              <div className="ph-name">{p.name.trim() || 'New person'}</div>
              <div className="ph-role">{p.role.trim() || 'role not set'}</div>
            </div>
          </div>
        </div>
        <div className="modal-scroll">
          <div className="fld">
            <div className="field-label">Avatar</div>
            <AvatarPicker value={p.avatarId} onChange={(v) => set({ avatarId: v })} />
          </div>
          <div className="fld">
            <div className="field-label">Name</div>
            <input
              className="soft-input"
              placeholder="e.g. Anna"
              autoFocus
              value={p.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          <div className="fld">
            <div className="field-label">Role</div>
            <input className="soft-input" placeholder="e.g. team lead" value={p.role} onChange={(e) => set({ role: e.target.value })} />
            <div className="trait-row" style={{ marginTop: 9 }}>
              {ROLE_SUGGEST.map((r) => (
                <button key={r} type="button" className={'opt' + (p.role === r ? ' on' : '')} onClick={() => set({ role: r })}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="fld">
            <div className="field-label">Who they are to you</div>
            <div className="trait-row">
              {RELATIONS.map((r) => (
                <button key={r} type="button" className={'opt' + (p.relation === r ? ' on' : '')} onClick={() => set({ relation: r })}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {teams.length > 0 && (
            <div className="fld">
              <div className="field-label">Team</div>
              <div className="trait-row">
                <button type="button" className={'opt' + (!p.teamId ? ' on' : '')} onClick={() => set({ teamId: null })}>
                  No team
                </button>
                {teams.map((t) => (
                  <button key={t.id} type="button" className={'opt' + (p.teamId === t.id ? ' on' : '')} onClick={() => set({ teamId: t.id })}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="fld">
            <div className="field-label">
              Character <span style={{ color: 'var(--ink-5)', fontWeight: 400 }}>— quick tags</span>
            </div>
            <div className="trait-row">
              {TRAITS.map((t) => (
                <button key={t} type="button" className={'opt' + (p.traits.includes(t) ? ' on' : '')} onClick={() => toggleTrait(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="fld">
            <div className="field-label">
              In your own words <span style={{ color: 'var(--ink-5)', fontWeight: 400 }}>— I'll factor this into advice</span>
            </div>
            <textarea
              className="soft-input"
              rows={3}
              style={{ resize: 'vertical', lineHeight: 1.5 }}
              placeholder="e.g. warms up slowly, hates long messages, replies fast but bluntly, sensitive to being corrected in public…"
              value={p.note || ''}
              onChange={(e) => set({ note: e.target.value })}
            />
          </div>
        </div>
        <div className="popup-foot">
          {onDelete && (
            <button className="btn btn-quiet" style={{ color: 'var(--danger-500)' }} onClick={onDelete}>
              <I.trash size={15} /> Delete
            </button>
          )}
          <div className="spacer" />
          <button className="btn btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSave(p)}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Team modal ─────────────────────────────── */
function TeamModal({
  initial,
  teams,
  onSave,
  onDelete,
  onClose,
}: {
  initial: Team
  teams: Team[]
  onSave: (t: Team) => void
  onDelete: (() => void) | null
  onClose: () => void
}) {
  const [t, setT] = useState<Team>(initial)
  const set = (patch: Partial<Team>) => setT((s) => ({ ...s, ...patch }))
  const others = teams.filter((x) => x.id !== t.id)
  const valid = t.name.trim().length > 0
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="popup" role="dialog" aria-modal="true">
        <div className="popup-head">
          <h2 className="popup-title">{initial.id ? 'Team' : 'New team'}</h2>
        </div>
        <div className="modal-scroll">
          <div className="fld">
            <div className="field-label">Name</div>
            <input className="soft-input" placeholder="e.g. Design" autoFocus value={t.name} onChange={(e) => set({ name: e.target.value })} />
          </div>
          <div className="fld">
            <div className="field-label">Sits under</div>
            <div className="trait-row">
              <button type="button" className={'opt' + (!t.parent ? ' on' : '')} onClick={() => set({ parent: null })}>
                Top level
              </button>
              {others.map((o) => (
                <button key={o.id} type="button" className={'opt' + (t.parent === o.id ? ' on' : '')} onClick={() => set({ parent: o.id })}>
                  {o.name}
                </button>
              ))}
            </div>
          </div>
          <div className="fld">
            <label className="person-row" style={{ cursor: 'pointer', padding: '4px 0' }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  border: '1.5px solid ' + (t.mine ? 'var(--accent)' : 'var(--ink-6)'),
                  background: t.mine ? 'var(--accent)' : 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                }}
              >
                {t.mine && <I.checkSm size={13} />}
              </span>
              <input type="checkbox" checked={t.mine} onChange={(e) => set({ mine: e.target.checked })} style={{ display: 'none' }} />
              <span style={{ fontSize: 14.5, color: 'var(--ink-2)' }}>This is my team</span>
            </label>
          </div>
        </div>
        <div className="popup-foot">
          {onDelete && (
            <button className="btn btn-quiet" style={{ color: 'var(--danger-500)' }} onClick={onDelete}>
              <I.trash size={15} /> Delete
            </button>
          )}
          <div className="spacer" />
          <button className="btn btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSave(t)}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Tree node ──────────────────────────────── */
function TeamNode({
  team,
  org,
  onEditTeam,
  onAddPerson,
  onEditPerson,
  isRoot,
}: NodeHandlers & { team: Team; org: Org; isRoot?: boolean }) {
  const people = org.people.filter((pp) => pp.teamId === team.id)
  return (
    <div className={'team-node' + (isRoot ? ' root' : '') + (team.mine ? ' mine' : '')}>
      <div className="tn-head">
        <span className="tn-ic">
          <I.building size={16} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="tn-name">{team.name}</div>
          {team.mine && <div className="tn-mine">my team</div>}
        </div>
        {!isRoot && (
          <div className="tn-ctrls">
            <button className="mini-btn" onClick={() => onEditTeam(team)} title="Edit">
              <I.pen size={13} />
            </button>
          </div>
        )}
      </div>
      {people.length > 0 && (
        <div className="tn-people">
          {people.map((pp) => (
            <div className="person-row" key={pp.id} onClick={() => onEditPerson(pp)}>
              <Avatar id={pp.avatarId} size={28} />
              <div className="pr-meta">
                <div className="pr-name">{pp.name}</div>
                {pp.role && <div className="pr-role">{pp.role}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="tn-add" onClick={() => onAddPerson(team.id)}>
        <I.userPlus size={13} /> Person
      </button>
    </div>
  )
}

function renderTree(parentId: string | null, org: Org, handlers: NodeHandlers): ReactElement | null {
  const kids = org.teams.filter((t) => (t.parent || null) === parentId)
  if (!kids.length) return null
  return (
    <ul>
      {kids.map((t) => (
        <li key={t.id}>
          <TeamNode team={t} org={org} {...handlers} />
          {renderTree(t.id, org, handlers)}
        </li>
      ))}
    </ul>
  )
}

/* ── Company tab ────────────────────────────── */
export function CompanyTab({ org, setOrg }: { org: Org; setOrg: Dispatch<SetStateAction<Org>> }) {
  const [teamModal, setTeamModal] = useState<Team | null>(null)
  const [personaModal, setPersonaModal] = useState<Person | null>(null)

  const newTeam = () =>
    setTeamModal({ id: '', name: org.teams.length ? '' : 'My team', parent: null, mine: org.teams.length === 0 })
  const saveTeam = (t: Team) => {
    setOrg((o) => {
      const exists = o.teams.some((x) => x.id === t.id)
      let teams: Team[]
      if (exists) teams = o.teams.map((x) => (x.id === t.id ? t : x))
      else teams = [...o.teams, { ...t, id: uid('t') }]
      if (t.mine) {
        const keep = exists ? t.id : teams[teams.length - 1].id
        teams = teams.map((x) => (x.mine && x.id !== keep ? { ...x, mine: false } : x))
      }
      return { ...o, teams }
    })
    setTeamModal(null)
  }
  const deleteTeam = (id: string) => {
    setOrg((o) => ({
      ...o,
      teams: o.teams.filter((x) => x.id !== id).map((x) => (x.parent === id ? { ...x, parent: null } : x)),
      people: o.people.map((x) => (x.teamId === id ? { ...x, teamId: null } : x)),
    }))
    setTeamModal(null)
  }

  const newPerson = (teamId: string | null) =>
    setPersonaModal({
      id: '',
      name: '',
      role: '',
      avatarId: AVATARS[Math.floor(Math.random() * AVATARS.length)].id,
      teamId: teamId || null,
      relation: '',
      traits: [],
      note: '',
    })
  const savePerson = (p: Person) => {
    setOrg((o) => {
      const exists = o.people.some((x) => x.id === p.id)
      return { ...o, people: exists ? o.people.map((x) => (x.id === p.id ? p : x)) : [...o.people, { ...p, id: uid('p') }] }
    })
    setPersonaModal(null)
  }
  const deletePerson = (id: string) => {
    setOrg((o) => ({ ...o, people: o.people.filter((x) => x.id !== id) }))
    setPersonaModal(null)
  }

  const handlers: NodeHandlers = {
    onEditTeam: (t) => setTeamModal(t),
    onAddPerson: newPerson,
    onEditPerson: (p) => setPersonaModal(p),
  }
  const unassigned = org.people.filter((p) => !p.teamId)
  const hasMap = org.teams.length > 0 || org.people.length > 0

  return (
    <div className="map-pad">
      <div className="page-head fade-up">
        <h1 className="page-title">Company map</h1>
        <p className="page-sub">
          This sketch builds itself from what you tell me — and you can fix it by hand. The clearer the map, the
          sharper the advice.
        </p>
      </div>

      <div className="fade-up" style={{ maxWidth: 360, position: 'relative', zIndex: 30 }}>
        <div className="field-label" style={{ marginBottom: 9 }}>
          Structure <span style={{ color: 'var(--ink-5)', fontWeight: 400 }}>— set once, optional</span>
        </div>
        <StructureDropdown value={org.structure} onChange={(v) => setOrg((o) => ({ ...o, structure: v }))} />
      </div>

      <div className="map-toolbar fade-up">
        <button className="btn btn-soft btn-sm" onClick={newTeam}>
          <I.plus size={15} /> Team
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => newPerson(null)}>
          <I.userPlus size={15} /> Person
        </button>
      </div>

      <div className="map-canvas fade-up">
        {!hasMap ? (
          <div className="map-empty">
            <div className="me-ic">
              <I.network size={28} />
            </div>
            <h3>Your company will take shape here</h3>
            <p>
              Add a team by hand — or just keep asking questions. When you mention another department or person, I'll
              offer to add them here.
            </p>
            <button className="btn btn-primary" onClick={newTeam}>
              <I.plus size={16} /> Add a team
            </button>
          </div>
        ) : (
          <div className="tree">
            <ul>
              <li>
                <div className="team-node root">
                  <div className="tn-head">
                    <span className="tn-ic">
                      <I.building size={16} />
                    </span>
                    <div className="tn-name">Company</div>
                  </div>
                  {unassigned.length > 0 && (
                    <div className="tn-people">
                      {unassigned.map((pp) => (
                        <div className="person-row" key={pp.id} onClick={() => setPersonaModal(pp)}>
                          <Avatar id={pp.avatarId} size={28} />
                          <div className="pr-meta">
                            <div className="pr-name">{pp.name}</div>
                            {pp.role && <div className="pr-role">{pp.role}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {renderTree(null, org, handlers)}
              </li>
            </ul>
          </div>
        )}
      </div>

      {teamModal && (
        <TeamModal
          initial={teamModal}
          teams={org.teams}
          onSave={saveTeam}
          onDelete={teamModal.id ? () => deleteTeam(teamModal.id) : null}
          onClose={() => setTeamModal(null)}
        />
      )}
      {personaModal && (
        <PersonaModal
          initial={personaModal}
          teams={org.teams}
          onSave={savePerson}
          onDelete={personaModal.id ? () => deletePerson(personaModal.id) : null}
          onClose={() => setPersonaModal(null)}
        />
      )}
    </div>
  )
}
