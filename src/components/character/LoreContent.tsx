'use client'

import { useState, useRef } from 'react'
import { RefSpecies, SpeciesAbility } from '@/lib/types'
import { Tooltip, TipLabel, TipBody, TipDivider } from '@/components/ui/Tooltip'
import { RichText } from '@/components/ui/RichText'
import { DutyCard } from '@/components/character/DutyCard'
import { ObligationCard } from '@/components/character/ObligationCard'
import { HUD, COLOR, FS, RADIUS, FONT_BODY } from '@/lib/tokens'

// ─── Props ───────────────────────────────────────────────────────────────────
interface LoreContentProps {
  characterName: string
  careerName: string
  speciesName: string
  gender?: string
  backstory: string
  notes: string
  speciesRef?: RefSpecies
  motivationType?: string
  motivationSpecific?: string
  motivationDesc?: string
  motivationConfigured?: boolean
  dutyType?: string
  dutyValue?: number
  dutyLore?: string
  dutyCustomName?: string | null
  dutyResolvedType?: string
  obligationType?: string
  obligationValue?: number
  obligationLore?: string
  obligationCustomName?: string | null
  obligationResolvedType?: string
  dutyObligationConfigured?: boolean
  conflictEntries?: { label: string; value: number }[]
  isForceUser?: boolean
  onBackstoryChange: (v: string) => void
  onNotesChange: (v: string) => void
}

// ─── Auto-save hook ───────────────────────────────────────────────────────────
function useDebounced(init: string, onSave: (v: string) => void) {
  const [val, setVal] = useState(init)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChange = (v: string) => {
    setVal(v)
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => onSave(v), 800)
  }
  return [val, onChange] as const
}

// ─── Shared style factories ───────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
  position: 'relative',
  background: 'var(--hud-surface-lo)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--hud-border)',
  borderRadius: RADIUS.lg,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Four absolute corner brackets */
function CornerBrackets() {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 8,
    height: 8,
  }
  const color = 'var(--hud-border-hi)'
  return (
    <>
      <div style={{ ...base, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...base, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...base, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...base, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

/** Gradient-line + uppercase label row */
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 14, height: 1, background: 'linear-gradient(90deg,transparent,var(--hud-border-hi))' }} />
      <span style={{
        fontFamily: FONT_BODY,
        fontSize: FS.caption,
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: HUD.textDim,
      }}>
        {label}
      </span>
    </div>
  )
}

/** Decorative divider used between backstory sections */
function SectionDivider() {
  const line: React.CSSProperties = {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, var(--hud-border), transparent)',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
      <div style={line} />
      <span style={{ color: HUD.textFaint, fontSize: FS.caption }}>◈</span>
      <div style={line} />
    </div>
  )
}

function ConflictCard({ entries }: { entries: { label: string; value: number }[] }) {
  const total = entries.reduce((s, e) => s + e.value, 0)
  return (
    <div style={{ ...panelStyle, padding: '14px 16px', border: '1px solid rgba(224,80,80,0.2)' }}>
      <CornerBrackets />
      <SectionLabel label="Conflict" />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: COLOR.red, lineHeight: 1 }}>
          {total}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          total active
        </div>
      </div>
      {entries.map((entry, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 0',
            borderBottom: idx < entries.length - 1 ? '1px solid var(--hud-border)' : 'none',
          }}
        >
          <div style={{
            width: 7,
            height: 7,
            borderRadius: RADIUS.full,
            background: COLOR.red,
            boxShadow: '0 0 6px rgba(224,80,80,0.5)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.text }}>
            {entry.label}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, color: COLOR.red }}>
            {entry.value}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Drop-cap rendered backstory */
function BackstoryView({ backstory }: { backstory: string }) {
  const trimmed = backstory.trimStart()

  if (!trimmed) {
    return (
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, fontStyle: 'italic' }}>
        No backstory recorded.
      </div>
    )
  }

  // Split on OggDude paragraph markers so each chunk renders independently.
  const segments = backstory.split(/\[P\]/gi).filter(s => s.trim().length > 0)

  return (
    <div>
      {segments.map((seg, idx) => {
        const segTrimmed = seg.trimStart()

        if (idx === 0 && segTrimmed.length > 0) {
          // First segment: extract drop-cap character, render remainder via RichText
          const firstChar = segTrimmed[0]
          return (
            <div key={idx}>
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: 52,
                fontWeight: 700,
                color: HUD.gold,
                float: 'left',
                lineHeight: 0.85,
                marginRight: 10,
                textShadow: '0 0 20px rgba(224,58,30,0.3)',
              }}>
                {firstChar}
              </span>
              <RichText
                text={segTrimmed.slice(1)}
                style={{ fontFamily: FONT_BODY, fontSize: FS.sm, lineHeight: 1.9, color: HUD.text }}
              />
            </div>
          )
        }

        return (
          <div key={idx}>
            {idx > 0 && <SectionDivider />}
            <RichText
              text={seg}
              style={{ fontFamily: FONT_BODY, fontSize: FS.sm, lineHeight: 1.9, color: HUD.text }}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LoreContent({
  characterName,
  careerName,
  speciesName,
  gender,
  backstory,
  notes,
  speciesRef,
  motivationType,
  motivationSpecific,
  motivationDesc,
  motivationConfigured,
  dutyType,
  dutyValue,
  dutyLore,
  dutyCustomName,
  dutyResolvedType,
  obligationType,
  obligationValue,
  obligationLore,
  obligationCustomName,
  obligationResolvedType,
  dutyObligationConfigured,
  conflictEntries,
  isForceUser,
  onBackstoryChange,
  onNotesChange,
}: LoreContentProps) {
  const [editingBackstory, setEditingBackstory] = useState(false)
  const [localBackstory, handleBackstoryChange] = useDebounced(backstory, onBackstoryChange)
  const [localNotes, handleNotesChange] = useDebounced(notes, onNotesChange)

  const specialAbilities: SpeciesAbility[] =
    Array.isArray(speciesRef?.special_abilities) ? (speciesRef.special_abilities as SpeciesAbility[]) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 20, width: '100%', minHeight: 0 }}>

      {/* ── LEFT COLUMN ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 1. Header panel */}
        <div style={{ ...panelStyle, padding: '14px 18px' }}>
          <CornerBrackets />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: HUD.gold, lineHeight: 1.1 }}>
                {characterName}
              </div>
              <div style={{
                fontFamily: FONT_BODY,
                fontSize: FS.overline,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: HUD.textDim,
                marginTop: 4,
              }}>
                Character Background &amp; History
              </div>
            </div>

            <button
              onClick={() => setEditingBackstory(e => !e)}
              style={{
                border: `1px solid ${HUD.borderHi}`,
                background: 'var(--hud-accent-10)',
                borderRadius: RADIUS.md,
                padding: '5px 11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: FONT_BODY,
                fontSize: FS.caption,
                fontWeight: 700,
                color: HUD.gold,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ fontSize: FS.sm }}>✎</span>
              {editingBackstory ? 'Preview' : 'Edit Background'}
            </button>
          </div>
        </div>

        {/* 2. Backstory body panel */}
        <div style={{ ...panelStyle, padding: '20px 22px' }}>
          <CornerBrackets />
          <SectionLabel label="Origin Story" />

          {editingBackstory ? (
            <>
              <textarea
                value={localBackstory}
                onChange={e => handleBackstoryChange(e.target.value)}
                placeholder="Write your character's backstory... (OggDude markup supported)"
                className="hud-textarea" style={{ minHeight: 240 }}
                autoFocus
              />
              <div style={{
                fontFamily: FONT_BODY,
                fontSize: FS.caption,
                color: HUD.textFaint,
                marginTop: 6,
                textAlign: 'right',
                letterSpacing: '0.06em',
              }}>
                Auto-saves on pause
              </div>
            </>
          ) : (
            <BackstoryView backstory={localBackstory} />
          )}
        </div>

        {/* 3. Notes panel */}
        <div style={{ ...panelStyle, padding: '20px 22px' }}>
          <CornerBrackets />
          <SectionLabel label="Field Notes" />
          <textarea
            value={localNotes}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder="Session notes, reminders, contacts, safehouses..."
            className="hud-textarea" style={{ minHeight: 120 }}
          />
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: FS.label,
            color: COLOR.blue,
            marginTop: 6,
            textAlign: 'right',
            letterSpacing: '0.06em',
          }}>
            Auto-saves on pause
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ────────────────────────────────────────────────────── */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 1. Quick Facts */}
        <div style={{ ...panelStyle, padding: '14px 16px' }}>
          <CornerBrackets />
          <SectionLabel label="Intelligence File" />

          {(
            [
              ['Designation', characterName],
              ['Species', speciesName],
              ['Career', careerName],
              ['Gender', gender || '—'],
            ] as [string, string][]
          ).map(([label, value], idx, arr) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: idx < arr.length - 1 ? '1px solid var(--hud-border)' : 'none',
              }}
            >
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: FS.label,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: HUD.textDim,
                letterSpacing: '0.1em',
              }}>
                {label}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 600, color: HUD.text }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* 2. Species Card — only if speciesRef provided */}
        {speciesRef && (
          <div style={{ ...panelStyle, padding: '14px 16px' }}>
            <CornerBrackets />

            {/* Badge */}
            <div style={{
              background: 'rgba(90,170,224,0.1)',
              border: '1px solid rgba(90,170,224,0.3)',
              borderRadius: RADIUS.xl,
              padding: '2px 10px',
              display: 'inline-block',
              fontFamily: FONT_BODY,
              fontSize: FS.overline,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: COLOR.blue,
              letterSpacing: '0.1em',
            }}>
              SPECIES
            </div>

            {/* Species name */}
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, color: HUD.text, marginTop: 6 }}>
              {speciesRef.name}
            </div>

            {/* Type subtitle */}
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: FS.caption,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: HUD.textDim,
              marginTop: 2,
              letterSpacing: '0.1em',
            }}>
              {speciesRef.source_book || 'Core Rulebook'}
            </div>

            {/* 2×2 stat grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              margin: '12px 0',
            }}>
              {(
                [
                  ['Starting XP', speciesRef.starting_xp],
                  ['Wound Base', speciesRef.wound_threshold],
                  ['Strain Base', speciesRef.strain_threshold],
                  ['Source', speciesRef.source_book || 'Core'],
                ] as [string, string | number][]
              ).map(([statLabel, statValue]) => (
                <div
                  key={statLabel}
                  style={{
                    background: 'var(--hud-surface-mid)',
                    border: '1px solid var(--hud-border)',
                    borderRadius: RADIUS.md,
                    padding: '8px 6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 600, color: HUD.gold, lineHeight: 1 }}>
                    {statValue}
                  </div>
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: FS.caption,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: HUD.textDim,
                    marginTop: 3,
                    letterSpacing: '0.08em',
                  }}>
                    {statLabel}
                  </div>
                </div>
              ))}
            </div>

            {/* Special Abilities */}
            {specialAbilities.length > 0 && (
              <div>
                <SectionLabel label="Special Abilities" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {specialAbilities.map((ability, idx) => {
                    const isCond = ability.is_conditional
                    const pillStyle: React.CSSProperties = {
                      fontFamily: FONT_BODY,
                      fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                      textTransform: 'uppercase' as const,
                      borderRadius: RADIUS.xl,
                      padding: '3px 10px',
                      cursor: 'help',
                      whiteSpace: 'nowrap' as const,
                      ...(isCond
                        ? {
                            border: '1px solid rgba(255,152,0,0.4)',
                            background: 'rgba(255,152,0,0.08)',
                            color: '#FF9800',
                          }
                        : {
                            border: `1px solid ${HUD.borderHi}`,
                            background: 'var(--hud-surface-lo)',
                            color: HUD.gold,
                          }),
                    }
                    const tipContent = (
                      <>
                        <TipLabel>{ability.name}</TipLabel>
                        <TipBody><RichText text={ability.description} /></TipBody>
                        {Array.isArray(ability.affected_skills) && ability.affected_skills.length > 0 && (
                          <>
                            <TipDivider />
                            <TipBody>Affects: {ability.affected_skills.join(', ')}</TipBody>
                          </>
                        )}
                        {isCond && (ability.condition_note ?? '') !== '' && (
                          <>
                            <TipDivider />
                            <div style={{
                              fontFamily: FONT_BODY,
                              fontSize: FS.label,
                              color: '#FF9800',
                              fontStyle: 'italic',
                              lineHeight: 1.5,
                            }}>
                              ⚠ Conditional: {ability.condition_note ?? ''}
                            </div>
                          </>
                        )}
                      </>
                    )
                    return (
                      <Tooltip key={idx} content={tipContent} placement="top" maxWidth={300}>
                        <span style={pillStyle}>
                          {isCond ? `⚠ ${ability.name}` : ability.name}
                        </span>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Conflict card — Force-sensitive only, shown when entries exist */}
        {isForceUser && conflictEntries && conflictEntries.length > 0 && (
          <ConflictCard entries={conflictEntries} />
        )}

        {/* 4. Motivation card — shown when configured, or as legacy fallback */}
        {(motivationConfigured && motivationType) ? (
          <div style={{ ...panelStyle, padding: '14px 16px' }}>
            <CornerBrackets />
            <SectionLabel label="Motivation" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700, color: COLOR.blue, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {motivationType}
                </div>
                {motivationSpecific && (
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>
                    {motivationSpecific}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: COLOR.blue, background: 'rgba(90,170,224,0.1)', border: '1px solid rgba(90,170,224,0.3)', borderRadius: RADIUS.sm, padding: '2px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Motivation
              </span>
            </div>
            {motivationDesc && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1.6, borderTop: '1px solid rgba(90,170,224,0.1)', paddingTop: 8 }}>
                {motivationDesc}
              </div>
            )}
          </div>
        ) : (!dutyObligationConfigured && motivationType) ? (
          <div style={{ ...panelStyle, padding: '14px 16px' }}>
            <CornerBrackets />
            <SectionLabel label="Motivation" />
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.gold, marginBottom: motivationDesc ? 8 : 0 }}>
              {motivationType}
            </div>
            {motivationDesc && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, lineHeight: 1.6 }}>
                {motivationDesc}
              </div>
            )}
          </div>
        ) : motivationConfigured === false ? (
          <div style={{ ...panelStyle, padding: '12px 16px' }}>
            <CornerBrackets />
            <SectionLabel label="Motivation" />
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, fontStyle: 'italic' }}>
              Motivation not yet set.
            </div>
          </div>
        ) : null}

        {/* 5. Duty & Obligation cards — shown when configured */}
        {dutyObligationConfigured && dutyType && dutyValue !== undefined && (
          <DutyCard
            dutyType={dutyType}
            dutyValue={dutyValue}
            dutyLore={dutyLore}
            dutyCustomName={dutyCustomName}
            resolvedTypeName={dutyResolvedType}
          />
        )}
        {dutyObligationConfigured && obligationType && obligationValue !== undefined && (
          <ObligationCard
            obligationType={obligationType}
            obligationValue={obligationValue}
            obligationLore={obligationLore}
            obligationCustomName={obligationCustomName}
            resolvedTypeName={obligationResolvedType}
          />
        )}
      </div>
    </div>
  )
}
