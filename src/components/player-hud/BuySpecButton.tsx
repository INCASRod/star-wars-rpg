'use client'

import { useState } from 'react'
import { C, FONT_RAJDHANI, FS_LABEL, FS_H4, FS_SM, panelBase } from './design-tokens'
import { SpecSelectorList } from '@/components/shared/SpecSelectorList'
import type { Character, CharacterSpecialization, RefSpecialization, RefTalent } from '@/lib/types'

export function BuySpecButton({
  character, charSpecs, refSpecs, refSpecMap, refTalentMap, onBuy,
}: {
  character: Character
  charSpecs: CharacterSpecialization[]
  refSpecs: RefSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  refTalentMap: Record<string, RefTalent>
  onBuy: (specKey: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ownedKeys = new Set(charSpecs.map(s => s.specialization_key))

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(224,58,30,0.06)',
          border: `1px dashed ${C.gold}55`,
          borderRadius: 4,
          padding: '5px 12px',
          cursor: 'pointer',
          fontFamily: FONT_RAJDHANI,
          fontSize: FS_LABEL,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: `${C.gold}88`,
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${C.gold}99`
          el.style.color = C.gold
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${C.gold}55`
          el.style.color = `${C.gold}88`
        }}
      >
        + NEW SPEC
      </button>
    )
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...panelBase,
          background: 'var(--hud-surface-hi)',
          border: `1px solid ${C.gold}40`,
          boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px ${C.gold}15`,
          borderRadius: 6,
          padding: '20px 20px 16px',
          width: '100%', maxWidth: 480,
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold,
          }}>
            Buy New Specialization
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: FONT_RAJDHANI, fontSize: FS_H4, color: C.textDim,
              lineHeight: 1, padding: '0 4px',
            }}
          >×</button>
        </div>

        {/* XP info */}
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim,
          lineHeight: 1.5,
          background: 'var(--hud-surface-lo)', border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '8px 10px',
        }}>
          Career specs cost{' '}
          <span style={{ color: C.gold, fontWeight: 700 }}>{charSpecs.length * 10} XP</span>
          {' '}· Non-career costs{' '}
          <span style={{ color: C.gold, fontWeight: 700 }}>{(charSpecs.length + 1) * 10} XP</span>
          {' '}· Available:{' '}
          <span style={{ color: '#4EC87A', fontWeight: 700 }}>{character.xp_available} XP</span>
        </div>

        {/* Spec search + list (shared component) */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <SpecSelectorList
            refSpecs={refSpecs}
            ownedKeys={ownedKeys}
            careerKey={character.career_key}
            getSpecCost={spec =>
              spec.career_key === character.career_key
                ? charSpecs.length * 10
                : (charSpecs.length + 1) * 10
            }
            canAfford={spec => {
              const cost = spec.career_key === character.career_key
                ? charSpecs.length * 10
                : (charSpecs.length + 1) * 10
              return character.xp_available >= cost
            }}
            onSelect={spec => { onBuy(spec.key); setOpen(false) }}
            autoFocus
            refTalentMap={refTalentMap}
          />
        </div>

        {/* Cancel */}
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            padding: '7px',
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: C.textDim, cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#E05050'
            el.style.color = '#E05050'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = C.border
            el.style.color = C.textDim
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
