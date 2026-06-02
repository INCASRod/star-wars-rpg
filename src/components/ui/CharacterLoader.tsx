'use client'

import { useState, useEffect }         from 'react'
import { useCharacterSelectStore }     from '@/store/characterSelectStore'
import {
  FONT_BODY, FONT_DISPLAY, HUD, Z, RADIUS, CHAR_COLOR,
} from '@/lib/tokens'

// Local CSS variable aliases — same values as page.tsx
const BORDER   = 'var(--hud-border)'
const INPUT_BG = 'var(--hud-surface-lo)'
const TEXT     = 'var(--hud-text)'
const TEXT_MUT = 'var(--hud-text-faint)'

const CHAR_COLORS: Record<string, string> = {
  brawn:     CHAR_COLOR.brawn,
  agility:   CHAR_COLOR.agility,
  intellect: CHAR_COLOR.intellect,
  cunning:   CHAR_COLOR.cunning,
  willpower: CHAR_COLOR.willpower,
  presence:  CHAR_COLOR.presence,
}

// CSS variable aliases matching page.tsx
const PIP_DANGER = 'var(--state-wounds)'
const PIP_WARN   = 'var(--state-strain)'

const CHAR_KEYS   = ['brawn','agility','intellect','cunning','willpower','presence'] as const
const CHAR_LABELS: Record<typeof CHAR_KEYS[number], string> = {
  brawn: 'BR', agility: 'AG', intellect: 'INT',
  cunning: 'CUN', willpower: 'WIL', presence: 'PR',
}

const LOADING_TEXTS = [
  'CONNECTING TO HOLONET...',
  'DECRYPTING IMPERIAL RECORDS...',
  'LOADING CHARACTER DOSSIER...',
  'SYNCING REBEL ALLIANCE DATABASE...',
  'VERIFYING CLEARANCE CODES...',
  'ACCESSING FIELD OPERATIVE PROFILE...',
] as const

export function CharacterLoader() {
  // Snapshot at mount — store changes after mount must not erase the card.
  const [char]     = useState(() => useCharacterSelectStore.getState().selectedCharacter)
  const [textIdx,  setTextIdx]  = useState(0)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTextIdx(p => (p + 1) % LOADING_TEXTS.length), 1800)
    return () => clearInterval(id)
  }, [])

  const showFallback = !char?.portrait_url || imgError

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      width:          '100vw',
      height:         '100vh',
      background:     '#0A0806',
      zIndex:         Z.modal,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '16px',
    }}>

      {char && (
        <div style={{
          width:          '220px',
          borderRadius:   '7px',
          border:         '1px solid color-mix(in srgb, var(--hud-accent) 65%, transparent)',
          background:     'var(--hud-surface-hi)',
          backdropFilter: 'blur(12px)',
          boxShadow:      [
            '0 0 0 1px color-mix(in srgb, var(--hud-accent) 10%, transparent)',
            '0 0 14px   color-mix(in srgb, var(--hud-accent) 28%, transparent)',
            '0 0 32px   color-mix(in srgb, var(--hud-accent)  8%, transparent)',
          ].join(', '),
          overflow:       'hidden',
          position:       'relative',
          display:        'flex',
          flexDirection:  'column',
          animation:      'cl-enter 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>

          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '0.125rem', background: 'var(--hud-accent)', zIndex: 2,
          }} />

          <div style={{
            position: 'absolute', top: 0, bottom: 0, right: '-20px',
            pointerEvents: 'none', zIndex: 4,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/factions/rebel.png"
              alt=""
              style={{ height: '100%', width: 'auto', filter: 'opacity(0.18)' }}
            />
          </div>

          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{
              width: '95px', flexShrink: 0,
              position: 'relative', overflow: 'hidden',
              borderRight: `1px solid ${BORDER}`,
            }}>
              {showFallback ? (
                <div style={{
                  width: '100%', height: '100%', minHeight: '90px',
                  background: 'var(--hud-surface-lo)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '6px',
                }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textAlign: 'center', lineHeight: 1.4 }}>
                    No image uploaded
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={char.portrait_url!}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                  onError={() => setImgError(true)}
                />
              )}

              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%)',
                padding: '18px 5px 5px', zIndex: 5,
              }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700, color: HUD.gold, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.name}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.career_key} // {char.species_key}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
                  Characteristics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '2px' }}>
                  {CHAR_KEYS.map(key => (
                    <div key={key} style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: '2px 1px', textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 700, color: CHAR_COLORS[key] }}>
                        {(char as unknown as Record<string, number>)[key]}
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {CHAR_LABELS[key]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
                  Combat
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
                  {[
                    { label: 'Soak',  value: char.soak           },
                    { label: 'M.Def', value: char.defense_melee  },
                    { label: 'R.Def', value: char.defense_ranged },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: '2px 4px', textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700, color: TEXT }}>{value}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '7px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: '2px' }}>
                  Resources
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
                  {[
                    { label: 'W.Thr', value: char.wound_threshold  },
                    { label: 'S.Thr', value: char.strain_threshold },
                    { label: 'XP',    value: char.xp_available     },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: '2px 4px', textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700, color: TEXT }}>{value}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '7px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, background: 'var(--hud-surface-lo)', padding: '5px 8px' }}>
            <div style={{ marginBottom: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Wounds</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT }}>{char.wound_current}/{char.wound_threshold}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                {Array.from({ length: char.wound_threshold }).map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: i < char.wound_current ? PIP_DANGER : 'transparent', border: `1px solid ${i < char.wound_current ? PIP_DANGER : 'color-mix(in srgb, var(--hud-accent) 25%, transparent)'}` }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT, textTransform: 'uppercase', letterSpacing: '0.06em', width: '28px' }}>Strain</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: '8px', color: TEXT_MUT }}>{char.strain_current}/{char.strain_threshold}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                {Array.from({ length: char.strain_threshold }).map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: i < char.strain_current ? PIP_WARN : 'transparent', border: `1px solid ${i < char.strain_current ? PIP_WARN : 'var(--hud-border)'}` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        width:     '220px',
        textAlign: 'center',
        animation: char ? 'cl-strip 0.4s 0.2s ease both' : 'cl-strip 0.4s ease both',
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: '13px', letterSpacing: '0.28em', textTransform: 'uppercase', color: HUD.gold, marginBottom: '8px' }}>
          H O L O C R O N
        </div>
        <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden', margin: '0 auto 8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, var(--hud-accent), #c8883a, transparent)', animation: 'loadingBarSweep 1.4s ease-in-out infinite' }} />
        </div>
        <div key={textIdx} role="status" aria-live="polite" style={{ fontFamily: FONT_BODY, fontSize: '7px', color: TEXT_MUT, letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'cl-text 0.3s ease forwards' }}>
          {LOADING_TEXTS[textIdx]}
        </div>
      </div>
    </div>
  )
}
