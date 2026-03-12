'use client'

import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase, FS_OVERLINE, FS_LABEL, FS_SM, FS_H3 } from './design-tokens'

export interface ForcePowerSummary {
  powerKey:       string
  powerName:      string
  purchasedCount: number
  totalCount:     number
}

interface ForcePanelProps {
  forceRating:      number
  moralityValue:    number
  moralityStrength: string
  moralityWeakness: string
  forcePowers:      ForcePowerSummary[]
  onViewPower:      (powerKey: string) => void
  onAdd:            () => void
  onRollForce:      () => void
}

function CornerBrackets() {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}` }} />
    </>
  )
}

function MoralitySlider({ value, strength, weakness }: { value: number; strength: string; weakness: string }) {
  return (
    <div style={{ ...panelBase, padding: '12px 14px' }}>
      <CornerBrackets />
      <div style={{
        textAlign: 'center', marginBottom: 8,
        fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700,
        color: C.gold,
      }}>
        {value}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: '#E05050', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {weakness || 'Weakness'}
        </span>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: '#5AAAE0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {strength || 'Strength'}
        </span>
      </div>
      {/* Track */}
      <div style={{ position: 'relative', height: 8, background: C.textFaint, borderRadius: 4 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4,
          width: `${value}%`,
          background: 'linear-gradient(90deg, #E05050, #4EC87A 60%, #5AAAE0)',
        }} />
        {/* Indicator dot */}
        <div style={{
          position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
          left: `${value}%`,
          width: 12, height: 12, borderRadius: '50%',
          background: C.gold, border: `2px solid ${C.bg}`,
          boxShadow: `0 0 8px ${C.gold}`,
          transition: 'left .3s ease',
        }} />
      </div>
    </div>
  )
}

export function ForcePanel({
  forceRating, moralityValue, moralityStrength, moralityWeakness, forcePowers, onViewPower, onAdd, onRollForce,
}: ForcePanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Force Rating */}
      <div style={{ ...panelBase, padding: '14px 16px', textAlign: 'center' }}>
        <CornerBrackets />
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: C.textDim, marginBottom: 8,
        }}>
          Force Rating
        </div>
        <div style={{
          fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700,
          color: '#5AAAE0', lineHeight: 1,
          textShadow: '0 0 24px rgba(90,170,224,0.4)',
        }}>
          {forceRating}
        </div>
        {/* Force pips */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8, marginBottom: 12 }}>
          {Array.from({ length: Math.max(forceRating, 1) }).map((_, i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: i < forceRating ? '#5AAAE0' : 'transparent',
              border: `1px solid #5AAAE0`,
              boxShadow: i < forceRating ? '0 0 6px rgba(90,170,224,0.5)' : 'none',
            }} />
          ))}
        </div>
        {/* Roll Force Dice button */}
        <button
          onClick={onRollForce}
          disabled={forceRating === 0}
          style={{
            width: '100%', padding: '8px 0',
            background: forceRating > 0 ? 'rgba(90,170,224,0.12)' : 'transparent',
            border: `1px solid ${forceRating > 0 ? 'rgba(90,170,224,0.5)' : C.border}`,
            borderRadius: 4, cursor: forceRating > 0 ? 'pointer' : 'not-allowed',
            fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.1em', color: forceRating > 0 ? '#5AAAE0' : C.textDim,
            transition: '.15s',
          }}
          onMouseEnter={e => { if (forceRating > 0) (e.currentTarget as HTMLElement).style.background = 'rgba(90,170,224,0.22)' }}
          onMouseLeave={e => { if (forceRating > 0) (e.currentTarget as HTMLElement).style.background = 'rgba(90,170,224,0.12)' }}
        >
          ◈ Roll {forceRating} Force {forceRating === 1 ? 'Die' : 'Dice'}
        </button>
        {/* Legend: light / dark */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E8E8FF', boxShadow: '0 0 4px #E8E8FF' }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: 'rgba(232,232,255,0.7)' }}>Light ○</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a1a2e', border: '1px solid #6060A0' }} />
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: 'rgba(96,96,160,0.9)' }}>Dark ●</span>
          </div>
        </div>
      </div>

      {/* Morality */}
      {moralityValue !== undefined && (
        <div>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: C.textDim, marginBottom: 8, paddingBottom: 4,
            borderBottom: `1px solid ${C.border}`,
          }}>
            Morality
          </div>
          <MoralitySlider value={moralityValue} strength={moralityStrength} weakness={moralityWeakness} />
        </div>
      )}

      {/* Force Powers */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8, paddingBottom: 4,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: C.textDim,
          }}>
            Force Powers
          </div>
          <button
            onClick={onAdd}
            style={{
              background: 'rgba(200,170,80,0.08)',
              border: `1px solid rgba(200,170,80,0.3)`,
              borderRadius: 3, padding: '2px 10px',
              fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
              fontWeight: 700, letterSpacing: '0.1em',
              color: C.gold, cursor: 'pointer',
              transition: '.15s',
            }}
          >
            + Add
          </button>
        </div>

        {forcePowers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {forcePowers.map(fp => {
              const pct = fp.totalCount > 0 ? (fp.purchasedCount / fp.totalCount) * 100 : 0
              return (
                <div
                  key={fp.powerKey}
                  onClick={() => onViewPower(fp.powerKey)}
                  style={{
                    ...panelBase,
                    padding: '10px 12px',
                    cursor: 'pointer', transition: '.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderHi }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border }}
                >
                  <CornerBrackets />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 600, color: C.text, flex: 1, minWidth: 0, marginRight: 6 }}>
                      {fp.powerName}
                    </div>
                    <div style={{
                      fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE,
                      color: '#5AAAE0', flexShrink: 0,
                    }}>
                      {fp.purchasedCount}/{fp.totalCount}
                    </div>
                  </div>
                  <div style={{ height: 4, background: C.textFaint, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: 'linear-gradient(90deg, #5AAAE0, #B070D8)',
                      borderRadius: 2, transition: 'width .4s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '28px 0',
          }}>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textFaint }}>
              No force powers purchased yet.
            </div>
            <button
              onClick={onAdd}
              style={{
                background: 'rgba(90,170,224,0.1)',
                border: '1px solid rgba(90,170,224,0.35)',
                borderRadius: 4, padding: '8px 20px',
                fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#5AAAE0', cursor: 'pointer',
              }}
            >
              Browse Force Powers
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
