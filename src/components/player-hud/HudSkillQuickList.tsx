'use client'

import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool } from './dice-engine'
import { FONT_BODY, FS } from '@/lib/tokens'
import type { HudSkill } from '@/lib/types'

const POOL_CAP = 5

const SECTION_HDR: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--hud-text-faint)',
  padding: '6px 8px 3px',
  borderBottom: '1px solid var(--hud-border)',
  flexShrink: 0,
}

const ROW_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 6,
  width: '100%',
  padding: '4px 8px',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--hud-border)',
  cursor: 'pointer',
  textAlign: 'left',
}

const SKILL_NAME: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS.label,
  color: 'var(--hud-text)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  minWidth: 0,
}

function PoolPreview({ charVal, rank }: { charVal: number; rank: number }) {
  const { proficiency, ability } = getSkillPool(charVal, rank)
  const total = proficiency + ability
  const overflow = Math.max(0, total - POOL_CAP)
  const proShown = overflow > 0
    ? Math.round((proficiency / total) * POOL_CAP)
    : proficiency
  const ablShown = overflow > 0 ? POOL_CAP - proShown : ability

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      {Array.from({ length: proShown }).map((_, i) => (
        <DiceFace key={`p${i}`} type="proficiency" size={14} />
      ))}
      {Array.from({ length: ablShown }).map((_, i) => (
        <DiceFace key={`a${i}`} type="ability" size={14} />
      ))}
      {overflow > 0 && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)' }}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

interface HudSkillQuickListProps {
  skills: HudSkill[]
  onOpenPopover: (skill: HudSkill, anchor: DOMRect) => void
}

export function HudSkillQuickList({ skills, onOpenPopover }: HudSkillQuickListProps) {
  const trained   = skills.filter(s => s.rank > 0).sort((a, b) => a.name.localeCompare(b.name))
  const untrained = skills.filter(s => s.rank === 0).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
      {trained.length > 0 && (
        <>
          <div style={SECTION_HDR}>Trained</div>
          {trained.map(skill => (
            <button
              key={skill.key}
              className="hud-skill-row"
              style={ROW_BASE}
              onClick={e => onOpenPopover(skill, e.currentTarget.getBoundingClientRect())}
            >
              <span style={SKILL_NAME}>{skill.name}</span>
              <PoolPreview charVal={skill.charVal} rank={skill.rank} />
            </button>
          ))}
        </>
      )}
      {untrained.length > 0 && (
        <>
          <div style={SECTION_HDR}>Untrained</div>
          {untrained.map(skill => (
            <button
              key={skill.key}
              className="hud-skill-row"
              style={{ ...ROW_BASE, opacity: 0.65 }}
              onClick={e => onOpenPopover(skill, e.currentTarget.getBoundingClientRect())}
            >
              <span style={SKILL_NAME}>{skill.name}</span>
              <PoolPreview charVal={skill.charVal} rank={skill.rank} />
            </button>
          ))}
        </>
      )}
    </div>
  )
}
