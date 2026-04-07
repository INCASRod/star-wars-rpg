'use client'
// ─────────────────────────────────────────────────────────────────────────────
// SpecSelectorList — shared specialisation search + card list
//
// Used by:
//   • PlayerHUDDesktop  BuySpecButton overlay (in-play purchase)
//   • create/page.tsx   SpecStep additional-spec section (creation)
//
// The caller supplies cost / affordability logic so each context can use its
// own XP formula without duplicating the rendering.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { RefSpecialization } from '@/lib/types'

const FR  = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FM  = "'Share Tech Mono', 'Courier New', monospace"
const GOLD   = '#C8AA50'
const BORDER = 'rgba(200,170,80,0.14)'
const TEXT   = '#C8D8C0'
const DIM    = '#6A8070'
const FAINT  = '#2A3A2E'

export interface SpecSelectorListProps {
  /** Full reference list — filtered internally */
  refSpecs: RefSpecialization[]
  /** Spec keys already owned/selected; excluded from the list */
  ownedKeys: Set<string>
  /** Career key used to highlight career specs */
  careerKey: string
  /** Return the XP cost for a given spec */
  getSpecCost: (spec: RefSpecialization) => number
  /** Return true when the user can afford this spec */
  canAfford: (spec: RefSpecialization) => boolean
  /** Called when the user clicks an affordable spec row */
  onSelect: (spec: RefSpecialization) => void
  /** Search box placeholder text */
  searchPlaceholder?: string
  /** Focus the search input on mount */
  autoFocus?: boolean
}

export function SpecSelectorList({
  refSpecs,
  ownedKeys,
  careerKey,
  getSpecCost,
  canAfford,
  onSelect,
  searchPlaceholder = 'Search specializations…',
  autoFocus = false,
}: SpecSelectorListProps) {
  const [search, setSearch] = useState('')

  const available = refSpecs
    .filter(s => !ownedKeys.has(s.key) && s.talent_tree?.rows?.length)
    .sort((a, b) => {
      const ac = a.career_key === careerKey ? 0 : 1
      const bc = b.career_key === careerKey ? 0 : 1
      return ac !== bc ? ac - bc : a.name.localeCompare(b.name)
    })

  const filtered = search
    ? available.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : available

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0 }}>
      {/* Search */}
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '7px 10px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          fontFamily: FR,
          fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
          color: TEXT,
          outline: 'none',
        }}
      />

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(spec => {
          const isCareer = spec.career_key === careerKey
          const cost = getSpecCost(spec)
          const affordable = canAfford(spec)
          return (
            <button
              key={spec.key}
              onClick={() => { if (affordable) onSelect(spec) }}
              disabled={!affordable}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: isCareer ? 'rgba(200,170,80,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isCareer ? `${GOLD}30` : BORDER}`,
                borderRadius: 4,
                cursor: affordable ? 'pointer' : 'not-allowed',
                opacity: affordable ? 1 : 0.4,
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                if (!affordable) return
                const el = e.currentTarget as HTMLElement
                el.style.background = isCareer ? 'rgba(200,170,80,0.12)' : 'rgba(255,255,255,0.05)'
                el.style.borderColor = isCareer ? `${GOLD}55` : `${GOLD}25`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = isCareer ? 'rgba(200,170,80,0.06)' : 'rgba(255,255,255,0.02)'
                el.style.borderColor = isCareer ? `${GOLD}30` : BORDER
              }}
            >
              {/* Left: name + badges */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: FR,
                  fontSize: 'clamp(0.85rem, 1.15vw, 0.95rem)',
                  fontWeight: 700,
                  color: affordable ? TEXT : DIM,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {spec.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{
                    fontFamily: FR,
                    fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                    color: isCareer ? GOLD : FAINT,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    {isCareer ? '★ Career' : spec.career_key}
                  </span>
                  {spec.is_force_sensitive && (
                    <span style={{
                      fontFamily: FM,
                      fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                      color: '#7EC8E3',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      ◈ Force
                    </span>
                  )}
                </div>
              </div>

              {/* Right: XP cost badge */}
              <div style={{
                fontFamily: FM,
                fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                color: affordable ? 'rgba(200,170,80,0.5)' : '#E05050',
                whiteSpace: 'nowrap',
                marginLeft: 12,
                flexShrink: 0,
              }}>
                {cost} XP
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            fontFamily: FR,
            fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
            color: FAINT,
          }}>
            No specializations found.
          </div>
        )}
      </div>
    </div>
  )
}
