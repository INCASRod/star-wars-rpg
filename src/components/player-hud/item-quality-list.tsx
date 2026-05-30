'use client'
import { FONT_BODY, FONT_DISPLAY, FS } from '@/lib/tokens'
import type { RefWeaponQuality } from '@/lib/types'

interface ItemQualityListProps {
  qualities:           { key: string; count?: number | null }[]
  refWeaponQualityMap: Record<string, RefWeaponQuality>
}

export function ItemQualityList({ qualities, refWeaponQualityMap }: ItemQualityListProps) {
  const resolved = qualities
    .map(q => ({ ...q, ref: refWeaponQualityMap[q.key] }))
    .filter((q): q is typeof q & { ref: RefWeaponQuality } => q.ref != null)

  if (resolved.length === 0) return null

  return (
    <div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--hud-gold)', marginBottom: 6,
        borderBottom: '1px solid var(--hud-border)', paddingBottom: 4,
      }}>
        Special Qualities
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {resolved.map(q => (
          <div key={q.key}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, color: 'var(--hud-text)' }}>
                {q.ref.name}
              </span>
              {q.ref.is_ranked && q.count != null && q.count > 0 && (
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.caption, color: 'var(--hud-gold)' }}>
                  {q.count}
                </span>
              )}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)', lineHeight: 1.5 }}>
              {q.ref.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
