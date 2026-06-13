'use client'
import { FONT_DISPLAY, FONT_BODY, FS, HUD } from '@/lib/tokens'

export function MobileTalentsScreen() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '32px 24px',
    }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.h3, color: HUD.text,
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Talents
      </div>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
        letterSpacing: '0.1em',
      }}>
        Phase 2
      </div>
    </div>
  )
}
