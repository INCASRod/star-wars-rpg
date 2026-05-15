'use client'

import { C } from './design-tokens'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS } from '@/lib/tokens'
import { HudSkillQuickList } from './HudSkillQuickList'
import type { Character, HudSkill } from '@/lib/types'

interface HudLeftColumnProps {
  character: Character
  hudSkills: HudSkill[]
  onOpenPopover: (skill: HudSkill, anchor: DOMRect) => void
}

export function HudLeftColumn({ character, hudSkills, onOpenPopover }: HudLeftColumnProps) {
  return (
    <div style={{
      background: 'var(--hud-surface-lo)',
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Characteristics 3×2 grid ── */}
      <div style={{ padding: 'var(--space-2)', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-1)' }}>
          {([
            { label: 'Brawn',     value: character.brawn },
            { label: 'Agility',   value: character.agility },
            { label: 'Intellect', value: character.intellect },
            { label: 'Cunning',   value: character.cunning },
            { label: 'Willpower', value: character.willpower },
            { label: 'Presence',  value: character.presence },
          ] as const).map(ch => (
            <div key={ch.label} style={{
              textAlign: 'center', padding: '6px 4px',
              background: 'var(--hud-surface-lo)',
              border: '1px solid var(--hud-border)',
              borderRadius: RADIUS.lg,
            }}>
              <div style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                fontWeight: 700, color: C.gold, lineHeight: 1,
              }}>
                {ch.value}
              </div>
              <div style={{
                fontFamily: FONT_BODY,
                fontSize: FS.overline,
                fontWeight: 700, letterSpacing: '0.08em',
                color: 'var(--hud-text-faint)', marginTop: 3,
                textTransform: 'uppercase',
              }}>
                {ch.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--hud-border)', flexShrink: 0 }} />

      {/* ── Quick-access skill list ── */}
      <HudSkillQuickList skills={hudSkills} onOpenPopover={onOpenPopover} />
    </div>
  )
}
