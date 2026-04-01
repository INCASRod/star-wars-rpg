'use client'

import { BottomSheet } from '@/components/mobile/shared/BottomSheet'
import type { Character } from '@/lib/types'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.6)'
const GOLD_BD  = 'rgba(200,170,80,0.4)'
const TEXT     = 'rgba(255,255,255,0.85)'
const FONT_C   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_R   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M   = "'Courier New', monospace"

const WOUND_DANGER  = '#f44336'
const STRAIN_WARN   = '#FF9800'

interface WoundsStrainOverlayProps {
  character: Character
  onVitalChange: (field: 'wound_current' | 'strain_current', delta: number) => void
  woundBonus?: number
}

function VitalBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 56, height: 56, minWidth: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: disabled ? 'rgba(200,170,80,0.04)' : 'rgba(200,170,80,0.1)',
        border: `1px solid ${disabled ? 'rgba(200,170,80,0.15)' : 'rgba(200,170,80,0.3)'}`,
        borderRadius: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: FONT_C,
        fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
        fontWeight: 700,
        color: disabled ? 'rgba(200,170,80,0.25)' : GOLD,
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function VitalSection({
  label, current, threshold,
  onDecrement, onIncrement,
  dangerColor,
}: {
  label: string
  current: number
  threshold: number
  onDecrement: () => void
  onIncrement: () => void
  dangerColor: string
}) {
  const atDanger = current >= threshold
  const valueColor = atDanger ? dangerColor : GOLD

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '0 12px' }}>
      <span style={{
        fontFamily: FONT_R,
        fontSize: 'clamp(0.65rem, 2.6vw, 0.8rem)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: GOLD_DIM,
      }}>
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <VitalBtn label="−" disabled={current <= 0} onClick={onDecrement} />

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: FONT_C,
            fontSize: 'clamp(1.6rem, 6vw, 2rem)',
            fontWeight: 700,
            color: valueColor,
            lineHeight: 1,
            transition: 'color 0.2s',
          }}>
            {current}
          </div>
          <div style={{
            fontFamily: FONT_M,
            fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
            color: GOLD_DIM,
            marginTop: 2,
          }}>
            / {threshold}
          </div>
        </div>

        <VitalBtn label="+" disabled={current >= threshold} onClick={onIncrement} />
      </div>
    </div>
  )
}

export function WoundsStrainFab({ character, woundBonus = 0 }: { character: Character; woundBonus?: number }) {
  const effectiveWound = character.wound_threshold + woundBonus
  const woundPct = effectiveWound > 0 ? character.wound_current / effectiveWound : 0
  const strainPct = character.strain_threshold > 0
    ? character.strain_current / character.strain_threshold : 0

  const woundDanger = woundPct >= 0.8
  const strainDanger = strainPct >= 0.8

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 14px',
      fontFamily: FONT_M,
      fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
    }}>
      <span style={{ color: woundDanger ? WOUND_DANGER : TEXT }}>
        ❤️ {character.wound_current}/{character.wound_threshold}
        {woundBonus > 0 && <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)', color: GOLD, marginLeft: 2 }}>+{woundBonus}</span>}
      </span>
      <span style={{ color: 'rgba(200,170,80,0.3)' }}>·</span>
      <span style={{ color: strainDanger ? STRAIN_WARN : TEXT }}>
        🧠 {character.strain_current}/{character.strain_threshold}
      </span>
    </div>
  )
}

export function WoundsStrainOverlay({ character, onVitalChange, woundBonus = 0 }: WoundsStrainOverlayProps) {
  // FAB and Sheet are split — the parent controls open state
  // This component is the sheet content only; use WoundsStrainFab for the trigger
  const effectiveWoundThreshold = character.wound_threshold + woundBonus
  return (
    <div style={{ padding: '8px 16px 32px' }}>
      <h2 style={{
        fontFamily: FONT_C,
        fontSize: 'clamp(0.8rem, 3.2vw, 1rem)',
        fontWeight: 700,
        color: GOLD,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textAlign: 'center',
        margin: '0 0 20px',
      }}>
        Vitals
        {woundBonus > 0 && (
          <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)', color: GOLD, marginLeft: 8, opacity: 0.8 }}>
            Duty +{woundBonus} WT
          </span>
        )}
      </h2>

      <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
        <VitalSection
          label="Wounds"
          current={character.wound_current}
          threshold={effectiveWoundThreshold}
          onDecrement={() => onVitalChange('wound_current', -1)}
          onIncrement={() => onVitalChange('wound_current', 1)}
          dangerColor={WOUND_DANGER}
        />

        {/* Vertical divider */}
        <div style={{ width: 1, background: 'rgba(200,170,80,0.15)', alignSelf: 'stretch' }} />

        <VitalSection
          label="Strain"
          current={character.strain_current}
          threshold={character.strain_threshold}
          onDecrement={() => onVitalChange('strain_current', -1)}
          onIncrement={() => onVitalChange('strain_current', 1)}
          dangerColor={STRAIN_WARN}
        />
      </div>
    </div>
  )
}
