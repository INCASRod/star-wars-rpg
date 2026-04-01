'use client'

import { RANGE_LABELS } from '@/lib/types'
import type { Character, CharacterWeapon, CharacterCriticalInjury, RefWeapon, RefSkill } from '@/lib/types'
import { WeaponDamageDisplay, isMeleeSkill } from '@/components/character/WeaponDamageDisplay'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD     = '#C8AA50'
const GOLD_DIM = 'rgba(200,170,80,0.6)'
const GOLD_BD  = 'rgba(200,170,80,0.15)'
const BORDER   = 'rgba(200,170,80,0.1)'
const TEXT     = 'rgba(255,255,255,0.85)'
const TEXT_DIM = 'rgba(255,255,255,0.5)'
const CARD_BG  = 'rgba(255,255,255,0.03)'
const FONT_C   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_R   = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_M   = "'Courier New', monospace"

const CHAR_ENTRIES: { key: keyof Character; label: string }[] = [
  { key: 'brawn',     label: 'Brawn'     },
  { key: 'agility',   label: 'Agility'   },
  { key: 'cunning',   label: 'Cunning'   },
  { key: 'intellect', label: 'Intellect' },
  { key: 'willpower', label: 'Willpower' },
  { key: 'presence',  label: 'Presence'  },
]

const SEV_COLOR: Record<string, string> = {
  Minor:    '#4CAF50',
  Moderate: '#FF9800',
  Serious:  '#f44336',
  Critical: '#9C27B0',
}

interface StatusTabProps {
  character: Character
  weapons: CharacterWeapon[]
  crits: CharacterCriticalInjury[]
  refWeaponMap: Record<string, RefWeapon>
  refSkillMap: Record<string, RefSkill>
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: FONT_C,
      fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
      fontWeight: 700,
      color: GOLD,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '12px 16px 6px',
      borderBottom: `1px solid ${BORDER}`,
      marginBottom: 8,
    }}>
      {label}
    </div>
  )
}

export function StatusTab({ character, weapons, crits, refWeaponMap, refSkillMap }: StatusTabProps) {
  const equippedWeapons = (Array.isArray(weapons) ? weapons : []).filter(w => w.equip_state === 'equipped' || w.is_equipped)

  return (
    <div style={{ paddingBottom: 16 }}>

      {/* ── Characteristics Grid ── */}
      <SectionHeader label="Characteristics" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 16px 12px' }}>
        {CHAR_ENTRIES.map(({ key, label }) => (
          <div key={key} style={{
            background: CARD_BG,
            border: `1px solid ${GOLD_BD}`,
            borderRadius: 8,
            padding: '8px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}>
            <span style={{
              fontFamily: FONT_R,
              fontSize: 'clamp(0.5rem, 2vw, 0.65rem)',
              textTransform: 'uppercase',
              color: GOLD_DIM,
              letterSpacing: '0.06em',
              lineHeight: 1,
            }}>
              {label}
            </span>
            <span style={{
              fontFamily: FONT_C,
              fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
              fontWeight: 700,
              color: GOLD,
              lineHeight: 1,
            }}>
              {character[key] as number}
            </span>
          </div>
        ))}
      </div>

      {/* ── Derived Stats Strip ── */}
      <SectionHeader label="Derived" />
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Soak',    value: character.soak },
          { label: 'Def (M)', value: character.defense_melee },
          { label: 'Def (R)', value: character.defense_ranged },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(200,170,80,0.08)',
            border: `1px solid rgba(200,170,80,0.2)`,
            borderRadius: 20,
            padding: '5px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontFamily: FONT_M, fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', color: TEXT_DIM }}>{label}</span>
            <span style={{ fontFamily: FONT_C, fontSize: 'clamp(0.8rem, 3vw, 1rem)', fontWeight: 700, color: GOLD }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Weapons ── */}
      {equippedWeapons.length > 0 && (
        <>
          <SectionHeader label="Weapons" />
          <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {equippedWeapons.map((cw, i) => {
              const ref = refWeaponMap[cw.weapon_key]
              if (!ref) return null
              const skillRef = refSkillMap[ref.skill_key]
              return (
                <div key={cw.id}>
                  {i > 0 && <div style={{ height: 1, background: BORDER, margin: '6px 0' }} />}
                  <div style={{ padding: '4px 0' }}>
                    <div style={{
                      fontFamily: FONT_C,
                      fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                      fontWeight: 700,
                      color: TEXT,
                      marginBottom: 2,
                    }}>
                      {cw.custom_name || ref.name}
                    </div>
                    <div style={{
                      fontFamily: FONT_R,
                      fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
                      color: TEXT_DIM,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0 10px',
                    }}>
                      {skillRef && <span>{skillRef.name}</span>}
                      <span style={{ color: '#E07855' }}>
                        DMG <WeaponDamageDisplay
                          baseDamage={ref.damage_add != null ? ref.damage_add : ref.damage}
                          isMelee={ref.damage_add != null && isMeleeSkill(ref.skill_key)}
                          brawn={character.brawn}
                        />
                      </span>
                      {ref.crit > 0 && <span style={{ color: '#E05050' }}>CRIT {ref.crit}</span>}
                      <span>{RANGE_LABELS[ref.range_value] ?? ref.range_value}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Critical Injuries ── */}
      {crits.length > 0 && (
        <>
          <SectionHeader label="Critical Injuries" />
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(Array.isArray(crits) ? crits : []).map(crit => {
              const sevColor = SEV_COLOR[crit.severity] ?? '#888'
              return (
                <div key={crit.id} style={{
                  background: `${sevColor}10`,
                  border: `1px solid ${sevColor}40`,
                  borderRadius: 8,
                  padding: '8px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontFamily: FONT_M,
                      fontSize: 'clamp(0.55rem, 2vw, 0.65rem)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: sevColor,
                      background: `${sevColor}20`,
                      border: `1px solid ${sevColor}50`,
                      borderRadius: 4,
                      padding: '1px 6px',
                    }}>
                      {crit.severity}
                    </span>
                    <span style={{
                      fontFamily: FONT_C,
                      fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
                      fontWeight: 700,
                      color: TEXT,
                    }}>
                      {crit.custom_name}
                    </span>
                  </div>
                  {crit.description && (
                    <p style={{
                      fontFamily: FONT_R,
                      fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
                      color: TEXT_DIM,
                      margin: 0,
                      lineHeight: 1.4,
                    }}>
                      {crit.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
