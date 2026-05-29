'use client'

import { HUD, SP, Z, FONT_BODY, FS } from '@/lib/tokens'

interface BottomBarProps {
  playerName: string
  sessionInfo?: string
}

export function BottomBar({ playerName, sessionInfo }: BottomBarProps) {
  return (
    <div className="au d7" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: `0 ${SP[5]}`,
      borderTop: `1px solid ${HUD.borderHi}`,
      background: HUD.panel,
      backdropFilter: 'blur(10px)',
      zIndex: Z.sticky,
      minHeight: 'clamp(36px, 3rem, 64px)',
    }}>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint,
      }}>
        Player: {playerName}{sessionInfo ? ` // ${sessionInfo}` : ''}
      </div>
    </div>
  )
}
