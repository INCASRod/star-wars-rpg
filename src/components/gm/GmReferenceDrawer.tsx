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
import { HUD, FONT_BODY, EASE, FS, RADIUS } from '@/lib/tokens'

// ── Design tokens ─────────────────────────────────────────────
const FC  = FONT_BODY
const FST = FONT_BODY

const BG         = HUD.bg
const PANEL      = HUD.panel
const GOLD_DIM   = HUD.gold
const TEXT       = HUD.text
const DIM        = HUD.textDim
const FAINT      = 'var(--hud-surface-lo)'
const BORDER     = HUD.border
const BORDER_HI  = HUD.borderHi
const GREEN      = 'var(--state-success)'
const RED        = 'var(--state-failure)'
const BLUE       = 'var(--die-force)'
const PURPLE     = 'var(--hud-accent-purple)'
const ORANGE     = 'var(--state-threat)'

const FS_OVERLINE = FS.overline
const FS_CAPTION  = FS.caption
const FS_LABEL    = FS.label
const FS_SM       = FS.sm
const FS_H4       = FS.h4

// ── Severity colour map ────────────────────────────────────────
function severityColor(sev: string): string {
  switch (sev) {
    case 'Easy':      return GREEN
    case 'Average':   return HUD.gold
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
    color: GOLD_DIM, marginBottom: '0.375rem',
  }}>{children}</div>
)

const Divider = () => (
  <div style={{ height: 1, background: BORDER, margin: '0.875rem 0' }} />
)

const Note = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: FC, fontSize: FS_CAPTION, color: DIM,
    fontStyle: 'italic', margin: '0.5rem 0 0', lineHeight: 1.5,
  }}>{children}</p>
)

// ── TAB: DICE ─────────────────────────────────────────────────
function DiceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Dice types */}
      <section>
        <Overline>Dice Types</Overline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {DICE_TYPES.map(d => (
            <div key={d.name} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              background: FAINT, borderRadius: RADIUS.md, padding: '0.4375rem 0.625rem',
            }}>
              <div style={{
                flexShrink: 0, width: '3.25rem', textAlign: 'center',
                fontFamily: FST, fontSize: FS_SM, color: d.color, fontWeight: 700,
              }}>
                d{d.sides}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: d.color }}>
                  {d.name}
                </div>
                <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, marginTop: '0.125rem' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {DICE_SYMBOLS.map(s => (
            <div key={s.name} style={{ padding: '0.375rem 0', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: HUD.gold, marginBottom: '0.1875rem' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {DIFFICULTY_LEVELS.map(d => (
            <div key={d.name} style={{
              display: 'grid', gridTemplateColumns: '6.25rem 2rem 1fr', gap: '0.5rem',
              padding: '0.3125rem 0.5rem', borderRadius: RADIUS.md,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Attack difficulties */}
      <section>
        <Overline>Attack Difficulties by Range</Overline>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FC, fontSize: FS_SM }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER_HI}` }}>
              {['Range Band', 'Difficulty', 'Dice'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.25rem 0.375rem',
                  fontSize: FS_OVERLINE, letterSpacing: '0.14em', color: GOLD_DIM, fontWeight: 700,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTACK_DIFFICULTIES.map(r => (
              <tr key={r.band} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '0.3125rem 0.375rem', color: TEXT }}>{r.band}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '0.3125rem 0.375rem', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {RANGED_MODIFIERS.map(m => (
            <div key={m.situation} style={{
              display: 'flex', gap: '0.5rem', justifyContent: 'space-between',
              padding: '0.3125rem 0.5rem', background: FAINT, borderRadius: RADIUS.md,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {ADVANTAGE_TRIUMPH_SPENDING.map((e, i) => (
            <div key={i} style={{ padding: '0.375rem 0', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FST, fontSize: FS_CAPTION, color: GREEN, marginBottom: '0.25rem' }}>{e.cost}</div>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {e.results.map((r, j) => (
                  <li key={j} style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT, lineHeight: 1.5, marginBottom: '0.125rem' }}>{r}</li>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {THREAT_DESPAIR_SPENDING.map((e, i) => (
            <div key={i} style={{ padding: '0.375rem 0', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FST, fontSize: FS_CAPTION, color: RED, marginBottom: '0.25rem' }}>{e.cost}</div>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {e.results.map((r, j) => (
                  <li key={j} style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT, lineHeight: 1.5, marginBottom: '0.125rem' }}>{r}</li>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.625rem' }}>
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: HUD.gold, marginBottom: '0.375rem' }}>Maneuvers</div>
            {COMBAT_MANEUVERS.map(m => (
              <div key={m.name} style={{ padding: '0.3125rem 0', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: BLUE }}>{m.name}: </span>
                <span style={{ fontFamily: FC, fontSize: FS_CAPTION, color: TEXT }}>{m.description}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: HUD.gold, marginBottom: '0.375rem' }}>Actions</div>
            {COMBAT_ACTIONS.map(a => (
              <div key={a.name} style={{ padding: '0.3125rem 0', borderBottom: `1px solid ${BORDER}` }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Roll lookup */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.75rem', background: FAINT, borderRadius: RADIUS.lg,
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
            fontFamily: FST, fontSize: FS_SM, color: HUD.gold,
            padding: '0.125rem 0.25rem', textAlign: 'center',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem' }}>
        {CRITICAL_INJURIES.map((inj, i) => (
          <div
            key={i}
            ref={el => { rowRefs.current[i] = el }}
            style={{
              padding: '0.375rem 0.5rem', borderRadius: RADIUS.md,
              background: highlighted === i ? `rgba(200,170,80,0.08)` : FAINT,
              border: `1px solid ${highlighted === i ? BORDER_HI : 'transparent'}`,
              transition: `background ${EASE.default}, border-color ${EASE.default}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.1875rem' }}>
              <span style={{
                fontFamily: FST, fontSize: FS_OVERLINE, color: DIM, minWidth: '3rem',
              }}>{inj.rollMin === inj.rollMax ? inj.rollMin : `${inj.rollMin}–${inj.rollMax}`}</span>
              <span style={{
                fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
                color: severityColor(inj.severity), minWidth: '4rem',
              }}>{inj.dieName}</span>
              <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>
                {inj.name}
              </span>
            </div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, paddingLeft: '3.5rem', lineHeight: 1.45 }}>
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
                  textAlign: 'left', padding: '0.25rem 0.375rem',
                  fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ARMOR_TABLE.map(a => (
              <tr key={a.name} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '0.3125rem 0.375rem', color: TEXT, fontWeight: 600 }}>{a.name}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: BLUE, textAlign: 'center' }}>{a.defense}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: GREEN, textAlign: 'center' }}>{a.soak}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: DIM, textAlign: 'center' }}>{a.encumbrance ?? '—'}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: DIM, fontStyle: 'italic' }}>{a.notes ?? ''}</td>
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
                <th key={h} style={{ textAlign: 'left', padding: '0.25rem 0.375rem', fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEDICAL_CHECK_TABLE.map(r => (
              <tr key={r.wounds} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '0.3125rem 0.375rem', color: TEXT }}>{r.wounds}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '0.3125rem 0.375rem', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Roll lookup */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.75rem', background: FAINT, borderRadius: RADIUS.lg,
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
            fontFamily: FST, fontSize: FS_SM, color: HUD.gold,
            padding: '0.125rem 0.25rem', textAlign: 'center',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem' }}>
        {VEHICLE_CRIT_HITS.map((hit, i) => (
          <div
            key={i}
            ref={el => { rowRefs.current[i] = el }}
            style={{
              padding: '0.375rem 0.5rem', borderRadius: RADIUS.md,
              background: highlighted === i ? `rgba(200,170,80,0.08)` : FAINT,
              border: `1px solid ${highlighted === i ? BORDER_HI : 'transparent'}`,
              transition: `background ${EASE.default}, border-color ${EASE.default}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.1875rem' }}>
              <span style={{ fontFamily: FST, fontSize: FS_OVERLINE, color: DIM, minWidth: '3rem' }}>
                {hit.rollMin === hit.rollMax ? hit.rollMin : `${hit.rollMin}–${hit.rollMax}`}
              </span>
              <span style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: severityColor(hit.severity), minWidth: '4rem' }}>
                {hit.dieName}
              </span>
              <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>
                {hit.name}
              </span>
            </div>
            <div style={{ fontFamily: FC, fontSize: FS_CAPTION, color: DIM, paddingLeft: '3.5rem', lineHeight: 1.45 }}>
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
                <th key={h} style={{ textAlign: 'left', padding: '0.25rem 0.375rem', fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SILHOUETTE_TABLE.map(r => (
              <tr key={r.difference} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '0.3125rem 0.375rem', color: TEXT }}>{r.difference}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '0.3125rem 0.375rem', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
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
                <th key={h} style={{ textAlign: 'left', padding: '0.25rem 0.375rem', fontSize: FS_OVERLINE, letterSpacing: '0.12em', color: GOLD_DIM, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAMAGE_CONTROL_TABLE.map(r => (
              <tr key={r.hullLevel} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '0.3125rem 0.375rem', color: TEXT }}>{r.hullLevel}</td>
                <td style={{ padding: '0.3125rem 0.375rem', color: DIM }}>{r.difficulty}</td>
                <td style={{ padding: '0.3125rem 0.375rem', fontFamily: FST, color: PURPLE }}>{r.dice}</td>
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
              textAlign: 'left', padding: '0.1875rem 0.25rem',
              fontSize: FS_OVERLINE, letterSpacing: '0.10em', color: GOLD_DIM, fontWeight: 700,
              whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weapons.map(w => (
          <tr key={w.name} style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td style={{ padding: '0.25rem', color: TEXT, fontWeight: 600, whiteSpace: 'nowrap' }}>{w.name}</td>
            <td style={{ padding: '0.25rem', color: DIM, whiteSpace: 'nowrap' }}>{w.skill}</td>
            <td style={{ padding: '0.25rem', color: RED, textAlign: 'center', fontFamily: FST }}>{w.damage}</td>
            <td style={{ padding: '0.25rem', color: ORANGE, textAlign: 'center', fontFamily: FST }}>{w.crit}</td>
            <td style={{ padding: '0.25rem', color: DIM, whiteSpace: 'nowrap' }}>{w.range}</td>
            <td style={{ padding: '0.25rem', color: DIM, textAlign: 'center' }}>{w.encum}</td>
            <td style={{ padding: '0.25rem', color: DIM, textAlign: 'center' }}>{w.hp}</td>
            <td style={{ padding: '0.25rem', color: GREEN, whiteSpace: 'nowrap' }}>{w.price}</td>
            <td style={{ padding: '0.25rem', color: DIM, textAlign: 'center' }}>{w.rarity}</td>
            <td style={{ padding: '0.25rem', color: DIM, fontStyle: 'italic', minWidth: '6.25rem' }}>{w.special}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filter input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.75rem', background: FAINT, borderRadius: RADIUS.lg,
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
            fontFamily: FC, fontSize: FS_SM, color: HUD.gold,
            padding: '0.125rem 0.25rem',
          }}
        />
        {filter && (
          <button
            onClick={() => setFilter('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, fontSize: FS_CAPTION, lineHeight: 1 }}
          >✕</button>
        )}
      </div>

      {/* Ranged weapons */}
      {rangedGroups.length > 0 && (
        <section>
          <Overline>Ranged Weapons</Overline>
          {rangedGroups.map(g => (
            <div key={g.label} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: BLUE, marginBottom: '0.25rem' }}>
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
            <div key={g.label} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: ORANGE, marginBottom: '0.25rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {qualities.map(q => (
              <div key={q.name} style={{
                padding: '0.375rem 0.5rem', background: FAINT, borderRadius: RADIUS.md,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.125rem' }}>
                  <span style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT }}>{q.name}</span>
                  <span style={{
                    fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', fontWeight: 700,
                    color: q.type === 'Active' ? ORANGE : BLUE,
                    border: `1px solid ${q.type === 'Active' ? ORANGE : BLUE}`,
                    padding: '0.0625rem 0.3125rem', borderRadius: RADIUS.sm,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Overview */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: FS_LABEL,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: HUD.gold, marginBottom: '0.625rem', paddingBottom: '0.3125rem',
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squad Overview
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {SQUAD_OVERVIEW.map(r => (
            <div key={r.title} style={{ padding: '0.5rem 0.625rem', background: PANEL, borderRadius: RADIUS.md, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: TEXT, marginBottom: '0.1875rem' }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Check */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: FS_LABEL,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: HUD.gold, marginBottom: '0.625rem', paddingBottom: '0.3125rem',
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Leadership Check Results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {SQUAD_LEADERSHIP_CHECK.map(r => (
            <div key={r.title} style={{ display: 'flex', gap: '0.625rem', padding: '0.375rem 0.625rem', background: PANEL, borderRadius: RADIUS.md, border: `1px solid ${BORDER}` }}>
              <div style={{
                fontFamily: FC, fontSize: FS_OVERLINE,
                fontWeight: 700, color: HUD.gold, flexShrink: 0, minWidth: '4.375rem',
              }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.45 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Squad Combat */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: FS_LABEL,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: HUD.gold, marginBottom: '0.625rem', paddingBottom: '0.3125rem',
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squad Combat Rules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {SQUAD_COMBAT_RULES.map(r => (
            <div key={r.title} style={{ padding: '0.5rem 0.625rem', background: PANEL, borderRadius: RADIUS.md, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: TEXT, marginBottom: '0.1875rem' }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disband */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: FS_LABEL,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: HUD.gold, marginBottom: '0.625rem', paddingBottom: '0.3125rem',
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Disbanding a Squad
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {SQUAD_DISBAND_RULES.map(r => (
            <div key={r.title} style={{ padding: '0.5rem 0.625rem', background: PANEL, borderRadius: RADIUS.md, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: TEXT, marginBottom: '0.1875rem' }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5 }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Squad Formations */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: FS_LABEL,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: HUD.gold, marginBottom: '0.625rem', paddingBottom: '0.3125rem',
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squad Formations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {SQUAD_FORMATIONS.map(r => (
            <div key={r.title} style={{ padding: '0.5rem 0.625rem', background: PANEL, borderRadius: RADIUS.md, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: TEXT, marginBottom: '0.1875rem' }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5 }}>
                <RichText text={r.description} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Squadron Formations */}
      <section>
        <div style={{
          fontFamily: FC, fontSize: FS_LABEL,
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: HUD.gold, marginBottom: '0.625rem', paddingBottom: '0.3125rem',
          borderBottom: `1px solid ${BORDER_HI}`,
        }}>
          Squadron Formations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {SQUADRON_FORMATIONS.map(r => (
            <div key={r.title} style={{ padding: '0.5rem 0.625rem', background: PANEL, borderRadius: RADIUS.md, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: TEXT, marginBottom: '0.1875rem' }}>
                {r.title}
              </div>
              <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, color: DIM, lineHeight: 1.5 }}>
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
            zIndex: 'calc(var(--z-hud-overlay) - 1)' as unknown as number,
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
          zIndex: 'var(--z-hud-overlay)' as unknown as number,
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          borderLeft: `1px solid ${open ? BORDER_HI : 'transparent'}`,
          boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.6)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${EASE.panel}, border-color ${EASE.default}`,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1rem',
          height: '3.125rem',
          borderBottom: `1px solid ${BORDER}`,
          background: PANEL,
        }}>
          <span style={{
            fontFamily: FST, fontSize: FS_LABEL, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: HUD.gold, fontWeight: 700,
          }}>
            GM Screen
          </span>
          <button
            onClick={onClose}
            className="gm-ref-close-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: DIM, fontSize: FS_H4, lineHeight: 1,
              padding: '0.25rem 0.375rem', borderRadius: RADIUS.md,
              transition: `color ${EASE.quick}`,
            }}
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
                className={isActive ? 'gm-ref-tab gm-ref-tab--active' : 'gm-ref-tab'}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.625rem 0.25rem',
                  fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: isActive ? HUD.gold : DIM,
                  borderBottom: `2px solid ${isActive ? HUD.gold : 'transparent'}`,
                  transition: `color ${EASE.quick}, border-color ${EASE.quick}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1rem 2rem' }}>
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
