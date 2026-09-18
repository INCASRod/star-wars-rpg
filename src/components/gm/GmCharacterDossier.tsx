'use client'

import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useCharacterData } from '@/hooks/useCharacterData'
import type { Character } from '@/lib/types'
import type { MapToken } from '@/hooks/useMapTokens'
import { HUD, FONT_BODY as FONT, FONT_DISPLAY, FS, SP, RADIUS, Z } from '@/lib/tokens'
import { PcCheckConsole } from './PcCheckConsole'

export interface GmCharacterDossierProps {
  character:   Character
  campaignId:  string
  mapId:       string | null
  tokens:      MapToken[]
  addToken:    (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken: (id: string) => Promise<void>
  onArchive:   (payload: { id: string; name: string }) => void
  onClose:     () => void
  originRect?: DOMRect | null
}

const CHAR_ROW: Array<[keyof Character, string]> = [
  ['brawn', 'BR'], ['agility', 'AG'], ['intellect', 'INT'],
  ['cunning', 'CUN'], ['willpower', 'WIL'], ['presence', 'PR'],
]

export function GmCharacterDossier({ character, campaignId, mapId, tokens, addToken, removeToken, onArchive, onClose, originRect }: GmCharacterDossierProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const dossierRef = useRef<HTMLDivElement>(null)

  // useLayoutEffect (not useEffect) — runs synchronously before paint, so the
  // first painted frame already shows the element transformed to originRect's
  // position/scale (no one-frame flash at full size first). Mirrors
  // EncounterDossier.tsx's FLIP-open pattern.
  useLayoutEffect(() => {
    if (!dossierRef.current || !originRect) return
    const el = dossierRef.current
    // Lock in the element's natural centered position via GSAP-tracked
    // xPercent/yPercent instead of a CSS `transform: translate(-50%,-50%)`
    // string — GSAP owns `transform` for this tween and would otherwise
    // clobber the CSS centering once it writes x/y, leaving the dossier
    // mis-positioned after the animation settles.
    gsap.set(el, { xPercent: -50, yPercent: -50 })
    const dr = el.getBoundingClientRect()
    gsap.fromTo(el,
      { x: originRect.left + originRect.width / 2 - (dr.left + dr.width / 2), y: originRect.top + originRect.height / 2 - (dr.top + dr.height / 2), scale: 0.16, opacity: 0.35 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originRect, mounted])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    const el = dossierRef.current
    if (!el || !originRect) { onClose(); return }
    const dr = el.getBoundingClientRect()
    gsap.to(el, {
      x: originRect.left + originRect.width / 2 - (dr.left + dr.width / 2),
      y: originRect.top + originRect.height / 2 - (dr.top + dr.height / 2),
      scale: 0.16, opacity: 0, duration: 0.28, ease: 'power2.in',
      onComplete: onClose,
    })
  }

  const {
    character: liveChar, loading,
    handleVitalAdjust,
    forceRating,
    hudSkills, hudWeapons, hudArmor, hudGear,
    encumbranceCurrent, encumbranceThreshold, encumbranceStats,
    handleToggleEquippedById, handleRemoveWeapon, handleRemoveEquipment,
  } = useCharacterData(character.id)

  if (!mounted) return null
  // useCharacterData fetches its own copy asynchronously — `liveChar` is
  // null/undefined until that load resolves (see `loading`), so fall back
  // to the prop-passed character to avoid a blank dossier on first paint.
  const c = liveChar ?? character
  void loading
  const existingToken = tokens.find(t => t.character_id === c.id)
  const onMap = !!existingToken

  async function toggleToken() {
    if (onMap && existingToken) {
      await removeToken(existingToken.id)
    } else if (mapId) {
      await addToken({
        map_id: mapId, campaign_id: campaignId, participant_type: 'pc',
        character_id: c.id, participant_id: null, slot_key: null,
        label: c.name, alignment: 'pc', x: 0.5, y: 0.5,
        is_visible: true, token_size: 1.0, wound_pct: null,
        token_image_url: c.portrait_url ?? null, token_shape: 'circle',
      })
    }
  }

  return createPortal(
    <>
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--hud-bg) 72%, transparent)', backdropFilter: 'blur(3px)', zIndex: Z.backdrop }} />
      <div ref={dossierRef} style={{
        // No CSS `transform: translate(-50%,-50%)` here — the useLayoutEffect
        // above sets xPercent/yPercent via GSAP instead (see EncounterDossier.tsx).
        position: 'fixed', left: '50%', top: '50%',
        zIndex: Z.modal, width: 'min(58.75rem, 96vw)',
        background: 'var(--hud-panel)', border: '1px solid var(--hud-border-hi)',
        boxShadow: '0 26px 90px color-mix(in srgb, var(--hud-bg) 75%, transparent)',
      }}>
        <div style={{ height: '3px', background: 'var(--hud-accent-purple)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '14rem 1fr 18.75rem', minHeight: '32.5rem' }}>

          {/* Hero */}
          <div style={{ borderRight: '1px solid var(--hud-border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: '15rem', background: 'var(--hud-surface-lo)', position: 'relative', overflow: 'hidden' }}>
              {c.portrait_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.portrait_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ padding: SP[3], borderTop: '1px solid var(--hud-border)', display: 'flex', flexDirection: 'column', gap: SP[1] }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: FS.h4, textTransform: 'uppercase', color: HUD.text }}>
                {c.name}
              </div>
              <div style={{ fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.14em', color: HUD.textFaint, textTransform: 'uppercase' }}>
                {c.species_key} · {c.career_key}
                {c.is_force_sensitive && <span style={{ color: 'var(--die-force)' }}> · ◆ FORCE FR {forceRating}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[1] }}>
                <button className="gm-dossier-ctlbtn" onClick={toggleToken}>
                  {onMap ? '⌖ REMOVE FROM MAP' : '◈ ADD TO MAP'}
                </button>
                <button className="gm-dossier-ctlbtn" onClick={() => onArchive({ id: c.id, name: c.name })}>
                  ▤ ARCHIVE CHARACTER
                </button>
              </div>
            </div>
          </div>

          {/* Centre column */}
          <div style={{ padding: SP[3], display: 'flex', flexDirection: 'column', gap: SP[4], overflowY: 'auto', maxHeight: '40rem' }}>
            <div>
              <span className="gm-dossier-slabel">Characteristics</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: SP[2], marginTop: SP[2] }}>
                {CHAR_ROW.map(([field, label]) => (
                  <div key={label} className="gm-dossier-hex">
                    <b>{c[field] as number}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="gm-dossier-slabel">Vitals</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2], marginTop: SP[2] }}>
                <VitalRow label="WOUNDS" color="var(--hud-vital-wounds)" current={c.wound_current} max={c.wound_threshold}
                  onDec={() => handleVitalAdjust('wound_current', -1)} onInc={() => handleVitalAdjust('wound_current', 1)} />
                <VitalRow label="STRAIN" color="var(--die-force)" current={c.strain_current} max={c.strain_threshold}
                  onDec={() => handleVitalAdjust('strain_current', -1)} onInc={() => handleVitalAdjust('strain_current', 1)} />
              </div>
            </div>

            <div>
              <span className="gm-dossier-slabel">Defense</span>
              <div style={{ display: 'flex', gap: SP[2], marginTop: SP[2] }}>
                <Chip value={c.soak} label="SOAK" />
                <Chip value={c.defense_melee} label="M DEF" />
                <Chip value={c.defense_ranged} label="R DEF" />
                {c.is_force_sensitive && <Chip value={forceRating ?? 0} label="FORCE" force />}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: SP[2] }}>
                <span className="gm-dossier-slabel">Inventory</span>
                <EncReadout current={encumbranceCurrent} threshold={encumbranceThreshold} cliff={encumbranceStats?.cliff ?? encumbranceThreshold} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1], marginTop: SP[2] }}>
                {hudWeapons.map(w => (
                  <InvRow key={w.id} name={w.name} enc={w.enc} equipState={w.equipState}
                    onCycle={() => handleToggleEquippedById(w.id, 'weapon')}
                    onDrop={() => handleRemoveWeapon(w.id)} />
                ))}
                {hudArmor.map(a => (
                  <InvRow key={a.id} name={a.name} enc={a.enc} equipState={a.equipState}
                    onCycle={() => handleToggleEquippedById(a.id, 'armor')}
                    onDrop={() => handleRemoveEquipment(a.id, 'armor')} />
                ))}
                {hudGear.map(g => (
                  <InvRow key={g.id} name={g.name} enc={g.enc} equipState={g.equipState}
                    onCycle={() => handleToggleEquippedById(g.id, 'gear')}
                    onDrop={() => handleRemoveEquipment(g.id, 'gear')} />
                ))}
                {hudWeapons.length + hudArmor.length + hudGear.length === 0 && (
                  <div style={{ fontFamily: FONT, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em', padding: `${SP[1]} 0.125rem` }}>
                    INVENTORY EMPTY
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Check console */}
          <div style={{ borderLeft: '1px solid var(--hud-border)', background: 'color-mix(in srgb, var(--hud-bg) 25%, transparent)' }}>
            <PcCheckConsole
              character={c}
              campaignId={campaignId}
              hudSkills={hudSkills}
              hudWeapons={hudWeapons}
              forceRating={forceRating ?? 0}
            />
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

function VitalRow({ label, color, current, max, onDec, onInc }: { label: string; color: string; current: number; max: number; onDec: () => void; onInc: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.sm, padding: `${SP[2]} ${SP[3]}` }}>
      <span style={{ fontFamily: FONT, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', color, flex: 1 }}>{label}</span>
      <button className="gm-dossier-stepbtn" onClick={onDec}>−</button>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: FS.h3, minWidth: '3.75rem', textAlign: 'center', color: HUD.text }}>
        {current}<small style={{ fontSize: FS.overline, color: HUD.textFaint, fontWeight: 400 }}>/{max}</small>
      </span>
      <button className="gm-dossier-stepbtn" onClick={onInc}>＋</button>
    </div>
  )
}

function Chip({ value, label, force }: { value: number; label: string; force?: boolean }) {
  return (
    <div className={force ? 'gm-dossier-chip force' : 'gm-dossier-chip'}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

const EQUIP_LABEL: Record<string, string> = { equipped: 'EQUIPPED', carrying: 'CARRIED', stowed: 'STOWED' }

function EncReadout({ current, threshold, cliff }: { current: number; threshold: number; cliff: number }) {
  const over = current - threshold
  const tone = current >= cliff ? 'immobile' : over > 0 ? 'over' : 'plain'
  const color = tone === 'immobile' ? 'var(--hud-vital-wounds)' : tone === 'over' ? 'var(--state-threat)' : 'var(--hud-text-dim)'
  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: SP[1], whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: FONT, fontSize: FS.overline, color: HUD.textFaint }}>ENC</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color }}>{current} / {threshold}</span>
      {tone === 'over' && (
        <span style={{ fontFamily: FONT, fontSize: FS.overline, letterSpacing: '0.08em', padding: `1px ${SP[1]}`, borderRadius: RADIUS.sm, border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`, color }}>
          −{over} PENALTY
        </span>
      )}
      {tone === 'immobile' && (
        <span style={{ fontFamily: FONT, fontSize: FS.overline, letterSpacing: '0.08em', padding: `1px ${SP[1]}`, borderRadius: RADIUS.sm, border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`, color }}>
          IMMOBILE
        </span>
      )}
    </span>
  )
}

function InvRow({ name, enc, equipState, onCycle, onDrop }: { name: string; enc: number; equipState: string; onCycle: () => void; onDrop: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)', borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}` }}>
      <span style={{ fontFamily: FONT, fontSize: FS.caption, color: HUD.text, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      <span style={{ fontFamily: FONT, fontSize: FS.overline, color: HUD.textFaint, fontWeight: 700, minWidth: '1.875rem', textAlign: 'right' }}>{enc}</span>
      <button className={`gm-dossier-statepill ${equipState}`} onClick={onCycle}>{EQUIP_LABEL[equipState] ?? equipState.toUpperCase()}</button>
      <button className="gm-dossier-dropbtn" onClick={onDrop} title="Drop / trash">✕</button>
    </div>
  )
}
