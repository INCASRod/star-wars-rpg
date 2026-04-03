'use client'

import { useState } from 'react'
import type { CharacterWeapon, RefWeapon } from '@/lib/types'

// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD      = '#C8AA50'
const GOLD_DIM  = 'rgba(200,170,80,0.5)'
const GOLD_BD   = 'rgba(200,170,80,0.15)'
const GOLD_BG   = 'rgba(200,170,80,0.06)'
const TEXT      = 'rgba(255,255,255,0.85)'
const TEXT_DIM  = 'rgba(255,255,255,0.5)'
const TEXT_MUTED = 'rgba(232,223,200,0.45)'
const FONT_C    = "var(--font-cinzel), 'Cinzel', serif"
const FONT_R    = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M    = "'Share Tech Mono', 'Courier New', monospace"

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
      border: `1px solid ${isPrimary ? GOLD : GOLD_BD}`,
      borderRadius: 10,
      padding: '12px 14px',
      background: isPrimary ? GOLD_BG : 'rgba(255,255,255,0.02)',
    }}>
      <div style={{
        fontFamily: FONT_C,
        fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
        fontWeight: 700,
        color: isPrimary ? GOLD : GOLD_DIM,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        marginBottom: 8,
      }}>
        {label} WEAPON
      </div>

      <div style={{
        fontFamily: FONT_C,
        fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
        fontWeight: 700,
        color: isPrimary ? GOLD : TEXT,
        marginBottom: 6,
        lineHeight: 1.2,
      }}>
        {name}
      </div>

      <div style={{
        fontFamily: FONT_M,
        fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
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
            background: 'rgba(200,170,80,0.08)',
            border: `1px solid ${GOLD_BD}`,
            borderRadius: 8,
            width: 36, height: 36,
            cursor: 'pointer',
            fontFamily: FONT_M,
            fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)',
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
          fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
          color: TEXT,
          lineHeight: 1.5,
        }}>
          Primary hits on success.<br />
          <span style={{ color: GOLD_DIM }}>Secondary hits by spending </span>
          <i className="ffi ffi-swrpg-advantage" style={{ color: GOLD }} /><i className="ffi ffi-swrpg-advantage" style={{ color: GOLD }} /><span style={{ color: GOLD }}>{' or '}</span><i className="ffi ffi-swrpg-triumph" style={{ color: GOLD }} />
          <span style={{ color: GOLD_DIM }}>.</span>
        </div>
      </div>

      {/* Combined check rules */}
      <div style={{
        fontFamily: FONT_R,
        fontStyle: 'italic',
        fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
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
          fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
          color: GOLD_DIM,
          letterSpacing: '0.05em',
        }}
      >
        ⇄ Swap Primary / Secondary
      </button>
    </div>
  )
}
