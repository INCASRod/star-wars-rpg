'use client'
import { FONT_DISPLAY, FONT_BODY, FS, SP, HUD } from '@/lib/tokens'

interface MobileItemsScreenProps {
  hudWeapons: any[]
  hudArmor: any[]
  hudGear: any[]
  encCurrent: number
  encThreshold: number
  credits: number
}

export function MobileItemsScreen(_props: MobileItemsScreenProps) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: SP[2],
      padding: `${SP[8]} ${SP[6]}`,
    }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.h3, color: HUD.text,
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Items
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
