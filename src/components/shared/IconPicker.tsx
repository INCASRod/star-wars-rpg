'use client'
import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import manifest from '../../../public/images/manifest.json'
import { ItemReadoutPlate } from '@/components/shared/ItemReadoutPlate'
import type { ItemTable, IconResolution, IconRung } from '@/lib/itemIconResolver'
import { FONT_BODY, HUD, COLOR, FS, SP, RADIUS, Z, EASE } from '@/lib/tokens'

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
  /** Fires only on explicit Save (grid click just stages a candidate into the preview). Returns whether the write succeeded — the picker closes on true, stays open with the selection intact and shows `error` on false. */
  onSelect: (imageKey: string) => Promise<boolean>
  /** Reset commits immediately (unambiguous, reversible) — same success-gated close as onSelect. */
  onReset: () => Promise<boolean>
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
  const [stagedKey, setStagedKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const stagedPath = stagedKey ? section[stagedKey] ?? null : null
  const canSave = stagedKey !== null && stagedKey !== currentKey
  const busyEffective = !!busy || saving

  const handleSave = async () => {
    if (!stagedKey || !canSave) return
    setSaving(true)
    setError(null)
    const ok = await onSelect(stagedKey)
    setSaving(false)
    if (ok) onClose()
    else setError('Save failed — try again.')
  }

  const handleReset = async () => {
    setSaving(true)
    setError(null)
    const ok = await onReset()
    setSaving(false)
    if (ok) onClose()
    else setError('Reset failed — try again.')
  }

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: Z.modal, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[3] }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, black 60%, transparent)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: 'min(880px, 94vw)', maxHeight: '85vh',
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
              const disabled = busyEffective || (resetDisabled ?? currentResolution?.rung !== 'override')
              return (
                <button
                  onClick={handleReset}
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

        {/* Body — grid + preview pane side by side */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Grid */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: SP[3],
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(4.5rem, 1fr))', gap: SP[2], alignContent: 'start',
          }}>
            {filtered.map(key => {
              const path = section[key]!
              const isCurrent = key === currentKey
              const isStaged = key === stagedKey
              return (
                <button
                  key={key}
                  onClick={() => { setStagedKey(key); setError(null) }}
                  disabled={busyEffective}
                  title={nameByKey[key] ?? key}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[1],
                    padding: SP[1], borderRadius: RADIUS.sm,
                    border: `1px solid ${isStaged ? HUD.gold : isCurrent ? HUD.borderHi : HUD.border}`,
                    background: isStaged ? 'color-mix(in srgb, var(--hud-gold) 15%, transparent)' : isCurrent ? 'color-mix(in srgb, var(--hud-gold) 6%, transparent)' : 'transparent',
                    cursor: busyEffective ? 'not-allowed' : 'pointer',
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

          {/* Preview pane */}
          <div style={{
            width: '14rem', flexShrink: 0, borderLeft: `1px solid ${HUD.border}`,
            padding: SP[3], display: 'flex', flexDirection: 'column', gap: SP[3], overflowY: 'auto',
          }}>
            <PreviewSlot
              label="Current"
              table={table}
              path={currentResolution?.path ?? null}
              name={currentKey ? (nameByKey[currentKey] ?? currentKey) : null}
              rungLabel={currentRungLabel}
            />
            <PreviewSlot
              label="Selected"
              table={table}
              path={stagedPath}
              name={stagedKey ? (nameByKey[stagedKey] ?? stagedKey) : null}
              rungLabel={stagedKey ? 'Pinned by GM (pending save)' : null}
              empty={!stagedKey}
            />
          </div>
        </div>

        {/* Footer — explicit Save/Cancel */}
        <div style={{
          padding: SP[3], borderTop: `1px solid ${HUD.border}`,
          display: 'flex', flexDirection: 'column', gap: SP[2],
        }}>
          {error && (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: COLOR.red }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: SP[2], justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
                padding: `${SP[1]} ${SP[3]}`, borderRadius: RADIUS.sm,
                border: `1px solid ${HUD.border}`, background: 'transparent', color: HUD.textDim,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || busyEffective}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700,
                padding: `${SP[1]} ${SP[3]}`, borderRadius: RADIUS.sm,
                border: `1px solid ${HUD.gold}`,
                background: canSave && !busyEffective ? 'color-mix(in srgb, var(--hud-gold) 20%, transparent)' : 'transparent',
                color: HUD.gold,
                cursor: !canSave || busyEffective ? 'not-allowed' : 'pointer',
                opacity: !canSave || busyEffective ? 0.4 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function PreviewSlot({ label, table, path, name, rungLabel, empty }: { label: string; table: ItemTable; path: string | null; name: string | null; rungLabel: string | null; empty?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: HUD.textFaint }}>
        {label}
      </span>
      <div style={{ width: '6.5rem', height: '6.5rem' }}>
        {path && !empty
          ? <ItemReadoutPlate iconUrl={path} table={table} alt={name ?? undefined} size="detail" />
          : (
            <div style={{
              width: '100%', height: '100%', borderRadius: RADIUS.md,
              border: `1px dashed ${HUD.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, textAlign: 'center', padding: SP[1],
            }}>
              None selected
            </div>
          )}
      </div>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name ?? '—'}
      </span>
      {rungLabel && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
          {rungLabel}
        </span>
      )}
    </div>
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
