'use client'

import { EquipmentImage } from '@/components/ui/EquipmentImage'
import { RichText } from '@/components/ui/RichText'
import type { Character } from '@/lib/types'
import type { UseGmLootReturn, LootItem } from '@/hooks/useGmLoot'
import { HUD, FONT_BODY, RADIUS, Z, panelBase as _panelBase } from '@/lib/tokens'
import { rarityColor, rarityLabel } from '@/lib/styles'

/* ── Design tokens ── */
const FC = FONT_BODY
const FR = FONT_BODY
const TEXT = HUD.text
const DIM  = HUD.textDim
const BORDER    = HUD.border
const BORDER_HI = HUD.borderHi
const RED  = 'var(--state-failure)'
const BLUE = 'var(--die-force)'

const FS_OVERLINE = 'var(--text-overline)'
const FS_CAPTION  = 'var(--text-caption)'
const FS_LABEL    = 'var(--text-label)'
const FS_SM       = 'var(--text-sm)'

const panelBase: React.CSSProperties = {
  ..._panelBase,
  borderRadius: RADIUS.lg,
}
const fieldLabel: React.CSSProperties = {
  fontFamily: FC,
  fontSize: FS_OVERLINE,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: HUD.gold,
  marginBottom: 4,
}
const btnSmall: React.CSSProperties = {
  background: 'rgba(200,170,80,0.08)',
  border: `1px solid rgba(200,170,80,0.2)`,
  color: DIM,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  padding: '4px 10px',
  borderRadius: RADIUS.md,
  cursor: 'pointer',
}
const btnPrimary: React.CSSProperties = {
  background: 'rgba(200,170,80,0.15)',
  border: `1px solid rgba(200,170,80,0.4)`,
  color: HUD.gold,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: RADIUS.md,
  cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  background: 'rgba(90,170,224,0.15)',
  border: `1px solid rgba(90,170,224,0.4)`,
  color: BLUE,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: RADIUS.md,
  cursor: 'pointer',
}
const btnDanger: React.CSSProperties = {
  background: 'rgba(224,80,80,0.15)',
  border: `1px solid rgba(224,80,80,0.4)`,
  color: RED,
  fontFamily: FR,
  fontSize: FS_CAPTION,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  borderRadius: RADIUS.md,
  cursor: 'pointer',
}
const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid rgba(200,170,80,0.25)`,
  color: TEXT,
  fontFamily: FR,
  padding: '6px 10px',
  borderRadius: RADIUS.md,
  outline: 'none',
  fontSize: FS_SM,
}
const darkInputFull: React.CSSProperties  = { ...darkInput, width: '100%' }
const darkInputNarrow: React.CSSProperties = { ...darkInput, width: '5rem', textAlign: 'center' }
const rowFlexWrap: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }

function CornerBrackets() {
  const s: React.CSSProperties = { position: 'absolute', width: 8, height: 8 }
  return (<>
    <div style={{ ...s, top: 0, left: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, top: 0, right: 0, borderTop: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, left: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderLeft: '1px solid rgba(200,170,80,0.35)' }} />
    <div style={{ ...s, bottom: 0, right: 0, borderBottom: '1px solid rgba(200,170,80,0.35)', borderRight: '1px solid rgba(200,170,80,0.35)' }} />
  </>)
}

const badgeStyle = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  padding: '2px 7px', borderRadius: RADIUS.md,
  fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700,
  background: bg, color: fg, whiteSpace: 'nowrap',
})

function LootBadges({ item, size = 'sm' }: { item: LootItem; size?: 'sm' | 'md' }) {
  const badges: React.ReactNode[] = []
  const fs = size === 'md' ? FS_LABEL : FS_OVERLINE
  const pad = '4px 8px'
  const b = (bg: string, fg: string): React.CSSProperties => ({ ...badgeStyle(bg, fg), fontSize: fs, padding: pad })

  if (item.type === 'weapon') {
    const isMelee = ['MELEE', 'BRAWL', 'LTSABER'].includes(item.skill_key || '')
    const isBrawnBased = isMelee && item.damage_add != null
    const dmg = isBrawnBased
      ? `Brawn+${item.damage_add ?? 0}`
      : item.damage != null ? String(item.damage) : null
    if (dmg != null) badges.push(<span key="dmg" style={b('rgba(224,80,80,0.15)', RED)}>DMG {dmg}</span>)
    if (item.crit != null && item.crit > 0) badges.push(<span key="crit" style={b('rgba(224,80,80,0.10)', RED)}>CRIT {item.crit}</span>)
    if (item.range_value) badges.push(<span key="rng" style={b('rgba(200,170,80,0.08)', DIM)}>{item.range_value}</span>)
  }
  if (item.type === 'armor') {
    if (item.defense != null && item.defense > 0) badges.push(<span key="def" style={b('rgba(90,170,224,0.15)', BLUE)}>DEF {item.defense}</span>)
    if (item.soak != null && item.soak > 0) badges.push(<span key="soak" style={b('rgba(90,170,224,0.10)', BLUE)}>SOAK +{item.soak}</span>)
  }
  if (badges.length === 0) return null
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>{badges}</div>
}

export interface GmLootModalProps extends UseGmLootReturn {
  characters: Character[]
  onClose:    () => void
}

export function GmLootModal({
  characters, onClose,
  lootSource, setLootSource,
  lootType, setLootType,
  lootRarityMin, setLootRarityMin,
  lootRarityMax, setLootRarityMax,
  lootSearchText, setLootSearchText,
  lootItems,
  lootSelected, setLootSelected,
  revealItem,
  assignTarget, setAssignTarget,
  lootBusy,
  handleLootBrowse, handleLootRoll,
  handleRevealToPlayers,
  handleAssignLoot, handleDismissReveal,
  setLootAwardItem,
}: GmLootModalProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: Z.modal,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...panelBase,
          width: '100%', maxWidth: 820, maxHeight: '92vh',
          padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
          overflowY: 'auto',
        }}
      >
        <CornerBrackets />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.2em', color: HUD.gold }}>LOOT GENERATOR</div>
          <button onClick={onClose} style={{ ...btnSmall, fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em' }}>CLOSE</button>
        </div>

        {/* Source toggle */}
        <div>
          <div style={{ ...fieldLabel, marginBottom: 8 }}>SOURCE</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Vendor', 'Searching', 'Looted'] as const).map(s => (
              <button key={s} onClick={() => setLootSource(s)} style={{
                ...btnSmall,
                background: lootSource === s ? 'rgba(200,170,80,0.2)' : 'rgba(200,170,80,0.05)',
                color: lootSource === s ? HUD.gold : DIM,
                border: lootSource === s ? `1px solid ${BORDER_HI}` : `1px solid ${BORDER}`,
                fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', padding: '6px 14px',
              }}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div>
          <div style={{ ...fieldLabel, marginBottom: 8 }}>TYPE</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([['all', 'All'], ['weapon', 'Weapons'], ['armor', 'Armor'], ['gear', 'Gear']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setLootType(val as typeof lootType)} style={{
                ...btnSmall,
                background: lootType === val ? 'rgba(200,170,80,0.2)' : 'rgba(200,170,80,0.05)',
                color: lootType === val ? HUD.gold : DIM,
                border: lootType === val ? `1px solid ${BORDER_HI}` : `1px solid ${BORDER}`,
                fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', padding: '6px 14px',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Rarity + search */}
        <div style={rowFlexWrap}>
          <div>
            <div style={{ ...fieldLabel, marginBottom: 6 }}>RARITY MIN</div>
            <input type="number" min={0} max={10} value={lootRarityMin} onChange={e => setLootRarityMin(Number(e.target.value))} style={{ ...darkInputNarrow, width: '64px' }} />
          </div>
          <div>
            <div style={{ ...fieldLabel, marginBottom: 6 }}>RARITY MAX</div>
            <input type="number" min={0} max={10} value={lootRarityMax} onChange={e => setLootRarityMax(Number(e.target.value))} style={{ ...darkInputNarrow, width: '64px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...fieldLabel, marginBottom: 6 }}>NAME SEARCH</div>
            <input
              placeholder="Filter by name..."
              value={lootSearchText}
              onChange={e => setLootSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLootBrowse()}
              style={darkInputFull}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleLootBrowse} disabled={lootBusy} style={{ ...btnPrimary, flex: 1, padding: '10px 0', opacity: lootBusy ? 0.5 : 1 }}>BROWSE</button>
          <button onClick={handleLootRoll} disabled={lootBusy} style={{ ...btnSecondary, flex: 1, padding: '10px 0', opacity: lootBusy ? 0.5 : 1 }}>RANDOM ROLL</button>
        </div>

        {/* Results grid */}
        {lootItems.length > 0 && (
          <div style={{ maxHeight: '16rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {lootItems.map(item => {
              const isSelected = lootSelected?.key === item.key && lootSelected?.type === item.type
              return (
                <div
                  key={`${item.type}-${item.key}`}
                  onClick={() => setLootSelected(item)}
                  style={{
                    ...panelBase,
                    padding: 10, cursor: 'pointer',
                    border: `1px solid ${isSelected ? BORDER_HI : BORDER}`,
                    background: isSelected ? 'rgba(200,170,80,0.08)' : HUD.panel,
                    transition: 'var(--ease-quick)', display: 'flex', gap: 8, alignItems: 'center',
                  }}
                >
                  <EquipmentImage itemKey={item.key} itemType={item.type} categories={item.categories} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FC, fontSize: FS_CAPTION, fontWeight: 700, color: TEXT, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: rarityColor(item.rarity), fontWeight: 700 }}>R{item.rarity}</span>
                      <span style={{ fontFamily: FR, fontSize: FS_CAPTION, color: DIM }}>{item.price}cr</span>
                    </div>
                    <div style={{
                      fontFamily: FR, fontSize: FS_OVERLINE, fontWeight: 600, textTransform: 'uppercase', marginTop: 2,
                      color: item.type === 'weapon' ? RED : item.type === 'armor' ? BLUE : DIM,
                    }}>{item.type}</div>
                    <LootBadges item={item} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {lootItems.length === 0 && !lootBusy && (
          <div style={{ fontFamily: FR, fontSize: FS_SM, color: DIM, textAlign: 'center', padding: 16 }}>
            Use BROWSE or RANDOM ROLL to generate items.
          </div>
        )}

        {/* Selected item preview */}
        {lootSelected && (
          <div style={{ ...panelBase, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <CornerBrackets />
            <button
              onClick={() => setLootSelected(null)}
              aria-label="Close item detail"
              className="hov-gold-text"
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: Z.raised,
                background: 'transparent', border: 'none',
                color: DIM, cursor: 'pointer',
                fontFamily: FR, fontSize: FS_SM, padding: '2px 6px', borderRadius: RADIUS.md,
              }}
            >
              ✕
            </button>
            <EquipmentImage itemKey={lootSelected.key} itemType={lootSelected.type} categories={lootSelected.categories} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FC, fontSize: FS_SM, fontWeight: 700, color: TEXT, letterSpacing: '0.05em' }}>{lootSelected.name}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: rarityColor(lootSelected.rarity), fontWeight: 700 }}>Rarity {lootSelected.rarity} ({rarityLabel(lootSelected.rarity)})</span>
                <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>{lootSelected.price} credits</span>
                <span style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM }}>Enc {lootSelected.encumbrance}</span>
                <span style={{ fontFamily: FR, fontSize: FS_CAPTION, fontWeight: 700, textTransform: 'uppercase', color: lootSelected.type === 'weapon' ? RED : lootSelected.type === 'armor' ? BLUE : DIM }}>{lootSelected.type}</span>
              </div>
              <LootBadges item={lootSelected} size="md" />
              {lootSelected.qualities && lootSelected.qualities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {lootSelected.qualities.map((q, i) => (
                    <span key={i} style={badgeStyle('rgba(200,170,80,0.12)', HUD.gold)}>
                      {q.key}{q.count ? ` ${q.count}` : ''}
                    </span>
                  ))}
                </div>
              )}
              {lootSelected.description && (
                <div style={{ fontFamily: FR, fontSize: FS_LABEL, color: DIM, marginTop: 8, lineHeight: 1.5 }}>
                  <RichText text={lootSelected.description} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => handleRevealToPlayers(lootSelected)}
                  style={{ ...btnPrimary, padding: '8px 16px' }}
                >
                  REVEAL TO PLAYERS
                </button>
                <button
                  onClick={() => setLootAwardItem({ key: lootSelected.key, name: lootSelected.name, type: lootSelected.type, encumbrance: lootSelected.encumbrance })}
                  style={{ ...btnSecondary, padding: '8px 16px' }}
                >
                  AWARD DIRECTLY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reveal assignment row */}
        {revealItem && (
          <div style={{ padding: 12, background: 'rgba(200,170,80,0.07)', border: `1px solid ${BORDER_HI}`, borderRadius: RADIUS.md, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: FC, fontSize: FS_OVERLINE, letterSpacing: '0.1em', color: HUD.gold }}>
              REVEALING: <span style={{ color: TEXT }}>{revealItem.name}</span>
            </div>
            <select value={assignTarget} onChange={e => setAssignTarget(e.target.value)} style={{ ...darkInput, minWidth: 140 }}>
              <option value="">Assign to...</option>
              {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={handleAssignLoot} disabled={!assignTarget || lootBusy} style={{ ...btnPrimary, opacity: assignTarget ? 1 : 0.4 }}>ASSIGN</button>
            <button onClick={handleDismissReveal} style={btnDanger}>DISMISS</button>
          </div>
        )}
      </div>
    </div>
  )
}
