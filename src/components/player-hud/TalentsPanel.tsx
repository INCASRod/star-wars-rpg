'use client'

import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase } from './design-tokens'
import { Tooltip, TipLabel, TipBody } from '@/components/ui/Tooltip'
import { MarkupText } from '@/components/ui/MarkupText'

export interface HudTalent {
  key: string
  name: string
  rank: number
  activation: string
  description?: string
}

interface TalentsPanelProps {
  talents: HudTalent[]
  onViewTree?: () => void
}

const ACTIVATION_COLORS: Record<string, string> = {
  Passive: C.textDim,
  Incidental: '#70C8E8',
  'Incidental (OOT)': '#70C8E8',
  Maneuver: '#4EC87A',
  Action: '#E07855',
}

const ACTIVATION_ORDER = ['Passive', 'Incidental', 'Incidental (OOT)', 'Maneuver', 'Action']

// Parse description for dice effect hints
// Detects OggDude bracket tags ([BO], [SE]) first; falls back to plain-text regex
interface DiceHints { boosts: number; removeSetbacks: number; upgrades: number; addSetbacks: number }
function parseDiceHints(desc = ''): DiceHints {
  const boostTags    = (desc.match(/\[BO\]/g) ?? []).length
  const setbackTags  = (desc.match(/\[SE\]/g) ?? []).length
  const d = desc.toLowerCase()
  const boostsText   = (d.match(/add\w* (?:a |one |two |an? )?boost|boost die|boost dice/g) ?? []).length
  const setbackText  = (d.match(/(?:add|impose)\w* (?:a |one |two |an? )?setback/g) ?? []).length
  const remSetbText  = (d.match(/remov\w* (?:a |one |two |an? )?setback|cancel\w* (?:a |one |two )?setback/g) ?? []).length
  return {
    boosts:         boostTags   > 0 ? boostTags   : boostsText,
    removeSetbacks: remSetbText,
    upgrades:       (d.match(/upgrad\w* (?:the |a |an? )?(?:abilit|skill|check|roll)/g) ?? []).length,
    addSetbacks:    setbackTags > 0 ? setbackTags : setbackText,
  }
}

function DiceHintChips({ hints }: { hints: DiceHints }) {
  const chips: { label: string; color: string; title: string }[] = []
  if (hints.boosts > 0)         chips.push({ label: `+${hints.boosts > 1 ? hints.boosts : ''}□`, color: '#70C8E8', title: 'Adds Boost die (blue)' })
  if (hints.removeSetbacks > 0) chips.push({ label: `−${hints.removeSetbacks > 1 ? hints.removeSetbacks : ''}■`, color: '#4EC87A', title: 'Removes Setback die' })
  if (hints.upgrades > 0)       chips.push({ label: '↑', color: '#FFD700', title: 'Upgrades ability die to proficiency' })
  if (hints.addSetbacks > 0)    chips.push({ label: `+${hints.addSetbacks > 1 ? hints.addSetbacks : ''}■`, color: '#909090', title: 'Adds Setback die (black)' })
  if (chips.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
      {chips.map((c, i) => (
        <span key={i} title={c.title} style={{
          fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
          color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}50`,
          borderRadius: 3, padding: '1px 5px', letterSpacing: '0.05em',
        }}>{c.label}</span>
      ))}
    </div>
  )
}

function CornerBrackets() {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
    </>
  )
}

function TalentCard({ talent }: { talent: HudTalent }) {
  const color = ACTIVATION_COLORS[talent.activation] ?? C.textDim
  const hints = parseDiceHints(talent.description)

  const tooltipContent = talent.description ? (
    <>
      <TipLabel>{talent.name}</TipLabel>
      <TipBody><MarkupText text={talent.description} /></TipBody>
    </>
  ) : null

  const card = (
    <div style={{
      ...panelBase,
      padding: '10px 12px',
      borderLeft: `2px solid ${color}`,
    }}>
      <CornerBrackets />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: talent.description ? 4 : 0 }}>
        <div style={{
          flex: 1,
          fontFamily: FONT_CINZEL, fontSize: 12, fontWeight: 600,
          color: C.text, letterSpacing: '0.02em',
        }}>
          {talent.name}
        </div>
        {talent.rank > 1 && (
          <div style={{
            background: `${color}20`, border: `1px solid ${color}50`,
            borderRadius: 3, padding: '1px 6px',
            fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
            color, letterSpacing: '0.08em',
          }}>
            ×{talent.rank}
          </div>
        )}
        <div style={{
          background: `${color}12`, border: `1px solid ${color}30`,
          borderRadius: 12, padding: '1px 8px',
          fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
          color, letterSpacing: '0.1em', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {talent.activation}
        </div>
      </div>
      {talent.description && (
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: 11, color: C.textDim,
          lineHeight: 1.5, marginTop: 4,
          maxHeight: '6em', overflow: 'hidden',
        }}>
          <MarkupText text={talent.description} />
        </div>
      )}
      <DiceHintChips hints={hints} />
    </div>
  )

  if (!tooltipContent) return card
  return (
    <Tooltip content={tooltipContent} placement="left" maxWidth={320}>
      {card}
    </Tooltip>
  )
}

export function TalentsPanel({ talents, onViewTree }: TalentsPanelProps) {
  if (talents.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 48, gap: 12,
      }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 13, color: C.textFaint }}>
          No talents purchased yet.
        </div>
        {onViewTree && (
          <button
            onClick={onViewTree}
            style={{
              background: `${C.gold}18`, border: `1px solid ${C.gold}`,
              borderRadius: 4, padding: '8px 20px',
              fontFamily: FONT_CINZEL, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', color: C.gold, cursor: 'pointer',
            }}
          >
            OPEN TALENT TREE
          </button>
        )}
      </div>
    )
  }

  // Group by activation type in defined order
  const grouped = ACTIVATION_ORDER.map(act => ({
    activation: act,
    items: talents.filter(t => t.activation === act),
  })).filter(g => g.items.length > 0)

  // Any unlisted activation types
  const listed = new Set(ACTIVATION_ORDER)
  const extra = talents.filter(t => !listed.has(t.activation))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onViewTree && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onViewTree}
            style={{
              background: `${C.gold}12`, border: `1px solid ${C.borderHi}`,
              borderRadius: 4, padding: '5px 14px',
              fontFamily: FONT_CINZEL, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.1em', color: C.gold, cursor: 'pointer', transition: '.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}22` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}12` }}
          >
            TALENT TREE
          </button>
        </div>
      )}
      {grouped.map(({ activation, items }) => (
        <div key={activation}>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: 13, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: ACTIVATION_COLORS[activation] ?? C.textDim,
            marginBottom: 6, paddingBottom: 4,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {activation}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 8,
          }}>
            {items.map(t => <TalentCard key={t.key} talent={t} />)}
          </div>
        </div>
      ))}
      {extra.length > 0 && (
        <div>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: C.textDim, marginBottom: 6, paddingBottom: 4,
            borderBottom: `1px solid ${C.border}`,
          }}>
            Other
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {extra.map(t => <TalentCard key={t.key} talent={t} />)}
          </div>
        </div>
      )}
    </div>
  )
}
