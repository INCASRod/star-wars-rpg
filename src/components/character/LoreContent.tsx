'use client'

import { useState, useRef } from 'react'
import { RefSpecies } from '@/lib/types'
import { parseOggDudeMarkup } from '@/lib/oggdude-markup'

// ─── Design Tokens ───────────────────────────────────────────────────────────
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FR = "var(--font-rajdhani), 'Rajdhani', sans-serif"

const GOLD = '#C8AA50'
const GOLD_DIM = '#7A6830'
const GOLD_BRT = '#E0C060'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BLUE = '#5AAAE0'
const GREEN = '#4EC87A'
const RED = '#E05050'

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
  motivationDesc?: string
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
  background: 'rgba(8,16,10,0.88)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(200,170,80,0.14)',
  borderRadius: 6,
}

const textareaStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(200,170,80,0.3)',
  color: TEXT,
  fontFamily: FR,
  fontSize: 13,
  padding: 14,
  lineHeight: 1.7,
  resize: 'vertical',
  width: '100%',
  outline: 'none',
  borderRadius: 4,
  boxSizing: 'border-box',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Four absolute corner brackets */
function CornerBrackets() {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 8,
    height: 8,
  }
  const color = `rgba(122,104,48,0.5)` // GOLD_DIM ~50% opacity
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
      <div style={{ width: 14, height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,170,80,0.4))' }} />
      <span style={{
        fontFamily: FC,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(200,170,80,0.4)',
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
    background: 'linear-gradient(90deg, transparent, rgba(200,170,80,0.25), transparent)',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
      <div style={line} />
      <span style={{ color: 'rgba(200,170,80,0.35)', fontSize: 10 }}>◈</span>
      <div style={line} />
    </div>
  )
}

/** Drop-cap rendered backstory */
function BackstoryView({ backstory }: { backstory: string }) {
  const html = parseOggDudeMarkup(backstory)
  const trimmed = backstory.trimStart()

  if (!trimmed) {
    return (
      <div style={{ fontFamily: FR, fontSize: 13, color: DIM, fontStyle: 'italic' }}>
        No backstory recorded.
      </div>
    )
  }

  // Split on OggDude section markers ([P] becomes <br><br>). For rendering we
  // just work with the raw text segments split on [P], then parse each chunk.
  const segments = backstory.split(/\[P\]/gi).filter(s => s.trim().length > 0)

  return (
    <div>
      {segments.map((seg, idx) => {
        const segTrimmed = seg.trimStart()
        const parsed = parseOggDudeMarkup(seg)

        if (idx === 0 && segTrimmed.length > 0) {
          // First segment: extract drop-cap character
          const firstChar = segTrimmed[0]
          const rest = parseOggDudeMarkup(segTrimmed.slice(1))
          return (
            <div key={idx}>
              <span style={{
                fontFamily: FC,
                fontSize: 52,
                fontWeight: 700,
                color: GOLD,
                float: 'left',
                lineHeight: 0.85,
                marginRight: 10,
                textShadow: '0 0 20px rgba(200,170,80,0.4)',
              }}>
                {firstChar}
              </span>
              <span
                style={{ fontFamily: FR, fontSize: 13, lineHeight: 1.9, color: TEXT }}
                dangerouslySetInnerHTML={{ __html: rest }}
              />
            </div>
          )
        }

        return (
          <div key={idx}>
            {idx > 0 && <SectionDivider />}
            <span
              style={{ fontFamily: FR, fontSize: 13, lineHeight: 1.9, color: TEXT }}
              dangerouslySetInnerHTML={{ __html: parsed }}
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
  motivationDesc,
  onBackstoryChange,
  onNotesChange,
}: LoreContentProps) {
  const [editingBackstory, setEditingBackstory] = useState(false)
  const [localBackstory, handleBackstoryChange] = useDebounced(backstory, onBackstoryChange)
  const [localNotes, handleNotesChange] = useDebounced(notes, onNotesChange)

  const abilities = speciesRef?.abilities
    ? (speciesRef.abilities as { name: string; description: string }[])
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 20, width: '100%', minHeight: 0 }}>

      {/* ── LEFT COLUMN ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 1. Header panel */}
        <div style={{ ...panelStyle, padding: '14px 18px' }}>
          <CornerBrackets />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 700, color: GOLD, lineHeight: 1.1 }}>
                {characterName}
              </div>
              <div style={{
                fontFamily: FR,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: DIM,
                marginTop: 4,
              }}>
                Character Background &amp; History
              </div>
            </div>

            <button
              onClick={() => setEditingBackstory(e => !e)}
              style={{
                border: '1px solid rgba(200,170,80,0.36)',
                background: 'rgba(200,170,80,0.07)',
                borderRadius: 4,
                padding: '5px 11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: FR,
                fontSize: 10,
                fontWeight: 700,
                color: GOLD,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ fontSize: 13 }}>✎</span>
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
                style={{ ...textareaStyle, minHeight: 240 }}
                autoFocus
              />
              <div style={{
                fontFamily: FR,
                fontSize: 10,
                color: FAINT,
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
            style={{ ...textareaStyle, minHeight: 120 }}
          />
          <div style={{
            fontFamily: FR,
            fontSize: 11,
            color: BLUE,
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
                borderBottom: idx < arr.length - 1 ? '1px solid rgba(200,170,80,0.1)' : 'none',
              }}
            >
              <span style={{
                fontFamily: FR,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: DIM,
                letterSpacing: '0.1em',
              }}>
                {label}
              </span>
              <span style={{ fontFamily: FR, fontSize: 11, fontWeight: 600, color: TEXT }}>
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
              borderRadius: 12,
              padding: '2px 10px',
              display: 'inline-block',
              fontFamily: FR,
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: BLUE,
              letterSpacing: '0.1em',
            }}>
              SPECIES
            </div>

            {/* Species name */}
            <div style={{ fontFamily: FC, fontSize: 16, color: TEXT, marginTop: 6 }}>
              {speciesRef.name}
            </div>

            {/* Type subtitle */}
            <div style={{
              fontFamily: FR,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: DIM,
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
                    background: 'rgba(200,170,80,0.06)',
                    border: '1px solid rgba(200,170,80,0.12)',
                    borderRadius: 4,
                    padding: '8px 6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: FR, fontSize: 18, fontWeight: 600, color: GOLD, lineHeight: 1 }}>
                    {statValue}
                  </div>
                  <div style={{
                    fontFamily: FR,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: DIM,
                    marginTop: 3,
                    letterSpacing: '0.08em',
                  }}>
                    {statLabel}
                  </div>
                </div>
              ))}
            </div>

            {/* Racial Abilities */}
            {abilities && abilities.length > 0 && (
              <div>
                <SectionLabel label="Racial Abilities" />
                {abilities.map((ability, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderLeft: '2px solid rgba(200,170,80,0.4)',
                      background: 'rgba(200,170,80,0.04)',
                      borderRadius: '0 4px 4px 0',
                      padding: '7px 10px',
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontFamily: FR, fontSize: 11, fontWeight: 700, color: GOLD }}>
                      {ability.name}
                    </div>
                    <div style={{ fontFamily: FR, fontSize: 10, color: DIM, lineHeight: 1.6, marginTop: 2 }}>
                      {ability.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Motivation panel — only if motivationType provided */}
        {motivationType && (
          <div style={{ ...panelStyle, padding: '14px 16px' }}>
            <CornerBrackets />
            <SectionLabel label="Motivation" />
            <div style={{ fontFamily: FC, fontSize: 14, color: GOLD, marginBottom: motivationDesc ? 8 : 0 }}>
              {motivationType}
            </div>
            {motivationDesc && (
              <div style={{ fontFamily: FR, fontSize: 12, color: DIM, lineHeight: 1.6 }}>
                {motivationDesc}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
