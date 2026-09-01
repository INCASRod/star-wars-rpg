'use client'
import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import manifest from '../../../public/images/manifest.json'
import { ItemReadoutPlate } from '@/components/shared/ItemReadoutPlate'
import type { ItemTable, IconResolution, IconRung } from '@/lib/itemIconResolver'
import { FONT_BODY, HUD, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'

const SECTION: Record<ItemTable, keyof typeof manifest> = { weapon: 'weapons', armor: 'armor', gear: 'gear' }
const TOP_LEVEL = new Set(['Ranged', 'Melee'])

const RUNG_LABEL: Record<IconRung, string> = {
  override:         'Pinned by GM',
  exact:            "Using its own illustration",
  'category-pair':  'Borrowed image',
  'single-category': 'Borrowed image',
  'only-category':  'Borrowed image',
  'broad-category': 'Borrowed image (broad match)',
  fallback:         'No illustration available — generic glyph',
}

interface CatalogEntry { key: string; name: string; categories?: string[] }

interface IconPickerProps {
  table: ItemTable
  itemName: string
  /** Every item in this table (key, name, categories) — used to browse/search/filter. Caller already has this list loaded for the surface it's opening from. */
  catalog: CatalogEntry[]
  currentResolution: IconResolution | null
  onSelect: (imageKey: string) => void
  onReset: () => void
  onClose: () => void
  busy?: boolean
  /** Disables the reset action -- e.g. nothing to reset yet (new item, no pick made). Defaults to `currentResolution?.rung !== 'override'` when omitted. */
  resetDisabled?: boolean
}

function pathToKey(table: ItemTable, path: string): string | null {
  const section = manifest[SECTION[table]] as Record<string, string | null>
  for (const key of Object.keys(section)) {
    if (section[key] === path) return key
  }
  return null
}

export function IconPicker({ table, itemName, catalog, currentResolution, onSelect, onReset, onClose, busy, resetDisabled }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const section = manifest[SECTION[table]] as Record<string, string | null>
  const nameByKey = useMemo(() => Object.fromEntries(catalog.map(c => [c.key, c.name])), [catalog])
  const categoriesByKey = useMemo(() => Object.fromEntries(catalog.map(c => [c.key, c.categories])), [catalog])

  // Every catalogue key that has its own (non-photographic) image — this is the browsable set.
  const availableKeys = useMemo(() => Object.keys(section).filter(k => !!section[k]), [section])

  const allCategories = useMemo(() => {
    const set = new Set<string>()
    for (const k of availableKeys) {
      for (const c of categoriesByKey[k] ?? []) if (!TOP_LEVEL.has(c)) set.add(c)
    }
    return [...set].sort()
  }, [availableKeys, categoriesByKey])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return availableKeys
      .filter(k => {
        if (categoryFilter && !(categoriesByKey[k] ?? []).includes(categoryFilter)) return false
        const label = nameByKey[k] ?? k
        if (q && !label.toLowerCase().includes(q) && !k.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => (nameByKey[a] ?? a).localeCompare(nameByKey[b] ?? b))
  }, [availableKeys, search, categoryFilter, categoriesByKey, nameByKey])

  const currentKey = currentResolution ? pathToKey(table, currentResolution.path) : null
  const currentRungLabel = currentResolution ? RUNG_LABEL[currentResolution.rung] : null
  const borrowedFromName = currentResolution && currentResolution.rung !== 'exact' && currentResolution.rung !== 'override' && currentResolution.rung !== 'fallback' && currentKey
    ? (nameByKey[currentKey] ?? currentKey)
    : null

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: Z.modal, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[3] }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, black 60%, transparent)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: 'min(640px, 92vw)', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          background: HUD.panel, border: `1px solid ${HUD.borderHi}`, borderRadius: RADIUS.lg,
          boxShadow: '0 16px 48px color-mix(in srgb, black 70%, transparent)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: SP[3], borderBottom: `1px solid ${HUD.border}`, display: 'flex', flexDirection: 'column', gap: SP[1] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, color: HUD.text, flex: 1 }}>
              Choose Icon — {itemName}
            </span>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: HUD.textDim, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS.sm }}>✕</button>
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint }}>
            Currently: {currentRungLabel}{borrowedFromName ? ` — from ${borrowedFromName}` : ''}
          </div>
          <div style={{ display: 'flex', gap: SP[2], marginTop: SP[1] }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by name…"
              style={{
                flex: 1, fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text,
                background: 'var(--hud-surface-lo)', border: `1px solid ${HUD.border}`,
                borderRadius: RADIUS.sm, padding: `${SP[1]} ${SP[2]}`,
              }}
            />
            {(() => {
              const disabled = busy || (resetDisabled ?? currentResolution?.rung !== 'override')
              return (
                <button
                  onClick={onReset}
                  disabled={disabled}
                  style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: `0 ${SP[2]}`, borderRadius: RADIUS.sm, border: `1px solid ${HUD.border}`,
                    background: 'transparent', color: HUD.textDim, cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  Reset to automatic
                </button>
              )
            })()}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
            <CategoryChip label="All" active={categoryFilter === null} onClick={() => setCategoryFilter(null)} />
            {allCategories.map(c => (
              <CategoryChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          overflowY: 'auto', padding: SP[3],
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(4.5rem, 1fr))', gap: SP[2],
        }}>
          {filtered.map(key => {
            const path = section[key]!
            const isCurrent = key === currentKey
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                disabled={busy}
                title={nameByKey[key] ?? key}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[1],
                  padding: SP[1], borderRadius: RADIUS.sm,
                  border: `1px solid ${isCurrent ? HUD.gold : HUD.border}`,
                  background: isCurrent ? 'color-mix(in srgb, var(--hud-gold) 10%, transparent)' : 'transparent',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  transition: EASE.quick,
                }}
              >
                <div style={{ width: '2.5rem', height: '2.5rem' }}>
                  <ItemReadoutPlate iconUrl={path} table={table} alt={nameByKey[key] ?? key} size="row" />
                </div>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
                  textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%',
                }}>
                  {nameByKey[key] ?? key}
                </span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, padding: SP[4] }}>
              No images match.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        padding: `1px ${SP[2]}`, borderRadius: RADIUS.full,
        border: `1px solid ${active ? HUD.gold : HUD.border}`,
        background: active ? 'color-mix(in srgb, var(--hud-gold) 15%, transparent)' : 'transparent',
        color: active ? HUD.gold : HUD.textFaint,
        cursor: 'pointer', transition: EASE.quick,
      }}
    >
      {label}
    </button>
  )
}
