'use client'

import { useState, useEffect } from 'react'
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3 } from '@/components/player-hud/design-tokens'
import { PanelSearchInput } from '@/components/character/PanelSearchInput'

// ── Types ─────────────────────────────────────────────────────────────────────

type Activation = 'Passive' | 'Incidental' | 'Maneuver' | 'Action' | 'Out of Turn'

interface StatBonus { stat: string; value: number }

interface Talent {
  id: string
  name: string
  activation: Activation
  ranked: boolean
  rank?: number
  description: string
  statBonus?: StatBonus
}

/** Compatible with HudTalent from player-hud/TalentsPanel */
export interface LiveTalent {
  key: string
  name: string
  rank: number
  activation: string
  description?: string
}

// ── Placeholder data ──────────────────────────────────────────────────────────

const STATIC_TALENTS: Talent[] = [
  { id: 'toughened', name: 'Toughened', activation: 'Passive', ranked: true, rank: 2, description: 'Increase wound threshold by 2 per rank.', statBonus: { stat: 'Wound Threshold', value: 4 } },
  { id: 'enduring', name: 'Enduring', activation: 'Passive', ranked: true, rank: 1, description: 'Increase soak value by 1 per rank.', statBonus: { stat: 'Soak', value: 1 } },
  { id: 'grit', name: 'Grit', activation: 'Passive', ranked: true, rank: 1, description: 'Increase strain threshold by 1 per rank.', statBonus: { stat: 'Strain Threshold', value: 1 } },
  { id: 'barrage', name: 'Barrage', activation: 'Passive', ranked: true, rank: 2, description: 'Add +1 damage per rank to ranged attacks at Long or Extreme range.' },
  { id: 'quick-strike', name: 'Quick Strike', activation: 'Passive', ranked: true, rank: 2, description: 'Add one Boost die per rank to combat checks against targets who have not yet acted this encounter.' },
  { id: 'second-wind', name: 'Second Wind', activation: 'Incidental', ranked: true, rank: 1, description: 'Once per encounter, recover strain equal to ranks in Second Wind.' },
  { id: 'nat-marks', name: 'Natural Marksman', activation: 'Incidental', ranked: false, description: 'Once per session, reroll any one Ranged (Heavy) or Ranged (Light) check.' },
  { id: 'prec-aim', name: 'Precise Aim', activation: 'Maneuver', ranked: true, rank: 1, description: 'Spend a maneuver to reduce the penalty from Called Shot by 1 per rank.' },
  { id: 'take-cover', name: 'Take Cover', activation: 'Maneuver', ranked: false, description: 'Spend a maneuver to gain cover (+1 Ranged Defense) until start of your next turn.' },
  { id: 'supp-fire', name: 'Suppressive Fire', activation: 'Action', ranked: false, description: 'Make a ranged attack; add Disorient 2 to all enemies engaged with the primary target.' },
  { id: 'field-cmd', name: 'Field Commander', activation: 'Action', ranked: false, description: 'Average Leadership check; allies equal to Presence may use your Initiative slot.' },
  { id: 'rapid-react', name: 'Rapid Reaction', activation: 'Out of Turn', ranked: true, rank: 1, description: 'When an enemy acts, suffer 1 strain to add 2 successes to your next Initiative result.' },
  { id: 'dodge', name: 'Dodge', activation: 'Out of Turn', ranked: true, rank: 1, description: 'When targeted by a combat check, suffer strain up to Dodge rank to upgrade difficulty by that amount.' },
  { id: 'return-fire', name: 'Return Fire', activation: 'Out of Turn', ranked: false, description: 'Once per encounter, make a free ranged attack against an attacker immediately after being targeted.' },
]

const TABS: { key: Activation; label: string; special?: boolean }[] = [
  { key: 'Passive', label: 'Passive' },
  { key: 'Incidental', label: 'Incidental' },
  { key: 'Maneuver', label: 'Maneuver' },
  { key: 'Action', label: 'Action' },
  { key: 'Out of Turn', label: '⚡ OOT', special: true },
]

// ── Activation type → accent color ───────────────────────────────────────────

const ACTIVATION_COLOR: Record<Activation, string> = {
  'Passive': C.textDim,
  'Incidental': '#5AAAE0',
  'Maneuver': '#4EC87A',
  'Action': C.gold,
  'Out of Turn': '#D87060',
}

// ── Known passive stat bonuses ────────────────────────────────────────────────

const PASSIVE_STAT_BONUSES: Record<string, (rank: number) => StatBonus> = {
  'Toughened': rank => ({ stat: 'Wound Threshold', value: rank * 2 }),
  'Enduring': rank => ({ stat: 'Soak', value: rank }),
  'Grit': rank => ({ stat: 'Strain Threshold', value: rank }),
  'Dedication': rank => ({ stat: 'Characteristic', value: rank }),
}

function mapActivation(raw: string): Activation {
  if (raw === 'Incidental (OOT)') return 'Out of Turn'
  if (['Passive', 'Incidental', 'Maneuver', 'Action', 'Out of Turn'].includes(raw)) return raw as Activation
  return 'Passive'
}

function toWfTalent(t: LiveTalent): Talent {
  const activation = mapActivation(t.activation)
  const fn = PASSIVE_STAT_BONUSES[t.name] as ((rank: number) => StatBonus) | undefined
  const statBonus = activation === 'Passive' && fn != null && t.rank > 0 ? fn(t.rank) : undefined
  return {
    id: t.key, name: t.name, activation,
    ranked: t.rank > 1, rank: t.rank > 0 ? t.rank : undefined,
    description: t.description || 'No description available.',
    statBonus,
  }
}

// ── Talent card ───────────────────────────────────────────────────────────────

function TalentCard({ t }: { t: Talent }) {
  const color = ACTIVATION_COLOR[t.activation]
  const isOOT = t.activation === 'Out of Turn'

  return (
    <div style={{
      ...panelBase,
      borderLeft: `2px solid ${color}60`,
      padding: '10px 12px',
      ...(isOOT ? { borderStyle: 'solid', borderColor: `${color}50` } : {}),
    }}>
      {/* Name + badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>
          {t.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {t.ranked && t.rank !== undefined && (
            <span style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_LABEL, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 2, padding: '1px 4px' }}>
              RANK {t.rank}
            </span>
          )}
          <span style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_LABEL, letterSpacing: '0.12em', textTransform: 'uppercase', color, border: `1px solid ${color}40`, borderRadius: 2, padding: '1px 4px', background: `${color}10` }}>
            {t.activation.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Description */}
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, lineHeight: 1.45 }}>
        {t.description}
      </div>

      {/* Stat bonus */}
      {t.statBonus && (
        <div style={{ borderLeft: `2px solid ${C.gold}40`, paddingLeft: 6, marginTop: 6, fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim }}>
          ↑ {t.statBonus.stat} <strong style={{ color: C.gold }}>+{t.statBonus.value}</strong>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface TalentsPanelProps {
  liveTalents?: LiveTalent[]
  characterName?: string
  characterId?: string
}

export function TalentsPanel({ liveTalents, characterName, characterId }: TalentsPanelProps) {
  const [tab, setTab] = useState<Activation>('Passive')
  const [talentSearch, setTalentSearch] = useState('')

  // Reset search when character changes
  useEffect(() => { setTalentSearch('') }, [characterId])

  const TALENTS: Talent[] = liveTalents ? liveTalents.map(toWfTalent) : STATIC_TALENTS

  const passiveBonuses = TALENTS
    .filter(t => t.activation === 'Passive' && t.statBonus)
    .map(t => `+${t.statBonus!.value} ${t.statBonus!.stat} (${t.name})`)

  const searchQuery = talentSearch.toLowerCase().trim()

  // When searching: show all matching talents flat (bypass tab filter)
  // When not searching: apply tab filter as before
  const filtered = searchQuery
    ? TALENTS.filter(t =>
        t.name.toLowerCase().includes(searchQuery) ||
        t.description.toLowerCase().includes(searchQuery) ||
        t.activation.toLowerCase().includes(searchQuery)
      )
    : TALENTS.filter(t => t.activation === tab)

  const counts = Object.fromEntries(TABS.map(t => [t.key, TALENTS.filter(x => x.activation === t.key).length])) as Record<Activation, number>

  return (
    <div style={{ ...panelBase, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDim, marginBottom: 2 }}>
          TALENTS — QUICK REFERENCE
        </div>
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 600, color: C.gold }}>
          {(characterName ?? 'KIRA VOSS').toUpperCase()}
          <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, marginLeft: 8, fontWeight: 400, letterSpacing: '0.05em' }}>
            {TALENTS.length} talents · {passiveBonuses.length} passive bonuses
          </span>
        </div>
      </div>

      {/* ── Tabs (hidden during active search) ── */}
      {!searchQuery && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
          {TABS.map(({ key, label, special }) => {
            const active = tab === key
            const color = ACTIVATION_COLOR[key]
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, minWidth: 'fit-content', whiteSpace: 'nowrap',
                  padding: '7px 10px',
                  background: active ? `${color}18` : 'transparent',
                  borderRight: `1px solid ${C.border}`,
                  borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                  cursor: 'pointer', transition: '.15s',
                  fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: active ? color : C.textDim,
                  ...(special && !active ? { borderBottom: `2px dashed ${color}50` } : {}),
                }}
              >
                {label}
                <span style={{ marginLeft: 4, opacity: 0.6 }}>({counts[key]})</span>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* ── Search ── */}
        <PanelSearchInput
          value={talentSearch}
          onChange={setTalentSearch}
          placeholder="Search talents..."
        />

        {/* ── Passive summary banner (only when not searching) ── */}
        {!searchQuery && tab === 'Passive' && passiveBonuses.length > 0 && (
          <div style={{ background: `${C.gold}08`, border: `1px solid ${C.gold}30`, borderRadius: 4, padding: '7px 10px' }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_OVERLINE, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: 4 }}>
              ■ Passive Bonuses Applied
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, lineHeight: 1.4 }}>
              {passiveBonuses.join('  ·  ')}
            </div>
          </div>
        )}

        {/* ── OOT alert banner (only when not searching) ── */}
        {!searchQuery && tab === 'Out of Turn' && (
          <div style={{ background: 'rgba(216,112,96,0.08)', border: '1px dashed rgba(216,112,96,0.4)', borderRadius: 4, padding: '7px 10px' }}>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em', color: '#D87060', marginBottom: 4 }}>
              ⚡ REACTION WINDOW
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, color: C.textDim, lineHeight: 1.45 }}>
              These talents activate on <strong style={{ color: C.text }}>other players&apos; turns</strong>. Watch the combat order and be ready to trigger them when opponents act.
            </div>
          </div>
        )}

        {/* ── Talent cards ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 16px' }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint, fontStyle: 'italic' }}>
              {searchQuery ? `No talents matching \u201c${talentSearch}\u201d` : 'No talents in this category'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
            {filtered.map(t => <TalentCard key={t.id} t={t} />)}
          </div>
        )}

        {/* ── Tab color rule reference (hidden during search) ── */}
        {!searchQuery && filtered.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {TABS.map(({ key, label }) => (
              <span key={key} style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: ACTIVATION_COLOR[key], letterSpacing: '0.06em' }}>
                {label}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
