'use client'

import { useState, useMemo } from 'react'
import { DiceFace } from '@/components/dice/DiceFace'
import { getSkillPool } from './dice-engine'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS, SP } from '@/lib/tokens'
import type { HudSkill } from '@/lib/types'

// ── constants ──────────────────────────────────────────────────────────────
const POOL_CAP = 5

// ── sub-components ─────────────────────────────────────────────────────────

function RankPips({ rank }: { rank: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flexShrink: 0 }}>
      {Array.from({ length: rank }).map((_, i) => (
        <div key={i} style={{
          width: '0.3125rem', height: '0.3125rem',
          borderRadius: RADIUS.sm,
          background: 'var(--hud-gold)',
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

function PoolDice({ charVal, rank }: { charVal: number; rank: number }) {
  const { proficiency, ability } = getSkillPool(charVal, rank)
  const total    = proficiency + ability
  const overflow = Math.max(0, total - POOL_CAP)
  const proShown = overflow > 0 ? Math.round((proficiency / total) * POOL_CAP) : proficiency
  const ablShown = overflow > 0 ? POOL_CAP - proShown : ability

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flexShrink: 0 }}>
      {Array.from({ length: proShown }).map((_, i) => <DiceFace key={`p${i}`} type="proficiency" size={13} solid />)}
      {Array.from({ length: ablShown }).map((_, i) => <DiceFace key={`a${i}`} type="ability"     size={13} solid />)}
      {overflow > 0 && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-dim)' }}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

// ── search input ───────────────────────────────────────────────────────────

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 8px',
      borderBottom: '1px solid var(--hud-border)',
      flexShrink: 0,
    }}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search skills…"
        className="hud-skill-search"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: FONT_BODY,
          fontSize: FS.label,
          color: 'var(--hud-text)',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--hud-text-faint)', padding: 0, lineHeight: 1,
            fontFamily: FONT_BODY, fontSize: FS.caption,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

// ── section header ──────────────────────────────────────────────────────────

function SectionHeader({ label, count, dimmed }: { label: string; count: number; dimmed?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${SP[1]} ${SP[2]} ${SP[1]}`,
      borderBottom: '1px solid var(--hud-border)',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.overline,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: dimmed ? 'var(--hud-text-faint)' : 'var(--hud-text-dim)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: FONT_DISPLAY,
        fontSize: FS.overline,
        color: 'var(--hud-text-faint)',
      }}>
        {count}
      </span>
    </div>
  )
}

// ── skill rows ─────────────────────────────────────────────────────────────

function TrainedRow({ skill, onOpen }: { skill: HudSkill; onOpen: (r: DOMRect) => void }) {
  return (
    <button
      className="hud-skill-row hud-skill-row--trained"
      style={{
        display: 'flex', alignItems: 'center',
        width: '100%', padding: `${SP[1]} ${SP[2]}`, gap: SP[1],
        background: 'transparent', border: 'none',
        borderBottom: '1px solid var(--hud-border)',
        cursor: 'pointer', textAlign: 'left',
      }}
      onClick={e => onOpen(e.currentTarget.getBoundingClientRect())}
    >
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.label,
        fontWeight: 600,
        color: 'var(--hud-text)',
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {skill.name}
      </span>
      <RankPips rank={skill.rank} />
      <PoolDice charVal={skill.charVal} rank={skill.rank} />
    </button>
  )
}

function UntrainedRow({ skill, onOpen }: { skill: HudSkill; onOpen: (r: DOMRect) => void }) {
  return (
    <button
      className="hud-skill-row hud-skill-row--untrained"
      style={{
        display: 'flex', alignItems: 'center',
        width: '100%', padding: `${SP[1]} ${SP[2]}`, gap: SP[1],
        background: 'transparent', border: 'none',
        borderBottom: '1px solid var(--hud-border)',
        cursor: 'pointer', textAlign: 'left',
        opacity: 0.55,
      }}
      onClick={e => onOpen(e.currentTarget.getBoundingClientRect())}
    >
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.caption,
        color: 'var(--hud-text-dim)',
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {skill.name}
      </span>
      <PoolDice charVal={skill.charVal} rank={skill.rank} />
    </button>
  )
}

// ── main component ─────────────────────────────────────────────────────────

interface HudSkillQuickListProps {
  skills: HudSkill[]
  onOpenPopover: (skill: HudSkill, anchor: DOMRect) => void
}

export function HudSkillQuickList({ skills, onOpenPopover }: HudSkillQuickListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? skills.filter(s => s.name.toLowerCase().includes(q)) : skills
  }, [skills, query])

  const trained   = filtered.filter(s => s.rank > 0).sort((a, b) => a.name.localeCompare(b.name))
  const untrained = filtered.filter(s => s.rank === 0).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <SearchInput value={query} onChange={setQuery} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {trained.length > 0 && (
          <>
            <SectionHeader label="Trained" count={trained.length} />
            {trained.map(skill => (
              <TrainedRow
                key={skill.key}
                skill={skill}
                onOpen={r => onOpenPopover(skill, r)}
              />
            ))}
          </>
        )}

        {untrained.length > 0 && (
          <>
            <SectionHeader label="Untrained" count={untrained.length} dimmed />
            {untrained.map(skill => (
              <UntrainedRow
                key={skill.key}
                skill={skill}
                onOpen={r => onOpenPopover(skill, r)}
              />
            ))}
          </>
        )}

        {filtered.length === 0 && (
          <div style={{
            padding: `${SP[4]} ${SP[2]}`,
            fontFamily: FONT_BODY, fontSize: FS.label,
            color: 'var(--hud-text-faint)',
            textAlign: 'center',
          }}>
            No skills match "{query}"
          </div>
        )}
      </div>
    </div>
  )
}
