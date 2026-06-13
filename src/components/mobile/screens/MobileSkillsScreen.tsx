'use client'
import { useMemo } from 'react'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD, COLOR } from '@/lib/tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool } from '@/components/player-hud/dice-engine'
import type { HudSkill } from '@/lib/types'

// Short abbreviations for the characteristic badge — max 2-3 chars, fits FS.overline in 22px badge.
// Defined locally (per spec); intentionally different from CHAR_ABBR3 in tokens.ts.
const CHAR_ABBR2: Record<string, string> = {
  brawn:     'Br', agility:   'Ag', cunning:   'Cu',
  intellect: 'In', willpower: 'Wi', presence:  'Pr',
}

// Badge bg tints. Agility uses FFG ability die green (sealed game-mechanic colour).
const CHAR_BADGE_BG: Record<string, string> = {
  brawn:     `color-mix(in srgb, var(--hud-accent) 18%, transparent)`,
  agility:   `color-mix(in srgb, #4A7A30 20%, transparent)`, /* FFG ability die — sealed */
  cunning:   `color-mix(in srgb, var(--hud-gold) 15%, transparent)`,
  intellect: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
  willpower: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
  presence:  `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
}

function CharBadge({ charKey }: { charKey: string }) {
  return (
    <div style={{
      width: 22, height: 22, /* fixed badge geometry */
      borderRadius: RADIUS.sm,
      background: CHAR_BADGE_BG[charKey] ?? `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      color: HUD.text, letterSpacing: '0.05em',
    }}>
      {CHAR_ABBR2[charKey] ?? '?'}
    </div>
  )
}

function PipTrack({ rank }: { rank: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' /* below SP[1] floor — fixed pip geometry */, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: 1, /* fixed pip geometry */
          background: i < rank ? 'var(--hud-gold)' : 'transparent',
          border: `1px solid ${i < rank ? 'var(--hud-gold)' : 'var(--hud-border-hi)'}`,
        }} />
      ))}
    </div>
  )
}

interface MobileSkillsScreenProps {
  hudSkills:   HudSkill[]
  xpAvailable: number
  onRollSkill: (skillKey: string) => void
}

export function MobileSkillsScreen({ hudSkills, xpAvailable, onRollSkill }: MobileSkillsScreenProps) {
  const sorted = useMemo(() => {
    return [...hudSkills].sort((a, b) => {
      if (a.isCareer !== b.isCareer) return a.isCareer ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [hudSkills])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── XP banner + filter stub ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: SP[1],
        padding: `${SP[1]} ${SP[2]}`,
        borderBottom: `1px solid var(--hud-border)`,
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1,
          background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)`,
          borderRadius: RADIUS.md,
          padding: `${SP[1]} ${SP[2]}`,
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          color: 'var(--hud-accent)', letterSpacing: '0.1em',
        }}>
          {xpAvailable} XP available · tap skill to roll
        </div>
        {/* Filter — no-op stub for Phase 2 */}
        <button
          onClick={() => { /* Phase 2 */ }}
          aria-label="Filter skills (Phase 2)"
          style={{
            background: 'var(--hud-surface-hi)',
            border: `1px solid var(--hud-border)`,
            borderRadius: RADIUS.md,
            padding: SP[1],
            cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, flexShrink: 0,
          }}
        >
          ⊟
        </button>
      </div>

      {/* ── Skill list ── */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {sorted.map(skill => {
          const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
          const nameColor = skill.isCareer
            ? 'var(--hud-accent)'
            : (skill.rank > 0 ? HUD.text : HUD.textFaint)

          return (
            <button
              key={skill.key}
              onClick={() => onRollSkill(skill.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: SP[1],
                width: '100%', textAlign: 'left',
                padding: `${SP[1]} ${SP[2]}`,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid var(--hud-border)`,
                cursor: 'pointer',
                minHeight: 44, /* minimum touch target */
              }}
            >
              <CharBadge charKey={skill.charKey} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' /* below SP[1] floor — compact label+pip stack */ }}>
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.sm,
                  color: nameColor, fontWeight: skill.isCareer ? 700 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {skill.name}
                </div>
                <PipTrack rank={skill.rank} />
              </div>
              {/* Die pool faces */}
              <div style={{ display: 'flex', gap: '2px' /* below SP[1] floor — fixed die geometry */, flexShrink: 0, alignItems: 'center' }}>
                {Array.from({ length: Math.min(proficiency, 4) }).map((_, i) => (
                  <DiceFace key={`p${i}`} type="proficiency" size={16} />
                ))}
                {Array.from({ length: Math.min(ability, 4) }).map((_, i) => (
                  <DiceFace key={`a${i}`} type="ability" size={16} />
                ))}
              </div>
              {/* Roll hint */}
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: COLOR.blue, /* static action blue — mobile roll affordance, not accent-themed */ letterSpacing: '0.06em', flexShrink: 0,
              }}>
                → roll
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
