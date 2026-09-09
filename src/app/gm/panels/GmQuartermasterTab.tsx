'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NumberField } from '@/components/ui/NumberField'
import { ItemDetailPopup } from '@/components/shared/ItemDetailPopup'
import { FONT_BODY, HUD, RADIUS, EASE, FS, SP } from '@/lib/tokens'
import type { UseQuartermasterReturn } from '@/hooks/useQuartermaster'
import type { CatalogueItem } from '@/lib/marketGenerator'
import type { EditableItem } from '@/components/gm/ItemEditor'
import type { IconCatalogEntry } from '@/hooks/useItemIconContext'
import type { ItemTable, IconResolution } from '@/lib/itemIconResolver'
import type { RefWeaponQuality, QuartermasterItem } from '@/lib/types'

const BORDER    = HUD.border
const BORDER_HI = HUD.borderHi
const TEXT      = HUD.text
const DIM       = HUD.textDim
const DIM_LO    = HUD.textFaint
const GOLD      = HUD.gold
const SURF_LO   = HUD.surfaceLo

// ── Row draft state ──────────────────────────────────────────────────────────
// One draft per item (existing-row or add-from-catalogue new row), keyed
// `${type}:${key}`. `originalPrice`/`originalStock` are the last value SEEN
// FROM THE SERVER while the row was clean — `dirty` is computed by comparing
// the live draft against them, and the resync effect below only overwrites a
// draft's price/stock/expectedStock while it is NOT dirty. The moment a GM's
// edit diverges from the server value, this freezes `expectedStock` at
// whatever it was the instant before divergence — i.e. the value the GM last
// actually saw — and a later realtime update (a player buying) no longer
// touches this row at all until the GM saves, reloads-on-conflict, or edits
// the value back to match (which un-dirties it and lets resync resume).
interface RowDraft {
  key: string
  type: 'weapon' | 'armor' | 'gear'
  name: string
  originalPrice: string
  originalStock: string
  price: string
  stock: string
  /** Frozen the moment this row first went dirty — the exact value upsertItem's guard is checked against. Never a re-read at Save time. */
  expectedStock: number
  /** True until the first successful Save — no prior row to guard against, `expectedStock` is unused. */
  isNew: boolean
}

function isDirty(d: RowDraft): boolean {
  return d.isNew || d.price !== d.originalPrice || d.stock !== d.originalStock
}

function rowKey(type: string, key: string) {
  return `${type}:${key}`
}

interface GmQuartermasterTabProps {
  campaignId: string
  supabase: SupabaseClient
  qmData: UseQuartermasterReturn
  catalogue: CatalogueItem[] | null
  details: Map<string, EditableItem>
  resolveIcon: (table: ItemTable, key: string | null | undefined, categories?: string[] | null) => IconResolution | null
  catalogEntries: (table: ItemTable) => IconCatalogEntry[]
  refetchIconOverrides: () => Promise<void>
  refQualityMap: Record<string, RefWeaponQuality>
}

export function GmQuartermasterTab({
  campaignId, supabase, qmData, catalogue, details, resolveIcon, catalogEntries, refetchIconOverrides, refQualityMap,
}: GmQuartermasterTabProps) {
  const { qm, qmItems, loading, upsertItem, removeItem, toggleOpen } = qmData

  const qmByKey = useMemo(() => {
    const m = new Map<string, QuartermasterItem>()
    for (const i of qmItems) m.set(rowKey(i.item_type, i.item_key), i)
    return m
  }, [qmItems])

  const [drafts,   setDrafts]   = useState<Record<string, RowDraft>>({})
  const [newOrder, setNewOrder] = useState<string[]>([])
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<{ rowKey: string; message: string } | null>(null)
  const [conflict, setConflict]   = useState<{ rowKey: string; type: 'weapon' | 'armor' | 'gear'; key: string; name: string; currentStock: number } | null>(null)

  // ── Resync drafts from live qmItems — only for rows that are NOT dirty.
  // A dirty row's price/stock/expectedStock are left completely alone here;
  // that's the touched-field guard that keeps a player's purchase (which
  // fires this same effect via realtime) from clobbering a GM's in-progress
  // edit. `isNew` (unsaved add-from-catalogue) rows are never touched here —
  // they don't exist server-side yet, nothing to resync from.
  useEffect(() => {
    setDrafts(prev => {
      const next = { ...prev }
      const liveKeys = new Set<string>()
      for (const item of qmItems) {
        const rk = rowKey(item.item_type, item.item_key)
        liveKeys.add(rk)
        const existingDraft = next[rk]
        if (!existingDraft || !isDirty(existingDraft)) {
          const info = details.get(rk)
          next[rk] = {
            key: item.item_key, type: item.item_type, name: info?.name ?? item.item_key,
            originalPrice: String(item.price_override), originalStock: String(item.stock),
            price: String(item.price_override), stock: String(item.stock),
            expectedStock: item.stock, isNew: false,
          }
        }
      }
      // Drop clean drafts whose live row is gone (deleted elsewhere). Dirty
      // and isNew drafts are left as-is — a dirty row whose live row vanished
      // just re-inserts on Save (upsertItem's own insert-branch behavior).
      for (const rk of Object.keys(next)) {
        const d = next[rk]
        if (!d.isNew && !isDirty(d) && !liveKeys.has(rk)) delete next[rk]
      }
      return next
    })
  }, [qmItems, details])

  const rows = useMemo(() => {
    const newRows = newOrder.filter(k => drafts[k]?.isNew).map(k => drafts[k])
    const existingRows = Object.values(drafts)
      .filter(d => !d.isNew)
      .sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type))
    return [...newRows, ...existingRows]
  }, [drafts, newOrder])

  const setField = useCallback((rk: string, field: 'price' | 'stock', value: string) => {
    setDrafts(prev => {
      const d = prev[rk]
      if (!d) return prev
      return { ...prev, [rk]: { ...d, [field]: value } }
    })
  }, [])

  const handleSave = useCallback(async (rk: string) => {
    const d = drafts[rk]
    if (!d) return
    setSavingKey(rk)
    setSaveError(null)
    const priceNum = Math.max(0, parseInt(d.price, 10) || 0)
    const stockNum = Math.max(0, parseInt(d.stock, 10) || 0)
    const result = await upsertItem(d.key, d.type, stockNum, priceNum, d.expectedStock)
    setSavingKey(null)
    if (result.ok) {
      setDrafts(prev => { const next = { ...prev }; delete next[rk]; return next })
      setNewOrder(prev => prev.filter(k => k !== rk))
      setConflict(prev => (prev?.rowKey === rk ? null : prev))
    } else if (result.reason === 'conflict') {
      setConflict({ rowKey: rk, type: d.type, key: d.key, name: d.name, currentStock: result.currentStock })
    } else {
      setSaveError({ rowKey: rk, message: result.message })
    }
  }, [drafts, upsertItem])

  const handleReload = useCallback(() => {
    if (!conflict) return
    const rk = conflict.rowKey
    setDrafts(prev => {
      const d = prev[rk]
      if (!d) return prev
      const stockStr = String(conflict.currentStock)
      return { ...prev, [rk]: { ...d, stock: stockStr, originalStock: stockStr, expectedStock: conflict.currentStock } }
    })
    setConflict(null)
  }, [conflict])

  const handleDelete = useCallback(async (rk: string) => {
    const d = drafts[rk]
    if (!d) return
    if (!d.isNew) await removeItem(d.key, d.type)
    setDrafts(prev => { const next = { ...prev }; delete next[rk]; return next })
    setNewOrder(prev => prev.filter(k => k !== rk))
    setConflict(prev => (prev?.rowKey === rk ? null : prev))
  }, [drafts, removeItem])

  // ── Add from catalogue ───────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [resultsOpen, setResultsOpen] = useState(false)
  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q.length < 2 || !catalogue) return []
    return catalogue.filter(c => c.name.toLowerCase().includes(q)).slice(0, 40)
  }, [search, catalogue])

  const handleSelectResult = useCallback((c: CatalogueItem) => {
    const rk = rowKey(c.table, c.key)
    setDrafts(prev => {
      const existing = prev[rk]
      if (existing) {
        const bumped = String(Math.max(0, (parseInt(existing.stock, 10) || 0) + 1))
        return { ...prev, [rk]: { ...existing, stock: bumped } }
      }
      return {
        ...prev,
        [rk]: {
          key: c.key, type: c.table, name: c.name,
          originalPrice: '', originalStock: '',
          price: String(c.price), stock: '1', expectedStock: 0, isNew: true,
        },
      }
    })
    if (!drafts[rk]) setNewOrder(prev => [rk, ...prev])
    setSearch('')
    setResultsOpen(false)
  }, [drafts])

  // ── View popup + icon override — own state, independent of the Merchant
  // tab's (they'd otherwise fight over one pickerOpen/viewingLine pair if
  // both tabs shared it). Same resolveIcon/catalogEntries/refetchIconOverrides
  // instance as the Merchant tab (passed down from GmMarketPanel — one
  // useItemIconContext fetch/subscription, not duplicated per tab).
  const [viewingItem, setViewingItem] = useState<EditableItem | null>(null)
  const [pickerOpen,  setPickerOpen]  = useState(false)
  const [pickerBusy,  setPickerBusy]  = useState(false)

  const handlePickIcon = useCallback(async (imageKey: string): Promise<boolean> => {
    if (!campaignId || !viewingItem) return false
    setPickerBusy(true)
    const { error } = await supabase.from('item_icon_overrides')
      .upsert(
        { campaign_id: campaignId, item_table: viewingItem.type, item_key: viewingItem.key, image_key: imageKey },
        { onConflict: 'campaign_id,item_table,item_key' },
      )
    if (!error) await refetchIconOverrides()
    setPickerBusy(false)
    return !error
  }, [campaignId, viewingItem, supabase, refetchIconOverrides])

  const handleResetIcon = useCallback(async (): Promise<boolean> => {
    if (!campaignId || !viewingItem) return false
    setPickerBusy(true)
    const { error } = await supabase.from('item_icon_overrides')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('item_table', viewingItem.type)
      .eq('item_key', viewingItem.key)
    if (!error) await refetchIconOverrides()
    setPickerBusy(false)
    return !error
  }, [campaignId, viewingItem, supabase, refetchIconOverrides])

  const totalUnits = qmItems.reduce((a, b) => a + b.stock, 0)

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

      {/* Add bar */}
      <div style={{
        flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', gap: SP[2],
        padding: `${SP[3]} ${SP[5]}`, borderBottom: `1px solid ${BORDER}`, background: SURF_LO,
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.2em', textTransform: 'uppercase', color: DIM_LO, flexShrink: 0 }}>
          Add
        </span>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setResultsOpen(true) }}
          onFocus={() => setResultsOpen(true)}
          placeholder="Search the catalogue to add stock…"
          style={{
            flex: 1, boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: FS.label,
            background: 'var(--hud-surface)', color: TEXT, border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.sm, padding: '0.5625rem 0.6875rem', outline: 'none',
          }}
        />
        {resultsOpen && results.length > 0 && (
          <div style={{
            position: 'absolute', left: SP[5], right: SP[5], top: 'calc(100% - 1px)', zIndex: 20,
            background: HUD.surfaceHi, border: `1px solid ${BORDER_HI}`, borderRadius: `0 0 ${RADIUS.sm} ${RADIUS.sm}`,
            maxHeight: '17.5rem', overflowY: 'auto',
          }}>
            {results.map(c => {
              const inStock = !!drafts[rowKey(c.table, c.key)]
              return (
                <div
                  key={rowKey(c.table, c.key)}
                  onClick={() => handleSelectResult(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: SP[3], padding: '0.5rem 0.75rem',
                    fontSize: FS.label, cursor: 'pointer', borderBottom: '1px solid color-mix(in srgb, var(--hud-accent) 7%, transparent)',
                  }}
                  className="qm-result-row"
                >
                  <span style={{ fontSize: FS.overline, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM_LO, width: '3rem', flexShrink: 0 }}>{c.table}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  {inStock && (
                    <span style={{ fontSize: FS.overline, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--hud-vital-strain, #E8A020)', flexShrink: 0 }}>
                      in stock
                    </span>
                  )}
                  <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }}>{c.price.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Conflict banner */}
      {conflict && (
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: SP[2], padding: '0.4375rem 1.25rem',
          background: 'color-mix(in srgb, var(--state-failure) 12%, transparent)',
          borderBottom: `1px solid color-mix(in srgb, var(--state-failure) 40%, transparent)`,
          fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--state-failure)',
        }}>
          <span>
            Stock for <b>{conflict.name}</b> changed while you were editing — someone bought one. Current stock is {conflict.currentStock}.
          </span>
          <button
            onClick={handleReload}
            style={{
              marginLeft: 'auto', flexShrink: 0, fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--state-failure)',
              border: '1px solid var(--state-failure)', borderRadius: RADIUS.sm, padding: '0.25rem 0.625rem', cursor: 'pointer',
            }}
          >
            Reload row
          </button>
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: SP[3], padding: '0.5625rem 1.25rem',
          background: SURF_LO, position: 'sticky', top: 0, zIndex: 2, borderBottom: `1px solid ${BORDER}`,
          fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM_LO,
        }}>
          <span style={{ width: '3.25rem', flexShrink: 0 }}>Type</span>
          <span style={{ flex: 1, minWidth: '10rem' }}>Item</span>
          <span style={{ width: '6.5rem', textAlign: 'right', flexShrink: 0 }}>Price</span>
          <span style={{ width: '5.125rem', textAlign: 'right', flexShrink: 0 }}>Stock</span>
          <span style={{ width: '11rem', flexShrink: 0 }} />
        </div>

        {rows.length === 0 && (
          <div style={{ padding: '4.375rem 1.875rem', textAlign: 'center', color: DIM_LO, fontFamily: FONT_BODY, fontSize: FS.label, letterSpacing: '0.1em' }}>
            {loading ? 'Loading…' : 'No stock yet — search the catalogue above to add some.'}
          </div>
        )}

        {rows.map(d => {
          const rk = rowKey(d.type, d.key)
          const live = qmByKey.get(rk)
          const liveStock = live?.stock ?? 0
          const zero = !d.isNew && liveStock === 0
          const dirty = isDirty(d)
          const saving = savingKey === rk
          const rowError = saveError?.rowKey === rk ? saveError.message : null
          const rowConflict = conflict?.rowKey === rk

          return (
            <div key={rk} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: SP[3], padding: '0.5625rem 1.25rem',
                fontFamily: FONT_BODY, fontSize: FS.label,
                background: rowConflict ? 'color-mix(in srgb, var(--state-failure) 8%, transparent)' : 'transparent',
                opacity: zero ? 0.5 : 1,
              }}>
                <span style={{ fontSize: FS.overline, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM_LO, width: '3.25rem', flexShrink: 0 }}>
                  {d.type}
                </span>
                <span style={{
                  flex: 1, minWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: zero ? DIM_LO : TEXT,
                }} title={d.name}>
                  {d.name}
                  {zero && <span style={{ marginLeft: '0.5rem', fontSize: FS.overline, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--state-failure)' }}>· 0 in stock</span>}
                </span>
                <NumberField
                  min={0} value={d.price}
                  onChange={e => setField(rk, 'price', e.target.value)}
                  style={{
                    width: '6.5rem', textAlign: 'right', flexShrink: 0, fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                    color: GOLD, background: 'transparent', border: `1px solid ${d.price !== d.originalPrice || d.isNew ? GOLD : BORDER}`,
                    borderRadius: RADIUS.sm, padding: '0.25rem 0.375rem', outline: 'none',
                  }}
                  wrapperStyle={{ flexShrink: 0 }}
                />
                <NumberField
                  min={0} value={d.stock}
                  onChange={e => setField(rk, 'stock', e.target.value)}
                  style={{
                    width: '5.125rem', textAlign: 'right', flexShrink: 0, fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                    color: TEXT, background: 'transparent', border: `1px solid ${d.stock !== d.originalStock || d.isNew ? GOLD : BORDER}`,
                    borderRadius: RADIUS.sm, padding: '0.25rem 0.375rem', outline: 'none',
                  }}
                  wrapperStyle={{ flexShrink: 0 }}
                />
                <div style={{ display: 'flex', gap: '0.25rem', width: '11rem', justifyContent: 'flex-end', flexShrink: 0 }}>
                  {dirty && (
                    <button
                      onClick={() => void handleSave(rk)}
                      disabled={saving}
                      style={{
                        fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
                        background: 'transparent', color: GOLD, border: `1px solid ${GOLD}`, borderRadius: RADIUS.sm,
                        padding: '0.1875rem 0.5rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {saving ? '…' : 'Save'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const item = details.get(rk)
                      if (item) setViewingItem(item)
                    }}
                    style={smallBtnStyle()}
                  >View</button>
                  <button onClick={() => void handleDelete(rk)} style={smallBtnStyle('var(--state-failure)')}>✕</button>
                </div>
              </div>
              {rowError && (
                <div style={{
                  padding: '0.375rem 1.25rem', fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--state-failure)',
                  background: 'color-mix(in srgb, var(--state-failure) 6%, transparent)',
                }}>
                  Save failed: {rowError}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: SP[2], padding: `${SP[3]} ${SP[5]}`,
        borderTop: `1px solid ${BORDER}`, background: SURF_LO,
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.14em', color: DIM_LO, textTransform: 'uppercase' }}>
          {qmItems.length} lines · {totalUnits} units in stock
        </span>
        <span style={{ flex: 1 }} />
        <button
          onClick={() => void toggleOpen()}
          style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500,
            background: 'transparent', color: DIM, border: `1px solid ${BORDER}`, borderRadius: RADIUS.sm,
            padding: '0.625rem 1.125rem', cursor: 'pointer', transition: `filter ${EASE.quick}, color ${EASE.quick}, border-color ${EASE.quick}`,
          }}
        >
          {qm?.is_open ? 'Close QM' : 'Open QM'}
        </button>
      </div>

      {viewingItem && (
        <ItemDetailPopup
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          resolveIcon={resolveIcon}
          catalogEntries={catalogEntries}
          pickerOpen={pickerOpen}
          setPickerOpen={setPickerOpen}
          pickerBusy={pickerBusy}
          onPickIcon={handlePickIcon}
          onResetIcon={handleResetIcon}
          refQualityMap={refQualityMap}
        />
      )}
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
