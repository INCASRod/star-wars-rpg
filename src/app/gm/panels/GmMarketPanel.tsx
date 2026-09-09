'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RichText } from '@/components/ui/RichText'
import { NumberField } from '@/components/ui/NumberField'
import { FONT_BODY, FONT_DISPLAY, HUD, RADIUS, EASE, FS, SP } from '@/lib/tokens'
import {
  LOCATIONS, SCALES, ARCHETYPES, rarityToDifficultyLabel,
  generateStock, type CatalogueItem, type MarketArchetype, type MarketScale, type MarketLegality,
} from '@/lib/marketGenerator'
import { useMarketMerchant, type DbStockLine } from '@/hooks/useMarketMerchant'
import type { MarketTier } from '@/lib/marketSnapshot'
import { useItemIconContext } from '@/hooks/useItemIconContext'
import { ItemDetailPopup } from '@/components/shared/ItemDetailPopup'
import type { EditableItem } from '@/components/gm/ItemEditor'
import type { RefWeaponQuality, Character } from '@/lib/types'
import { createPendingAction, cancelPendingActionsByType, type UseGmBroadcastReturn } from '@/hooks/useGmBroadcast'

// ── Palette (existing GM/HUD tokens only) ────────────────────────────────────
const BORDER    = HUD.border
const BORDER_HI = HUD.borderHi
const TEXT      = HUD.text
const DIM       = HUD.textDim
const DIM_LO    = HUD.textFaint
const GOLD      = HUD.gold
const SURF_LO   = HUD.surfaceLo

const TIER_META: Record<MarketTier, { label: string; dot: string; skill: string | null }> = {
  open:           { label: 'Open stock',          dot: 'var(--state-success)', skill: null },
  back_room:      { label: 'Back room',           dot: 'var(--hud-vital-strain)', skill: 'Negotiation' },
  under_counter:  { label: 'Under the counter',   dot: 'var(--hud-accent-purple)', skill: 'Streetwise' },
}
const TIER_ORDER: MarketTier[] = ['open', 'back_room', 'under_counter']

const ARCHETYPE_LABELS: Record<MarketArchetype, string> = {
  general: 'General', weapons: 'Weapons', armor: 'Armor', medical: 'Medical', tech: 'Tech', black: 'Black Market', junk: 'Junk',
}
const SCALE_LABELS: Record<MarketScale, string> = { stall: 'Stall', shop: 'Shop', emporium: 'Emporium' }
const LEGALITY_LABELS: Record<MarketLegality, string> = { legit: 'Legitimate', grey: 'Grey Market', black: 'Black Market' }
const LEGALITY_HINTS: Record<MarketLegality, string> = {
  legit: 'Restricted goods are never stocked.',
  grey:  'Restricted goods sit under the counter, sometimes the back room.',
  black: 'Restricted goods openly for sale — some still under the counter.',
}
const SCALE_HINTS: Record<MarketScale, string> = {
  stall:    `~${SCALES.stall.lines} lines · rarity ceiling ${SCALES.stall.cap}`,
  shop:     `~${SCALES.shop.lines} lines · rarity ceiling ${SCALES.shop.cap}`,
  emporium: `~${SCALES.emporium.lines} lines · rarity ceiling ${SCALES.emporium.cap}`,
}

// ── Catalogue loader ─────────────────────────────────────────────────────────

// Keyed `${table}:${key}` — the View popup's data, sourced from the same
// fetch as the generator's CatalogueItem[] (below) rather than a second
// per-click query. marketGenerator.ts's CatalogueItem type is untouched;
// this is a GmMarketPanel-local superset for display only.
type CatalogueDetails = Map<string, EditableItem>

function useCatalogue() {
  const supabase = useMemo(() => createClient(), [])
  const [catalogue, setCatalogue] = useState<CatalogueItem[] | null>(null)
  const [details, setDetails] = useState<CatalogueDetails>(new Map())

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [w, a, g] = await Promise.all([
        supabase.from('ref_weapons').select('key,name,price,rarity,restricted,categories,encumbrance,description,qualities,skill_key,damage,damage_add,crit,range_value,hard_points').eq('is_custom', false),
        supabase.from('ref_armor').select('key,name,price,rarity,restricted,categories,encumbrance,description,defense,soak_bonus,encumbrance_bonus').eq('is_custom', false),
        supabase.from('ref_gear').select('key,name,price,rarity,restricted,categories,encumbrance,description,encumbrance_bonus').eq('is_custom', false),
      ])
      if (cancelled) return

      const detailsMap: CatalogueDetails = new Map()
      for (const r of w.data ?? []) detailsMap.set(`weapon:${r.key}`, { ...r, type: 'weapon', is_custom: false, categories: r.categories ?? undefined })
      for (const r of a.data ?? []) detailsMap.set(`armor:${r.key}`, { ...r, type: 'armor', is_custom: false, categories: r.categories ?? undefined })
      for (const r of g.data ?? []) detailsMap.set(`gear:${r.key}`, { ...r, type: 'gear', is_custom: false, categories: r.categories ?? undefined })
      setDetails(detailsMap)

      const items: CatalogueItem[] = [
        ...(w.data ?? []).map(r => ({ table: 'weapon' as const, key: r.key, name: r.name, rarity: r.rarity ?? 0, price: r.price ?? 0, restricted: !!r.restricted, categories: r.categories ?? [] })),
        ...(a.data ?? []).map(r => ({ table: 'armor' as const, key: r.key, name: r.name, rarity: r.rarity ?? 0, price: r.price ?? 0, restricted: !!r.restricted, categories: r.categories ?? [] })),
        ...(g.data ?? []).map(r => ({ table: 'gear' as const, key: r.key, name: r.name, rarity: r.rarity ?? 0, price: r.price ?? 0, restricted: !!r.restricted, categories: r.categories ?? [] })),
      ]
      setCatalogue(items)
    }
    void load()
    return () => { cancelled = true }
  }, [supabase])

  return { catalogue, details }
}

// ── Atoms ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: SP[5] }}>
      <label style={{
        display: 'block', fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: DIM_LO, marginBottom: '0.4375rem',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ChipRow<T extends string>({ options, labels, value, onChange }: {
  options: readonly T[]; labels: Record<T, string>; value: T; onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3125rem' }}>
      {options.map(opt => {
        const active = opt === value
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: active ? GOLD : 'var(--hud-surface)', color: active ? 'var(--hud-bg)' : DIM,
              border: `1px solid ${active ? GOLD : BORDER}`, borderRadius: RADIUS.sm,
              padding: '0.4375rem 0.625rem', cursor: 'pointer', fontWeight: active ? 700 : 500,
              transition: `background ${EASE.quick}, color ${EASE.quick}, border-color ${EASE.quick}`,
            }}
          >
            {labels[opt]}
          </button>
        )
      })}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: FS.label,
        background: 'var(--hud-surface)', color: TEXT, border: `1px solid ${BORDER}`,
        borderRadius: RADIUS.sm, padding: '0.5625rem 0.6875rem', outline: 'none',
      }}
    />
  )
}

function Btn({ children, onClick, ghost, disabled }: { children: React.ReactNode; onClick: () => void; ghost?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: ghost ? 500 : 700,
        background: ghost ? 'transparent' : GOLD, color: ghost ? DIM : 'var(--hud-bg)',
        border: ghost ? `1px solid ${BORDER}` : 'none', borderRadius: RADIUS.sm,
        padding: '0.625rem 1.125rem', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: `filter ${EASE.quick}, color ${EASE.quick}, border-color ${EASE.quick}`,
      }}
    >
      {children}
    </button>
  )
}

// ── Stock row ────────────────────────────────────────────────────────────────

function StockRow({ line, onView, onToggleReveal, onCycleTier, onDelete, onPriceChange }: {
  line: DbStockLine
  onView: () => void
  onToggleReveal: () => void
  onCycleTier: () => void
  onDelete: () => void
  onPriceChange: (price: number) => void
}) {
  const [priceDraft, setPriceDraft] = useState(String(line.price))
  useEffect(() => { setPriceDraft(String(line.price)) }, [line.price])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: SP[3], padding: '0.5625rem 1.25rem',
      borderTop: '1px solid color-mix(in srgb, var(--hud-accent) 6%, transparent)',
      background: line.revealed ? 'color-mix(in srgb, var(--state-success) 6%, transparent)' : 'transparent',
      fontFamily: FONT_BODY, fontSize: FS.label,
    }}>
      <span style={{ fontSize: FS.overline, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM_LO, width: '3.125rem', flexShrink: 0 }}>
        {line.item_table}
      </span>
      {/* Only column that grows — sensible min so it never collapses to nothing on an extreme name. */}
      <span
        title={line.name}
        style={{ flex: 1, minWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: TEXT }}
      >
        {line.name}
        {line.restricted && <span style={{ color: 'var(--state-failure)', fontWeight: 700, marginLeft: '0.3125rem' }}>R</span>}
        {line.revealed && <span style={{ fontSize: FS.overline, color: 'var(--state-success)', textTransform: 'uppercase', letterSpacing: '0.12em', marginLeft: '0.5rem' }}>▸ revealed</span>}
      </span>
      <span style={{ fontSize: FS.overline, color: DIM, width: '4.875rem', flexShrink: 0 }}>
        {line.base_rarity} → <b style={{ color: TEXT }}>{line.modified_rarity}</b>
      </span>
      <NumberField
        value={priceDraft}
        onChange={e => setPriceDraft(e.target.value)}
        onBlur={() => { const n = Number(priceDraft); if (Number.isFinite(n) && n !== line.price) onPriceChange(n) }}
        style={{
          width: '5rem', textAlign: 'right', flexShrink: 0, fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
          color: GOLD, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: '0.25rem 0.375rem', outline: 'none',
        }}
        wrapperStyle={{ flexShrink: 0 }}
      />
      <div style={{ display: 'flex', gap: '0.25rem', width: '10rem', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={onView} style={smallBtnStyle()}>View</button>
        {line.tier !== 'open' && (
          <button onClick={onToggleReveal} style={smallBtnStyle()}>{line.revealed ? 'Hide' : 'Reveal'}</button>
        )}
        <button onClick={onCycleTier} style={smallBtnStyle()}>Tier</button>
        <button onClick={onDelete} style={smallBtnStyle('var(--state-failure)')}>✕</button>
      </div>
    </div>
  )
}

function smallBtnStyle(hoverColor?: string): React.CSSProperties {
  return {
    fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.1em', textTransform: 'uppercase',
    background: 'transparent', color: hoverColor ?? DIM_LO, border: `1px solid ${BORDER}`,
    borderRadius: RADIUS.sm, padding: '0.1875rem 0.4375rem', cursor: 'pointer',
  }
}

// ── Tier section ─────────────────────────────────────────────────────────────

function TierSection({ tier, lines, locationModifier, onRevealTier, onView, onToggleReveal, onCycleTier, onDelete, onPriceChange }: {
  tier: MarketTier
  lines: DbStockLine[]
  locationModifier: number
  onRevealTier: () => void
  onView: (line: DbStockLine) => void
  onToggleReveal: (refKey: string) => void
  onCycleTier: (refKey: string) => void
  onDelete: (refKey: string) => void
  onPriceChange: (refKey: string, price: number) => void
}) {
  if (lines.length === 0 && tier === 'open') return null
  const meta = TIER_META[tier]
  const hardest = lines.length ? Math.max(...lines.map(l => l.modified_rarity)) : 6 + locationModifier
  const diffLabel = rarityToDifficultyLabel(hardest)

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: SP[2], padding: '0.625rem 1.25rem',
        background: SURF_LO, position: 'sticky', top: 0, zIndex: 2, borderBottom: `1px solid ${BORDER}`,
      }}>
        <span style={{ width: '0.4375rem', height: '0.4375rem', borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: TEXT }}>
          {meta.label}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM_LO, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.3125rem' }}>
          {meta.skill && <>{meta.skill} · <RichText text={`:${diffLabel}:`} /></>}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM_LO }}>{lines.length}</span>
        {tier !== 'open' && (
          <button onClick={onRevealTier} style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'transparent', color: GOLD, border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.sm,
            padding: '0.25rem 0.5625rem', cursor: 'pointer',
          }}>
            Reveal tier
          </button>
        )}
      </div>
      {lines.length === 0 ? (
        <div style={{ padding: '0.5625rem 1.25rem', fontFamily: FONT_BODY, fontSize: FS.label, color: DIM_LO, fontStyle: 'italic' }}>
          Nothing here — a successful check reveals an empty shelf.
        </div>
      ) : (
        lines.map(line => (
          <StockRow
            key={line.ref_key}
            line={line}
            onView={() => onView(line)}
            onToggleReveal={() => onToggleReveal(line.ref_key)}
            onCycleTier={() => onCycleTier(line.ref_key)}
            onDelete={() => onDelete(line.ref_key)}
            onPriceChange={p => onPriceChange(line.ref_key, p)}
          />
        ))
      )}
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────────

export function GmMarketPanel({ campaignId, activeChars, broadcastAll }: {
  campaignId: string
  activeChars: Character[]
  broadcastAll: UseGmBroadcastReturn['broadcastAll']
}) {
  const { catalogue, details } = useCatalogue()
  const {
    merchant, loading, rollStock, toggleReveal, revealTier, cycleTier, setLinePrice, deleteLine, setOpenToPlayers,
    downloadSnapshot, parseSnapshotFile, restoreSnapshot,
  } = useMarketMerchant(campaignId)

  // Read/inspect + icon-override-only popup shared with ItemDatabaseTab's
  // Items tab — reused, not forked. Own useItemIconContext instance, same
  // convention as every other independent GM surface (GmToolsPanel,
  // ItemEditor, LootAwardModal each hold their own).
  const supabaseForIcons = useMemo(() => createClient(), [])
  const { resolveIcon, catalogEntries, refetch: refetchIconOverrides } = useItemIconContext(supabaseForIcons, campaignId)
  const [viewingLine, setViewingLine] = useState<DbStockLine | null>(null)
  const [pickerOpen, setPickerOpen]   = useState(false)
  const [pickerBusy, setPickerBusy]   = useState(false)
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

  const handlePickIcon = useCallback(async (imageKey: string): Promise<boolean> => {
    if (!campaignId || !viewingLine) return false
    setPickerBusy(true)
    const { error } = await supabaseForIcons.from('item_icon_overrides')
      .upsert(
        { campaign_id: campaignId, item_table: viewingLine.item_table, item_key: viewingLine.ref_key, image_key: imageKey },
        { onConflict: 'campaign_id,item_table,item_key' },
      )
    if (!error) await refetchIconOverrides()
    setPickerBusy(false)
    return !error
  }, [campaignId, viewingLine, supabaseForIcons, refetchIconOverrides])

  // Open to Players toggle — the only place this panel creates or cancels
  // pending actions (Prompt 3). Fires both the durable pending_actions row
  // and the ephemeral broadcast, per the project's established
  // "fire both" convention (useGmBroadcast.ts's own doc comment) — the
  // broadcast is the instant path for a connected player, the row is what
  // survives a dropped socket. source_ref is the merchant's own id, so
  // re-opening never double-queues (the partial unique index absorbs a
  // repeat) and closing cancels every player's row in one call.
  const handleToggleOpenToPlayers = useCallback(async (open: boolean) => {
    if (!merchant) return
    await setOpenToPlayers(open)
    if (open) {
      for (const c of activeChars) {
        await createPendingAction({
          campaignId, characterId: c.id, actionType: 'vendor_offer',
          sourceRef: merchant.id, isBlocking: false,
        })
      }
      broadcastAll({ type: 'vendor-offer-open', merchantId: merchant.id }, activeChars)
    } else {
      await cancelPendingActionsByType(campaignId, 'vendor_offer', merchant.id)
      broadcastAll({ type: 'vendor-offer-close', merchantId: merchant.id }, activeChars)
    }
  }, [merchant, activeChars, campaignId, broadcastAll, setOpenToPlayers])

  const handleResetIcon = useCallback(async (): Promise<boolean> => {
    if (!campaignId || !viewingLine) return false
    setPickerBusy(true)
    const { error } = await supabaseForIcons.from('item_icon_overrides')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('item_table', viewingLine.item_table)
      .eq('item_key', viewingLine.ref_key)
    if (!error) await refetchIconOverrides()
    setPickerBusy(false)
    return !error
  }, [campaignId, viewingLine, supabaseForIcons, refetchIconOverrides])

  const [name, setName]           = useState("Vosk's Sundries")
  const [locationMod, setLocationMod] = useState(0)
  const [archetype, setArchetype] = useState<MarketArchetype>('general')
  const [scale, setScale]         = useState<MarketScale>('shop')
  const [legality, setLegality]   = useState<MarketLegality>('legit')
  const [status, setStatus]       = useState('—')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync local form fields FROM the loaded merchant once (not on every
  // realtime refresh — the GM's in-progress edits to these fields must not
  // be clobbered by their own writes echoing back).
  // `touchedRef` closes a real race: the GM can start editing chips before
  // the catch-up SELECT resolves on a slow connection. Once the GM has
  // touched any field, the merchant's own values must never overwrite that
  // in-progress edit again — restoreSnapshot (below) explicitly clears both
  // refs since a restore's whole point IS to overwrite the form.
  const syncedRef  = useRef(false)
  const touchedRef = useRef(false)
  useEffect(() => {
    if (merchant && !syncedRef.current && !touchedRef.current) {
      setName(merchant.name)
      setLocationMod(merchant.location_modifier)
      setArchetype(merchant.archetype as MarketArchetype)
      setScale(merchant.scale as MarketScale)
      setLegality(merchant.legality as MarketLegality)
      syncedRef.current = true
    }
  }, [merchant])

  function touch<T>(setter: (v: T) => void): (v: T) => void {
    return v => { touchedRef.current = true; setter(v) }
  }

  const handleRoll = useCallback(async () => {
    if (!catalogue) return
    const seed = Math.floor(Math.random() * 2 ** 31)
    const stock = generateStock({ catalogue, locationModifier: locationMod, archetype, scale, legality, seed })
    setStatus('Rolling…')
    await rollStock({ name, locationModifier: locationMod, archetype, scale, legality, seed, stock })
    setStatus(`Rolled ${stock.length} lines · seed ${seed}`)
  }, [catalogue, locationMod, archetype, scale, legality, name, rollStock])

  const handleDownload = useCallback(() => {
    downloadSnapshot()
    setStatus('Snapshot downloaded')
  }, [downloadSnapshot])

  const handleRestoreFile = useCallback(async (file: File) => {
    const knownRefKeys = catalogue ? {
      weapon: new Set(catalogue.filter(i => i.table === 'weapon').map(i => i.key)),
      armor:  new Set(catalogue.filter(i => i.table === 'armor').map(i => i.key)),
      gear:   new Set(catalogue.filter(i => i.table === 'gear').map(i => i.key)),
    } : undefined
    const result = await parseSnapshotFile(file, knownRefKeys)
    if (!result.ok) { setStatus(`Restore failed: ${result.error}`); return }
    await restoreSnapshot(result.snapshot)
    syncedRef.current = false // allow the just-restored merchant to resync the form fields
    touchedRef.current = false
    setStatus(
      result.unresolvedRefKeys.length
        ? `Restored — ${result.unresolvedRefKeys.length} ref key(s) no longer in the catalogue: ${result.unresolvedRefKeys.join(', ')}`
        : 'Restored',
    )
  }, [catalogue, parseSnapshotFile, restoreSnapshot])

  const stockByTier = useMemo(() => {
    const grouped: Record<MarketTier, DbStockLine[]> = { open: [], back_room: [], under_counter: [] }
    for (const line of merchant?.stock ?? []) grouped[line.tier].push(line)
    return grouped
  }, [merchant?.stock])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--hud-bg)' }}>

      {/* Header */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: SP[3], padding: `${SP[4]} ${SP[5]}`,
        borderBottom: `1px solid ${BORDER}`, background: SURF_LO,
      }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT, margin: 0 }}>
          Market
        </h2>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.16em', color: DIM_LO, textTransform: 'uppercase' }}>
          {merchant ? `${merchant.name} · ${LOCATIONS.find(l => l.modifier === merchant.location_modifier)?.label ?? ''}` : 'no merchant'}
        </span>
        {merchant?.is_open_to_players && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--state-success)' }}>
            <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: 'var(--state-success)', boxShadow: '0 0 6px var(--state-success)' }} />
            open to players
          </span>
        )}
      </div>

      {/* Body — two columns, each scrolls independently */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(18.75rem, 0.72fr) minmax(26.875rem, 1.28fr)' }}>

        {/* Left — parameters */}
        <div style={{ borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', minHeight: 0, background: SURF_LO }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: SP[5] }}>
            <Field label="Merchant name">
              <TextInput value={name} onChange={touch(setName)} placeholder="Merchant name" />
            </Field>
            <Field label="Location">
              <select
                value={locationMod} onChange={e => touch(setLocationMod)(Number(e.target.value))}
                style={{
                  width: '100%', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: FS.label,
                  background: 'var(--hud-surface)', color: TEXT, border: `1px solid ${BORDER}`,
                  borderRadius: RADIUS.sm, padding: '0.5625rem 0.6875rem', outline: 'none',
                }}
              >
                {LOCATIONS.map(l => (
                  <option key={l.modifier} value={l.modifier}>
                    {l.label} ({l.modifier >= 0 ? '+' : ''}{l.modifier})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Archetype">
              <ChipRow options={Object.keys(ARCHETYPES) as MarketArchetype[]} labels={ARCHETYPE_LABELS} value={archetype} onChange={touch(setArchetype)} />
            </Field>
            <Field label="Scale">
              <ChipRow options={Object.keys(SCALES) as MarketScale[]} labels={SCALE_LABELS} value={scale} onChange={touch(setScale)} />
              <div style={{ fontSize: FS.overline, color: DIM_LO, marginTop: '0.375rem', lineHeight: 1.55 }}>{SCALE_HINTS[scale]}</div>
            </Field>
            <Field label="Legality">
              <ChipRow options={['legit', 'grey', 'black'] as MarketLegality[]} labels={LEGALITY_LABELS} value={legality} onChange={touch(setLegality)} />
              <div style={{ fontSize: FS.overline, color: DIM_LO, marginTop: '0.375rem', lineHeight: 1.55 }}>{LEGALITY_HINTS[legality]}</div>
            </Field>
          </div>
        </div>

        {/* Right — stock */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {!merchant || merchant.stock.length === 0 ? (
              <div style={{ padding: '4.375rem 1.875rem', textAlign: 'center', color: DIM_LO, fontFamily: FONT_BODY, fontSize: FS.label, letterSpacing: '0.1em' }}>
                {loading ? 'Loading…' : 'No stock yet — Roll Stock to generate a merchant.'}
              </div>
            ) : (
              TIER_ORDER.map(tier => (
                <TierSection
                  key={tier}
                  tier={tier}
                  lines={stockByTier[tier]}
                  locationModifier={merchant.location_modifier}
                  onRevealTier={() => revealTier(tier)}
                  onView={setViewingLine}
                  onToggleReveal={toggleReveal}
                  onCycleTier={cycleTier}
                  onDelete={deleteLine}
                  onPriceChange={setLinePrice}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer — pinned outside both scroll regions */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: SP[2], padding: `${SP[3]} ${SP[5]}`,
        borderTop: `1px solid ${BORDER}`, background: SURF_LO,
      }}>
        <Btn onClick={() => void handleRoll()} disabled={!catalogue}>Roll Stock</Btn>
        <Btn ghost onClick={handleDownload} disabled={!merchant}>Snapshot ↓</Btn>
        <Btn ghost onClick={() => fileInputRef.current?.click()}>Restore ↑</Btn>
        <input
          ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) void handleRestoreFile(f); e.target.value = '' }}
        />
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.1em', color: DIM_LO, textTransform: 'uppercase', maxWidth: '20rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {status}
        </span>
        <Btn ghost onClick={() => void handleToggleOpenToPlayers(!merchant?.is_open_to_players)} disabled={!merchant}>
          {merchant?.is_open_to_players ? 'Close to Players' : 'Open to Players'}
        </Btn>
      </div>

      {/* Read/inspect + icon-override popup — same shared component ItemDatabaseTab
          uses, portaled to document.body so it escapes this panel's own
          transform-bearing ancestor rather than centering inside it. */}
      {viewingLine && (() => {
        const item = details.get(`${viewingLine.item_table}:${viewingLine.ref_key}`)
        if (!item) return null
        return (
          <ItemDetailPopup
            item={item}
            onClose={() => setViewingLine(null)}
            resolveIcon={resolveIcon}
            catalogEntries={catalogEntries}
            pickerOpen={pickerOpen}
            setPickerOpen={setPickerOpen}
            pickerBusy={pickerBusy}
            onPickIcon={handlePickIcon}
            onResetIcon={handleResetIcon}
            refQualityMap={refQualityMap}
          />
        )
      })()}
    </div>
  )
}
