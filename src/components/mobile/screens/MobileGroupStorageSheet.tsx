'use client'

import { useState } from 'react'
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet'
import { useGroupStorage, GroupStorageItem } from '@/hooks/useGroupStorage'
import { COLOR, FONT_BODY, FONT_DISPLAY, FS, HUD, RADIUS, SP } from '@/lib/tokens'

// ── Props ──────────────────────────────────────────────────────────────────────

interface MobileGroupStorageSheetProps {
  assetId:   string | null
  assetName: string
  isOpen:    boolean
  onClose:   () => void
  takerId:   string
}

// ── Item type display metadata ─────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  weapon: '⚔',
  armor:  '◈',
  gear:   '◆',
}

const TYPE_COLOR: Record<string, string> = {
  weapon: COLOR.red,
  armor:  COLOR.blue,
  gear:   'var(--hud-accent)',
}

// ── Stat summary builder ────────────────────────────────────────────────────────

function buildStatSummary(item: GroupStorageItem): string {
  if (item.itemType === 'weapon') {
    const dmgStr = item.damageAdd != null
      ? `Dmg +${item.damageAdd}`
      : item.damage != null
        ? `Dmg ${item.damage}`
        : null
    const critStr = item.crit != null ? `Crit ${item.crit}` : null
    const rangeStr = item.range ? item.range : null
    return [dmgStr, critStr, rangeStr].filter(Boolean).join(' · ') || `Enc ${item.encumbrance}`
  }
  if (item.itemType === 'armor') {
    const parts: string[] = []
    if (item.soakBonus) parts.push(`Soak +${item.soakBonus}`)
    if (item.defense)   parts.push(`Def ${item.defense}`)
    parts.push(`Enc ${item.encumbrance}`)
    return parts.join(' · ')
  }
  // gear
  return `Enc ${item.encumbrance}`
}

// ── StorageItemRow ─────────────────────────────────────────────────────────────

interface StorageItemRowProps {
  item:     GroupStorageItem
  taking:   Set<string>
  takerId:  string
  takeItem: (itemId: string, itemType: 'weapon' | 'armor' | 'gear', takerId: string, qty?: number) => Promise<void>
}

function StorageItemRow({ item, taking, takerId, takeItem }: StorageItemRowProps) {
  const [confirm,    setConfirm]    = useState(false)
  const [qty,        setQty]        = useState(1)
  const [takeError,  setTakeError]  = useState<string | null>(null)

  const isStackable = item.itemType === 'gear' && (item.qty ?? 1) > 1
  const isThisTaking = taking.has(item.id)
  const isAnyTaking  = taking.size > 0

  const typeColor = TYPE_COLOR[item.itemType] ?? HUD.textDim
  const statSummary = buildStatSummary(item)

  async function handleConfirm() {
    setTakeError(null)
    try {
      await takeItem(item.id, item.itemType, takerId, isStackable ? qty : undefined)
      setConfirm(false)
      setQty(1)
      setTakeError(null)
    } catch (err) {
      setTakeError(err instanceof Error ? err.message : 'Take failed')
    }
  }

  function handleTakeClick() {
    setConfirm(true)
    if (isStackable) setQty(1)
  }

  function handleCancel() {
    setConfirm(false)
    setQty(1)
    setTakeError(null)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: SP[2],
      padding: `${SP[2]} 0`,
      borderBottom: `1px solid var(--hud-border)`,
    }}>
      {/* Left column — item info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' /* geometry minimum */ }}>
        {/* Name row with type icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: typeColor, flexShrink: 0 }}>
            {TYPE_ICON[item.itemType] ?? '◇'}
          </span>
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: FS.sm, color: HUD.text, fontWeight: 700,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.name}
          </span>
          {(item.qty ?? 1) > 1 && (
            <span style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, flexShrink: 0,
            }}>
              ×{item.qty}
            </span>
          )}
        </div>
        {/* Sub-row: owner · stats */}
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
          <span>{item.ownerName}</span>
          <span style={{ color: HUD.textFaint }}> · </span>
          <span style={{ color: HUD.textDim }}>{statSummary}</span>
        </div>
        {/* Error state */}
        {takeError && (
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: '#E85A2A', /* wounds/danger — sealed exception */
            letterSpacing: '0.08em',
            marginTop: '2px', /* geometry minimum */
          }}>
            {takeError}
          </div>
        )}
      </div>

      {/* Right column — action buttons */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: SP[1] }}>
        {!confirm ? (
          <button
            disabled={isAnyTaking}
            onClick={handleTakeClick}
            aria-label={`Take ${item.name}`}
            style={{
              padding: `1px ${SP[2]}`, /* 1px vertical — geometry minimum */
              fontFamily: FONT_DISPLAY, fontSize: FS.overline,
              color: 'var(--hud-accent)',
              background: 'color-mix(in srgb, var(--hud-accent) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)',
              borderRadius: RADIUS.sm,
              cursor: isAnyTaking ? 'not-allowed' : 'pointer',
              opacity: isAnyTaking ? 0.4 : 1,
              letterSpacing: '0.08em',
            }}
          >
            TAKE
          </button>
        ) : (
          <>
            {/* Qty stepper — only for stackable gear */}
            {isStackable && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' /* geometry minimum */ }}>
                <button
                  disabled={qty <= 1 || isAnyTaking}
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label={`Decrease quantity, currently ${qty}`}
                  style={{
                    width: 24, height: 24, /* fixed stepper geometry */
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FONT_BODY, fontSize: FS.sm,
                    color: HUD.textDim,
                    background: `color-mix(in srgb, var(--hud-border) 60%, transparent)`,
                    border: `1px solid var(--hud-border)`,
                    borderRadius: RADIUS.sm,
                    cursor: qty <= 1 || isAnyTaking ? 'not-allowed' : 'pointer',
                    opacity: qty <= 1 ? 0.4 : 1,
                  }}
                >
                  −
                </button>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: FS.sm, color: HUD.text,
                  minWidth: 20, textAlign: 'center',
                }}>
                  {qty}
                </span>
                <button
                  disabled={qty >= (item.qty ?? 1) || isAnyTaking}
                  onClick={() => setQty(q => Math.min(item.qty ?? 1, q + 1))}
                  aria-label={`Increase quantity, currently ${qty}`}
                  style={{
                    width: 24, height: 24, /* fixed stepper geometry */
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FONT_BODY, fontSize: FS.sm,
                    color: HUD.textDim,
                    background: `color-mix(in srgb, var(--hud-border) 60%, transparent)`,
                    border: `1px solid var(--hud-border)`,
                    borderRadius: RADIUS.sm,
                    cursor: qty >= (item.qty ?? 1) || isAnyTaking ? 'not-allowed' : 'pointer',
                    opacity: qty >= (item.qty ?? 1) ? 0.4 : 1,
                  }}
                >
                  +
                </button>
              </div>
            )}
            {/* Confirm / Cancel buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
              <button
                disabled={isAnyTaking}
                onClick={handleConfirm}
                aria-label={`Confirm take ${isStackable ? `${qty}× ` : ''}${item.name}`}
                style={{
                  padding: `1px ${SP[2]}`, /* 1px vertical — geometry minimum */
                  fontFamily: FONT_DISPLAY, fontSize: FS.overline,
                  color: COLOR.green,
                  background: `color-mix(in srgb, ${COLOR.green} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${COLOR.green} 35%, transparent)`,
                  borderRadius: RADIUS.sm,
                  cursor: isAnyTaking ? 'not-allowed' : 'pointer',
                  opacity: isThisTaking ? 0.4 : 1,
                  letterSpacing: '0.08em',
                }}
              >
                {isThisTaking ? '…' : '✓ CONFIRM'}
              </button>
              <button
                disabled={isAnyTaking}
                onClick={handleCancel}
                aria-label="Cancel"
                style={{
                  background: 'transparent', border: 'none',
                  fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
                  cursor: isAnyTaking ? 'not-allowed' : 'pointer',
                  padding: `1px ${SP[1]}`, /* 1px vertical — geometry minimum */
                }}
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── MobileGroupStorageSheet ────────────────────────────────────────────────────

export function MobileGroupStorageSheet({
  assetId,
  assetName,
  isOpen,
  onClose,
  takerId,
}: MobileGroupStorageSheetProps) {
  const { items, loading, taking, takeItem } = useGroupStorage(isOpen ? assetId : null)

  return (
    <MobileBottomSheet
      open={isOpen}
      onClose={onClose}
      expandedHeight="90dvh"
      collapsedHeight="60dvh"
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: SP[2],
        marginBottom: SP[2],
      }}>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.body, color: HUD.text, fontWeight: 700,
          flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {assetName}
        </span>
        {!loading && (
          <span style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: 'var(--hud-accent)',
            background: 'color-mix(in srgb, var(--hud-accent) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)',
            borderRadius: RADIUS.sm,
            padding: `1px ${SP[1]}`, /* 1px vertical — geometry minimum */
            flexShrink: 0,
            letterSpacing: '0.08em',
          }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: SP[4],
        }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>
            Loading…
          </span>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: SP[4],
        }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>
            Storage is empty.
          </span>
        </div>
      )}

      {/* Item list */}
      {!loading && items.length > 0 && (
        <div>
          {items.map(item => (
            <StorageItemRow
              key={item.id}
              item={item}
              taking={taking}
              takerId={takerId}
              takeItem={takeItem}
            />
          ))}
        </div>
      )}
    </MobileBottomSheet>
  )
}
