'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { specPurchaseCost } from '@/hooks/useCharacterData'
import { HUD, FONT_BODY, FS, RADIUS, Z, panelBase } from '@/lib/tokens'
import { SpecSelectorList } from '@/components/shared/SpecSelectorList'
import { isDroid, isClone } from '@/lib/forceEligibility'
import type { Character, CharacterSpecialization, RefSpecialization, RefTalent } from '@/lib/types'

export function BuySpecButton({
  character, charSpecs, refSpecs, refSpecMap, refTalentMap, careerSpecKeys, specKeyToCareerName, onBuy,
}: {
  character: Character
  charSpecs: CharacterSpecialization[]
  refSpecs: RefSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  refTalentMap: Record<string, RefTalent>
  // ref_specializations.career_key is always NULL for the respec dataset (migration 064) —
  // in-career association lives on ref_careers.specialization_keys instead. Sourced once
  // from useCharacterData (single source of truth shared with handleBuySpecialization) so
  // the displayed cost can never drift from what's actually charged on purchase.
  careerSpecKeys: Set<string>
  specKeyToCareerName: Record<string, string>
  onBuy: (specKey: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ownedKeys = new Set(charSpecs.map(s => s.specialization_key))

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="buy-spec-btn"
        style={{
          background: 'rgba(224,58,30,0.06)',
          border: `1px dashed`,
          borderRadius: RADIUS.md,
          padding: '5px 12px',
          cursor: 'pointer',
          fontFamily: FONT_BODY,
          fontSize: FS.label,
          fontWeight: 700,
          letterSpacing: '0.12em',
        }}
      >
        + NEW SPEC
      </button>
    )
  }

  // Portalled to document.body (Prompt 7b, Defect 3) — same pattern as
  // TalentDossier.tsx. Not strictly required to fix the reported symptom
  // today (no ancestor currently breaks position:fixed's viewport-relative
  // containing block — the parallax tilt wrapper that used to, via its
  // `transform`, was removed in Prompt 6d), but portalling removes the
  // dependency on that assumption holding forever: any future transform/
  // filter/will-change on an ancestor would silently reintroduce this bug
  // for an in-place-rendered fixed panel, but not for one already living
  // outside the component tree entirely.
  return createPortal(
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: Z.fab,
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
          border: `1px solid color-mix(in srgb, var(--hud-gold) 25%, transparent)`,
          boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px color-mix(in srgb, var(--hud-gold) 8%, transparent)`,
          borderRadius: RADIUS.lg,
          padding: '20px 20px 16px',
          width: '100%', maxWidth: 480,
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: HUD.gold,
          }}>
            Buy New Specialization
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: FS.h4, color: HUD.textDim,
              lineHeight: 1, padding: '0 4px',
            }}
          >×</button>
        </div>

        {/* XP info */}
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textDim,
          lineHeight: 1.5,
          background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`,
          borderRadius: RADIUS.md, padding: '8px 10px',
        }}>
          Career specs cost{' '}
          <span style={{ color: HUD.gold, fontWeight: 700 }}>{specPurchaseCost(charSpecs.length, true)} XP</span>
          {' '}· Non-career costs{' '}
          <span style={{ color: HUD.gold, fontWeight: 700 }}>{specPurchaseCost(charSpecs.length, false)} XP</span>
          {' '}· Available:{' '}
          <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>{character.xp_available} XP</span>
        </div>

        {/* Spec search + list (shared component) */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <SpecSelectorList
            refSpecs={refSpecs}
            ownedKeys={ownedKeys}
            careerSpecKeys={careerSpecKeys}
            otherCareerName={spec => specKeyToCareerName[spec.key] ?? null}
            getSpecCost={spec => specPurchaseCost(charSpecs.length, careerSpecKeys.has(spec.key))}
            canAfford={spec => {
              const cost = specPurchaseCost(charSpecs.length, careerSpecKeys.has(spec.key))
              return character.xp_available >= cost
            }}
            onSelect={spec => { onBuy(spec.key); setOpen(false) }}
            autoFocus
            refTalentMap={refTalentMap}
            blockedReason={spec => {
              if (!spec.is_force_sensitive) return null
              if (isDroid(character)) return 'Droids cannot become Force sensitive'
              if (isClone(character)) return 'Clones cannot become Force sensitive'
              return null
            }}
          />
        </div>

        {/* Cancel */}
        <button
          onClick={() => setOpen(false)}
          className="hov-danger"
          style={{
            background: 'transparent',
            border: `1px solid ${HUD.border}`,
            borderRadius: RADIUS.md,
            padding: '7px',
            fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: HUD.textDim, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  )
}
