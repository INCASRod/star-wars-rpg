'use client'

import { FONT_DISPLAY, FS } from '@/lib/tokens'
import type { SessionMode } from '@/hooks/useSessionMode'

interface CombatTransitionProps {
  pending:  boolean
  prevMode: SessionMode | null
}

/**
 * Full-screen cinematic overlay that plays during mode transitions.
 * Phase 1 (0–400ms):   colour wipe top→bottom
 * Phase 2 (400–800ms): text flash (2 pulses)
 * Phase 3 (800–1200ms): wipe retracts from bottom
 */
export function CombatTransition({ pending, prevMode }: CombatTransitionProps) {
  if (!pending) return null

  const enteringCombat = prevMode === 'exploration'
  const color          = enteringCombat ? 'var(--state-wounds)' : 'var(--die-boost)'
  const text           = enteringCombat ? 'COMBAT INITIATED' : 'ENCOUNTER ENDED'

  return (
    <>
      {/* Scan-line wipe */}
      <div
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         'var(--z-hud-overlay)' as unknown as number,
          background:     enteringCombat
            ? 'rgba(224,80,80,0.15)'
            : 'rgba(96,200,224,0.12)',
          pointerEvents:  'none',
          animation:      'combatWipe 1.2s ease-in-out forwards',
        }}
      />
      {/* Text flash */}
      <div
        style={{
          position:        'fixed',
          top:             '50%',
          left:            '50%',
          transform:       'translate(-50%, -50%)',
          zIndex:          'var(--z-hud-combat)' as unknown as number,
          fontFamily:      FONT_DISPLAY,
          fontSize:        FS.h3,
          letterSpacing:   '0.4em',
          color,
          textShadow:      `0 0 30px ${color}`,
          whiteSpace:      'nowrap',
          pointerEvents:   'none',
          animation:       'combatFlash 0.8s ease 0.4s 2 both',
        }}
      >
        {text}
      </div>
    </>
  )
}
