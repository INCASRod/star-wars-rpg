'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { ItemDetailPopup } from '@/components/shared/ItemDetailPopup'
import { useItemIconContext } from '@/hooks/useItemIconContext'
import { usePlayerMarket, type PlayerMarketLine } from '@/hooks/usePlayerMarket'
import { LOCATIONS, rarityToDifficultyLabel } from '@/lib/marketGenerator'
import { RichText } from '@/components/ui/RichText'
import type { MarketTier } from '@/lib/marketSnapshot'
import type { EditableItem } from '@/components/gm/ItemEditor'
import type { RefWeaponQuality } from '@/lib/types'

const TIER_LABEL: Record<Exclude<MarketTier, 'open'>, { label: string; skill: string }> = {
  back_room:     { label: 'Back Room',         skill: 'Negotiation' },
  under_counter: { label: 'Under the Counter', skill: 'Streetwise' },
}

// Same public ref-table lookup as desktop's MarketStorefront.tsx own
// useCatalogueDetails() — kept local per that file's own precedent ("kept
// local since this is the only other place that needs it"). No merchant
// secrets touched here, only public catalogue rows for whatever refKeys
// the (already-redacted) projection revealed.
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

function StockRow({ line, onInspect }: { line: PlayerMarketLine; onInspect: () => void }) {
  return (
    <button type="button" className="m-market-row" onClick={onInspect}>
      <span className="m-market-table-tag">{line.itemTable}</span>
      <span className="m-item-meta">
        <span className="m-item-name">
          {line.name}
          {line.restricted && <span className="m-market-restricted"> R</span>}
        </span>
        <span className="m-item-sub">Rarity {line.modifiedRarity}</span>
      </span>
      <span className="m-market-price">{line.price.toLocaleString()} cr</span>
    </button>
  )
}

export interface MobileMarketStorefrontProps {
  open: boolean
  onClose: () => void
  campaignId: string | null
  credits: number
  refWeaponQualityMap: Record<string, RefWeaponQuality>
}

/**
 * Player-facing Market storefront, mobile. Consumes usePlayerMarket only
 * (migration 130's projection — catch-up RPC + campaign-scoped broadcast) —
 * never market_merchants directly, never postgres_changes. See docs/
 * architecture.md and the Prompt 4b audit for why: RLS on that table cannot
 * redact unrevealed stock lines inside the jsonb column, so a raw
 * postgres_changes subscription would put the whole row — secrets included —
 * on the wire regardless of what this component chooses to render.
 *
 * Inspect-only, matching desktop's MarketStorefront.tsx exactly: no buy
 * button anywhere. Confirmed via Step-0 audit that no purchase write path
 * exists anywhere in the codebase today — desktop's storefront is a look,
 * then negotiate-with-the-GM-out-of-band model, not a transactional one.
 * Building a first-ever buy mechanism was explicitly declined for this
 * prompt (user chose "mirror desktop: inspect-only").
 *
 * Auto-closes the instant the GM closes the merchant or takes it off
 * `is_open_to_players` — usePlayerMarket collapses to null in both cases,
 * there is no separate "merchant deleted" case (no DELETE path exists on
 * market_merchants; it's insert-once, update-in-place per its own hook's
 * doc comment).
 */
export function MobileMarketStorefront({ open, onClose, campaignId, credits, refWeaponQualityMap }: MobileMarketStorefrontProps) {
  const market = usePlayerMarket(campaignId)
  const details = useCatalogueDetails()
  const supabaseForIcons = useMemo(() => createClient(), [])
  const { resolveIcon } = useItemIconContext(supabaseForIcons, campaignId)
  const [viewingLine, setViewingLine] = useState<PlayerMarketLine | null>(null)

  if (!open) return null

  // Merchant closed/removed mid-browse (GM toggled is_open_to_players off,
  // deactivated, or rolled a new merchant while this was mounted) — tell the
  // player rather than leaving a dead, silently-stale storefront open.
  if (!market) {
    return createPortal(
      <div className="m-market-root" data-mobile-shell="">
        <div className="m-combat-header">
          <span className="m-combat-title">Storefront</span>
          <button type="button" className="m-icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="m-combat-body">
          <div className="m-placeholder">
            <div className="m-placeholder-title">Merchant unavailable</div>
            <div className="m-placeholder-body">This vendor is no longer open. Check back later or ask the GM.</div>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  const location = LOCATIONS.find(l => l.modifier === market.locationModifier)?.label ?? ''
  const viewingItem = viewingLine ? details.get(`${viewingLine.itemTable}:${viewingLine.refKey}`) : null

  return createPortal(
    <>
      <div className="m-market-root" data-mobile-shell="">
        <div className="m-combat-header">
          <span className="m-combat-title">{market.name}</span>
          <button type="button" className="m-icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="m-market-subheader">
          <span className="m-item-sub">{location}</span>
          <span className="m-market-credits">₵{credits.toLocaleString()}</span>
        </div>

        <div className="m-combat-body">
          {market.visibleLines.length === 0 ? (
            <div className="m-placeholder">
              <div className="m-placeholder-title">Nothing on the shelves</div>
              <div className="m-placeholder-body">This merchant has nothing revealed for you yet.</div>
            </div>
          ) : (
            market.visibleLines.map(line => (
              <StockRow key={`${line.itemTable}:${line.refKey}`} line={line} onInspect={() => setViewingLine(line)} />
            ))
          )}

          {market.lockedTiers.map(t => {
            const meta = TIER_LABEL[t.tier]
            const diffLabel = rarityToDifficultyLabel(t.difficultyRarity)
            return (
              <div key={t.tier} className="m-market-locked-tier">
                <div className="m-market-locked-label">{meta.label}</div>
                <span><RichText text={`Make a :${diffLabel}: ${meta.skill} check to see whether this merchant has more items available.`} /></span>
              </div>
            )
          })}
        </div>
      </div>

      {viewingLine && viewingItem && (
        <ItemDetailPopup
          item={viewingItem}
          onClose={() => setViewingLine(null)}
          resolveIcon={resolveIcon}
          refQualityMap={refWeaponQualityMap}
        />
      )}
    </>,
    document.body,
  )
}
