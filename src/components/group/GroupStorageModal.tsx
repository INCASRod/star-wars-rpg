'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { HUD, COLOR, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, SHADOW, Z } from '@/lib/tokens'
import { useGroupStorage, type GroupStorageItem } from '@/hooks/useGroupStorage'

const TYPE_COLOR: Record<string, string> = {
  weapon: COLOR.red,
  armor:  COLOR.blue,
  gear:   'var(--hud-accent)',
}
const TYPE_ICON: Record<string, string> = { weapon: '⚔', armor: '◈', gear: '◆' }

const WEAPON_SKILL_LABEL: Record<string, string> = {
  BRAWL: 'Brawl', MELEE: 'Melee', LTSABER: 'Lightsaber',
  RANGLT: 'Ranged (Lt)', RANGHVY: 'Ranged (Hvy)', GUNN: 'Gunnery',
}

interface GroupStorageModalProps {
  assetId:     string
  assetName:   string
  characterId: string | null
  onClose:     () => void
}

export function GroupStorageModal({ assetId, assetName, characterId, onClose }: GroupStorageModalProps) {
  const { items, loading, taking, takeItem } = useGroupStorage(assetId)
  const [expandedTakeId, setExpandedTakeId] = useState<string | null>(null)
  const [takeQtyDraft,   setTakeQtyDraft]   = useState(1)
  const [viewingItem,    setViewingItem]    = useState<GroupStorageItem | null>(null)

  function statSummary(item: GroupStorageItem): string {
    if (item.itemType === 'weapon') {
      const dmg = item.damageAdd != null ? `Brawn+${item.damageAdd}` : String(item.damage ?? '—')
      return `Dmg ${dmg} · Crit ${item.crit ?? '—'}`
    }
    if (item.itemType === 'armor') return `Soak +${item.soakBonus ?? 0} · Def ${item.defense ?? 0}`
    return `Enc ${item.encumbrance}`
  }

  function handleTakeClick(item: GroupStorageItem) {
    if (!characterId) return
    if (item.itemType === 'gear' && (item.qty ?? 1) > 1) {
      setTakeQtyDraft(1)
      setExpandedTakeId(item.id)
    } else {
      takeItem(item.id, item.itemType, characterId)
    }
  }

  const portal = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: Z.overlay,
          background: 'color-mix(in srgb, black 70%, transparent)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: Z.modal,
          width: 'min(560px, 94vw)', maxHeight: '82vh',
          background: HUD.panel,
          border: `1px solid ${HUD.borderHi}`,
          borderRadius: RADIUS.lg,
          boxShadow: SHADOW.lg,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: `${SP[4]} ${SP[5]} ${SP[3]}`,
          borderBottom: `1px solid ${HUD.border}`,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP[3],
        }}>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color: 'var(--hud-gold)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
              Group Storage
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], marginTop: SP[1] }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700, color: HUD.text }}>
                {assetName}
              </span>
              {!loading && (
                <span style={{
                  fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                  color: 'var(--hud-accent)',
                  background: 'color-mix(in srgb, var(--hud-accent) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--hud-accent) 30%, transparent)',
                  borderRadius: RADIUS.full,
                  padding: `1px ${SP[2]}`,
                }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${HUD.border}`,
              borderRadius: RADIUS.sm,
              cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim,
              padding: `${SP[1]} ${SP[2]}`,
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: `${SP[3]} ${SP[5]}` }}>
          {loading ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, textAlign: 'center' as const, padding: SP[6] }}>
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, fontStyle: 'italic' as const, textAlign: 'center' as const, padding: SP[6] }}>
              Nothing stored here yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: SP[2] }}>
              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: SP[3],
                    padding: `${SP[2]} ${SP[3]}`,
                    background: HUD.bg,
                    border: `1px solid ${HUD.border}`,
                    borderRadius: RADIUS.md,
                  }}
                >
                  {/* Type icon */}
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: TYPE_COLOR[item.itemType], flexShrink: 0, textAlign: 'center' as const }}>
                    {TYPE_ICON[item.itemType]}
                  </span>

                  {/* Name + stats + owner */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: SP[2], flexWrap: 'wrap' as const }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.text }}>
                        {item.name}
                        {item.itemType === 'gear' && item.qty && item.qty > 1 && (
                          <span style={{ fontWeight: 400, color: HUD.textDim }}> ×{item.qty}</span>
                        )}
                      </span>
                      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim }}>
                        {statSummary(item)}
                      </span>
                    </div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
                      Stowed by {item.ownerName}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: SP[2], flexShrink: 0, alignItems: 'center' }}>
                    <button
                      onClick={() => setViewingItem(item)}
                      style={{
                        background: `color-mix(in srgb, ${TYPE_COLOR[item.itemType]} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${TYPE_COLOR[item.itemType]} 40%, transparent)`,
                        borderRadius: RADIUS.sm, cursor: 'pointer',
                        fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                        color: TYPE_COLOR[item.itemType], padding: `${SP[1]} ${SP[2]}`,
                      }}
                    >
                      View
                    </button>

                    {expandedTakeId === item.id ? (
                      <div style={{ display: 'flex', gap: SP[1], alignItems: 'center' }}>
                        <button
                          onClick={() => setTakeQtyDraft(q => Math.max(1, q - 1))}
                          style={{ background: 'transparent', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, cursor: 'pointer', color: HUD.text, fontFamily: FONT_BODY, fontSize: FS.sm, padding: `${SP[1]} ${SP[2]}` }}
                        >−</button>
                        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.text, minWidth: 48, textAlign: 'center' as const }}>
                          {takeQtyDraft} of {item.qty}
                        </span>
                        <button
                          onClick={() => setTakeQtyDraft(q => Math.min(item.qty ?? 1, q + 1))}
                          style={{ background: 'transparent', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, cursor: 'pointer', color: HUD.text, fontFamily: FONT_BODY, fontSize: FS.sm, padding: `${SP[1]} ${SP[2]}` }}
                        >+</button>
                        <button
                          onClick={() => {
                            if (characterId) takeItem(item.id, 'gear', characterId, takeQtyDraft)
                            setExpandedTakeId(null)
                          }}
                          style={{
                            background: 'color-mix(in srgb, var(--hud-accent) 14%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)',
                            borderRadius: RADIUS.sm, cursor: 'pointer',
                            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                            color: 'var(--hud-gold)', padding: `${SP[1]} ${SP[2]}`,
                          }}
                        >CONFIRM</button>
                        <button
                          onClick={() => setExpandedTakeId(null)}
                          style={{ background: 'transparent', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, cursor: 'pointer', color: HUD.textDim, fontFamily: FONT_BODY, fontSize: FS.overline, padding: `${SP[1]} ${SP[2]}` }}
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTakeClick(item)}
                        disabled={!characterId || taking.has(item.id)}
                        style={{
                          background: `color-mix(in srgb, ${COLOR.green} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${COLOR.green} 40%, transparent)`,
                          borderRadius: RADIUS.sm,
                          cursor: characterId && !taking.has(item.id) ? 'pointer' : 'not-allowed',
                          opacity: !characterId || taking.has(item.id) ? 0.45 : 1,
                          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
                          color: COLOR.green, padding: `${SP[1]} ${SP[2]}`,
                        }}
                      >
                        {taking.has(item.id) ? '…' : 'TAKE'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item detail popup */}
      {viewingItem && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: Z.tooltip, background: 'color-mix(in srgb, var(--hud-bg) 75%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' as const }}
          onClick={() => setViewingItem(null)}
        >
          <div
            style={{ background: HUD.panel, border: `1px solid ${HUD.borderHi}`, borderRadius: RADIUS.lg, padding: SP[4], width: 'min(480px, 90vw)', maxHeight: '80vh', overflowY: 'auto', boxShadow: SHADOW.lg, display: 'flex', flexDirection: 'column' as const, gap: SP[3] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: TYPE_COLOR[viewingItem.itemType], flexShrink: 0 }}>
                {viewingItem.itemType}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700, color: HUD.text, flex: 1 }}>
                {viewingItem.name}
              </span>
              <button onClick={() => setViewingItem(null)} style={{ background: 'transparent', border: `1px solid ${HUD.border}`, borderRadius: RADIUS.sm, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, padding: `${SP[1]} ${SP[2]}` }}>✕</button>
            </div>

            {/* Common stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`, paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}` }}>
              {([['Rarity', viewingItem.rarity], ['Encumbrance', viewingItem.encumbrance]] as [string, number][]).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{label}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Weapon stats */}
            {viewingItem.itemType === 'weapon' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`, paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}` }}>
                {([
                  ['Skill',   WEAPON_SKILL_LABEL[viewingItem.skillKey ?? ''] ?? viewingItem.skillKey ?? '—'],
                  ['Damage',  viewingItem.damageAdd != null ? `Brawn+${viewingItem.damageAdd}` : String(viewingItem.damage ?? '—')],
                  ['Crit',    String(viewingItem.crit ?? '—')],
                  ['Range',   (viewingItem.range ?? '—')],
                  ['HP',      String(viewingItem.hardPoints ?? 0)],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{label}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Armor stats */}
            {viewingItem.itemType === 'armor' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${SP[1]} ${SP[3]}`, paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}` }}>
                {([
                  ['Soak Bonus', String(viewingItem.soakBonus ?? 0)],
                  ['Defense',   String(viewingItem.defense ?? 0)],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{label}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Gear encumbrance bonus */}
            {viewingItem.itemType === 'gear' && viewingItem.encumbranceBonus != null && (
              <div style={{ paddingBottom: SP[2], borderBottom: `1px solid ${HUD.border}` }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Enc Threshold Bonus</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, fontWeight: 600 }}>+{viewingItem.encumbranceBonus}</div>
              </div>
            )}

            {/* Description */}
            {viewingItem.description
              ? <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, lineHeight: 1.6 }}>{viewingItem.description}</div>
              : <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, fontStyle: 'italic' as const }}>No description.</div>
            }
          </div>
        </div>
      )}
    </>
  )

  if (typeof window === 'undefined') return null
  return createPortal(portal, document.body)
}
