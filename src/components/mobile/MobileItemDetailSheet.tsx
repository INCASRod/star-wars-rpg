'use client'

import { useState } from 'react'
import { RichText } from '@/components/ui/RichText'
import type {
  EquipState, EquipSlot, StowLocation, RefWeaponQuality,
  RefItemAttachment, RefItemDescriptor, AttachmentModEntry,
} from '@/lib/types'
import type { EncumbranceStats, EncumbranceSuppressReason } from '@/lib/derivedStats'
import {
  isCyberneticItem, modSubtype, modFitsTarget, parseInstalledAttachments, modKeyLabel,
} from '@/lib/itemCategories'
import { MobileBottomSheet } from './MobileBottomSheet'
import { MobileQualityChips } from './MobileWeaponStep'
import { MobileStowSheet } from './MobileStowSheet'

export interface GearItem {
  id: string
  type: 'weapon' | 'armor' | 'gear'
  refKey: string
  name: string
  iconUrl: string | null
  itemImageUrl: string | null
  equipState: EquipState
  equipSlot: EquipSlot | null
  stowLocation: StowLocation | null
  qty: number
  /** Actual encumbrance this item contributes right now (0 if stowed) — from `EncumbranceStats.perItem[id].cost`. */
  enc: number
  /** Unmodified ref encumbrance (pre worn-reduction), for showing "worn vs carried" when they differ. */
  baseEnc: number
  rarity: number
  price: number
  hardPoints: number
  attachmentsCount: number
  /** Raw character_weapons/armor.attachments jsonb — the Mods section's source. */
  attachments?: unknown[]
  /** ref_weapons.skill_key — the only signal separating a lightsaber from any other weapon. */
  skillKey?: string | null
  /** True only for a cybernetic implant this character has surgically installed. */
  isInstalledCybernetic?: boolean
  description?: string | null
  effectText?: string | null
  loreText?: string | null
  wornAnchor: string | null
  /** ref_*.categories — drives the MOD/CYBERNETIC chips (migration 134). */
  categories?: string[]
  weaponStats?: { damage: string; crit: number; range: string; skillName: string; qualities: { key: string; count?: number | null }[] }
  armorStats?: { soak: number; defense: number }
}

const STATE_ORDER: EquipState[] = ['equipped', 'carrying', 'stowed']
const STATE_LABEL: Record<EquipState, string> = { equipped: 'Equipped', carrying: 'Carried', stowed: 'Stowed' }

/** Verbatim from item-detail-panel.tsx's reasonNote() — same wording, not a
 *  new invention, since this describes the same real rule. */
/** Verbatim behaviour of item-detail-panel.tsx's baseModsText() — same tiered
 *  descriptor -> MOD_KEY_LABEL -> raw-key resolution, so desktop and mobile
 *  never print a mod's effects differently. */
function baseModsText(
  mods: RefItemAttachment['base_mods'],
  refDescriptorMap: Record<string, RefItemDescriptor>,
): string {
  if (!Array.isArray(mods)) return ''
  const parts: string[] = []
  for (const m of mods as AttachmentModEntry[]) {
    if (m?.misc_desc && m.misc_desc.trim()) { parts.push(m.misc_desc.trim()); continue }
    if (!m?.key) continue
    const label = modKeyLabel(m.key, refDescriptorMap[m.key]?.name)
    parts.push(m.count && m.count > 1 ? `${label} ${m.count}` : label)
  }
  return parts.join(' · ')
}

function reasonNote(reason: EncumbranceSuppressReason): string {
  return reason === 'anchor_occupied_armor'
    ? 'Another suit is already worn on this anchor — full encumbrance charged, no worn reduction.'
    : 'Another item already occupies this anchor — no threshold bonus granted while it stays there.'
}

export interface MobileItemDetailSheetProps {
  item: GearItem | null
  onClose: () => void
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  encumbranceStats: EncumbranceStats | null
  campaignId: string | null
  onSetEquipState: (id: string, type: 'weapon' | 'armor' | 'gear', state: EquipState, location?: StowLocation | null, equipSlot?: EquipSlot | null) => void
  onDropWeapon: (id: string) => void
  onDropEquipment: (id: string, type: 'armor' | 'gear') => void
  // ── Mods / cybernetics (migrations 134, 136) ──
  // Same four RPC wrappers the desktop Mods tab uses. All optional so a caller
  // that hasn't threaded them renders the section read-only.
  refAttachmentMap?: Record<string, RefItemAttachment>
  refDescriptorMap?: Record<string, RefItemDescriptor>
  /** The character's loose MOD gear rows, for the "available from inventory" list. */
  looseMods?: GearItem[]
  onInstallMod?: (inventoryRowId: string, targetKind: 'weapon' | 'armor', targetItemId: string) => Promise<{ ok: boolean; warnings: string[] }>
  onUninstallMod?: (targetKind: 'weapon' | 'armor', targetItemId: string, attachmentInstanceId: string) => Promise<{ ok: boolean }>
  onInstallCybernetic?: (gearRowId: string) => Promise<{ ok: boolean; warnings: string[] }>
  onUninstallCybernetic?: (gearRowId: string) => Promise<{ ok: boolean }>
}

export function MobileItemDetailSheet({
  item, onClose, refWeaponQualityMap, encumbranceStats, campaignId,
  onSetEquipState, onDropWeapon, onDropEquipment,
  refAttachmentMap = {}, refDescriptorMap = {}, looseMods = [],
  onInstallMod, onUninstallMod, onInstallCybernetic, onUninstallCybernetic,
}: MobileItemDetailSheetProps) {
  const [actionSheet, setActionSheet] = useState<'stow' | 'drop' | null>(null)
  const [busy, setBusy] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])

  if (!item) return null

  const perItem = encumbranceStats?.perItem[item.id]
  const wornReduction = item.type === 'armor' && item.equipState === 'equipped' && item.enc < item.baseEnc
  const suppressed = perItem?.suppressed ? perItem.reason : null

  const isCybernetic  = isCyberneticItem(item.categories)
  const installedMods = parseInstalledAttachments(item.attachments)
  const hardPointsUsed = installedMods.reduce((sum, e) => sum + (refAttachmentMap[e.key]?.hp_required ?? 0), 0)
  const availableMods = (item.type === 'weapon' || item.type === 'armor')
    ? looseMods.filter(m => modFitsTarget(modSubtype(m.categories), item.type as 'weapon' | 'armor', item.skillKey))
    : []

  async function handleInstallMod(rowId: string) {
    if (!item || !onInstallMod || busy) return
    setBusy(true)
    const res = await onInstallMod(rowId, item.type as 'weapon' | 'armor', item.id)
    setWarnings(res.ok ? res.warnings : [])
    setBusy(false)
  }

  async function handleUninstallMod(instanceId: string) {
    if (!item || !onUninstallMod || busy) return
    setBusy(true)
    await onUninstallMod(item.type as 'weapon' | 'armor', item.id, instanceId)
    setWarnings([])
    setBusy(false)
  }

  async function handleCyberAction() {
    if (!item || busy) return
    setBusy(true)
    if (item.isInstalledCybernetic) {
      await onUninstallCybernetic?.(item.id)
      setWarnings([])
    } else {
      const res = await onInstallCybernetic?.(item.id)
      setWarnings(res?.ok ? res.warnings : [])
    }
    setBusy(false)
  }

  function handleSetState(state: EquipState) {
    if (!item) return
    if (state === 'stowed') { setActionSheet('stow'); return }
    onSetEquipState(item.id, item.type, state)
  }

  function handleConfirmStow(location: StowLocation) {
    if (!item) return
    onSetEquipState(item.id, item.type, 'stowed', location)
  }

  function handleConfirmDrop() {
    if (!item) return
    if (item.type === 'weapon') onDropWeapon(item.id)
    else onDropEquipment(item.id, item.type)
    onClose()
  }

  return (
    <MobileBottomSheet
      open={!!item}
      onClose={onClose}
      collapsedHeight="80dvh"
      expandedHeight="90dvh"
      footer={
        <div className="m-state-btn-row">
          {STATE_ORDER.map(state => (
            <button
              key={state}
              type="button"
              className={`m-state-btn${item.equipState === state ? ' is-current' : ''}`}
              onClick={() => handleSetState(state)}
            >
              {STATE_LABEL[state]}
            </button>
          ))}
        </div>
      }
    >
      <div className="m-detail-plate">
        {item.iconUrl ? (
          <img className="m-detail-plate-icon" src={item.iconUrl} alt="" />
        ) : (
          <span className="m-detail-plate-icon-fallback" aria-hidden="true">
            {item.type === 'weapon' ? '⌖' : item.type === 'armor' ? '⛨' : '◈'}
          </span>
        )}
        <span className="m-detail-plate-meta">
          <span className="m-detail-eyebrow">{item.type} · {STATE_LABEL[item.equipState]}</span>
          <span className="m-detail-name">{item.name}</span>
          {item.weaponStats && <span className="m-detail-sub">{item.weaponStats.skillName}</span>}
        </span>
      </div>

      <div className="m-stat-grid">
        {item.type === 'weapon' && item.weaponStats && (
          <>
            <div className="m-stat-box"><span className="m-stat-label">DMG</span><span className="m-stat-value">{item.weaponStats.damage}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Crit</span><span className="m-stat-value">{item.weaponStats.crit}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Range</span><span className="m-stat-value">{item.weaponStats.range}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Enc</span><span className="m-stat-value">{item.enc}</span></div>
          </>
        )}
        {item.type === 'armor' && item.armorStats && (
          <>
            <div className="m-stat-box"><span className="m-stat-label">Soak</span><span className="m-stat-value">{item.armorStats.soak}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Defense</span><span className="m-stat-value">{item.armorStats.defense}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Enc</span><span className="m-stat-value">{item.enc}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Hard Pts</span><span className="m-stat-value">{item.hardPoints}</span></div>
          </>
        )}
        {item.type === 'gear' && (
          <>
            <div className="m-stat-box"><span className="m-stat-label">Qty</span><span className="m-stat-value">{item.qty}</span></div>
            <div className="m-stat-box"><span className="m-stat-label">Enc</span><span className="m-stat-value">{item.enc}</span></div>
          </>
        )}
      </div>

      {item.weaponStats && item.weaponStats.qualities.length > 0 && (
        <MobileQualityChips qualities={item.weaponStats.qualities} refWeaponQualityMap={refWeaponQualityMap} idPrefix={`detail-${item.id}`} />
      )}

      <div className="m-detail-row">
        <span className="m-detail-row-label">Carried as</span>
        <span className="m-detail-row-value">{STATE_LABEL[item.equipState]}{item.equipState === 'equipped' && item.equipSlot ? ` · ${item.equipSlot}` : ''}</span>
      </div>
      {item.equipState === 'stowed' && item.stowLocation && (
        <div className="m-detail-row">
          <span className="m-detail-row-label">Location</span>
          <span className="m-detail-row-value">{item.stowLocation.name}</span>
        </div>
      )}
      <div className="m-detail-row">
        <span className="m-detail-row-label">Encumbrance</span>
        <span className="m-detail-row-value">
          {wornReduction ? `${item.enc} worn (${item.baseEnc} carried)` : `${item.enc}`}
        </span>
      </div>
      <div className="m-detail-row">
        <span className="m-detail-row-label">Rarity</span>
        <span className="m-detail-row-value">{item.rarity}</span>
      </div>
      <div className="m-detail-row">
        <span className="m-detail-row-label">Value</span>
        <span className="m-detail-row-value">₵{item.price.toLocaleString()}</span>
      </div>

      {/* ── Mods / implants ──────────────────────────────────────────────
          Full parity with the desktop Mods tab (item-detail-panel.tsx):
          installed list, available-from-inventory list, hard-point usage and
          the same non-blocking warnings, all through the same four RPCs. The
          Phase-1 "view only" placeholder this replaced is gone. */}
      {isCybernetic ? (
        <>
          <div className="m-group-label">Implant</div>
          <div className="m-attach-placeholder">
            {item.isInstalledCybernetic
              ? 'Surgically installed. Its effects are applied to this character’s sheet.'
              : 'Carried, not installed. Install it to apply its effects.'}
          </div>
          {warnings.map((w, i) => <div key={i} className="m-ledger-penalty">⚠ {w}</div>)}
          {(onInstallCybernetic || onUninstallCybernetic) && (
            <button type="button" className="m-state-btn" disabled={busy} onClick={handleCyberAction}>
              {item.isInstalledCybernetic ? 'Uninstall' : 'Install'}
            </button>
          )}
        </>
      ) : (item.type === 'weapon' || item.type === 'armor') ? (
        item.hardPoints > 0 ? (
          <>
            <div className="m-detail-row">
              <span className="m-detail-row-label">Hard points</span>
              <span className="m-detail-row-value">{hardPointsUsed} / {item.hardPoints} used</span>
            </div>
            {warnings.map((w, i) => <div key={i} className="m-ledger-penalty">⚠ {w}</div>)}

            <div className="m-group-label">Installed ({installedMods.length})</div>
            {installedMods.length === 0 ? (
              <div className="m-attach-placeholder">No attachments installed.</div>
            ) : installedMods.map((entry, i) => {
              const ref = refAttachmentMap[entry.key]
              return (
                <div key={entry.instance_id ?? `${entry.key}-${i}`} className="m-item-row">
                  <span className="m-item-meta">
                    <span className="m-item-name">{ref?.name ?? entry.key}</span>
                    <span className="m-item-sub">{ref?.hp_required ?? 0} HP · {baseModsText(ref?.base_mods, refDescriptorMap) || '—'}</span>
                  </span>
                  {onUninstallMod && entry.instance_id && (
                    <button
                      type="button" className="m-chip" disabled={busy}
                      onClick={() => handleUninstallMod(entry.instance_id!)}
                    >
                      Uninstall
                    </button>
                  )}
                </div>
              )
            })}

            {onInstallMod && (
              <>
                <div className="m-group-label">Available from inventory ({availableMods.length})</div>
                {availableMods.length === 0 ? (
                  <div className="m-attach-placeholder">No compatible mods carried.</div>
                ) : availableMods.map(m => {
                  const ref = refAttachmentMap[m.refKey]
                  return (
                    <div key={m.id} className="m-item-row">
                      <span className="m-item-meta">
                        <span className="m-item-name">{m.name}</span>
                        <span className="m-item-sub">{ref?.hp_required ?? 0} HP · {baseModsText(ref?.base_mods, refDescriptorMap) || '—'}</span>
                      </span>
                      <button type="button" className="m-chip" disabled={busy} onClick={() => handleInstallMod(m.id)}>
                        Install
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </>
        ) : (
          <div className="m-attach-placeholder">No hard points. This item cannot take attachments.</div>
        )
      ) : null}

      {item.wornAnchor && item.equipState === 'equipped' && (
        <div className="m-anchor-note">
          {suppressed
            ? `⚠ ${reasonNote(suppressed)}`
            : 'Only the first item worn on this anchor gets its full encumbrance benefit — a second item sharing it is charged in full or grants no threshold bonus.'}
        </div>
      )}

      {item.description && (
        <div className="m-detail-desc"><RichText text={item.description} /></div>
      )}
      {item.effectText && (
        <div className="m-detail-desc"><RichText text={item.effectText} /></div>
      )}

      <button type="button" className="m-drop-link" onClick={() => setActionSheet('drop')}>
        Drop this item
      </button>

      <MobileStowSheet
        open={actionSheet !== null}
        onClose={() => setActionSheet(null)}
        mode={actionSheet ?? 'stow'}
        itemName={item.name}
        quantity={item.qty}
        campaignId={campaignId}
        onConfirmStow={handleConfirmStow}
        onConfirmDrop={handleConfirmDrop}
      />
    </MobileBottomSheet>
  )
}
