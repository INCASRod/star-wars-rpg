'use client'
import { FONT_DISPLAY, FONT_BODY, FS, SP, HUD } from '@/lib/tokens'

interface MobileDiceScreenProps {
  preSelectedSkill?: string | null
}

export function MobileDiceScreen({ preSelectedSkill: _ }: MobileDiceScreenProps) {
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
        Dice Roller
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
