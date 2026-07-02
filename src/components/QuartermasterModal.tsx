'use client'
import { useState, useEffect, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Modal } from '@/components/ui/Modal'
import { RichText } from '@/components/ui/RichText'
import { QualityBadge } from '@/components/character/QualityBadge'
import type { UseQuartermasterReturn } from '@/hooks/useQuartermaster'
import type { QmBuyRow, RefWeaponQuality } from '@/lib/types'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, EASE, Z, SHADOW } from '@/lib/tokens'

const QM_TYPE_COLOR: Record<string, string> = {
  weapon: 'var(--state-failure)',
  armor:  'var(--die-force)',
  gear:   'var(--hud-accent)',
}

const WEAPON_SKILL_NAME: Record<string, string> = {
  BRAWL:   'Brawl',
  MELEE:   'Melee',
  LTSABER: 'Lightsaber',
  RANGLT:  'Ranged (Light)',
  RANGHVY: 'Ranged (Heavy)',
  GUNN:    'Gunnery',
  MECH:    'Mechanics',
  SKUL:    'Skulduggery',
}

type Tab = 'buy' | 'sell'

interface SellRow {
  rowId:    string
  rowTable: 'character_weapons' | 'character_armor' | 'character_gear'
  itemKey:  string
  itemType: 'weapon' | 'armor' | 'gear'
  name:     string
  encumbrance: number
  marketValue: number
}

interface CharacterInfo {
  id:      string
  name:    string
  credits: number
}

interface QuartermasterModalProps {
  campaignId:    string | null
  characterName: string
  characterId?:  string
  supabase:      SupabaseClient
  onClose:       () => void
  // Pre-fetched from GroupSheet — avoids a double fetch waterfall on open
  qm:            UseQuartermasterReturn['qm']
  qmLoading?:    boolean
  buyRows:       UseQuartermasterReturn['buyRows']
  buyItem:       UseQuartermasterReturn['buyItem']
  sellItem:      UseQuartermasterReturn['sellItem']
}

export function QuartermasterModal({ campaignId, characterName, characterId, supabase, onClose, qm, qmLoading, buyRows, buyItem, sellItem }: QuartermasterModalProps) {

  const [tab,        setTab]        = useState<Tab>('buy')
  const [typeFilter, setTypeFilter] = useState<'all' | 'weapon' | 'armor' | 'gear'>('all')
  const [search,     setSearch]     = useState('')
  const [character,  setCharacter]  = useState<CharacterInfo | null>(null)
  const [sellRows,   setSellRows]   = useState<SellRow[]>([])
  const [buying,        setBuying]        = useState<string | null>(null)
  const [selling,       setSelling]       = useState<string | null>(null)
  const [viewingRow,    setViewingRow]    = useState<QmBuyRow | null>(null)
  const [refQualityMap, setRefQualityMap] = useState<Record<string, RefWeaponQuality>>({})

  // ── Load active character for this campaign session ─────────────────────────
  const loadCharacter = useCallback(async () => {
    // Fast path: load directly by ID when available (avoids dependence on character_sessions)
    if (characterId) {
      const { data } = await supabase
        .from('characters')
        .select('id,name,credits')
        .eq('id', characterId)
        .single()
      if (data) setCharacter(data as CharacterInfo)
      return
    }
    // Fallback: resolve via character_sessions (requires active session row)
    if (!campaignId || !characterName) return
    const { data: sessions } = await supabase
      .from('character_sessions')
      .select('character_id')
      .eq('campaign_id', campaignId)
      .limit(10)
    if (!sessions?.length) return
    const charIds = sessions.map((s: { character_id: string }) => s.character_id)
    const { data: chars } = await supabase
      .from('characters')
      .select('id,name,credits')
      .in('id', charIds)
    if (!chars?.length) return
    const found = Array.isArray(chars)
      ? chars.find((c: { id: string; name: string; credits: number }) => c.name === characterName) ?? chars[0]
      : null
    if (found) setCharacter(found as CharacterInfo)
  }, [supabase, campaignId, characterName, characterId])

  // ── Load sell inventory ─────────────────────────────────────────────────────
  const loadSellRows = useCallback(async (charId: string) => {
    type WInv = { id: string; weapon_key: string }
    type AInv = { id: string; armor_key: string }
    type GInv = { id: string; gear_key: string }
    type Ref  = { key: string; name: string; encumbrance: number; price: number }

    const [wRes, aRes, gRes] = await Promise.all([
      supabase.from('character_weapons').select('id,weapon_key').eq('character_id', charId).eq('is_dropped', false),
      supabase.from('character_armor').select('id,armor_key').eq('character_id', charId).eq('is_dropped', false),
      supabase.from('character_gear').select('id,gear_key').eq('character_id', charId).eq('is_dropped', false),
    ])

    const wInv = (wRes.data ?? []) as WInv[]
    const aInv = (aRes.data ?? []) as AInv[]
    const gInv = (gRes.data ?? []) as GInv[]

    const weaponKeys = wInv.map(r => r.weapon_key)
    const armorKeys  = aInv.map(r => r.armor_key)
    const gearKeys   = gInv.map(r => r.gear_key)

    const [rwRes, raRes, rgRes] = await Promise.all([
      weaponKeys.length ? supabase.from('ref_weapons').select('key,name,encumbrance,price').in('key', weaponKeys) : Promise.resolve({ data: [] }),
      armorKeys.length  ? supabase.from('ref_armor').select('key,name,encumbrance,price').in('key', armorKeys)   : Promise.resolve({ data: [] }),
      gearKeys.length   ? supabase.from('ref_gear').select('key,name,encumbrance,price').in('key', gearKeys)     : Promise.resolve({ data: [] }),
    ])

    const rwMap = Object.fromEntries(((rwRes.data ?? []) as Ref[]).map(r => [r.key, r]))
    const raMap = Object.fromEntries(((raRes.data ?? []) as Ref[]).map(r => [r.key, r]))
    const rgMap = Object.fromEntries(((rgRes.data ?? []) as Ref[]).map(r => [r.key, r]))

    const rows: SellRow[] = [
      ...wInv.flatMap(r => {
        const ref = rwMap[r.weapon_key]
        return ref ? [{ rowId: r.id, rowTable: 'character_weapons' as const, itemKey: r.weapon_key, itemType: 'weapon' as const, name: ref.name, encumbrance: ref.encumbrance, marketValue: ref.price }] : []
      }),
      ...aInv.flatMap(r => {
        const ref = raMap[r.armor_key]
        return ref ? [{ rowId: r.id, rowTable: 'character_armor' as const, itemKey: r.armor_key, itemType: 'armor' as const, name: ref.name, encumbrance: ref.encumbrance, marketValue: ref.price }] : []
      }),
      ...gInv.flatMap(r => {
        const ref = rgMap[r.gear_key]
        return ref ? [{ rowId: r.id, rowTable: 'character_gear' as const, itemKey: r.gear_key, itemType: 'gear' as const, name: ref.name, encumbrance: ref.encumbrance, marketValue: ref.price }] : []
      }),
    ]
    setSellRows(rows)
  }, [supabase])

  useEffect(() => { loadCharacter() }, [loadCharacter])
  useEffect(() => { if (character?.id) loadSellRows(character.id) }, [character?.id, loadSellRows])
  useEffect(() => {
    supabase.from('ref_weapon_qualities').select('key,name,description,is_ranked,stat_modifier')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, RefWeaponQuality> = {}
        for (const q of data as RefWeaponQuality[]) map[q.key] = q
        setRefQualityMap(map)
      })
  }, [supabase])

  // ── Buy ─────────────────────────────────────────────────────────────────────
  const handleBuy = async (itemKey: string, itemType: 'weapon' | 'armor' | 'gear') => {
    if (!character?.id) return
    setBuying(`${itemKey}-${itemType}`)
    try {
      await buyItem(character.id, itemKey, itemType)
      await loadCharacter()
    } finally {
      setBuying(null)
    }
  }

  // ── Sell ────────────────────────────────────────────────────────────────────
  const handleSell = async (row: SellRow) => {
    if (!character?.id) return
    setSelling(row.rowId)
    try {
      await sellItem(character.id, row.rowId, row.rowTable, row.itemKey, row.marketValue)
      await loadCharacter()
      setSellRows(prev => prev.filter(r => r.rowId !== row.rowId))
    } finally {
      setSelling(null)
    }
  }

  const filteredBuyRows = buyRows.filter(r => {
    if (typeFilter !== 'all' && r.qmItem.item_type !== typeFilter) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sellPct = qm?.sell_pct ?? 25

  return (
    <Modal open onClose={onClose} zIndex={Z.modal} maxWidth={680}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: SP[3],
          padding: `${SP[3]} ${SP[4]}`,
          borderBottom: `1px solid ${HUD.border}`,
        }}>
          <img
            src="/images/factions/rebel.png"
            alt="Rebel Alliance"
            style={{ width: 36, height: 36, objectFit: 'contain', opacity: 0.85, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: HUD.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Quartermaster
            </div>
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              padding: '1px 6px', borderRadius: RADIUS.sm, display: 'inline-block', marginTop: '2px', /* 2px vertical offset aligns pill under title */
              color: qmLoading
                ? HUD.textFaint
                : qm?.is_open ? 'var(--state-success)' : 'var(--state-failure)',
              border: qmLoading
                ? `1px solid color-mix(in srgb, var(--hud-text-faint) 25%, transparent)`
                : qm?.is_open
                  ? `1px solid color-mix(in srgb, var(--state-success) 35%, transparent)`
                  : `1px solid color-mix(in srgb, var(--state-failure) 30%, transparent)`,
              background: qmLoading
                ? 'transparent'
                : qm?.is_open
                  ? 'color-mix(in srgb, var(--state-success) 10%, transparent)'
                  : 'color-mix(in srgb, var(--state-failure) 08%, transparent)',
            }}>
              {qmLoading ? '···' : qm?.is_open ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          {character && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' /* 2px minimum row gap */ }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text }}>{character.name}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: HUD.gold, letterSpacing: '0.06em' }}>
                ₡ {character.credits.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${HUD.border}`, padding: `0 ${SP[4]}` }}>
          {(['buy', 'sell'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: `${SP[2]} ${SP[3]}`, border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: tab === t ? HUD.gold : HUD.textDim,
                borderBottom: tab === t ? `2px solid ${HUD.gold}` : '2px solid transparent',
                marginBottom: -1,
                transition: EASE.quick,
              }}
            >
              {t === 'buy' ? 'Buy' : 'Sell'}
            </button>
          ))}
        </div>

        {/* ── Buy Tab ────────────────────────────────────────────────────────── */}
        {tab === 'buy' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `${SP[2]} ${SP[4]}`, gap: SP[2] }}>
            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
              {(['all', 'weapon', 'armor', 'gear'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className="qm-filter-pill"
                  style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    padding: '2px 8px', borderRadius: RADIUS.sm, cursor: 'pointer', border: 'none',
                    background: typeFilter === f
                      ? 'color-mix(in srgb, var(--hud-accent) 20%, transparent)'
                      : 'transparent',
                    color: typeFilter === f ? 'var(--hud-accent)' : HUD.textDim,
                    transition: EASE.quick,
                  }}
                >
                  {f}
                </button>
              ))}
              <input
                type="text" placeholder="Search…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text,
                  flex: 1, padding: `${SP[1]} ${SP[2]}`,
                  borderRadius: RADIUS.sm, border: `1px solid ${HUD.border}`,
                  background: 'var(--hud-surface-lo)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Item list grouped by type */}
            <div style={{ overflowY: 'auto', maxHeight: 360, display: 'flex', flexDirection: 'column', gap: '2px' /* 2px minimum row gap */ }}>
              {filteredBuyRows.length === 0 && (
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, textAlign: 'center', padding: SP[4] }}>
                  No items available.
                </div>
              )}
              {(['weapon', 'armor', 'gear'] as const).map(groupType => {
                const group = filteredBuyRows.filter(r => r.qmItem.item_type === groupType)
                if (!group.length) return null
                return (
                  <div key={groupType}>
                    <div style={{
                      fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.15em', color: HUD.textFaint,
                      padding: `${SP[1]} 0`, marginTop: SP[1],
                    }}>
                      {groupType === 'weapon' ? 'Weapons' : groupType === 'armor' ? 'Armour' : 'Gear'} ({group.length})
                    </div>
                    {group.map(r => {
                      const outOfStock = r.qmItem.stock === 0
                      const canAfford  = (character?.credits ?? 0) >= r.qmItem.price_override
                      const isBuying   = buying === `${r.qmItem.item_key}-${r.qmItem.item_type}`
                      const qmClosed   = !qm?.is_open
                      const disabled   = outOfStock || !canAfford || isBuying || qmClosed
                      return (
                        <div
                          key={r.qmItem.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: SP[2],
                            padding: `${SP[1]} ${SP[2]}`,
                            background: HUD.panel,
                            border: `1px solid ${HUD.border}`,
                            borderRadius: RADIUS.sm,
                            opacity: outOfStock ? 0.45 : 1,
                          }}
                        >
                          {/* Thumbnail */}
                          <div style={{
                            width: 44, height: 44, flexShrink: 0,
                            background: 'radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--hud-accent) 10%, transparent) 0%, transparent 70%)',
                            borderRadius: RADIUS.sm,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: FS.h4, color: HUD.textDim, fontFamily: FONT_BODY, lineHeight: 1 }}>
                              {groupType === 'weapon' ? '⚔' : groupType === 'armor' ? '◈' : '◆'}
                            </span>
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' /* 2px minimum row gap */ }}>
                            <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.text, fontWeight: 600 }}>{r.name}</div>
                            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>
                              R{r.rarity} · ENC {r.encumbrance}
                              {r.qmItem.item_type === 'weapon' && ` · DMG ${r.damage_add != null ? `Brawn+${r.damage_add}` : r.damage} · CRIT ${r.crit}`}
                              {r.qmItem.item_type === 'armor'  && ` · SOAK+${r.soak} · DEF ${r.defense}`}
                            </div>
                          </div>

                          {/* Stock badge */}
                          {outOfStock ? (
                            <span style={{
                              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.1em',
                              padding: '1px 6px', borderRadius: RADIUS.sm, flexShrink: 0,
                              color: 'var(--state-failure)',
                              border: `1px solid color-mix(in srgb, var(--state-failure) 30%, transparent)`,
                              background: 'color-mix(in srgb, var(--state-failure) 08%, transparent)',
                            }}>Out of Stock</span>
                          ) : (
                            <span style={{
                              fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                              letterSpacing: '0.06em', padding: '1px 6px', borderRadius: RADIUS.sm, flexShrink: 0,
                              /* amber fallback — semantic token with hex fallback for SVG compat */
                              color: r.qmItem.stock >= 3 ? 'var(--state-success)' : 'var(--hud-vital-strain, #E8A020)',
                              border: r.qmItem.stock >= 3
                                ? `1px solid color-mix(in srgb, var(--state-success) 30%, transparent)`
                                : `1px solid color-mix(in srgb, var(--hud-vital-strain, #E8A020) 30%, transparent)`,
                              background: r.qmItem.stock >= 3
                                ? 'color-mix(in srgb, var(--state-success) 08%, transparent)'
                                : 'color-mix(in srgb, var(--hud-vital-strain, #E8A020) 08%, transparent)',
                            }}>×{r.qmItem.stock}</span>
                          )}

                          {/* Price */}
                          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.gold, fontWeight: 600, flexShrink: 0, minWidth: '4rem', textAlign: 'right' }}>
                            ₡ {r.qmItem.price_override.toLocaleString()}
                          </div>

                          {/* View button */}
                          <button
                            onClick={() => setViewingRow(r)}
                            style={{
                              fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                              padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                              cursor: 'pointer', flexShrink: 0,
                              border: `1px solid ${HUD.border}`,
                              color: HUD.textDim, background: 'transparent',
                              transition: EASE.quick,
                            }}
                          >View</button>

                          {/* Buy button */}
                          <button
                            disabled={disabled}
                            onClick={() => handleBuy(r.qmItem.item_key, r.qmItem.item_type)}
                            className="qm-buy-btn"
                            style={{
                              fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                              padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                              cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0,
                              border: `1px solid color-mix(in srgb, var(--hud-accent) ${disabled ? '15' : '35'}%, transparent)`,
                              color: disabled ? HUD.textFaint : 'var(--hud-accent)',
                              background: disabled ? 'transparent' : 'color-mix(in srgb, var(--hud-accent) 08%, transparent)',
                              transition: EASE.quick,
                              opacity: disabled ? 0.6 : 1,
                            }}
                          >
                            {isBuying ? '…' : 'Buy'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Sell Tab ───────────────────────────────────────────────────────── */}
        {tab === 'sell' && (
          <div style={{ flex: 1, padding: `${SP[2]} ${SP[4]}`, display: 'flex', flexDirection: 'column', gap: SP[2] }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>
              Selling at {sellPct}% of market value.
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 400, display: 'flex', flexDirection: 'column', gap: '2px' /* 2px minimum row gap */ }}>
              {sellRows.length === 0 && (
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, textAlign: 'center', padding: SP[4] }}>
                  No items to sell.
                </div>
              )}
              {sellRows.map(row => {
                const offer     = Math.floor(row.marketValue * sellPct / 100)
                const isSelling = selling === row.rowId
                return (
                  <div
                    key={row.rowId}
                    style={{
                      display: 'flex', alignItems: 'center', gap: SP[2],
                      padding: `${SP[1]} ${SP[2]}`,
                      background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm,
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: 44, height: 44, flexShrink: 0,
                      background: 'radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--hud-accent) 10%, transparent) 0%, transparent 70%)',
                      borderRadius: RADIUS.sm,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: FS.h4, color: HUD.textDim, fontFamily: FONT_BODY, lineHeight: 1 }}>
                        {row.itemType === 'weapon' ? '⚔' : row.itemType === 'armor' ? '◈' : '◆'}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' /* 2px minimum row gap */ }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: HUD.text, fontWeight: 600 }}>{row.name}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>
                        {row.itemType} · ENC {row.encumbrance} · Market ₡ {row.marketValue.toLocaleString()}
                      </div>
                    </div>

                    {/* Sell offer */}
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: 'var(--state-success)', fontWeight: 600, flexShrink: 0, minWidth: '4rem', textAlign: 'right' }}>
                      +₡ {offer.toLocaleString()}
                    </div>

                    {/* Sell button */}
                    <button
                      disabled={isSelling}
                      onClick={() => handleSell(row)}
                      className="qm-sell-btn"
                      style={{
                        fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm,
                        cursor: isSelling ? 'not-allowed' : 'pointer', flexShrink: 0,
                        border: `1px solid color-mix(in srgb, var(--state-success) 35%, transparent)`,
                        color: 'var(--state-success)',
                        background: 'color-mix(in srgb, var(--state-success) 08%, transparent)',
                        transition: EASE.quick,
                      }}
                    >
                      {isSelling ? '…' : 'Sell'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${SP[2]} ${SP[4]}`,
          borderTop: `1px solid ${HUD.border}`,
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>
            {tab === 'sell' ? `Buy-back rate: ${sellPct}%` : 'Prices set by the Quartermaster.'}
          </div>
          <button
            onClick={onClose}
            style={{
              fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: `${SP[1]} ${SP[3]}`, borderRadius: RADIUS.sm, cursor: 'pointer',
              border: `1px solid ${HUD.border}`, color: HUD.textDim, background: 'transparent',
              transition: EASE.quick,
            }}
          >Close</button>
        </div>

      </div>

      {/* ── Item detail popup ───────────────────────────────────────────────── */}
      {viewingRow && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: Z.popover,
            background: 'color-mix(in srgb, var(--hud-bg) 75%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setViewingRow(null)}
        >
          <div
            style={{
              background: HUD.panel, border: `1px solid ${HUD.borderHi}`,
              borderRadius: RADIUS.lg, padding: SP[4],
              width: 'min(480px, 90vw)', maxHeight: '80vh', overflowY: 'auto',
              boxShadow: SHADOW.lg, display: 'flex', flexDirection: 'column', gap: SP[3],
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
              <span style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.12em', flexShrink: 0,
                color: QM_TYPE_COLOR[viewingRow.qmItem.item_type],
              }}>
                {viewingRow.qmItem.item_type}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700, color: HUD.text, flex: 1 }}>
                {viewingRow.name}
              </span>
              <button
                onClick={() => setViewingRow(null)}
                style={{
                  fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: `${SP[1]} ${SP[2]}`, borderRadius: RADIUS.sm, cursor: 'pointer', flexShrink: 0,
                  border: `1px solid ${HUD.border}`, color: HUD.textDim, background: 'transparent',
                }}
              >✕</button>
            </div>

            {/* Common stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
              paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}`,
            }}>
              {([
                ['QM Price', `₡ ${viewingRow.qmItem.price_override.toLocaleString()}`],
                ['Rarity', viewingRow.rarity],
                ['Encumbrance', viewingRow.encumbrance],
              ] as [string, string | number][]).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Weapon stats */}
            {viewingRow.qmItem.item_type === 'weapon' && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
                paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}`,
              }}>
                {([
                  ['Skill', WEAPON_SKILL_NAME[viewingRow.skill_key ?? ''] ?? viewingRow.skill_key ?? '—'],
                  ['Damage', viewingRow.damage_add != null ? `Brawn+${viewingRow.damage_add}` : String(viewingRow.damage ?? '—')],
                  ['Crit', viewingRow.crit ?? '—'],
                  ['Range', (viewingRow.range_value ?? '—').replace(/^wr/i, '')],
                  ['Hard Points', viewingRow.hard_points ?? 0],
                ] as [string, string | number][]).map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Armor stats */}
            {viewingRow.qmItem.item_type === 'armor' && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
                paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}`,
              }}>
                {([
                  ['Soak Bonus', viewingRow.soak_bonus ?? 0],
                  ['Defense', viewingRow.defense ?? 0],
                ] as [string, string | number][]).map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Armor/Gear: encumbrance threshold bonus when equipped */}
            {(viewingRow.qmItem.item_type === 'gear' || viewingRow.qmItem.item_type === 'armor') && viewingRow.encumbrance_bonus && (
              <div style={{ paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}` }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encumbrance threshold bonus</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>+{viewingRow.encumbrance_bonus}</div>
              </div>
            )}

            {/* Qualities */}
            {viewingRow.qualities && viewingRow.qualities.length > 0 && (
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: SP[1] }}>Qualities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
                  {viewingRow.qualities.map(q => (
                    <QualityBadge key={q.key} quality={q} refQualityMap={refQualityMap} variant="desktop" />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {viewingRow.description ? (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, lineHeight: 1.6 }}>
                <RichText text={viewingRow.description} />
              </div>
            ) : (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, fontStyle: 'italic' }}>No description.</div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
