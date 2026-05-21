'use client'

import { useState } from 'react'
import type { CharacterWeapon, RefWeapon } from '@/lib/types'
import { HUD, FS } from '@/lib/tokens'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM  = 'var(--hud-text-faint)'
const GOLD_BD   = 'var(--hud-border)'
const GOLD_BG   = 'var(--hud-surface-lo)'
const TEXT = 'var(--hud-text)'
const TEXT_DIM = 'var(--hud-text-dim)'
const TEXT_MUTED = 'var(--hud-text-faint)'
const FONT_C    = "var(--font-rajdhani), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"


interface DualWieldReviewStepProps {
  primaryWeapon:    CharacterWeapon
  secondaryWeapon:  CharacterWeapon
  primaryRef:       RefWeapon | null
  secondaryRef:     RefWeapon | null
  onSwap:           () => void
}

function WeaponCard({
  label, weapon, refWeapon,
}: { label: 'PRIMARY' | 'SECONDARY'; weapon: CharacterWeapon; refWeapon: RefWeapon | null }) {
  const name = weapon.custom_name || refWeapon?.name || 'Weapon'
  const skillName = refWeapon?.skill_key
    ? refWeapon.skill_key.replace('RANGLT', 'Ranged (Light)')
        .replace('RANGHVY', 'Ranged (Heavy)')
        .replace('BRAWL', 'Brawl')
        .replace('MELEE', 'Melee')
        .replace('GUNN', 'Gunnery')
        .replace('LTSABER', 'Lightsaber')
    : 'Unknown'

  const isPrimary = label === 'PRIMARY'

  return (
    <div style={{
      flex: 1,
      border: `1px solid ${isPrimary ? HUD.gold : GOLD_BD}`,
      borderRadius: 10,
      padding: '12px 14px',
      background: isPrimary ? GOLD_BG : 'transparent',
    }}>
      <div style={{
        fontFamily: FONT_C,
        fontSize: FS.overline,
        fontWeight: 700,
        color: isPrimary ? HUD.gold : GOLD_DIM,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        marginBottom: 8,
      }}>
        {label} WEAPON
      </div>

      <div style={{
        fontFamily: FONT_C,
        fontSize: FS.label,
        fontWeight: 700,
        color: isPrimary ? HUD.gold : TEXT,
        marginBottom: 6,
        lineHeight: 1.2,
      }}>
        {name}
      </div>

      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: FS.overline,
        color: TEXT_DIM,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}>
        <span>{skillName}</span>
        {refWeapon && (
          <>
            <span style={{ color: '#E07855' }}>DMG {refWeapon.damage_add != null ? `+${refWeapon.damage_add}` : refWeapon.damage}</span>
            <span style={{ color: '#E05050' }}>Crit {refWeapon.crit}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function DualWieldReviewStep({
  primaryWeapon, secondaryWeapon, primaryRef, secondaryRef, onSwap,
}: DualWieldReviewStepProps) {
  const sameSkill = primaryRef?.skill_key === secondaryRef?.skill_key
  const primarySkillLabel = primaryRef?.skill_key
    ? primaryRef.skill_key.replace('RANGLT', 'Ranged Light')
        .replace('RANGHVY', 'Ranged Heavy')
        .replace('BRAWL', 'Brawl')
        .replace('MELEE', 'Melee')
    : 'Unknown'

  return (
    <div>
      {/* Weapon cards with swap */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <WeaponCard label="PRIMARY"   weapon={primaryWeapon}   refWeapon={primaryRef} />

        <button
          onClick={onSwap}
          title="Swap primary and secondary"
          style={{
            flexShrink: 0,
            background: 'rgba(224,58,30,0.08)',
            border: `1px solid ${GOLD_BD}`,
            borderRadius: 8,
            width: 36, height: 36,
            cursor: 'pointer',
            fontFamily: "var(--font-body)",
            fontSize: FS.label,
            color: GOLD_DIM,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ⇄
        </button>

        <WeaponCard label="SECONDARY" weapon={secondaryWeapon} refWeapon={secondaryRef} />
      </div>

      {/* Hit explanation */}
      <div style={{
        background: GOLD_BG,
        border: `1px solid ${GOLD_BD}`,
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 14,
      }}>
        <div style={{
          fontFamily: FONT_R,
          fontSize: FS.caption,
          color: TEXT,
          lineHeight: 1.5,
        }}>
          Primary hits on success.<br />
          <span style={{ color: GOLD_DIM }}>Secondary hits by spending </span>
          <i className="ffi ffi-swrpg-advantage" style={{ color: HUD.gold }} /><i className="ffi ffi-swrpg-advantage" style={{ color: HUD.gold }} /><span style={{ color: HUD.gold }}>{' or '}</span><i className="ffi ffi-swrpg-triumph" style={{ color: HUD.gold }} />
          <span style={{ color: GOLD_DIM }}>.</span>
        </div>
      </div>

      {/* Combined check rules */}
      <div style={{
        fontFamily: FONT_R,
        fontStyle: 'italic',
        fontSize: FS.caption,
        color: TEXT_MUTED,
        lineHeight: 1.5,
      }}>
        Combined check uses lower skill rank and lower characteristic.{' '}
        {sameSkill
          ? <>Difficulty +1 (same skill: {primarySkillLabel}).</>
          : <>Difficulty +2 (different skills).</>
        }
      </div>

      {/* Swap button below */}
      <button
        onClick={onSwap}
        style={{
          marginTop: 16,
          width: '100%',
          padding: '8px 0',
          background: 'transparent',
          border: `1px solid ${GOLD_BD}`,
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: FONT_R,
          fontSize: FS.label,
          color: GOLD_DIM,
          letterSpacing: '0.05em',
        }}
      >
        ⇄ Swap Primary / Secondary
      </button>
    </div>
  )
}


