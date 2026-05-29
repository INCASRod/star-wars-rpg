'use client'

import type { Character, CharacterCriticalInjury } from '@/lib/types'
import { HUD, FONT_BODY as FONT, FS, EASE, RADIUS } from '@/lib/tokens'
import { CriticalInjuryPip, type CritPip } from '@/components/character/CriticalInjuryPip'
import { GmConflictPip } from '@/components/gm/GmConflictPip'
import { Tooltip } from '@/components/ui/Tooltip'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'


interface Props {
  character:          Character
  onAddWound:         (id: string) => void
  onHealWound:        (id: string) => void
  onAddStrain:        (id: string) => void
  onHealStrain:       (id: string) => void
  onClick:            () => void
  crits?:             CharacterCriticalInjury[]
  conflicts?:         GmConflictRow[]
  onHealCrit?:        (id: string) => void
  onResolveConflict?: (id: string) => void
}

function OverflowBadge({ color, count, items }: { color: string; count: number; items: string[] }) {
  return (
    <Tooltip
      content={
        <div style={{ fontFamily: FONT, fontSize: FS.caption, lineHeight: 1.5 }}>
          {items.map((item, i) => <div key={i}>{item}</div>)}
        </div>
      }
      placement="top"
      maxWidth={180}
    >
      <span style={{
        fontFamily: FONT,
        fontSize: 'var(--text-caption)',
        color,
        fontWeight: 700,
        cursor: 'default',
        flexShrink: 0,
      }}>
        +{count}
      </span>
    </Tooltip>
  )
}

export function GmPartyMiniCard({ character: c, onAddWound, onHealWound, onAddStrain, onHealStrain, onClick, crits, conflicts, onHealCrit, onResolveConflict }: Props) {
  const wPct     = Math.min(100, (c.wound_current / c.wound_threshold) * 100)
  const sPct     = Math.min(100, (c.strain_current / c.strain_threshold) * 100)
  const isDown   = c.wound_current >= c.wound_threshold
  const isHurt   = !isDown && wPct >= 50
  const leftBdr  = isDown ? 'var(--hud-vital-wounds)' : 'transparent'

  const stepBtn: React.CSSProperties = {
    width:          '1.125rem',
    height:         '1.125rem',
    background:     'rgba(0,0,0,0.3)',
    border:         '1px solid var(--hud-border-hi)',
    borderRadius:   RADIUS.sm,
    cursor:         'pointer',
    color:          'var(--hud-text-dim)',
    fontSize:       'var(--text-caption)',
    fontFamily:     FONT,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  }

  return (
    <div
      style={{
        background:  'var(--hud-surface-mid)',
        border:      `1px solid var(--hud-border-hi)`,
        borderLeft:  `3px solid ${leftBdr}`,
        borderRadius: RADIUS.md,
        padding:     '0.5rem 0.625rem',
        cursor:      'pointer',
        transition:  `background ${EASE.quick}`,
        boxShadow:   isDown ? '0 0 8px rgba(192,64,64,0.2)' : undefined,
      }}
      onClick={onClick}
    >
      {/* Name + species/career */}
      <div style={{ marginBottom: '0.375rem' }}>
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--hud-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.name}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--hud-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.0625rem' }}>
          {c.species_key} · {c.career_key}
        </div>
      </div>

      {/* Wounds */}
      <div style={{ marginBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.1875rem' }}>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--hud-vital-wounds)', fontWeight: 700, flex: 1 }}>W</span>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: isDown ? 'var(--hud-vital-wounds)' : 'var(--hud-text)', fontWeight: 700 }}>
            {c.wound_current}<span style={{ color: 'var(--hud-text-dim)' }}>/{c.wound_threshold}</span>
          </span>
          <button onClick={e => { e.stopPropagation(); onHealWound(c.id) }} style={stepBtn}>−</button>
          <button onClick={e => { e.stopPropagation(); onAddWound(c.id) }} style={stepBtn}>+</button>
        </div>
        <div style={{ height: '0.1875rem', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${wPct}%`, background: isDown ? 'var(--hud-vital-wounds)' : isHurt ? 'var(--hud-vital-strain)' : HUD.gold, borderRadius: RADIUS.sm, transition: `width ${EASE.smooth}` }} />
        </div>
      </div>

      {/* Strain */}
      <div style={{ marginBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.1875rem' }}>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--die-force)', fontWeight: 700, flex: 1 }}>S</span>
          <span style={{ fontFamily: FONT, fontSize: 'var(--text-caption)', color: 'var(--hud-text)', fontWeight: 700 }}>
            {c.strain_current}<span style={{ color: 'var(--hud-text-dim)' }}>/{c.strain_threshold}</span>
          </span>
          <button onClick={e => { e.stopPropagation(); onHealStrain(c.id) }} style={stepBtn}>−</button>
          <button onClick={e => { e.stopPropagation(); onAddStrain(c.id) }} style={stepBtn}>+</button>
        </div>
        <div style={{ height: '0.1875rem', background: 'var(--hud-surface-lo)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${sPct}%`, background: sPct >= 100 ? 'var(--hud-vital-wounds)' : 'var(--die-force)', borderRadius: RADIUS.sm, transition: `width ${EASE.smooth}` }} />
        </div>
      </div>

      {/* Pip row: injuries left, conflicts right — hidden when both empty */}
      {((crits?.length ?? 0) > 0 || (conflicts?.length ?? 0) > 0) && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem', marginBottom: '0.375rem', marginTop: '0.25rem' }}
        >
          {/* Injury pips (max 3) */}
          {crits?.slice(0, 3).map(inj => {
            const pip: CritPip = {
              id:           inj.id,
              severity:     inj.severity,
              name:         inj.custom_name ?? 'Critical Injury',
              description:  inj.description,
              sessionLabel: inj.session_label ?? undefined,
              rollResult:   inj.roll_result,
            }
            return <CriticalInjuryPip key={inj.id} pip={pip} onHeal={onHealCrit} />
          })}
          {crits && crits.length > 3 && (
            <OverflowBadge
              color="var(--state-failure)"
              count={crits.length - 3}
              items={crits.slice(3).map(inj => inj.custom_name ?? 'Critical Injury')}
            />
          )}
          {/* Flex spacer */}
          <div style={{ flex: 1 }} />
          {/* Conflict pips (max 3) */}
          {conflicts?.slice(0, 3).map(con => (
            <GmConflictPip key={con.id} conflict={con} onResolve={onResolveConflict} />
          ))}
          {conflicts && conflicts.length > 3 && (
            <OverflowBadge
              color="var(--hud-accent-purple)"
              count={conflicts.length - 3}
              items={conflicts.slice(3).map(con => con.description ?? 'Conflict')}
            />
          )}
        </div>
      )}

      {/* Soak */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', color: 'var(--hud-text-dim)' }}>Soak </span>
        <span style={{ fontFamily: FONT, fontSize: 'var(--text-overline)', fontWeight: 700, color: HUD.gold, marginLeft: '0.25rem' }}>{c.soak}</span>
      </div>
    </div>
  )
}
