'use client'

import { useState } from 'react'
import { isForceUserSensitive } from '@/lib/forceUtils'
import { RichText } from '@/components/ui/RichText'
import { FONT_DISPLAY, FONT_BODY, FS, SP, RADIUS, HUD, EASE } from '@/lib/tokens'
import type {
  Character, RefSpecies, RefCareer, RefSpecialization,
  CharacterSpecialization, SpeciesAbility,
  RefObligationType, RefDutyType,
} from '@/lib/types'

// ── Sealed game-mechanic colours ──────────────────────────────────────────────
const XP_GOLD      = '#C8961A' /* FFG proficiency die — sealed */
const DANGER       = '#E85A2A' /* wounds/danger — Ember Tatooine exception */
const ABILITY_GREEN = '#4A7A30' /* FFG ability die — sealed */
const FORCE_PURPLE  = '#8B5CF6' /* force/purple accent — mobile consistent */

// ── Props ─────────────────────────────────────────────────────────────────────
interface MobileLoreScreenProps {
  character:          Character
  speciesAbilities:   SpeciesAbility[]
  refSpeciesAll:      RefSpecies[]
  refCareers:         RefCareer[]
  refSpecs:           RefSpecialization[]
  charSpecs:          CharacterSpecialization[]
  refObligationTypes: RefObligationType[]
  refDutyTypes:       RefDutyType[]
  forceRating:        number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toTitleCase(s: string | undefined | null): string {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

// ── Section header (same style as MobileGroupScreen zone headers) ─────────────
function SectionHdr({ label, purple }: { label: string; purple?: boolean }) {
  return (
    <div style={{
      padding: `${SP[1]} ${SP[2]}`,
      borderBottom: `1px solid var(--hud-border)`,
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: purple
        ? FORCE_PURPLE /* force/purple accent — mobile consistent */
        : 'var(--hud-accent)',
    }}>
      {label}
    </div>
  )
}

// ── Collapsible species ability card ─────────────────────────────────────────
function AbilityCard({ ability }: { ability: SpeciesAbility }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      onClick={() => setOpen(p => !p)}
      style={{
        width: '100%', textAlign: 'left',
        background: `color-mix(in srgb, var(--hud-accent) 4%, transparent)`,
        border: `1px solid color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
        borderRadius: RADIUS.md,
        padding: SP[2],
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        gap: open && ability.description ? SP[1] : 0,
        transition: `gap ${EASE.quick}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
        <span style={{
          flex: 1,
          fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--hud-accent)',
        }}>
          {ability.name}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
          {open ? '▼' : '▶'}
        </span>
      </div>
      {open && ability.description && (
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: HUD.textFaint, lineHeight: 1.6,
          textAlign: 'left',
        }}>
          <RichText text={ability.description} />
        </div>
      )}
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MobileLoreScreen({
  character, speciesAbilities, refSpeciesAll, refCareers,
  refSpecs, charSpecs, refObligationTypes, refDutyTypes, forceRating,
}: MobileLoreScreenProps) {
  const isForceUser = isForceUserSensitive(character, forceRating)

  // Resolve display names
  const speciesData = refSpeciesAll.find(s => s.key === character.species_key)
  const speciesName = speciesData?.name ?? toTitleCase(character.species_key)
  const careerName  = refCareers.find(c => c.key === character.career_key)?.name
    ?? toTitleCase(character.career_key)
  const specNames   = charSpecs
    .map(cs => refSpecs.find(s => s.key === cs.specialization_key)?.name ?? cs.specialization_key)
    .join(' · ')

  // Duty / Obligation resolved names (with custom name and key fallbacks)
  const dutyResolvedName = character.duty_type
    ? refDutyTypes.find(d => d.key === character.duty_type)?.name
      ?? character.duty_custom_name
      ?? toTitleCase(character.duty_type)
    : null
  const obligationResolvedName = character.obligation_type
    ? refObligationTypes.find(o => o.key === character.obligation_type)?.name
      ?? character.obligation_custom_name
      ?? toTitleCase(character.obligation_type)
    : null

  const motivationText = character.motivation_description
    || character.obligation_notes
    || character.duty_notes
    || ''

  const dutyDescription       = character.duty_lore        || character.duty_notes        || ''
  const obligationDescription = character.obligation_lore  || character.obligation_notes  || ''

  const showDuty       = !!(character.duty_obligation_configured && dutyResolvedName && character.duty_value !== undefined)
  const showObligation = !!(character.duty_obligation_configured && obligationResolvedName && character.obligation_value !== undefined)

  const moralityPct = Math.min(100, Math.max(0, character.morality_value ?? 50))

  return (
    <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

      {/* ══ SECTION 1: IDENTITY ══════════════════════════════════════ */}
      <SectionHdr label="◈ Identity" />
      <div style={{
        padding: SP[2],
        display: 'flex', flexDirection: 'column', gap: SP[2],
      }}>
        {/* Species, career, spec line */}
        <div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
            color: HUD.text,
          }}>
            {speciesName}
          </div>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint,
            marginTop: '2px', /* fixed pixel — below SP[1] floor */
          }}>
            {careerName}{specNames ? ` · ${specNames}` : ''}
          </div>
          {speciesData?.starting_xp != null && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: HUD.textFaint,
              marginTop: '2px', /* fixed pixel — below SP[1] floor */
            }}>
              Starting XP: {speciesData.starting_xp}
            </div>
          )}
        </div>

        {/* Species special abilities (collapsible) */}
        {speciesAbilities.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
            {speciesAbilities.map(a => (
              <AbilityCard key={a.key} ability={a} />
            ))}
          </div>
        )}
      </div>

      {/* ══ SECTION 2: BACKGROUND ════════════════════════════════════ */}
      <SectionHdr label="◈ Background" />
      <div style={{
        padding: SP[2],
        display: 'flex', flexDirection: 'column', gap: SP[2],
      }}>
        {/* Motivation type + specific pills */}
        {(character.motivation_type || character.motivation_specific) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], flexWrap: 'wrap' }}>
            {character.motivation_type && (
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.06em',
                padding: `1px ${SP[1]}`, /* fixed pixel — below SP[1] floor */
                borderRadius: RADIUS.full,
                background: `color-mix(in srgb, #C8961A 12%, transparent)`, /* FFG proficiency die — sealed */
                border: `1px solid color-mix(in srgb, #C8961A 35%, transparent)`, /* FFG proficiency die — sealed */
                color: XP_GOLD, /* FFG proficiency die — sealed */
              }}>
                {toTitleCase(character.motivation_type)}
              </span>
            )}
            {character.motivation_specific && (
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: HUD.textFaint,
              }}>
                {character.motivation_specific}
              </span>
            )}
          </div>
        )}

        {/* Motivation description */}
        {motivationText ? (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, lineHeight: 1.5,
          }}>
            <RichText text={motivationText} />
          </div>
        ) : null}

        {/* Duty block */}
        {showDuty && (
          <div style={{
            padding: SP[2], borderRadius: RADIUS.md,
            border: `1px solid color-mix(in srgb, #C8961A 25%, transparent)`, /* FFG proficiency die — sealed */
            background: `color-mix(in srgb, #C8961A 5%, transparent)`, /* FFG proficiency die — sealed */
            display: 'flex', flexDirection: 'column', gap: SP[1],
          }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--hud-accent)',
            }}>
              DUTY
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                padding: `1px ${SP[1]}`, /* fixed pixel — below SP[1] floor */
                borderRadius: RADIUS.full,
                background: `color-mix(in srgb, #C8961A 15%, transparent)`, /* FFG proficiency die — sealed */
                border: `1px solid color-mix(in srgb, #C8961A 40%, transparent)`, /* FFG proficiency die — sealed */
                color: XP_GOLD, /* FFG proficiency die — sealed */
              }}>
                {dutyResolvedName}
              </span>
              <span style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
                color: XP_GOLD, /* FFG proficiency die — sealed */
              }}>
                {character.duty_value}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{
              height: '4px', /* fixed bar height */
              borderRadius: RADIUS.sm, overflow: 'hidden',
              background: 'var(--hud-border)',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, character.duty_value ?? 0)}%`,
                background: XP_GOLD, /* FFG proficiency die — sealed */
                borderRadius: RADIUS.sm,
                transition: `width ${EASE.smooth}`,
              }} />
            </div>
            {dutyDescription ? (
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: HUD.textFaint, lineHeight: 1.5, fontStyle: 'italic',
              }}>
                <RichText text={dutyDescription} />
              </div>
            ) : null}
          </div>
        )}

        {/* Obligation block */}
        {showObligation && (
          <div style={{
            padding: SP[2], borderRadius: RADIUS.md,
            border: `1px solid color-mix(in srgb, #E85A2A 25%, transparent)`, /* wounds/danger — Ember Tatooine exception */
            background: `color-mix(in srgb, #E85A2A 5%, transparent)`, /* wounds/danger — Ember Tatooine exception */
            display: 'flex', flexDirection: 'column', gap: SP[1],
          }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: DANGER, /* wounds/danger — Ember Tatooine exception */
            }}>
              OBLIGATION
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                padding: `1px ${SP[1]}`, /* fixed pixel — below SP[1] floor */
                borderRadius: RADIUS.full,
                background: `color-mix(in srgb, #E85A2A 15%, transparent)`, /* wounds/danger — Ember Tatooine exception */
                border: `1px solid color-mix(in srgb, #E85A2A 40%, transparent)`, /* wounds/danger — Ember Tatooine exception */
                color: DANGER, /* wounds/danger — Ember Tatooine exception */
              }}>
                {obligationResolvedName}
              </span>
              <span style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700,
                color: DANGER, /* wounds/danger — Ember Tatooine exception */
              }}>
                {character.obligation_value}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{
              height: '4px', /* fixed bar height */
              borderRadius: RADIUS.sm, overflow: 'hidden',
              background: 'var(--hud-border)',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, character.obligation_value ?? 0)}%`,
                background: DANGER, /* wounds/danger — Ember Tatooine exception */
                borderRadius: RADIUS.sm,
                transition: `width ${EASE.smooth}`,
              }} />
            </div>
            {obligationDescription ? (
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: HUD.textFaint, lineHeight: 1.5, fontStyle: 'italic',
              }}>
                <RichText text={obligationDescription} />
              </div>
            ) : null}
          </div>
        )}

        {/* Fallback when no background details exist */}
        {!motivationText
          && !(character.motivation_type || character.motivation_specific)
          && !showDuty && !showObligation && (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: HUD.textFaint, fontStyle: 'italic',
          }}>
            No background details recorded.
          </div>
        )}
      </div>

      {/* ══ SECTION 3: MORALITY (Force users only) ═══════════════════ */}
      {isForceUser && character.morality_configured && (
        <>
          <SectionHdr label="◈ Morality" purple />
          <div style={{ padding: SP[2] }}>
            <div style={{
              padding: SP[2], borderRadius: RADIUS.lg,
              border: `1px solid color-mix(in srgb, #8B5CF6 30%, transparent)`, /* force/purple accent — mobile consistent */
              background: `color-mix(in srgb, #8B5CF6 5%, transparent)`, /* force/purple accent — mobile consistent */
              display: 'flex', flexDirection: 'column', gap: SP[1],
            }}>
              {/* Morality value */}
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.h2, fontWeight: 700,
                color: FORCE_PURPLE, /* force/purple accent — mobile consistent */
                textAlign: 'center',
              }}>
                {character.morality_value ?? 50}
              </div>

              {/* Gradient progress bar with position marker */}
              <div style={{
                position: 'relative',
                height: '8px', /* fixed bar height */
                borderRadius: RADIUS.sm, overflow: 'visible',
                background: 'var(--hud-border)',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: RADIUS.sm, overflow: 'hidden',
                  background: `linear-gradient(to right,
                    #E85A2A /* wounds/danger — Ember Tatooine exception */,
                    #8B5CF6 /* force/purple accent — mobile consistent */)`,
                }} />
                <div style={{
                  position: 'absolute',
                  left: `${moralityPct}%`,
                  top: '-2px', bottom: '-2px',
                  width: '2px', /* fixed marker width */
                  background: HUD.text,
                  borderRadius: '1px',
                  transform: 'translateX(-50%)',
                }} />
              </div>

              {/* Strength / Weakness labels */}
              <div style={{ display: 'flex', gap: SP[2], flexWrap: 'wrap', justifyContent: 'center' }}>
                {character.morality_strength_key && (
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                    color: ABILITY_GREEN, /* FFG ability die — sealed */
                    letterSpacing: '0.06em',
                  }}>
                    Strength: {toTitleCase(character.morality_strength_key)}
                  </div>
                )}
                {character.morality_weakness_key && (
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
                    color: DANGER, /* wounds/danger — Ember Tatooine exception */
                    letterSpacing: '0.06em',
                  }}>
                    Weakness: {toTitleCase(character.morality_weakness_key)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ SECTION 4: BACKSTORY ════════════════════════════════════ */}
      <SectionHdr label="◈ Backstory" />
      <div style={{
        padding: SP[2],
        fontFamily: FONT_BODY, fontSize: FS.overline,
        color: HUD.textFaint, lineHeight: 1.6,
      }}>
        {character.backstory ? (
          <RichText text={character.backstory} />
        ) : (
          <span style={{ fontStyle: 'italic' }}>No backstory recorded.</span>
        )}
      </div>

      {/* ══ SECTION 5: NOTES ════════════════════════════════════════ */}
      <SectionHdr label="◈ Notes" />
      <div style={{
        padding: SP[2],
        paddingBottom: SP[4], /* extra bottom breathing room above nav */
        fontFamily: FONT_BODY, fontSize: FS.overline,
        color: HUD.textFaint, lineHeight: 1.5,
      }}>
        {character.notes ? (
          <RichText text={character.notes} />
        ) : (
          <span style={{ fontStyle: 'italic' }}>No notes recorded.</span>
        )}
      </div>

    </div>
  )
}
