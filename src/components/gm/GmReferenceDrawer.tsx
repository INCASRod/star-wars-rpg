'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DICE_TYPES,
  DICE_SYMBOLS,
  DIFFICULTY_LEVELS,
  ATTACK_DIFFICULTIES,
  ATTACK_DIFFICULTY_NOTE,
  RANGED_MODIFIERS,
  ADVANTAGE_TRIUMPH_SPENDING,
  THREAT_DESPAIR_SPENDING,
  COMBAT_MANEUVERS,
  COMBAT_ACTIONS,
  ACTION_ECONOMY_NOTE,
  CRITICAL_INJURIES,
  CRITICAL_INJURY_FOOTNOTE,
  ARMOR_TABLE,
  VEHICLE_CRIT_HITS,
  VEHICLE_CRIT_FOOTNOTE,
  SILHOUETTE_TABLE,
  DAMAGE_CONTROL_TABLE,
  MEDICAL_CHECK_TABLE,
  RANGED_WEAPON_GROUPS,
  MELEE_WEAPON_GROUPS,
  ITEM_QUALITIES,
  SQUAD_OVERVIEW,
  SQUAD_COMBAT_RULES,
  SQUAD_DISBAND_RULES,
  SQUAD_LEADERSHIP_CHECK,
  SQUAD_FORMATIONS,
  SQUADRON_FORMATIONS,
} from '@/lib/gmScreenData'
import { RichText } from '@/components/ui/RichText'

// ── Design tokens ─────────────────────────────────────────────
const FC  = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FST = "var(--font-share-tech-mono), 'Share Tech Mono', monospace"

const BG         = 'rgba(6,10,8,0.97)'
const PANEL      = 'rgba(10,18,12,0.92)'
const GOLD       = '#C8AA50'
const GOLD_DIM   = '#7A6830'
const TEXT       = '#C8D8C0'
const DIM        = '#6A8070'
const FAINT      = '#1E2E22'
const BORDER     = 'rgba(200,170,80,0.14)'
const BORDER_HI  = 'rgba(200,170,80,0.36)'
const GREEN      = '#4EC87A'
const RED        = '#E05050'
const BLUE       = '#5AAAE0'
const PURPLE     = '#9060D0'
const ORANGE     = '#E07855'
const YELLOW     = '#C8AA50'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'
const FS_BODY     = 'var(--text-body)'
const FS_H4       = 'var(--text-h4)'

// ── Severity colour map ────────────────────────────────────────
function severityColor(sev: string): string {
  switch (sev) {
    case 'Easy':      return GREEN
    case 'Average':   return YELLOW
    case 'Hard':      return ORANGE
    case 'Daunting':  return RED
    case 'Formidable':return PURPLE
    default:          return DIM
  }
}

// ── Tiny helpers ──────────────────────────────────────────────
const Overline = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontFamily: FC, fontSize: FS_OVERLINE, fontWeight: 700,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color: GOLD_DIM, marginBottom: 6,
  }}>{children}</div>
)

const Divider = () => (
  <div style={{ height: 1, background: BORDER, margin: '14px 0' }} />
)

const Note = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: FC, fontSize: FS_CAPTION, color: DIM,
    fontStyle: 'italic', margin: '8px 0 0', lineHeight: 1.5,
  }}>{children}</p>
)

// ── TAB: DICE ─────────────────────────────────────────────────
function DiceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Dice types */}
      <section>
        <Overline>Dice Types</Overline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DICE_TYPES.map(d => (
            <div key={d.name} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: FAINT, borderRadius: 4, padding: '7px 10px',
            }}>
              <div style={{
                flexShrink: 0, width: 52, textAlign: 'center',
                fontFamily: FST, fontSize: FS_SM, color: d.color, fontWeight: 700,
              }}>
                d{d.sides}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: d.color }}>
                  {d.name}
                </div>
                <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, marginTop: 2 }}>
                  {d.contains.join(' · ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Symbol rules */}
      <section>
        <Overline>Symbol Rules</Overline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DICE_SYMBOLS.map(s => (
            <div key={s.name} style={{ padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
                {s.name}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT, lineHeight: 1.5 }}>
                {s.rules}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Difficulty levels */}
      <section>
        <Overline>Difficulty Levels</Overline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DIFFICULTY_LEVELS.map(d => (
            <div key={d.name} style={{
              display: 'grid', gridTemplateColumns: '100px 32px 1fr', gap: 8,
              padding: '5px 8px', borderRadius: 4,
              background: FAINT,
            }}>
              <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{d.name}</div>
              <div style={{ fontFamily: FST, fontSize: FS_SM, color: PURPLE, textAlign: 'center' }}>{d.dice}</div>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, lineHeight: 1.45 }}>{d.example}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── TAB: COMBAT ───────────────────────────────────────────────
function CombatTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Attack difficulties */}
      <section>
        <Overline>Attack Difficulties by Range</Overline>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FC, fontSize: FS_SM }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER_HI}` }}>
              {['Range Band', 'Difficulty', 'Dice'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '4px 6px',
                  fontSize: FS_OVERLINE, letterSpacing: '0.14em', color: GOLD_DIM, fontWeight: 700,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTACK_DIFFICULTIES.map(r => (
              <tr key={r.band} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '5px 6px', color: TEXT }}>{r.band}</td>
                <td style={{ padding: '5px 6px', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '5px 6px', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Note>{ATTACK_DIFFICULTY_NOTE}</Note>
      </section>

      <Divider />

      {/* Ranged modifiers */}
      <section>
        <Overline>Ranged Modifiers at Engaged</Overline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {RANGED_MODIFIERS.map(m => (
            <div key={m.situation} style={{
              display: 'flex', gap: 8, justifyContent: 'space-between',
              padding: '5px 8px', background: FAINT, borderRadius: 4,
            }}>
              <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT }}>{m.situation}</span>
              <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: ORANGE, whiteSpace: 'nowrap' }}>{m.modifier}</span>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Advantage/Triumph spending */}
      <section>
        <Overline>Advantage & Triumph Spending</Overline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ADVANTAGE_TRIUMPH_SPENDING.map((e, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FST, fontSize: FS_CAPTION, color: GREEN, marginBottom: 4 }}>{e.cost}</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {e.results.map((r, j) => (
                  <li key={j} style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT, lineHeight: 1.5, marginBottom: 2 }}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Threat/Despair spending */}
      <section>
        <Overline>Threat & Despair Spending</Overline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THREAT_DESPAIR_SPENDING.map((e, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FST, fontSize: FS_CAPTION, color: RED, marginBottom: 4 }}>{e.cost}</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {e.results.map((r, j) => (
                  <li key={j} style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT, lineHeight: 1.5, marginBottom: 2 }}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Action economy */}
      <section>
        <Overline>Action Economy</Overline>
        <Note>{ACTION_ECONOMY_NOTE}</Note>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Maneuvers</div>
            {COMBAT_MANEUVERS.map(m => (
              <div key={m.name} style={{ padding: '5px 0', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: BLUE }}>{m.name}: </span>
                <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT }}>{m.description}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Actions</div>
            {COMBAT_ACTIONS.map(a => (
              <div key={a.name} style={{ padding: '5px 0', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: ORANGE }}>{a.name}: </span>
                <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT }}>{a.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// ── TAB: INJURIES ─────────────────────────────────────────────
function InjuriesTab() {
  const [rollInput, setRollInput] = useState('')
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  function handleRollLookup(val: string) {
    setRollInput(val)
    const num = parseInt(val, 10)
    if (isNaN(num)) { setHighlighted(null); return }
    const idx = CRITICAL_INJURIES.findIndex(c => num >= c.rollMin && num <= c.rollMax)
    if (idx !== -1) {
      setHighlighted(idx)
      rowRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      setHighlighted(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Roll lookup */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', background: FAINT, borderRadius: 6,
        border: `1px solid ${BORDER_HI}`,
      }}>
        <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>Roll lookup:</span>
        <input
          type="number"
          min={1}
          max={200}
          value={rollInput}
          onChange={e => handleRollLookup(e.target.value)}
          placeholder="e.g. 75"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            borderBottom: `1px solid ${BORDER_HI}`, outline: 'none',
            fontFamily: FST, fontSize: FS_SM, color: GOLD,
            padding: '2px 4px', textAlign: 'center',
          }}
        />
        {highlighted !== null && (
          <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: GREEN }}>
            {CRITICAL_INJURIES[highlighted].name}
          </span>
        )}
      </div>

      <Note>{CRITICAL_INJURY_FOOTNOTE}</Note>

      {/* Injury rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {CRITICAL_INJURIES.map((inj, i) => (
          <div
            key={i}
            ref={el => { rowRefs.current[i] = el }}
            style={{
              padding: '6px 8px', borderRadius: 4,
              background: highlighted === i ? `rgba(200,170,80,0.08)` : FAINT,
              border: `1px solid ${highlighted === i ? BORDER_HI : 'transparent'}`,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{
                fontFamily: FST, fontSize: FS_OVERLINE, color: DIM, minWidth: 48,
              }}>{inj.rollMin === inj.rollMax ? inj.rollMin : `${inj.rollMin}–${inj.rollMax}`}</span>
              <span style={{
                fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
                color: severityColor(inj.severity), minWidth: 64,
              }}>{inj.dieName}</span>
              <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>
                {inj.name}
              </span>
            </div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, paddingLeft: 56, lineHeight: 1.45 }}>
              {inj.effect}
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Armor */}
      <section>
        <Overline>Armor Reference</Overline>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FC, fontSize: FS_CAPTION }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER_HI}` }}>
              {['Armor', 'Def', 'Soak', 'Enc', 'Notes'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '4px 6px',
                  fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ARMOR_TABLE.map(a => (
              <tr key={a.name} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '5px 6px', color: TEXT, fontWeight: 600 }}>{a.name}</td>
                <td style={{ padding: '5px 6px', color: BLUE, textAlign: 'center' }}>{a.defense}</td>
                <td style={{ padding: '5px 6px', color: GREEN, textAlign: 'center' }}>{a.soak}</td>
                <td style={{ padding: '5px 6px', color: DIM, textAlign: 'center' }}>{a.encumbrance ?? '—'}</td>
                <td style={{ padding: '5px 6px', color: DIM, fontStyle: 'italic' }}>{a.notes ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Medical check */}
      <section>
        <Overline>Medicine Check Difficulty</Overline>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FC, fontSize: FS_CAPTION }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER_HI}` }}>
              {['Wound Level', 'Difficulty', 'Dice'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '4px 6px', fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEDICAL_CHECK_TABLE.map(r => (
              <tr key={r.wounds} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '5px 6px', color: TEXT }}>{r.wounds}</td>
                <td style={{ padding: '5px 6px', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '5px 6px', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

// ── TAB: VEHICLES ─────────────────────────────────────────────
function VehiclesTab() {
  const [rollInput, setRollInput] = useState('')
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  function handleRollLookup(val: string) {
    setRollInput(val)
    const num = parseInt(val, 10)
    if (isNaN(num)) { setHighlighted(null); return }
    const idx = VEHICLE_CRIT_HITS.findIndex(c => num >= c.rollMin && num <= c.rollMax)
    if (idx !== -1) {
      setHighlighted(idx)
      rowRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      setHighlighted(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Roll lookup */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', background: FAINT, borderRadius: 6,
        border: `1px solid ${BORDER_HI}`,
      }}>
        <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>Roll lookup:</span>
        <input
          type="number"
          min={1}
          max={200}
          value={rollInput}
          onChange={e => handleRollLookup(e.target.value)}
          placeholder="e.g. 55"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            borderBottom: `1px solid ${BORDER_HI}`, outline: 'none',
            fontFamily: FST, fontSize: FS_SM, color: GOLD,
            padding: '2px 4px', textAlign: 'center',
          }}
        />
        {highlighted !== null && (
          <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: GREEN }}>
            {VEHICLE_CRIT_HITS[highlighted].name}
          </span>
        )}
      </div>

      <Note>{VEHICLE_CRIT_FOOTNOTE}</Note>

      {/* Crit hits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {VEHICLE_CRIT_HITS.map((hit, i) => (
          <div
            key={i}
            ref={el => { rowRefs.current[i] = el }}
            style={{
              padding: '6px 8px', borderRadius: 4,
              background: highlighted === i ? `rgba(200,170,80,0.08)` : FAINT,
              border: `1px solid ${highlighted === i ? BORDER_HI : 'transparent'}`,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: FST, fontSize: FS_OVERLINE, color: DIM, minWidth: 48 }}>
                {hit.rollMin === hit.rollMax ? hit.rollMin : `${hit.rollMin}–${hit.rollMax}`}
              </span>
              <span style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: severityColor(hit.severity), minWidth: 64 }}>
                {hit.dieName}
              </span>
              <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>
                {hit.name}
              </span>
            </div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, paddingLeft: 56, lineHeight: 1.45 }}>
              {hit.effect}
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Silhouette table */}
      <section>
        <Overline>Silhouette vs. Silhouette</Overline>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FC, fontSize: FS_CAPTION }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER_HI}` }}>
              {['Size Difference', 'Difficulty', 'Dice'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '4px 6px', fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SILHOUETTE_TABLE.map(r => (
              <tr key={r.difference} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '5px 6px', color: TEXT }}>{r.difference}</td>
                <td style={{ padding: '5px 6px', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '5px 6px', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Damage control */}
      <section>
        <Overline>Damage Control (Repair) Difficulty</Overline>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FC, fontSize: FS_CAPTION }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER_HI}` }}>
              {['Hull Level', 'Difficulty', 'Dice'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '4px 6px', fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAMAGE_CONTROL_TABLE.map(r => (
              <tr key={r.hullLevel} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '5px 6px', color: TEXT }}>{r.hullLevel}</td>
                <td style={{ padding: '5px 6px', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '5px 6px', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

// ── TAB: WEAPONS ──────────────────────────────────────────────
function WeaponsTab() {
  const [filter, setFilter] = useState('')

  const lc = filter.toLowerCase()

  function matchWeapon(w: { name: string; skill: string; special: string }) {
    if (!lc) return true
    return (
      w.name.toLowerCase().includes(lc) ||
      w.skill.toLowerCase().includes(lc) ||
      w.special.toLowerCase().includes(lc)
    )
  }

  function matchQuality(q: { name: string; description: string }) {
    if (!lc) return true
    return q.name.toLowerCase().includes(lc) || q.description.toLowerCase().includes(lc)
  }

  const rangedGroups = RANGED_WEAPON_GROUPS.map(g => ({
    ...g,
    weapons: g.weapons.filter(matchWeapon),
  })).filter(g => g.weapons.length > 0)

  const meleeGroups = MELEE_WEAPON_GROUPS.map(g => ({
    ...g,
    weapons: g.weapons.filter(matchWeapon),
  })).filter(g => g.weapons.length > 0)

  const qualities = ITEM_QUALITIES.filter(matchQuality)

  const WeaponTable = ({ weapons }: { weapons: typeof RANGED_WEAPON_GROUPS[0]['weapons'] }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FC, fontSize: FS_CAPTION }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${BORDER_HI}` }}>
          {['Weapon', 'Skill', 'Dmg', 'Crit', 'Range', 'Enc', 'HP', 'Price', 'Rar', 'Special'].map(h => (
            <th key={h} style={{
              textAlign: 'left', padding: '3px 4px',
              fontSize: FS_OVERLINE, letterSpacing: '0.10em', color: GOLD_DIM, fontWeight: 700,
              whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weapons.map(w => (
          <tr key={w.name} style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td style={{ padding: '4px', color: TEXT, fontWeight: 600, whiteSpace: 'nowrap' }}>{w.name}</td>
            <td style={{ padding: '4px', color: DIM, whiteSpace: 'nowrap' }}>{w.skill}</td>
            <td style={{ padding: '4px', color: RED, textAlign: 'center', fontFamily: FST }}>{w.damage}</td>
            <td style={{ padding: '4px', color: ORANGE, textAlign: 'center', fontFamily: FST }}>{w.crit}</td>
            <td style={{ padding: '4px', color: DIM, whiteSpace: 'nowrap' }}>{w.range}</td>
            <td style={{ padding: '4px', color: DIM, textAlign: 'center' }}>{w.encum}</td>
            <td style={{ padding: '4px', color: DIM, textAlign: 'center' }}>{w.hp}</td>
            <td style={{ padding: '4px', color: GREEN, whiteSpace: 'nowrap' }}>{w.price}</td>
            <td style={{ padding: '4px', color: DIM, textAlign: 'center' }}>{w.rarity}</td>
            <td style={{ padding: '4px', color: DIM, fontStyle: 'italic', minWidth: 100 }}>{w.special}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', background: FAINT, borderRadius: 6,
        border: `1px solid ${BORDER_HI}`,
      }}>
        <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, flexShrink: 0 }}>Filter:</span>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="weapon name, skill, or quality…"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            borderBottom: `1px solid ${BORDER_HI}`, outline: 'none',
            fontFamily: FC, fontSize: FS_SM, color: GOLD,
            padding: '2px 4px',
          }}
        />
        {filter && (
          <button
            onClick={() => setFilter('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, fontSize: 14, lineHeight: 1 }}
          >✕</button>
        )}
      </div>

      {/* Ranged weapons */}
      {rangedGroups.length > 0 && (
        <section>
          <Overline>Ranged Weapons</Overline>
          {rangedGroups.map(g => (
            <div key={g.label} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: BLUE, marginBottom: 4 }}>
                {g.label}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <WeaponTable weapons={g.weapons} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Melee weapons */}
      {meleeGroups.length > 0 && (
        <section>
          <Overline>Melee Weapons</Overline>
          {meleeGroups.map(g => (
            <div key={g.label} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: ORANGE, marginBottom: 4 }}>
                {g.label}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <WeaponTable weapons={g.weapons} />
              </div>
            </div>
          ))}
        </section>
      )}

      <Divider />

      {/* Item qualities */}
      {qualities.length > 0 && (
        <section>
          <Overline>Item Qualities</Overline>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {qualities.map(q => (
              <div key={q.name} style={{
                padding: '6px 8px', background: FAINT, borderRadius: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{q.name}</span>
                  <span style={{
                    fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', fontWeight: 700,
                    color: q.type === 'Active' ? ORANGE : BLUE,
                    border: `1px solid ${q.type === 'Active' ? ORANGE : BLUE}`,
                    padding: '1px 5px', borderRadius: 3,
                  }}>{q.type}</span>
                </div>
                <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, lineHeight: 1.45 }}>
                  {q.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── TAB: SQUADS ───────────────────────────────────────────────
function SquadsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Overview */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: `clamp(10px, 1.2vw, 13px)`,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: GOLD, marginBottom: 10, paddingBottom: 5,
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squad Overview
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SQUAD_OVERVIEW.map(r => (
            <div key={r.title} style={{ padding: '8px 10px', background: PANEL, borderRadius: 4, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: `clamp(10px, 1.1vw, 12px)`, fontWeight: 700, color: TEXT, marginBottom: 3 }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: `clamp(9px, 1vw, 11px)`, color: DIM, lineHeight: 1.5 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Check */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: `clamp(10px, 1.2vw, 13px)`,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: GOLD, marginBottom: 10, paddingBottom: 5,
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Leadership Check Results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SQUAD_LEADERSHIP_CHECK.map(r => (
            <div key={r.title} style={{ display: 'flex', gap: 10, padding: '6px 10px', background: PANEL, borderRadius: 4, border: `1px solid ${BORDER}` }}>
              <div style={{
                fontFamily: FC, fontSize: `clamp(9px, 1vw, 11px)`,
                fontWeight: 700, color: GOLD, flexShrink: 0, minWidth: 70,
              }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: `clamp(9px, 1vw, 11px)`, color: DIM, lineHeight: 1.45 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Squad Combat */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: `clamp(10px, 1.2vw, 13px)`,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: GOLD, marginBottom: 10, paddingBottom: 5,
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squad Combat Rules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SQUAD_COMBAT_RULES.map(r => (
            <div key={r.title} style={{ padding: '8px 10px', background: PANEL, borderRadius: 4, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: `clamp(10px, 1.1vw, 12px)`, fontWeight: 700, color: TEXT, marginBottom: 3 }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: `clamp(9px, 1vw, 11px)`, color: DIM, lineHeight: 1.5 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disband */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: `clamp(10px, 1.2vw, 13px)`,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: GOLD, marginBottom: 10, paddingBottom: 5,
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Disbanding a Squad
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SQUAD_DISBAND_RULES.map(r => (
            <div key={r.title} style={{ padding: '8px 10px', background: PANEL, borderRadius: 4, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: `clamp(10px, 1.1vw, 12px)`, fontWeight: 700, color: TEXT, marginBottom: 3 }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: `clamp(9px, 1vw, 11px)`, color: DIM, lineHeight: 1.5 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Squad Formations */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: `clamp(10px, 1.2vw, 13px)`,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: GOLD, marginBottom: 10, paddingBottom: 5,
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squad Formations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SQUAD_FORMATIONS.map(r => (
            <div key={r.title} style={{ padding: '8px 10px', background: PANEL, borderRadius: 4, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: `clamp(10px, 1.1vw, 12px)`, fontWeight: 700, color: TEXT, marginBottom: 3 }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: `clamp(9px, 1vw, 11px)`, color: DIM, lineHeight: 1.5 }}>
                <RichText text={r.description} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Squadron Formations */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: `clamp(10px, 1.2vw, 13px)`,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: GOLD, marginBottom: 10, paddingBottom: 5,
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squadron Formations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SQUADRON_FORMATIONS.map(r => (
            <div key={r.title} style={{ padding: '8px 10px', background: PANEL, borderRadius: 4, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: `clamp(10px, 1.1vw, 12px)`, fontWeight: 700, color: TEXT, marginBottom: 3 }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: `clamp(9px, 1vw, 11px)`, color: DIM, lineHeight: 1.5 }}>
                <RichText text={r.description} />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

// ── Main drawer component ─────────────────────────────────────
const TABS = ['Dice', 'Combat', 'Injuries', 'Vehicles', 'Weapons', 'Squads'] as const
type TabId = typeof TABS[number]

interface GmReferenceDrawerProps {
  open: boolean
  onClose: () => void
}

export function GmReferenceDrawer({ open, onClose }: GmReferenceDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('Dice')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const drawerWidth = 'clamp(320px, 42vw, 620px)'

  return createPortal(
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 8999,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: drawerWidth,
          zIndex: 9000,
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          borderLeft: `1px solid ${open ? BORDER_HI : 'transparent'}`,
          boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.6)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          height: 50,
          borderBottom: `1px solid ${BORDER}`,
          background: PANEL,
        }}>
          <span style={{
            fontFamily: FST, fontSize: FS_LABEL, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: GOLD, fontWeight: 700,
          }}>
            GM Screen
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: DIM, fontSize: 18, lineHeight: 1,
              padding: '4px 6px', borderRadius: 4,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM }}
            aria-label="Close GM Screen"
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          borderBottom: `1px solid ${BORDER}`,
          background: PANEL,
        }}>
          {TABS.map(tab => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 4px',
                  fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: isActive ? GOLD : DIM,
                  borderBottom: `2px solid ${isActive ? GOLD : 'transparent'}`,
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = TEXT }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = DIM }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
          {activeTab === 'Dice'     && <DiceTab />}
          {activeTab === 'Combat'   && <CombatTab />}
          {activeTab === 'Injuries' && <InjuriesTab />}
          {activeTab === 'Vehicles' && <VehiclesTab />}
          {activeTab === 'Weapons'  && <WeaponsTab />}
          {activeTab === 'Squads'   && <SquadsTab />}
        </div>
      </div>
    </>,
    document.body,
  )
}
