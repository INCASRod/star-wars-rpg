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
      borderTop: '1px solid var(--bdr-l)',
      background: 'rgba(250,247,242,.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
      minHeight: 'clamp(36px, 3rem, 64px)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', color: 'var(--txt3)',
      }}>
        Player: {playerName}{sessionInfo ? ` // ${sessionInfo}` : ''}
      </div>
    </div>
  )
}
