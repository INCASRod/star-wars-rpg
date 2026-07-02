'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { isForceUserSensitive } from '@/lib/forceUtils'
import { resolveDutyName, resolveObligationName } from '@/lib/dutyObligationUtils'
import { RichText } from '@/components/ui/RichText'
import { Modal } from '@/components/ui/Modal'
import { FONT_BODY, FONT_DISPLAY, FONT_MONO, FS, SP, RADIUS, Z, HUD, EASE } from '@/lib/tokens'
import type { Character, RefSpecies } from '@/lib/types'

// ─── Props ───────────────────────────────────────────────────────────────────
interface HudLoreTabProps {
  character: Character
  careerName: string
  speciesName: string
  specNames: string
  refSpeciesAll: RefSpecies[]
  refDutyTypes: { key: string; name: string }[]
  refObligationTypes: { key: string; name: string }[]
  onBackstoryChange: (val: string) => void
  onNotesChange: (val: string) => void
  onPortraitUpload: (file: File) => Promise<void>
  onPortraitDelete: () => Promise<void>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toTitleCase(s: string | undefined | null): string {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

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

// count-up RAF hook — animates 0→target over duration ms with delay
function useCountUp(target: number | undefined, duration = 900, delay = 300) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const t = target ?? 0
    if (t === 0) { setDisplay(0); return }
    let rafId: number
    const tid = window.setTimeout(() => {
      const t0 = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - t0) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(eased * t))
        if (progress < 1) rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }, delay)
    return () => { window.clearTimeout(tid); cancelAnimationFrame(rafId) }
  }, [target, duration, delay])
  return display
}

// ─── Faction-sealed game-semantic colour constants ────────────────────────────
// Alliance (Duty) / Imperial (Obligation) identity colours — sealed namespace,
// same approved-exception status as DICE_COLOR. Raw hex required: these are
// game-world faction identities, not UI theme accents.
const ALLY_BRIGHT = '#5EBF72'
const ALLY_DARK   = '#1E5028'
const ALLY_GLOW   = 'rgba(58,140,74,0.5)'
const ALLY_BLEED  = 'rgba(58,140,74,0.07)'
const ALLY_20     = 'rgba(58,140,74,0.20)'
const IMP_BRIGHT  = '#E05555'
const IMP_DARK    = '#6B1212'
const IMP_GLOW    = 'rgba(196,48,48,0.5)'
const IMP_BLEED   = 'rgba(196,48,48,0.07)'
const IMP_20      = 'rgba(196,48,48,0.20)'

// Portrait vignette layers — portrait-layer-only, rgba approved for linear-gradient()
const P_TOP  = 'rgba(0,0,0,0.82)'
const P_BTM  = 'rgba(0,0,0,0.92)'
const P_SIDE = 'rgba(0,0,0,0.75)'

// ─── Animation shorthands ─────────────────────────────────────────────────────
const ANIM_SLIDE_L  = 'loreLeftIn    0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both'
const ANIM_SLIDE_R  = 'loreRightIn   0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both'
const ANIM_SLIDE_UP = 'loreContentIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both'
const ANIM_BAR_FILL = 'loreBarFillIn 0.8s ease 0.6s both'

// ─── IdentityCell — label/value pair ──────────────────────────────────────────
function IdentityCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase' as const,
        color: 'var(--hud-text-faint)',
      }}>{label}</div>
      <div style={{
        fontFamily: FONT_MONO, fontSize: FS.label,
        color: 'var(--hud-text-dim)',
      }}>{value ?? '—'}</div>
    </div>
  )
}

// ─── Pillar — duty or obligation stat column ──────────────────────────────────
function Pillar({
  heading, resolvedName, value, side,
  description, onExpand,
}: {
  heading: string
  resolvedName: string | null
  value: number | undefined
  side: 'left' | 'right'
  description: string
  onExpand: () => void
}) {
  const isLeft      = side === 'left'
  const bright      = isLeft ? ALLY_BRIGHT : IMP_BRIGHT
  const dark        = isLeft ? ALLY_DARK   : IMP_DARK
  const glow        = isLeft ? ALLY_GLOW   : IMP_GLOW
  const bleedColor  = isLeft ? ALLY_BLEED  : IMP_BLEED
  const barBg       = isLeft ? ALLY_20     : IMP_20
  const pulseAnim   = isLeft ? 'loreAllyPulse 4s ease-in-out infinite' : 'loreImpPulse 4.6s ease-in-out 0.9s infinite'
  const isConfigured = !!resolvedName && value !== undefined

  const displayValue = useCountUp(isConfigured ? value : undefined, 900, 400)

  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: `${SP[3]} ${SP[2]}`,
      animation: isLeft ? ANIM_SLIDE_L : ANIM_SLIDE_R,
      overflow: 'hidden',
      // transparent — portrait bleeds through
    }}>
      {/* faction bleed overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isLeft
          ? `linear-gradient(90deg, ${bleedColor} 0%, transparent 100%)`
          : `linear-gradient(270deg, ${bleedColor} 0%, transparent 100%)`,
      }} />

      {/* section heading */}
      <div style={{
        position: 'relative',
        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase' as const,
        color: 'var(--hud-text-faint)', marginBottom: SP[1],
        textAlign: 'center',
      }}>
        {heading}
      </div>

      {isConfigured ? (
        <>
          {/* giant hero numeral — clamp required; FS.display maxes at 80px, spec calls for 128px */}
          <div className="lore-pillar-numeral" style={{
            fontFamily: FONT_DISPLAY,
            /* approved exception: clamp(72px,9vw,128px) — faction identity display, exceeds FS scale */
            fontSize: 'clamp(72px,9vw,128px)',
            fontWeight: 700, lineHeight: 0.85,
            letterSpacing: '-0.04em',
            color: bright,
            animation: pulseAnim,
            textAlign: 'center',
            position: 'relative',
          }}>
            {displayValue}
          </div>

          {/* /100 denominator */}
          <div style={{
            fontFamily: FONT_MONO, fontSize: FS.overline,
            color: `color-mix(in srgb, ${bright} 45%, transparent)`,
            letterSpacing: '0.06em', marginBottom: SP[2],
          }}>/100</div>

          {/* type name */}
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
            color: 'var(--hud-text)', textAlign: 'center',
            letterSpacing: '0.04em', lineHeight: 1.3,
            marginBottom: SP[2], position: 'relative',
          }}>
            {resolvedName}
          </div>

          {/* progress bar */}
          <div style={{
            width: '80%', height: '3px', position: 'relative',
            background: barBg, borderRadius: RADIUS.full, overflow: 'hidden',
            marginBottom: SP[2],
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, value ?? 0)}%`,
              /* approved exception: faction identity gradient, raw hex sealed to faction namespace */
              background: `linear-gradient(90deg, ${dark}, ${bright})`,
              boxShadow: `0 0 8px ${glow}`,
              borderRadius: RADIUS.full,
              animation: ANIM_BAR_FILL,
            }} />
          </div>

          {/* description */}
          {description ? (
            <>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: 'var(--hud-text-faint)', lineHeight: 1.5,
                fontStyle: 'italic', textAlign: 'center',
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden', position: 'relative',
              }}>
                {description}
              </div>
              <button
                onClick={onExpand}
                className="lore-pillar-expand-btn"
                style={{
                  marginTop: SP[1],
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                  color: bright, opacity: 0.75, position: 'relative',
                  padding: `2px ${SP[1]}`,
                }}
              >
                Read Full Text →
              </button>
            </>
          ) : null}
        </>
      ) : (
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: `color-mix(in srgb, var(--hud-text-faint) 50%, transparent)`,
          textAlign: 'center', textTransform: 'uppercase' as const,
          letterSpacing: '0.15em', marginTop: SP[4], lineHeight: 1.6,
          position: 'relative',
        }}>
          Not<br />Set
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function HudLoreTab({
  character, careerName, speciesName, specNames,
  refDutyTypes, refObligationTypes,
  onBackstoryChange, onNotesChange,
  onPortraitUpload, onPortraitDelete,
}: HudLoreTabProps) {
  const isForceUser = isForceUserSensitive(character)

  // Text editing
  const [editingBackstory, setEditingBackstory] = useState(false)
  const [editingNotes,     setEditingNotes]     = useState(false)
  const [localBackstory,   handleBackstoryChange] = useDebounced(character.backstory || '', onBackstoryChange)
  const [localNotes,       handleNotesChange]     = useDebounced(character.notes || '', onNotesChange)

  // Duty/Obligation full-text expand
  const [expandedPillar, setExpandedPillar] = useState<'duty' | 'obligation' | null>(null)

  // Portrait
  const [photoOpen,          setPhotoOpen]          = useState(false)
  const [portraitUploading,  setPortraitUploading]  = useState(false)
  const [portraitConfirming, setPortraitConfirming] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPortraitUploading(true)
    await onPortraitUpload(file)
    setPortraitUploading(false)
    e.target.value = ''
  }

  const handlePortraitDeleteConfirmed = async () => {
    setPortraitConfirming(false)
    setPortraitUploading(true)
    await onPortraitDelete()
    setPortraitUploading(false)
  }

  const handleDownloadPortrait = useCallback(() => {
    if (!character.portrait_url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { window.open(character.portrait_url!, '_blank'); return }
      ctx.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.download = `${character.name.replace(/\s+/g, '_')}_portrait.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.onerror = () => window.open(character.portrait_url!, '_blank')
    img.src = character.portrait_url
  }, [character.portrait_url, character.name])

  // ── Derived values ─────────────────────────────────────────────────────────
  const dutyResolvedName = character.duty_type
    ? resolveDutyName(character, refDutyTypes)
    : null

  const obligationResolvedName = character.obligation_type
    ? resolveObligationName(character, refObligationTypes)
    : null

  const motivationText        = character.motivation_description || character.obligation_notes || character.duty_notes || ''
  const dutyDescription       = character.duty_lore || character.duty_notes || ''
  const obligationDescription = character.obligation_lore || character.obligation_notes || ''

  return (
    <>
      {/* ── Keyframes + CSS classes injected here; cannot use frozen globals.css ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loreContentIn { from{transform:translateY(6px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes loreLeftIn    { from{transform:translateX(-12px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes loreRightIn   { from{transform:translateX(12px);opacity:0}  to{transform:translateX(0);opacity:1} }
        @keyframes loreBarFillIn { from{width:0} }
        @keyframes loreSweepDown { 0%{top:-20%} 100%{top:115%} }
        @keyframes loreLineIn    { from{opacity:0;transform:scaleX(0)} to{opacity:1;transform:scaleX(1)} }
        @keyframes loreAllyPulse {
          0%,100% { text-shadow: 0 0 35px rgba(58,140,74,0.5), 0 0 70px rgba(58,140,74,0.15); }
          50%     { text-shadow: 0 0 60px rgba(58,140,74,0.75), 0 0 110px rgba(58,140,74,0.25); }
        }
        @keyframes loreImpPulse {
          0%,100% { text-shadow: 0 0 35px rgba(196,48,48,0.5), 0 0 70px rgba(196,48,48,0.15); }
          50%     { text-shadow: 0 0 60px rgba(196,48,48,0.75), 0 0 110px rgba(196,48,48,0.25); }
        }
        .hud-lore-root:hover .dossier-portrait-btns { opacity: 1 !important; }
        .lore-edit-btn {
          clip-path: polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%);
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(200,170,80,0.45);
          font-family: var(--font-body);
          font-size: var(--text-overline);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--hud-gold);
          cursor: pointer;
          padding: 2px 10px;
          transition: border-color 0.15s ease;
        }
        .lore-edit-btn:hover { border-color: rgba(200,170,80,0.8); }
        .lore-portrait-btn {
          clip-path: polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%);
          background: rgba(0,0,0,0.65);
          font-family: var(--font-body);
          font-size: var(--text-overline);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 2px 8px;
          transition: border-color 0.15s ease;
        }
        .lore-portrait-btn.accent {
          border: 1px solid rgba(200,170,80,0.45);
          color: var(--hud-gold);
        }
        .lore-portrait-btn.accent:hover { border-color: rgba(200,170,80,0.8); }
        .lore-portrait-btn.danger {
          border: 1px solid rgba(196,48,48,0.5);
          color: #E05555;
        }
        .lore-portrait-btn.danger:hover { border-color: rgba(196,48,48,0.9); }
        .lore-narrative-text {
          font-weight: 300;
          line-height: 1.85;
          text-shadow: 0 1px 8px rgba(0,0,0,0.8), 0 0 24px rgba(0,0,0,0.9);
        }
        .lore-narrative-scroll::-webkit-scrollbar { width: 3px; }
        .lore-narrative-scroll::-webkit-scrollbar-track { background: transparent; }
        .lore-narrative-scroll::-webkit-scrollbar-thumb { background: rgba(200,170,80,0.3); border-radius: 2px; }
        .lore-pillar-expand-btn:hover { opacity: 1 !important; text-decoration: underline; }
        .lore-modal-text {
          white-space: pre-wrap;
          font-weight: 300;
        }
        .lore-modal-scroll::-webkit-scrollbar { width: 3px; }
        .lore-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .lore-modal-scroll::-webkit-scrollbar-thumb { background: rgba(200,170,80,0.3); border-radius: 2px; }
      `}} />

      <div
        className="hud-lore-root"
        style={{
          display: 'flex', flexDirection: 'column',
          height: '100%', overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ═══ PORTRAIT — full-bleed absolute behind everything ══════════════ */}
        {character.portrait_url && (
          <>
            <img
              src={character.portrait_url}
              alt=""
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                /* darkened dramatically so text remains legible */
                filter: 'grayscale(100%) brightness(0.28) contrast(1.1)',
                zIndex: Z.base, display: 'block',
                pointerEvents: 'none',
              }}
            />
            {/* 4-direction vignette — portrait-layer rgba approved */}
            <div style={{ position:'absolute',inset:0,zIndex:Z.raised,pointerEvents:'none',
              background:`linear-gradient(to bottom,${P_TOP} 0%,transparent 40%)` }} />
            <div style={{ position:'absolute',inset:0,zIndex:Z.raised,pointerEvents:'none',
              background:`linear-gradient(to top,${P_BTM} 0%,transparent 55%)` }} />
            <div style={{ position:'absolute',inset:0,zIndex:Z.raised,pointerEvents:'none',
              background:`linear-gradient(to right,${P_SIDE} 0%,transparent 32%)` }} />
            <div style={{ position:'absolute',inset:0,zIndex:Z.raised,pointerEvents:'none',
              background:`linear-gradient(to left,${P_SIDE} 0%,transparent 32%)` }} />
          </>
        )}

        {/* ═══ ATMOSPHERE — scanlines, sweep, hex ════════════════════════════ */}
        {/* scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          zIndex: Z.sticky,
          background: 'repeating-linear-gradient(to bottom,transparent 0,transparent 2px,rgba(0,0,0,0.055) 2px,rgba(0,0,0,0.055) 3px)',
        }} />
        {/* gold sweep */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '3px',
          /* approved exception: gold sweep is decorative atmosphere, rgba required */
          background: 'linear-gradient(90deg,transparent 0%,rgba(200,170,80,0.18) 30%,rgba(200,170,80,0.35) 50%,rgba(200,170,80,0.18) 70%,transparent 100%)',
          animation: 'loreSweepDown 7s linear 1s infinite',
          pointerEvents: 'none', zIndex: Z.sticky,
        }} />
        {/* CLASSIFIED watermark */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: Z.raised + 1,
          transform: 'rotate(-35deg)',
        }}>
          <div style={{
            fontFamily: FONT_DISPLAY,
            /* approved exception: clamp for dramatic watermark sizing */
            fontSize: 'clamp(28px,6vw,64px)',
            fontWeight: 900, letterSpacing: '0.5em',
            color: 'rgba(200,170,80,0.04)',
            textTransform: 'uppercase' as const,
            userSelect: 'none',
          }}>CLASSIFIED</div>
        </div>

        {/* ═══ IDENTITY STRIP ════════════════════════════════════════════════ */}
        <div style={{
          position: 'relative', zIndex: Z.sticky + 1,
          display: 'flex', alignItems: 'center',
          gap: SP[3], padding: `${SP[2]} ${SP[3]}`,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
          animation: ANIM_SLIDE_UP,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700,
              letterSpacing: '0.04em', color: 'var(--hud-text)', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {character.name}
            </div>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline,
              color: 'var(--hud-text-dim)', letterSpacing: '0.1em',
              textTransform: 'uppercase', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {careerName}{specNames ? ` · ${specNames}` : ''}{speciesName ? ` · ${speciesName}` : ''}
            </div>
          </div>
          {/* obligation chip — red */}
          {obligationResolvedName && character.obligation_value !== undefined && (
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: `2px ${SP[2]}`, /* 2px minimum touch target */
              borderRadius: RADIUS.full,
              /* approved exception: faction identity chip colour */
              border: `1px solid rgba(196,48,48,0.4)`,
              background: `rgba(196,48,48,0.12)`,
              color: IMP_BRIGHT, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {obligationResolvedName} · {character.obligation_value}
            </span>
          )}
          {/* duty chip — green */}
          {dutyResolvedName && character.duty_value !== undefined && (
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: `2px ${SP[2]}`, /* 2px minimum touch target */
              borderRadius: RADIUS.full,
              /* approved exception: faction identity chip colour */
              border: `1px solid rgba(58,140,74,0.4)`,
              background: `rgba(58,140,74,0.12)`,
              color: ALLY_BRIGHT, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {dutyResolvedName} · {character.duty_value}
            </span>
          )}
        </div>

        {/* faction separator line */}
        <div style={{
          position: 'relative', zIndex: Z.sticky + 1,
          height: '1px', flexShrink: 0,
          /* approved exception: faction gradient separator, raw rgba required */
          background: `linear-gradient(90deg,${ALLY_GLOW} 0%,rgba(200,170,80,0.25) 50%,${IMP_GLOW} 100%)`,
          animation: 'loreLineIn 0.6s ease 0.35s both',
        }} />

        {/* ═══ DOSSIER STAGE — 3-column grid ════════════════════════════════ */}
        <div style={{
          position: 'relative', zIndex: Z.sticky + 1,
          flex: 1, minHeight: 0,
          display: 'grid',
          /* clamp columns — structural layout, not spacing tokens */
          gridTemplateColumns: 'clamp(120px,17vw,210px) 1fr clamp(120px,17vw,210px)',
          overflow: 'hidden',
        }}>

          {/* ── LEFT: DUTY PILLAR ── */}
          {character.duty_obligation_configured ? (
            <Pillar
              heading="Duty"
              resolvedName={dutyResolvedName}
              value={character.duty_value}
              side="left"
              description={dutyDescription}
              onExpand={() => setExpandedPillar('duty')}
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: SP[2], animation: ANIM_SLIDE_L,
            }}>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--hud-text-faint)', textAlign: 'center',
              }}>Duty</div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.label,
                color: `color-mix(in srgb, var(--hud-text-faint) 50%, transparent)`,
                textAlign: 'center', marginTop: SP[1],
              }}>—</div>
            </div>
          )}

          {/* ── CENTRE: NARRATIVE ── */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            animation: ANIM_SLIDE_UP,
          }}>
            {/* Portrait action buttons — shown on root hover via CSS */}
            <div
              className="dossier-portrait-btns"
              style={{
                position: 'absolute', top: SP[1], right: SP[1],
                display: 'flex', gap: SP[1],
                opacity: 0, transition: EASE.default,
                zIndex: Z.dropdown,
              }}
            >
              {character.portrait_url && (
                <button className="lore-portrait-btn accent" onClick={() => setPhotoOpen(true)}>⊞</button>
              )}
              {!portraitUploading && (
                <button className="lore-portrait-btn accent" onClick={() => fileRef.current?.click()}>
                  {character.portrait_url ? '↑ Replace' : '↑ Upload'}
                </button>
              )}
              {character.portrait_url && !portraitUploading && !portraitConfirming && (
                <button className="lore-portrait-btn danger" onClick={() => setPortraitConfirming(true)}>✕</button>
              )}
              {portraitConfirming && (
                <>
                  <button className="lore-portrait-btn danger" onClick={handlePortraitDeleteConfirmed}>Confirm</button>
                  <button className="lore-portrait-btn accent" onClick={() => setPortraitConfirming(false)}>Cancel</button>
                </>
              )}
              {portraitUploading && (
                <span style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.gold,
                  padding: `2px ${SP[1]}`, /* 2px minimum */
                }}>…</span>
              )}
            </div>

            {/* Scrollable narrative — above portrait/gradients */}
            <div
              className="lore-narrative-scroll"
              style={{
                flex: 1, minHeight: 0, overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
                padding: `${SP[3]} ${SP[3]}`,
                gap: SP[3],
              }}
            >
              {/* ─ Backstory ─ */}
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: SP[1],
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: SP[2],
                  }}>
                    {/* gold rule left */}
                    <div style={{
                      width: SP[3], height: '1px',
                      background: 'var(--hud-gold)', opacity: 0.4,
                    }} />
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: HUD.gold,
                    }}>Background</span>
                    <div style={{
                      width: SP[3], height: '1px',
                      background: 'var(--hud-gold)', opacity: 0.4,
                    }} />
                  </div>
                  <button
                    className="lore-edit-btn"
                    onClick={() => setEditingBackstory(e => !e)}
                  >
                    {editingBackstory ? 'Preview' : 'Edit'}
                  </button>
                </div>
                {editingBackstory ? (
                  <>
                    <textarea
                      value={localBackstory}
                      onChange={e => handleBackstoryChange(e.target.value)}
                      placeholder="Write your character's backstory… (OggDude markup supported)"
                      className="hud-textarea"
                      style={{ minHeight: '8rem' }}
                      autoFocus
                    />
                    <div style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline,
                      color: 'var(--hud-text-faint)',
                      marginTop: SP[1], textAlign: 'right', letterSpacing: '0.06em',
                    }}>Auto-saves on pause</div>
                  </>
                ) : localBackstory ? (
                  <div
                    className="lore-narrative-text"
                    style={{
                      fontFamily: FONT_BODY, fontSize: FS.sm,
                      color: 'var(--hud-text)',
                    }}
                  >
                    {localBackstory.split(/\[P\]/gi).filter(s => s.trim()).map((seg, i) => (
                      <div key={i} style={{ marginTop: i > 0 ? SP[3] : 0 }}>
                        <RichText text={seg.trim()} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: FS.sm,
                    color: 'var(--hud-text-dim)', fontStyle: 'italic',
                  }}>No backstory recorded.</div>
                )}
              </div>

              {/* ─ Motivation ─ */}
              {(character.motivation_type || character.motivation_specific) && (
                <div style={{ flexShrink: 0, paddingTop: SP[2], borderTop: `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)` }}>
                  <div style={{ marginBottom: SP[1], display: 'flex', alignItems: 'center', gap: SP[2] }}>
                    <div style={{ width: SP[3], height:'1px', background:'var(--hud-gold)', opacity:0.4 }} />
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: HUD.gold,
                    }}>Motivation</span>
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline,
                      color: 'var(--hud-text-dim)',
                    }}>
                      {[character.motivation_type, character.motivation_specific].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  {motivationText ? (
                    <div className="lore-narrative-text" style={{
                      fontFamily: FONT_BODY, fontSize: FS.sm,
                      color: 'var(--hud-text-dim)',
                    }}>
                      <RichText text={motivationText} />
                    </div>
                  ) : null}
                </div>
              )}

              {/* ─ Morality ─ */}
              {isForceUser && character.morality_configured && (
                <div style={{ flexShrink: 0, paddingTop: SP[2], borderTop: `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)` }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: SP[2], marginBottom: SP[2],
                  }}>
                    <div style={{ width: SP[3], height:'1px', background:'var(--hud-gold)', opacity:0.4 }} />
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: HUD.gold,
                    }}>Morality</span>
                  </div>
                  <div style={{ display: 'flex', gap: SP[4], flexWrap: 'wrap' }}>
                    {character.morality_value !== undefined && (
                      <IdentityCell label="Score" value={character.morality_value} />
                    )}
                    {character.morality_strength_key && (
                      <IdentityCell label="Strength" value={toTitleCase(character.morality_strength_key)} />
                    )}
                    {character.morality_weakness_key && (
                      <IdentityCell label="Weakness" value={toTitleCase(character.morality_weakness_key)} />
                    )}
                  </div>
                </div>
              )}

              {/* ─ Notes ─ */}
              <div style={{ flexShrink: 0, paddingTop: SP[2], borderTop: `1px solid color-mix(in srgb, var(--hud-border) 60%, transparent)` }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: SP[1],
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap: SP[2] }}>
                    <div style={{ width: SP[3], height:'1px', background:'var(--hud-gold)', opacity:0.4 }} />
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: HUD.gold,
                    }}>Notes</span>
                    <div style={{ width: SP[3], height:'1px', background:'var(--hud-gold)', opacity:0.4 }} />
                  </div>
                  <button
                    className="lore-edit-btn"
                    onClick={() => setEditingNotes(e => !e)}
                  >
                    {editingNotes ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingNotes ? (
                  <textarea
                    value={localNotes}
                    onChange={e => handleNotesChange(e.target.value)}
                    placeholder="Session notes, reminders, contacts, safehouses…"
                    className="hud-textarea"
                    style={{ minHeight: '4rem', resize: 'vertical' as const }}
                  />
                ) : (
                  <div className="lore-narrative-text" style={{
                    fontFamily: FONT_BODY, fontSize: FS.sm,
                    color: 'var(--hud-text-dim)',
                  }}>
                    {localNotes
                      ? localNotes
                      : <span style={{ fontStyle: 'italic' }}>No notes recorded.</span>
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* ── RIGHT: OBLIGATION PILLAR ── */}
          {character.duty_obligation_configured ? (
            <Pillar
              heading="Obligation"
              resolvedName={obligationResolvedName}
              value={character.obligation_value}
              side="right"
              description={obligationDescription}
              onExpand={() => setExpandedPillar('obligation')}
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: SP[2], animation: ANIM_SLIDE_R,
            }}>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--hud-text-faint)', textAlign: 'center',
              }}>Obligation</div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: FS.label,
                color: `color-mix(in srgb, var(--hud-text-faint) 50%, transparent)`,
                textAlign: 'center', marginTop: SP[1],
              }}>—</div>
            </div>
          )}

        </div>
      </div>

      {/* ═══ PHOTO LIGHTBOX ════════════════════════════════════════════════════ */}
      <Modal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        maxWidth="min(88vw, 900px)"
        zIndex={Z.modal}
      >
        <div>
          <img
            src={character.portrait_url ?? ''}
            alt={character.name}
            style={{
              width: '100%', display: 'block',
              borderRadius: RADIUS.lg,
              maxHeight: '80vh', objectFit: 'contain',
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            gap: SP[2], marginTop: SP[2],
          }}>
            <button
              onClick={handleDownloadPortrait}
              style={{
                background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
                border: `1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)`,
                borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[3]}`,
                fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: HUD.gold, cursor: 'pointer', transition: EASE.default,
              }}
            >↓ Download</button>
            <button
              onClick={() => setPhotoOpen(false)}
              style={{
                background: 'var(--hud-surface-mid)',
                border: `1px solid var(--hud-border)`,
                borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[3]}`,
                fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--hud-text-dim)', cursor: 'pointer', transition: EASE.default,
              }}
            >Close</button>
          </div>
        </div>
      </Modal>

      {/* ═══ DUTY / OBLIGATION FULL-TEXT MODAL ════════════════════════════════ */}
      <Modal
        open={!!expandedPillar}
        onClose={() => setExpandedPillar(null)}
        maxWidth="min(90vw, 640px)"
        zIndex={Z.modal}
        borderColor={expandedPillar === 'duty' ? `rgba(58,140,74,0.4)` : `rgba(196,48,48,0.4)`}
      >
        <div style={{ padding: SP[4] }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase' as const,
            color: expandedPillar === 'duty' ? ALLY_BRIGHT : IMP_BRIGHT,
            marginBottom: SP[1],
          }}>
            {expandedPillar === 'duty' ? 'Duty' : 'Obligation'}
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.h3, fontWeight: 700,
            color: 'var(--hud-text)', marginBottom: SP[3],
          }}>
            {expandedPillar === 'duty' ? dutyResolvedName : obligationResolvedName}
            {' · '}
            {expandedPillar === 'duty' ? character.duty_value : character.obligation_value}/100
          </div>
          <div
            className="lore-modal-scroll lore-modal-text"
            style={{
              maxHeight: '60vh', overflowY: 'auto',
              fontFamily: FONT_BODY, fontSize: FS.sm, lineHeight: 1.7,
              color: 'var(--hud-text-dim)',
            }}
          >
            {expandedPillar === 'duty' ? dutyDescription : obligationDescription}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: SP[3] }}>
            <button
              onClick={() => setExpandedPillar(null)}
              style={{
                background: 'var(--hud-surface-mid)',
                border: `1px solid var(--hud-border)`,
                borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[3]}`,
                fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: 'var(--hud-text-dim)', cursor: 'pointer', transition: EASE.default,
              }}
            >Close</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
