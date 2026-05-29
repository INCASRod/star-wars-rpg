'use client'

import { useState, useEffect } from 'react'
import { C, panelBase } from './design-tokens'
import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'
import { Tooltip, TipLabel, TipBody } from '@/components/ui/Tooltip'
import { RichText } from '@/components/ui/RichText'
import { PanelSearchInput } from '@/components/character/PanelSearchInput'
import { useHudPanelContext } from '@/contexts/HudPanelContext'
import { TickerText } from '@/components/ui/TickerText'
import type { HudTalent } from '@/lib/types'

export type { HudTalent } from '@/lib/types'

interface TalentsPanelProps {
  talents: HudTalent[]
  onViewTree?: () => void
  characterId?: string
}

const ACTIVATION_COLORS: Record<string, string> = {
  Passive: C.textDim,
  Incidental: 'var(--die-boost)',
  'Incidental (OOT)': 'var(--die-boost)',
  Maneuver: 'var(--die-ability)',
  Action: 'var(--die-threat)',
}

const ACTIVATION_ORDER = ['Passive', 'Incidental', 'Incidental (OOT)', 'Maneuver', 'Action']

// Parse description for dice effect hints.
// Detects all supported tag formats:
//   [boost] / [BO]  — new canonical shortcode and OggDude legacy
//   [setback] / [SE]
//   :boost: / :setback: — colon-code format used in adversary abilities
// Falls back to plain-text regex when no tags are present.
interface DiceHints { boosts: number; removeSetbacks: number; upgrades: number; addSetbacks: number }
function parseDiceHints(desc = ''): DiceHints {
  const d = desc.toLowerCase()
  const boostTags    = (d.match(/\[boost\]|\[bo\]|:boost:/g) ?? []).length
  const setbackTags  = (d.match(/\[setback\]|\[se\]|:setback:/g) ?? []).length
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
  if (hints.boosts > 0)         chips.push({ label: `+${hints.boosts > 1 ? hints.boosts : ''}□`, color: 'var(--die-boost)', title: 'Adds Boost die (blue)' })
  if (hints.removeSetbacks > 0) chips.push({ label: `−${hints.removeSetbacks > 1 ? hints.removeSetbacks : ''}■`, color: 'var(--die-ability)', title: 'Removes Setback die' })
  if (hints.upgrades > 0)       chips.push({ label: '↑', color: 'var(--die-triumph)', title: 'Upgrades ability die to proficiency' })
  if (hints.addSetbacks > 0)    chips.push({ label: `+${hints.addSetbacks > 1 ? hints.addSetbacks : ''}■`, color: 'var(--die-setback)', title: 'Adds Setback die (black)' })
  if (chips.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
      {chips.map((c, i) => (
        <span key={i} title={c.title} style={{
          fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
          color: c.color, background: `color-mix(in srgb, ${c.color} 9%, transparent)`,
          border: `1px solid color-mix(in srgb, ${c.color} 31%, transparent)`,
          borderRadius: RADIUS.sm, padding: '1px 5px', letterSpacing: '0.05em',
        }}>{c.label}</span>
      ))}
    </div>
  )
}

// Species color: sky blue — using die-boost as closest available token
const SPECIES_COLOR = 'var(--die-boost)'

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
      <TipBody><RichText text={talent.description} /></TipBody>
    </>
  ) : null

  const card = (
    <div style={{
      ...panelBase,
      padding: '10px 12px',
      borderLeft: `2px solid ${talent.isSpeciesGranted ? SPECIES_COLOR : color}`,
    }}>
      <CornerBrackets />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: talent.description ? 4 : 0 }}>
        <div style={{
          flex: 1,
          fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 600,
          color: C.text, letterSpacing: '0.02em',
        }}>
          {talent.name}
        </div>
        {talent.rank > 1 && (
          <div style={{
            background: `color-mix(in srgb, ${color} 13%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 31%, transparent)`,
            borderRadius: RADIUS.sm, padding: '1px 6px',
            fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
            color, letterSpacing: '0.08em',
          }}>
            ×{talent.rank}
          </div>
        )}
        {talent.isSpeciesGranted && (
          <div style={{
            background: `color-mix(in srgb, ${SPECIES_COLOR} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${SPECIES_COLOR} 31%, transparent)`,
            borderRadius: RADIUS.sm, padding: '1px 6px',
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            color: SPECIES_COLOR, letterSpacing: '0.1em', textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Species
          </div>
        )}
        <div style={{
          background: `color-mix(in srgb, ${color} 7%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 19%, transparent)`,
          borderRadius: RADIUS.xl, padding: '1px 8px',
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          color, letterSpacing: '0.1em', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {talent.activation}
        </div>
      </div>
      {talent.description && (
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.label, color: C.textDim,
          lineHeight: 1.5, marginTop: 4,
          maxHeight: '6em', overflow: 'hidden',
        }}>
          <RichText text={talent.description} />
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

export function TalentsPanel({ talents, onViewTree, characterId }: TalentsPanelProps) {
  const [talentSearch, setTalentSearch] = useState('')
  const { isOpen } = useHudPanelContext()

  // Reset search when character changes
  useEffect(() => { setTalentSearch('') }, [characterId])

  if (talents.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 48, gap: 12,
      }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: C.textFaint }}>
          No talents purchased yet.
        </div>
        {onViewTree && (
          <button
            onClick={onViewTree}
            style={{
              background: `color-mix(in srgb, ${C.gold} 9%, transparent)`, border: `1px solid ${C.gold}`,
              borderRadius: RADIUS.md, padding: '8px 20px',
              fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600,
              letterSpacing: '0.1em', color: C.gold, cursor: 'pointer',
            }}
          >
            OPEN TALENT TREE
          </button>
        )}
      </div>
    )
  }

  const searchQuery = talentSearch.toLowerCase().trim()
  const visibleTalents = searchQuery
    ? talents.filter(t =>
        t.name.toLowerCase().includes(searchQuery) ||
        (t.description ?? '').toLowerCase().includes(searchQuery) ||
        t.activation.toLowerCase().includes(searchQuery)
      )
    : talents

  // Group by activation type in defined order
  const grouped = ACTIVATION_ORDER.map(act => ({
    activation: act,
    items: visibleTalents.filter(t => t.activation === act),
  })).filter(g => g.items.length > 0)

  // Any unlisted activation types
  const listed = new Set(ACTIVATION_ORDER)
  const extra = visibleTalents.filter(t => !listed.has(t.activation))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onViewTree && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onViewTree}
            className="hov-gold-bg"
            style={{
              background: `color-mix(in srgb, ${C.gold} 7%, transparent)`, border: `1px solid ${C.borderHi}`,
              borderRadius: RADIUS.md, padding: '5px 14px',
              fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600,
              letterSpacing: '0.1em', color: C.gold, cursor: 'pointer', transition: '.15s',
            }}
          >
            TALENT TREE
          </button>
        </div>
      )}

      {/* Search */}
      <PanelSearchInput
        value={talentSearch}
        onChange={setTalentSearch}
        placeholder="Search talents..."
      />

      {/* No-results message */}
      {grouped.length === 0 && extra.length === 0 && searchQuery && (
        <div style={{
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontSize: FS.sm,
          color: 'var(--hud-text-faint)',
          fontStyle: 'italic',
          padding: '16px 0',
        }}>
          No talents matching &ldquo;{talentSearch}&rdquo;
        </div>
      )}

      {grouped.map(({ activation, items }) => (
        <div key={activation}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: ACTIVATION_COLORS[activation] ?? C.textDim,
            marginBottom: 6, paddingBottom: 4,
            borderBottom: `1px solid ${C.border}`,
          }}>
            <TickerText text={activation} isOpen={isOpen} delayMs={120} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 8,
          }}>
            {items.map((t, idx) => (
              <div key={t.key} data-stagger={idx}>
                <div className="panel-row-enter">
                  <TalentCard talent={t} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {extra.length > 0 && (
        <div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: C.textDim, marginBottom: 6, paddingBottom: 4,
            borderBottom: `1px solid ${C.border}`,
          }}>
            <TickerText text="Other" isOpen={isOpen} delayMs={120} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {extra.map((t, idx) => (
              <div key={t.key} data-stagger={idx}>
                <div className="panel-row-enter">
                  <TalentCard talent={t} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
