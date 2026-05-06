'use client'

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
      padding: '0 var(--sp-lg)',
      borderTop: '1px solid var(--bs-bdr-mid)',
      background: 'var(--bs-panel)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
      minHeight: 'clamp(36px, 3rem, 64px)',
    }}>
      <div style={{
        fontFamily: 'var(--font-rajdhani)', fontSize: 'var(--font-sm)', color: 'var(--bs-txt3)',
      }}>
        Player: {playerName}{sessionInfo ? ` // ${sessionInfo}` : ''}
      </div>
    </div>
  )
}
