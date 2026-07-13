'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import gsap from 'gsap'
import type { Character } from '@/lib/types'
import type { CombatEncounter } from '@/lib/combat'
import type { AdversaryInstance } from '@/lib/adversaries'
import type { VehicleInstance } from '@/lib/vehicles'
import type { MapToken } from '@/hooks/useMapTokens'
import { useAdversaryTokenImages } from '@/hooks/useAdversaryTokenImages'
import { useVehicleTokenImages } from '@/hooks/useVehicleTokenImages'
import { useEncounterCombatControls } from '@/hooks/useEncounterCombatControls'
import { createClient } from '@/lib/supabase/client'
import { HUD, FS, SP, FONT_BODY, FONT_DISPLAY, RADIUS, Z, EASE, COLOR } from '@/lib/tokens'

const FC = FONT_BODY
const FD = FONT_DISPLAY
const RED = COLOR.red
const GREEN = COLOR.green
const BORDER_HI = 'var(--hud-border-hi)'

export interface EncounterDeckProps {
  campaignId:          string
  encounter:           CombatEncounter | null
  setEncounter:        React.Dispatch<React.SetStateAction<CombatEncounter | null>>
  saveEncounter:       (partial: Partial<CombatEncounter>) => Promise<void>
  tokens:              MapToken[]
  addToken:            (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:         (id: string) => Promise<void>
  toggleVisibility:    (id: string, visible: boolean) => Promise<void>
  updateTokenWoundPct: (id: string, wound_pct: number) => Promise<void>
  markPending:         (key: string) => void
  clearPending:        (key: string) => void
  stagingAddToEncounter: (adv: import('@/lib/adversaries').Adversary, alignment: 'enemy' | 'allied_npc') => Promise<void>
  open:                boolean
  onOpenChange:        (open: boolean) => void
  characters:          Character[]
  onMapAreaResize?:    () => void
  focusedEntityId?:    string | null
}

export function EncounterDeck({
  campaignId, encounter, setEncounter, saveEncounter, tokens,
  addToken, removeToken, toggleVisibility, updateTokenWoundPct,
  markPending, clearPending, stagingAddToEncounter,
  open, onOpenChange, characters, onMapAreaResize, focusedEntityId,
}: EncounterDeckProps) {
  const supabase = useMemo(() => createClient(), [])
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')

  const { tokenImages: advImages } = useAdversaryTokenImages()
  const { tokenImages: vehImages } = useVehicleTokenImages()

  const { adjustAdversaryWounds, adjustAdversaryStrain, adjustGroupSize, adjustHullTrauma, adjustSystemStrain } =
    useEncounterCombatControls({
      encounter, setEncounter, saveEncounter,
      supabase, campaignId, tokens, updateTokenWoundPct, markPending, clearPending,
    })

  // GSAP open/close — height + opacity on the body, never display:none toggling
  // (display toggling would skip the transition entirely).
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    if (open) {
      gsap.to(el, {
        height: 236, duration: 0.4, ease: 'power3.out',
        onComplete: () => onMapAreaResize?.(),
      })
    } else {
      gsap.to(el, {
        height: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => onMapAreaResize?.(),
      })
    }
  }, [open, onMapAreaResize])

  const adversaries = encounter?.adversaries ?? []
  const vehicles     = encounter?.vehicles ?? []
  const slots        = encounter?.initiative_slots ?? []

  // AdversaryInstance carries no `alignment` field of its own — alignment lives
  // on the matching initiative_slots entry (SlotAlignment, set at add-time / by
  // the CombatFeedPanel toggle). VehicleInstance, by contrast, does carry its
  // own `alignment` field directly (src/lib/vehicles.ts). Deriving both counts
  // via a single lookup so a defeated/unslotted adversary safely counts as an
  // enemy default, matching the convention used elsewhere (GmMapView.tsx,
  // CombatFeedPanel.tsx) rather than inventing a new one here.
  const advAlignment = (instanceId: string) =>
    slots.find(s => s.adversaryInstanceId === instanceId)?.alignment ?? 'enemy'

  const enemyCount    = adversaries.filter(a => advAlignment(a.instanceId) !== 'allied_npc').length
                      + vehicles.filter(v => v.alignment !== 'allied_npc').length
  const friendlyCount = adversaries.filter(a => advAlignment(a.instanceId) === 'allied_npc').length
                      + vehicles.filter(v => v.alignment === 'allied_npc').length

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      zIndex: Z.deck, pointerEvents: 'none',
    }}>
      <button
        onClick={() => onOpenChange(!open)}
        style={{
          pointerEvents: 'auto', alignSelf: 'center',
          display: 'flex', alignItems: 'center', gap: SP[3],
          padding: `${SP[1]} ${SP[6]} ${SP[1]} ${SP[6]}`,
          background: 'color-mix(in srgb, var(--hud-panel) 92%, transparent)',
          border: `1px solid ${BORDER_HI}`, borderBottom: 'none',
          borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg,
          cursor: 'pointer', transition: `background ${EASE.quick}`,
        }}
      >
        <span style={{
          color: HUD.gold, fontSize: FS.caption,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: `transform ${EASE.default}`,
        }}>▲</span>
        <span style={{
          fontFamily: FD, fontSize: FS.overline, fontWeight: 700,
          letterSpacing: '0.24em', color: HUD.gold, textTransform: 'uppercase',
        }}>Encounter Deck</span>
        <span style={{ display: 'flex', gap: SP[1] }}>
          <b style={{
            fontSize: FS.overline, fontWeight: 700, padding: `1px ${SP[1]}`, borderRadius: RADIUS.sm,
            color: RED, border: `1px solid color-mix(in srgb, ${RED} 40%, transparent)`,
          }}>{enemyCount}</b>
          <b style={{
            fontSize: FS.overline, fontWeight: 700, padding: `1px ${SP[1]}`, borderRadius: RADIUS.sm,
            color: GREEN, border: `1px solid color-mix(in srgb, ${GREEN} 40%, transparent)`,
          }}>{friendlyCount}</b>
        </span>
      </button>

      <div
        ref={bodyRef}
        style={{
          pointerEvents: 'auto', height: 0, overflow: 'hidden',
          background: 'color-mix(in srgb, var(--hud-bg) 94%, transparent)',
          borderTop: `1px solid ${BORDER_HI}`,
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          zIndex: Z.deckExpanded,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '14.75rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: SP[3],
            padding: `${SP[2]} ${SP[4]}`, borderBottom: `1px solid var(--hud-border)`,
          }}>
            <div style={{ flex: '0 0 18.75rem', position: 'relative' }}>
              <span style={{
                position: 'absolute', left: SP[2], top: '50%', transform: 'translateY(-50%)',
                color: 'var(--hud-text-faint)', fontSize: FS.caption,
              }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search adversaries & vehicles…"
                style={{
                  width: '100%', background: 'color-mix(in srgb, var(--hud-bg) 65%, transparent)', border: `1px solid ${BORDER_HI}`,
                  borderRadius: RADIUS.sm, color: HUD.text, fontFamily: FC,
                  padding: `${SP[1]} ${SP[2]} ${SP[1]} ${SP[6]}`, fontSize: FS.caption, outline: 'none',
                }}
              />
            </div>
            <span style={{ fontSize: FS.overline, color: 'var(--hud-text-faint)', letterSpacing: '0.06em' }}>
              {search ? 'Library results — click ADD to place' : 'Encounter roster'}
            </span>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Task 10 fills this: roster rail (search === '') vs library results (search !== '') */}
          </div>
        </div>
      </div>
    </div>
  )
}
