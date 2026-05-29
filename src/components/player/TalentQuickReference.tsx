'use client'

import { RichText } from '@/components/ui/RichText'
import { FS, SP, RADIUS, HUD, FONT_BODY } from '@/lib/tokens'

// ── Activation UI colors — semantic palette, not characteristic stats ──
// No clean token mappings exist for these three; kept as design-stable hex.
const ACT_BLUE  = '#52a8e0'  // maneuver / action
const ACT_RED   = '#e05252'  // action (danger)
const ACT_TEAL  = '#52e0a8'  // out-of-turn

const ACTIVATION_ORDER  = ['incidental', 'out of turn', 'maneuver', 'action']
const ACTIVATION_COLORS: Record<string, string> = {
  passive:              HUD.textFaint,
  incidental:           HUD.gold,
  maneuver:             ACT_BLUE,
  action:               ACT_RED,
  'out of turn':        ACT_TEAL,
  'incidental (oot)':   ACT_TEAL,
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
    color: ACTIVATION_COLORS[act] ?? HUD.textFaint,
    items: talents.filter(t =>
      t.activation.toLowerCase() === act ||
      (act === 'out of turn' && t.activation.toLowerCase() === 'incidental (oot)')
    ),
  })).filter(g => g.items.length > 0)

  const passiveTalents = talents.filter(
    t => t.activation.toLowerCase() === 'passive' && t.statBonus
  )

  return (
    <div style={{ width: '18.75rem', flexShrink: 0, overflowY: 'auto', padding: '0.875rem' }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: `${HUD.gold}b3`, marginBottom: '0.625rem' }}>
        Talent Quick Reference
      </div>

      {/* OOT Alert */}
      <div style={{
        background: `${ACT_TEAL}12`, border: `1px solid ${ACT_TEAL}50`,
        borderRadius: RADIUS.md, padding: `${SP[2]} 0.625rem`, marginBottom: SP[3],
      }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: ACT_TEAL, marginBottom: '0.1875rem' }}>⚡ Out-of-Turn</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, lineHeight: 1.4 }}>
          Out-of-Turn talents can trigger on ANY player&apos;s turn — watch for them.
        </div>
      </div>

      {/* Talent groups */}
      {talentGroups.map(group => (
        <div key={group.activation} style={{ marginBottom: SP[3] }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.18em', textTransform: 'uppercase', color: group.color, marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {group.activation}
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`, borderRadius: '0.625rem', padding: '0 0.3125rem' }}>
              {group.activation === 'incidental' || group.activation === 'out of turn' ? 'No action cost' : 'Costs action/maneuver'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
            {group.items.map((t, i) => (
              <div key={i} style={{
                background: group.activation === 'incidental' ? `${HUD.gold}08`
                  : group.activation === 'out of turn' ? `${ACT_TEAL}08`
                    : 'var(--hud-surface-lo)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: RADIUS.md,
                position: 'relative',
                borderTop: `1px solid ${HUD.border}`,
                borderRight: `1px solid ${HUD.border}`,
                borderBottom: `1px solid ${HUD.border}`,
                borderLeft: `2px solid ${group.color}60`,
                padding: `${SP[2]} 0.625rem`,
              }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: HUD.text, marginBottom: '0.125rem' }}>{t.name}</div>
                {t.description && (
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, lineHeight: 1.4 }}><RichText text={t.description} /></div>
                )}
                <span style={{
                  display: 'inline-block', marginTop: SP[1],
                  fontFamily: FONT_BODY, fontSize: FS.overline, color: group.color,
                  border: `1px solid ${group.color}40`, borderRadius: RADIUS.sm, padding: `0 ${SP[1]}`,
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
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.18em', textTransform: 'uppercase', color: HUD.textFaint, marginBottom: '0.375rem' }}>
            Passive Bonuses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
            {passiveTalents.map((t, i) => (
              <div key={i} style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, display: 'flex', gap: '0.375rem' }}>
                <span style={{ color: HUD.gold }}>+{t.statBonus!.value} {t.statBonus!.stat}</span>
                <span style={{ color: HUD.textFaint }}>· {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {talentGroups.length === 0 && passiveTalents.length === 0 && (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.textFaint, fontStyle: 'italic', textAlign: 'center', padding: '1.25rem 0' }}>
          No active talents to display
        </div>
      )}
    </div>
  )
}
