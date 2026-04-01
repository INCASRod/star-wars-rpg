'use client'

import { useState, useMemo } from 'react'
import { ACTIVATION_LABELS } from '@/lib/types'
import type { CharacterTalent, RefTalent } from '@/lib/types'
import { DiceText } from '@/components/dice/DiceText'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.6)'
const GOLD_BD  = 'rgba(200,170,80,0.15)'
const BORDER   = 'rgba(200,170,80,0.1)'
const TEXT     = 'rgba(255,255,255,0.85)'
const TEXT_DIM = 'rgba(255,255,255,0.6)'
const CARD_BG  = 'rgba(255,255,255,0.03)'
const STICKY_BG = 'rgba(6,13,9,0.96)'
const INPUT_BG  = 'rgba(6,13,9,0.9)'
const FONT_C   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_R   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M   = "'Courier New', monospace"

const ACTIVATION_COLOR: Record<string, string> = {
  taPassive:        'rgba(150,150,150,0.8)',
  taAction:         '#C8AA50',
  taManeuver:       '#4FC3F7',
  taIncidental:     '#81C784',
  taIncidentalOOT:  '#81C784',
}

interface TalentsTabProps {
  charTalents: CharacterTalent[]
  refTalentMap: Record<string, RefTalent>
}

export function TalentsTab({ charTalents, refTalentMap }: TalentsTabProps) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Deduplicate by talent_key, accumulate ranks
  const talentList = useMemo(() => {
    const seen = new Map<string, { ct: CharacterTalent; ref: RefTalent }>()
    for (const ct of (Array.isArray(charTalents) ? charTalents : [])) {
      const ref = refTalentMap[ct.talent_key]
      if (!ref) continue
      if (!seen.has(ct.talent_key)) {
        seen.set(ct.talent_key, { ct, ref })
      }
    }
    return Array.from(seen.values())
  }, [charTalents, refTalentMap])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return talentList
    return talentList.filter(({ ref }) =>
      ref.name.toLowerCase().includes(q) ||
      (ref.description ?? '').toLowerCase().includes(q)
    )
  }, [talentList, query])

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      {/* Sticky search */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '8px 16px',
        background: STICKY_BG,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: GOLD_DIM, fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search talents…"
            style={{
              width: '100%',
              background: INPUT_BG,
              border: `1px solid rgba(200,170,80,0.3)`,
              borderRadius: 6,
              padding: '8px 10px 8px 32px',
              color: GOLD,
              fontFamily: FONT_M,
              fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Talent list */}
      <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <p style={{ fontFamily: FONT_R, fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', color: GOLD_DIM, textAlign: 'center', padding: '24px 0' }}>
            No talents found.
          </p>
        )}
        {filtered.map(({ ct, ref }) => {
          const isExpanded = !!expanded[ref.key]
          const activationLabel = ACTIVATION_LABELS[ref.activation] ?? ref.activation
          const activationColor = ACTIVATION_COLOR[ref.activation] ?? 'rgba(150,150,150,0.8)'
          const totalRanks = (Array.isArray(charTalents) ? charTalents : []).filter(t => t.talent_key === ref.key).reduce((s, t) => s + (t.ranks || 1), 0)
          const summary = (ref.description ?? '').replace(/\[.*?\]/g, '').slice(0, 80)
          const truncated = (ref.description ?? '').length > 80

          return (
            <button
              key={ct.id}
              onClick={() => toggle(ref.key)}
              style={{
                width: '100%',
                background: CARD_BG,
                border: `1px solid ${GOLD_BD}`,
                borderRadius: 8,
                padding: '10px 12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isExpanded ? 8 : 0 }}>
                <span style={{
                  fontFamily: FONT_C,
                  fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                  fontWeight: 700,
                  color: GOLD,
                  flex: 1,
                  minWidth: 0,
                }}>
                  {ref.name}
                  {ref.is_ranked && totalRanks > 1 && (
                    <span style={{ color: GOLD_DIM, fontWeight: 400, marginLeft: 6, fontSize: '0.85em' }}>
                      ×{totalRanks}
                    </span>
                  )}
                </span>
                <span style={{
                  fontFamily: FONT_M,
                  fontSize: 'clamp(0.55rem, 2vw, 0.65rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: activationColor,
                  background: `${activationColor}18`,
                  border: `1px solid ${activationColor}40`,
                  borderRadius: 4,
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  {activationLabel}
                </span>
                <span style={{ color: GOLD_DIM, fontSize: 12, flexShrink: 0 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {/* Description */}
              {!isExpanded && ref.description && (
                <p style={{
                  fontFamily: FONT_R,
                  fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
                  color: TEXT_DIM,
                  margin: 0,
                  marginTop: 4,
                  lineHeight: 1.4,
                }}>
                  {summary}{truncated ? '…' : ''}
                </p>
              )}
              {isExpanded && ref.description && (
                <p style={{
                  fontFamily: FONT_R,
                  fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
                  color: TEXT,
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  <DiceText text={ref.description} />
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
