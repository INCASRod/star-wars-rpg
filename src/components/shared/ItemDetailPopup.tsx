'use client'

import { createPortal } from 'react-dom'
import type { EditableItem } from '@/components/gm/ItemEditor'
import { QualityBadge } from '@/components/character/QualityBadge'
import { RichText } from '@/components/ui/RichText'
import { ItemReadoutPlate } from '@/components/shared/ItemReadoutPlate'
import { IconPicker } from '@/components/shared/IconPicker'
import type { IconCatalogEntry } from '@/hooks/useItemIconContext'
import type { ItemTable, IconResolution } from '@/lib/itemIconResolver'
import type { RefWeaponQuality } from '@/lib/types'
import { HUD, FONT_BODY, FS, RADIUS, SP, Z, SHADOW } from '@/lib/tokens'

// ── Tokens (matches ItemDatabaseTab's own local palette exactly) ────────────
const GOLD_DIM = 'rgba(200,170,80,0.5)'
const TEXT     = HUD.text
const DIM      = HUD.textDim
const BORDER   = HUD.border
const RED      = 'var(--state-failure)'
const BLUE     = 'var(--die-force)'

const TYPE_COLOR: Record<string, string> = {
  weapon: RED,
  armor:  BLUE,
  gear:   GOLD_DIM,
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

// Pure-move copy of ItemDatabaseTab.tsx's own local `actionBtn` helper —
// duplicated rather than imported so this file has no dependency back on
// ItemDatabaseTab (a trivial style helper, not shared business logic).
function actionBtn(color: string): React.CSSProperties {
  return {
    fontFamily: FONT_BODY, fontSize: FS.caption, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '0.1875rem 0.5rem', borderRadius: RADIUS.sm, cursor: 'pointer',
    border: `1px solid ${color}44`, color, background: `${color}10`,
  }
}

export interface ItemDetailPopupProps {
  item:           EditableItem
  onClose:        () => void
  resolveIcon:    (table: ItemTable, key: string | null | undefined, categories?: string[] | null) => IconResolution | null
  // Icon-OVERRIDE control (the "Icon" button + IconPicker) — GM-only. Omit
  // all five together to render a read-only popup: `resolveIcon` still shows
  // whichever icon (including a GM's pinned override) is already resolved,
  // it just can't be changed from here. The Market player storefront (The
  // Archive Prompt 3) is the first caller that omits them.
  catalogEntries?: (table: ItemTable) => IconCatalogEntry[]
  pickerOpen?:     boolean
  setPickerOpen?:  (open: boolean) => void
  pickerBusy?:     boolean
  onPickIcon?:     (imageKey: string) => Promise<boolean>
  onResetIcon?:    () => Promise<boolean>
  refQualityMap:  Record<string, RefWeaponQuality>
}

/**
 * Item inspect popup — icon (with an optional GM-only override control),
 * stats, qualities, description. Read/inspect only otherwise: no award, no
 * inventory action, no credit/stock mutation of any kind. Shared by
 * ItemDatabaseTab's Items tab, GmMarketPanel's stock rows, and the player
 * Market storefront — one component, reused, not forked (a per-surface copy
 * would drift).
 *
 * Portaled to document.body: every host renders inside GmShell's or
 * PlayerHUDDesktop's sliding-panel wrapper, which carries an inline
 * `transform` (translateX) at all times — per CSS, that makes the wrapper
 * the containing block for any non-portaled `position:fixed` descendant,
 * which would trap this popup inside the panel's own bounds instead of
 * centering on the real viewport.
 */
export function ItemDetailPopup({
  item, onClose, resolveIcon, catalogEntries,
  pickerOpen, setPickerOpen, pickerBusy, onPickIcon, onResetIcon,
  refQualityMap,
}: ItemDetailPopupProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: Z.modal,
        background: 'color-mix(in srgb, var(--hud-bg) 75%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
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
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
          {(() => {
            const res = resolveIcon(item.type, item.key, item.categories)
            return res && (
              <button
                onClick={() => setPickerOpen?.(true)}
                disabled={!setPickerOpen}
                title={setPickerOpen ? 'Change icon' : undefined}
                style={{ width: '3rem', height: '3rem', flexShrink: 0, padding: 0, background: 'transparent', border: 'none', cursor: setPickerOpen ? 'pointer' : 'default' }}
              >
                <ItemReadoutPlate iconUrl={res.path} table={item.type} refKey={item.key} categories={item.categories} alt={item.name} size="detail" />
              </button>
            )
          })()}
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: TYPE_COLOR[item.type], flexShrink: 0,
          }}>
            {item.type}
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700, color: HUD.text, flex: 1 }}>
            {item.name}
          </span>
          {setPickerOpen && <button onClick={() => setPickerOpen(true)} style={actionBtn(HUD.gold)}>Icon</button>}
          <button onClick={onClose} style={actionBtn(DIM)}>✕</button>
        </div>

        {pickerOpen && catalogEntries && onPickIcon && onResetIcon && setPickerOpen && (
          <IconPicker
            table={item.type}
            itemName={item.name}
            catalog={catalogEntries(item.type)}
            currentResolution={resolveIcon(item.type, item.key, item.categories)}
            onSelect={onPickIcon}
            onReset={onResetIcon}
            onClose={() => setPickerOpen(false)}
            busy={!!pickerBusy}
          />
        )}

        {/* ── Common stats ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
          paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}`,
        }}>
          {[
            ['Price', `${item.price ?? '—'} cr`],
            ['Rarity', item.rarity ?? '—'],
            ['Encumbrance', item.encumbrance ?? '—'],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* ── Type-specific stats ── */}
        {item.type === 'weapon' && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
            paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}`,
          }}>
            {[
              ['Skill', WEAPON_SKILL_NAME[item.skill_key ?? ''] ?? item.skill_key ?? '—'],
              ['Damage', item.damage_add != null ? `Brawn+${item.damage_add}` : String(item.damage ?? '—')],
              ['Crit', item.crit ?? '—'],
              ['Range', (item.range_value ?? '—').replace(/^wr/i, '')],
              ['Hard Points', item.hard_points ?? 0],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        )}
        {item.type === 'armor' && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`,
            paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}`,
          }}>
            {[
              ['Soak bonus', item.soak_bonus ?? 0],
              ['Defense', item.defense ?? 0],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        )}
        {(item.type === 'gear' || item.type === 'armor') && item.encumbrance_bonus && (
          <div style={{ paddingBottom: SP[2], borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encumbrance threshold bonus</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>+{item.encumbrance_bonus}</div>
          </div>
        )}

        {/* ── Qualities ── */}
        {item.qualities && item.qualities.length > 0 && (
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: SP[1] }}>Qualities</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
              {item.qualities.map(q => (
                <QualityBadge key={q.key} quality={q} refQualityMap={refQualityMap} variant="desktop" />
              ))}
            </div>
          </div>
        )}

        {/* ── Description ── */}
        {item.description ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, lineHeight: 1.6 }}>
            <RichText text={item.description} />
          </div>
        ) : (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DIM, fontStyle: 'italic' }}>No description.</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
