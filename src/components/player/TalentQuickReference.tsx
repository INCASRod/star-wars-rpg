'use client'

import { RichText } from '@/components/ui/RichText'
import { FS_OVERLINE, FS_CAPTION, FS_LABEL } from '@/components/player-hud/design-tokens'

// ── Design tokens (mirrored from CombatTracker) ──
const RAISED_BG   = 'rgba(14,26,18,0.9)'
const GOLD        = '#C8AA50'
const BORDER      = 'rgba(200,170,80,0.18)'
const CHAR_BR     = '#e05252'
const CHAR_AG     = '#52a8e0'
const CHAR_WIL    = '#52e0a8'
const TEXT        = '#E8DFC8'
const TEXT_MUTED  = 'rgba(232,223,200,0.35)'
const TEXT_SEC    = 'rgba(232,223,200,0.6)'
const FC          = "'Rajdhani', sans-serif"
const FR          = "'Rajdhani', sans-serif"
const FM          = "'Rajdhani', sans-serif"

const ACTIVATION_ORDER  = ['incidental', 'out of turn', 'maneuver', 'action']
const ACTIVATION_COLORS: Record<string, string> = {
  passive:              TEXT_MUTED,
  incidental:           GOLD,
  maneuver:             CHAR_AG,
  action:               CHAR_BR,
  'out of turn':        CHAR_WIL,
  'incidental (oot)':   CHAR_WIL,
}

type Talent = {
  name:        string
  activation:  string
  description?: string
  statBonus?:  { stat: string; value: number }
}

interface Props {
  talents: Talent[]
}

export function TalentQuickReference({ talents }: Props) {
  const talentGroups = ACTIVATION_ORDER.map(act => ({
    activation: act,
    color: ACTIVATION_COLORS[act] ?? TEXT_MUTED,
    items: talents.filter(t =>
      t.activation.toLowerCase() === act ||
      (act === 'out of turn' && t.activation.toLowerCase() === 'incidental (oot)')
    ),
  })).filter(g => g.items.length > 0)

  const passiveTalents = talents.filter(
    t => t.activation.toLowerCase() === 'passive' && t.statBonus
  )

  return (
    <div style={{ width: 300, flexShrink: 0, overflowY: 'auto', padding: '14px 14px' }}>
      <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${GOLD}b3`, marginBottom: 10 }}>
        Talent Quick Reference
      </div>

      {/* OOT Alert */}
      <div style={{
        background: `${CHAR_WIL}12`, border: `1px solid ${CHAR_WIL}50`,
        borderRadius: 4, padding: '8px 10px', marginBottom: 12,
      }}>
        <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: CHAR_WIL, marginBottom: 3 }}>⚡ Out-of-Turn</div>
        <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, lineHeight: 1.4 }}>
          Out-of-Turn talents can trigger on ANY player&apos;s turn — watch for them.
        </div>
      </div>

      {/* Talent groups */}
      {talentGroups.map(group => (
        <div key={group.activation} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.18em', textTransform: 'uppercase', color: group.color, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            {group.activation}
            <span style={{ fontFamily: FM, fontSize: FS_OVERLINE, color: TEXT_MUTED, background: RAISED_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '0 5px' }}>
              {group.activation === 'incidental' || group.activation === 'out of turn' ? 'No action cost' : 'Costs action/maneuver'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {group.items.map((t, i) => (
              <div key={i} style={{
                background: group.activation === 'incidental' ? `${GOLD}08`
                  : group.activation === 'out of turn' ? `${CHAR_WIL}08`
                    : RAISED_BG,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 4,
                position: 'relative',
                borderTop: `1px solid ${BORDER}`,
                borderRight: `1px solid ${BORDER}`,
                borderBottom: `1px solid ${BORDER}`,
                borderLeft: `2px solid ${group.color}60`,
                padding: '8px 10px',
              }}>
                <div style={{ fontFamily: FC, fontSize: FS_LABEL, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{t.name}</div>
                {t.description && (
                  <div style={{ fontFamily: FM, fontSize: FS_LABEL, color: TEXT_MUTED, lineHeight: 1.4 }}><RichText text={t.description} /></div>
                )}
                <span style={{
                  display: 'inline-block', marginTop: 4,
                  fontFamily: FM, fontSize: FS_OVERLINE, color: group.color,
                  border: `1px solid ${group.color}40`, borderRadius: 2, padding: '0 4px',
                  background: `${group.color}10`,
                }}>{group.activation.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Passive bonuses */}
      {passiveTalents.length > 0 && (
        <div>
          <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEXT_MUTED, marginBottom: 6 }}>
            Passive Bonuses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {passiveTalents.map((t, i) => (
              <div key={i} style={{ fontFamily: FM, fontSize: FS_CAPTION, color: TEXT_SEC, display: 'flex', gap: 6 }}>
                <span style={{ color: GOLD }}>+{t.statBonus!.value} {t.statBonus!.stat}</span>
                <span style={{ color: TEXT_MUTED }}>· {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {talentGroups.length === 0 && passiveTalents.length === 0 && (
        <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: TEXT_MUTED, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
          No active talents to display
        </div>
      )}
    </div>
  )
}
