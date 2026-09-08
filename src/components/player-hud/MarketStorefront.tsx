'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { RichText } from '@/components/ui/RichText'
import { ItemDetailPopup } from '@/components/shared/ItemDetailPopup'
import { useItemIconContext } from '@/hooks/useItemIconContext'
import { usePlayerMarket, type PlayerMarketLine } from '@/hooks/usePlayerMarket'
import { LOCATIONS, rarityToDifficultyLabel } from '@/lib/marketGenerator'
import type { MarketTier } from '@/lib/marketSnapshot'
import type { EditableItem } from '@/components/gm/ItemEditor'
import type { RefWeaponQuality } from '@/lib/types'
import { FONT_BODY, FONT_DISPLAY, HUD, RADIUS, FS, SP, Z } from '@/lib/tokens'

const BORDER = HUD.border
const DIM    = HUD.textDim
const DIM_LO = HUD.textFaint
const GOLD   = HUD.gold

const TIER_LABEL: Record<Exclude<MarketTier, 'open'>, { label: string; skill: string }> = {
  back_room:     { label: 'Back Room',          skill: 'Negotiation' },
  under_counter: { label: 'Under the Counter',  skill: 'Streetwise' },
}

// ── Full item detail lookup — public ref-table data only, no merchant   ────
// secrets here (that's usePlayerMarket's job). Same shape/columns as
// GmMarketPanel's own useCatalogue() `details` map, kept local since this
// is the only other place that needs it.
function useCatalogueDetails() {
  const supabase = useMemo(() => createClient(), [])
  const [details, setDetails] = useState<Map<string, EditableItem>>(new Map())

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [w, a, g] = await Promise.all([
        supabase.from('ref_weapons').select('key,name,price,rarity,restricted,categories,encumbrance,description,qualities,skill_key,damage,damage_add,crit,range_value,hard_points').eq('is_custom', false),
        supabase.from('ref_armor').select('key,name,price,rarity,restricted,categories,encumbrance,description,defense,soak_bonus,encumbrance_bonus').eq('is_custom', false),
        supabase.from('ref_gear').select('key,name,price,rarity,restricted,categories,encumbrance,description,encumbrance_bonus').eq('is_custom', false),
      ])
      if (cancelled) return
      const map: Map<string, EditableItem> = new Map()
      for (const r of w.data ?? []) map.set(`weapon:${r.key}`, { ...r, type: 'weapon', is_custom: false, categories: r.categories ?? undefined })
      for (const r of a.data ?? []) map.set(`armor:${r.key}`, { ...r, type: 'armor', is_custom: false, categories: r.categories ?? undefined })
      for (const r of g.data ?? []) map.set(`gear:${r.key}`, { ...r, type: 'gear', is_custom: false, categories: r.categories ?? undefined })
      setDetails(map)
    }
    void load()
    return () => { cancelled = true }
  }, [supabase])

  return details
}

function StockLineRow({ line, onInspect }: { line: PlayerMarketLine; onInspect: () => void }) {
  return (
    <button
      onClick={onInspect}
      style={{
        display: 'flex', alignItems: 'center', gap: SP[2], width: '100%',
        padding: `${SP[2]} ${SP[3]}`, background: 'transparent', border: 0,
        borderTop: '1px solid color-mix(in srgb, var(--hud-accent) 6%, transparent)',
        cursor: 'pointer', textAlign: 'left', fontFamily: FONT_BODY,
      }}
    >
      <span style={{ fontSize: FS.overline, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM_LO, width: '3rem', flexShrink: 0 }}>
        {line.itemTable}
      </span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: FS.label, color: HUD.text }}>
        {line.name}
        {line.restricted && <span style={{ color: 'var(--state-failure)', fontWeight: 700, marginLeft: '0.3125rem' }}>R</span>}
      </span>
      <span style={{ fontSize: FS.overline, color: DIM, flexShrink: 0 }}>Rarity {line.modifiedRarity}</span>
      <span style={{ fontSize: FS.label, fontWeight: 700, color: GOLD, flexShrink: 0, minWidth: '4rem', textAlign: 'right' }}>
        {line.price.toLocaleString()} cr
      </span>
    </button>
  )
}

export interface MarketStorefrontProps {
  campaignId: string
  credits:    number
  onClose:    () => void
}

/**
 * Player-facing Market storefront. Dismissible (client-side only — see
 * PlayerHUDDesktop's wiring), recallable from the notifications drawer,
 * closes itself the instant the GM closes the merchant or toggles it off
 * (usePlayerMarket collapses to null in either case).
 *
 * No buy button, no reserve, no "I want this" action anywhere here — the
 * player talks to the GM. All transactions are manual.
 */
export function MarketStorefront({ campaignId, credits, onClose }: MarketStorefrontProps) {
  const market = usePlayerMarket(campaignId)
  const details = useCatalogueDetails()
  const supabaseForIcons = useMemo(() => createClient(), [])
  const { resolveIcon } = useItemIconContext(supabaseForIcons, campaignId)
  const [viewingLine, setViewingLine] = useState<PlayerMarketLine | null>(null)
  const [refQualityMap, setRefQualityMap] = useState<Record<string, RefWeaponQuality>>({})

  useEffect(() => {
    supabaseForIcons.from('ref_weapon_qualities').select('key,name,description,is_ranked,stat_modifier')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, RefWeaponQuality> = {}
        for (const q of data as RefWeaponQuality[]) map[q.key] = q
        setRefQualityMap(map)
      })
  }, [supabaseForIcons])

  // GM closed the merchant or toggled it off — nothing to show. This also
  // covers "no active merchant at all".
  if (!market) return null

  const location = LOCATIONS.find(l => l.modifier === market.locationModifier)?.label ?? ''
  const viewingItem = viewingLine ? details.get(`${viewingLine.itemTable}:${viewingLine.refKey}`) : null

  return createPortal(
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: Z.overlay,
          background: 'color-mix(in srgb, var(--hud-bg) 55%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: HUD.panel, border: `1px solid ${HUD.borderHi}`,
            borderRadius: RADIUS.lg, width: 'min(30rem, 92vw)', maxHeight: '82vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 18px 50px rgba(0,0,0,0.65)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: SP[4], borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: SP[2] }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.24em', textTransform: 'uppercase', color: GOLD }}>
                  Merchant
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 600, color: HUD.text, marginTop: '0.25rem' }}>
                  {market.name}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, marginTop: '0.25rem', letterSpacing: '0.05em' }}>
                  {location}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, fontWeight: 700, color: GOLD }}>{credits.toLocaleString()}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM_LO }}>Credits</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM_LO,
                  background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm,
                  padding: '0.25rem 0.5rem', cursor: 'pointer', flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {market.visibleLines.length === 0 ? (
              <div style={{ padding: `${SP[6]} ${SP[3]}`, textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.label, color: DIM_LO, fontStyle: 'italic' }}>
                Nothing on the shelves yet.
              </div>
            ) : (
              market.visibleLines.map(line => (
                <StockLineRow key={`${line.itemTable}:${line.refKey}`} line={line} onInspect={() => setViewingLine(line)} />
              ))
            )}

            {market.lockedTiers.map(t => {
              const meta = TIER_LABEL[t.tier]
              const diffLabel = rarityToDifficultyLabel(t.difficultyRarity)
              return (
                <div key={t.tier} style={{
                  padding: SP[3], borderTop: `1px solid ${BORDER}`,
                  fontFamily: FONT_BODY, fontSize: FS.caption, color: DIM, lineHeight: 1.6,
                }}>
                  <div style={{ fontSize: FS.overline, letterSpacing: '0.16em', textTransform: 'uppercase', color: DIM_LO, marginBottom: '0.375rem' }}>
                    {meta.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <span>Make a <RichText text={`:${diffLabel}:`} /> {meta.skill} check to see whether this merchant has more items available.</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {viewingLine && viewingItem && (
        <ItemDetailPopup
          item={viewingItem}
          onClose={() => setViewingLine(null)}
          resolveIcon={resolveIcon}
          refQualityMap={refQualityMap}
        />
      )}
    </>,
    document.body,
  )
}
