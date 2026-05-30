'use client'
import { FONT_BODY, RADIUS, FS } from '@/lib/tokens'
import type { ItemCondition } from '@/lib/types'

const CONDITIONS: ItemCondition[] = ['undamaged', 'minor', 'moderate', 'major', 'destroyed']

const COND_LABEL: Record<ItemCondition, string> = {
  undamaged: 'Undamaged',
  minor:     'Minor',
  moderate:  'Moderate',
  major:     'Major',
  destroyed: 'Destroyed',
}

const COND_FILL: Record<ItemCondition, string> = {
  undamaged: 'var(--die-success)',
  minor:     'var(--die-success)',
  moderate:  'var(--die-threat)',
  major:     'var(--hud-vital-wounds)',
  destroyed: 'var(--hud-text-faint)',
}

const COND_PENALTY: Record<ItemCondition, { text: string; color: string }> = {
  undamaged: { text: 'No penalty to use.',                                               color: 'var(--hud-text-faint)' },
  minor:     { text: 'Minor damage — adds 1 Setback die to all checks.',                 color: 'var(--hud-text-faint)' },
  moderate:  { text: 'Moderate damage — adds 1 Setback die to all checks.',              color: 'var(--hud-text-faint)' },
  major:     { text: 'Major damage — item is unusable until repaired.',                  color: 'var(--hud-vital-wounds)' },
  destroyed: { text: 'Destroyed — this item is gone.',                                   color: 'var(--hud-text-faint)' },
}

function segFill(idx: number, activeIdx: number, condition: ItemCondition): string {
  if (condition === 'destroyed') return 'var(--hud-text-faint)'
  if (idx > activeIdx) return 'transparent'
  if (idx <= 1) return 'var(--die-success)'   // segments 0, 1 always green when filled
  if (idx === 2) return 'var(--die-threat)'   // segment 2 = moderate
  return 'var(--hud-vital-wounds)'            // segment 3 = major
}

export function ItemConditionTrack({ condition }: { condition: ItemCondition }) {
  const activeIdx = CONDITIONS.indexOf(condition)
  const penalty   = COND_PENALTY[condition]

  return (
    <div style={{ padding: '8px 0 4px' }}>
      {/* segments */}
      <div style={{ display: 'flex', gap: 3 }}>
        {CONDITIONS.map((c, i) => (
          <div key={c} style={{ flex: 1 }}>
            <div style={{
              height: 8, borderRadius: RADIUS.sm,
              background: segFill(i, activeIdx, condition),
              border: '1px solid var(--hud-border)',
              boxShadow: i === activeIdx ? `0 0 6px color-mix(in srgb, ${COND_FILL[condition]} 33%, transparent)` : 'none',
            }} />
          </div>
        ))}
      </div>
      {/* labels */}
      <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
        {CONDITIONS.map((c, i) => (
          <div key={c} style={{
            flex: 1, textAlign: 'center',
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: i === activeIdx ? COND_FILL[condition] : 'var(--hud-text-faint)',
            fontWeight: i === activeIdx ? 700 : 400,
          }}>
            {COND_LABEL[c]}
          </div>
        ))}
      </div>
      {/* penalty note */}
      <div style={{
        marginTop: 6, fontFamily: FONT_BODY, fontSize: FS.overline,
        fontStyle: 'italic', color: penalty.color,
      }}>
        {penalty.text}
      </div>
    </div>
  )
}
