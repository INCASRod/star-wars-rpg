'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { QualityBadge } from '@/components/character/QualityBadge'
import { RichText } from '@/components/ui/RichText'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import type { Character, RefWeaponQuality } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VendorOffer {
  item: {
    key:               string
    name:              string
    type:              'weapon' | 'armor' | 'gear'
    rarity?:           number
    encumbrance?:      number
    skill_key?:        string
    damage?:           number
    damage_add?:       number | null
    crit?:             number
    range_value?:      string
    qualities?:        { key: string; count?: number | null }[]
    soak?:             number
    soak_bonus?:       number
    defense?:          number
    encumbrance_bonus?: number | null
    description?:      string
  }
  price:      number
  quantity:   number
  campaignId: string
}

interface VendorPurchaseDialogProps {
  offer:              VendorOffer
  character:          Character
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  supabase:           SupabaseClient
  onCreditSpend:      (amount: number, campaignId: string) => Promise<void>
  onClose:            () => void
}

// ─── Skill display names ───────────────────────────────────────────────────────
const SKILL_DISPLAY: Record<string, string> = {
  MELEE: 'Melee', BRAWL: 'Brawl', LTSABER: 'Lightsaber',
  RANGLT: 'Ranged (Light)', RANGHVY: 'Ranged (Heavy)', GUNN: 'Gunnery',
  MECH: 'Mechanics', PILOTPL: 'Piloting (Planetary)', PILOTSP: 'Piloting (Space)',
}

// ─── Rarity colours ───────────────────────────────────────────────────────────
function rarityColor(r: number) {
  if (r <= 2) return 'var(--txt3)'
  if (r <= 4) return 'var(--green)'
  if (r <= 6) return 'var(--blue)'
  if (r <= 8) return '#7B3FA0'
  return 'var(--gold)'
}
function rarityLabel(r: number) {
  if (r <= 2) return 'Common'
  if (r <= 4) return 'Uncommon'
  if (r <= 6) return 'Rare'
  if (r <= 8) return 'Epic'
  return 'Legendary'
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VendorPurchaseDialog({
  offer, character, refWeaponQualityMap, supabase, onCreditSpend, onClose,
}: VendorPurchaseDialogProps) {
  const [busy,    setBusy]    = useState(false)
  const [done,    setDone]    = useState(false)
  const [declined, setDeclined] = useState(false)

  const { item, price, quantity, campaignId } = offer
  const totalCost = price * quantity
  const canAfford = character.credits >= totalCost
  const rarity = item.rarity ?? 0
  const color  = rarityColor(rarity)

  const handlePurchase = async () => {
    if (!canAfford || busy) return
    setBusy(true)

    // Add item(s) to inventory
    if (item.type === 'weapon') {
      // Each weapon is its own row — insert one per quantity
      await supabase.from('character_weapons').insert(
        Array.from({ length: quantity }, () => ({
          character_id: character.id,
          weapon_key:   item.key,
          is_equipped:  false,
          equip_state:  'carrying',
          attachments:  [],
          notes:        'Purchased from vendor',
        }))
      )
    } else if (item.type === 'armor') {
      await supabase.from('character_armor').insert(
        Array.from({ length: quantity }, () => ({
          character_id: character.id,
          armor_key:    item.key,
          is_equipped:  false,
          equip_state:  'carrying',
          attachments:  [],
          notes:        'Purchased from vendor',
        }))
      )
    } else {
      await supabase.from('character_gear').insert({
        character_id: character.id,
        gear_key:     item.key,
        quantity:     quantity,
        is_equipped:  false,
        equip_state:  'carrying',
        notes:        'Purchased from vendor',
      })
    }

    // Deduct credits
    await onCreditSpend(totalCost, campaignId)

    setBusy(false)
    setDone(true)
    setTimeout(onClose, 1800)
  }

  const handleDecline = () => {
    setDeclined(true)
    setTimeout(onClose, 800)
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--sand)',
        border: `3px solid ${color}`,
        boxShadow: `0 0 48px ${color}55, 0 16px 64px rgba(0,0,0,0.5)`,
        padding: '28px 24px 24px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Source label */}
        <div style={{
          fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700,
          letterSpacing: '0.25em', color, marginBottom: 14, textTransform: 'uppercase',
        }}>
          Vendor Offer
        </div>

        {done ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--green)', marginBottom: 8 }}>
              PURCHASED!
            </div>
            <div style={{ fontFamily: 'var(--font-chakra)', fontSize: 'var(--font-sm)', color: 'var(--ink)' }}>
              {item.name} added to your inventory.
            </div>
          </div>
        ) : declined ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--ink)', opacity: 0.5, marginBottom: 8 }}>
              DECLINED
            </div>
          </div>
        ) : (
          <>
            {/* Item image */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <EquipmentImage
                itemKey={item.key}
                itemType={item.type}
                categories={[]}
                size="lg"
                style={{ width: 96, height: 96 }}
              />
            </div>

            {/* Name */}
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 900,
              letterSpacing: '0.06em', color: 'var(--ink)', marginBottom: 4, lineHeight: 1.2,
            }}>
              {quantity > 1 ? `${item.name} ×${quantity}` : item.name}
            </div>

            {/* Rarity */}
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 700,
              color, marginBottom: 14, letterSpacing: '0.1em',
            }}>
              Rarity {rarity} — {rarityLabel(rarity)}
            </div>

            {/* Stats */}
            <div style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 4,
              padding: '10px 12px',
              marginBottom: 12,
              textAlign: 'left',
            }}>
              {item.type === 'weapon' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: item.qualities?.length ? 8 : 0 }}>
                  {item.skill_key && (
                    <StatPill label="Skill" value={SKILL_DISPLAY[item.skill_key] ?? item.skill_key} />
                  )}
                  <StatPill label="Damage" value={item.damage_add != null ? `Brawn+${item.damage_add}` : String(item.damage ?? '—')} />
                  <StatPill label="Crit"   value={String(item.crit ?? '—')} />
                  {item.range_value && <StatPill label="Range" value={item.range_value} />}
                  <StatPill label="ENC"    value={String(item.encumbrance ?? '—')} />
                </div>
              )}
              {item.type === 'armor' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                  <StatPill label="Soak"    value={`+${item.soak ?? 0}${item.soak_bonus ? ` (+${item.soak_bonus})` : ''}`} />
                  <StatPill label="Defense" value={String(item.defense ?? 0)} />
                  <StatPill label="ENC"     value={String(item.encumbrance ?? '—')} />
                </div>
              )}
              {item.type === 'gear' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                  <StatPill label="ENC" value={`${item.encumbrance ?? '—'}${item.encumbrance_bonus ? ` (+${item.encumbrance_bonus} thresh)` : ''}`} />
                </div>
              )}

              {/* Qualities */}
              {item.qualities && item.qualities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {item.qualities.map(q => (
                    <QualityBadge key={q.key} quality={q} refQualityMap={refWeaponQualityMap} variant="desktop" />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div style={{
                fontFamily: 'var(--font-chakra)', fontSize: 'var(--font-xs)', color: 'var(--ink)',
                lineHeight: 1.5, marginBottom: 14, textAlign: 'left',
                maxHeight: 72, overflowY: 'auto',
              }}>
                <RichText text={item.description} />
              </div>
            )}

            {/* Price section */}
            <div style={{
              background: 'rgba(200,170,80,0.08)',
              border: '1px solid rgba(200,170,80,0.3)',
              borderRadius: 4, padding: '12px 14px',
              marginBottom: 18,
            }}>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xl)', fontWeight: 900,
                color: 'var(--gold-d)', letterSpacing: '0.05em', marginBottom: 4,
              }}>
                {totalCost.toLocaleString()} cr
              </div>
              <div style={{ fontFamily: 'var(--font-chakra)', fontSize: 'var(--font-sm)', color: 'var(--ink)', opacity: 0.7 }}>
                Your balance:{' '}
                <span style={{ fontWeight: 700, color: canAfford ? 'var(--ink)' : '#E05050' }}>
                  {character.credits.toLocaleString()} cr
                </span>
                {!canAfford && (
                  <span style={{ color: '#E05050', marginLeft: 6 }}>
                    (need {(totalCost - character.credits).toLocaleString()} more)
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleDecline}
                style={{
                  flex: 1, padding: '12px 0',
                  background: 'transparent',
                  border: '2px solid rgba(0,0,0,0.15)',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
                  fontWeight: 700, letterSpacing: '0.15em', color: 'var(--ink)', opacity: 0.6,
                  cursor: 'pointer', textTransform: 'uppercase',
                }}
              >
                Decline
              </button>
              <button
                onClick={handlePurchase}
                disabled={!canAfford || busy}
                style={{
                  flex: 2, padding: '12px 0',
                  background: canAfford ? 'var(--gold)' : 'rgba(0,0,0,0.1)',
                  border: 'none',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
                  fontWeight: 700, letterSpacing: '0.15em',
                  color: canAfford ? 'var(--white)' : 'rgba(0,0,0,0.3)',
                  cursor: canAfford && !busy ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase',
                  transition: 'opacity 0.15s',
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? 'Processing…' : `Spend ${totalCost.toLocaleString()} cr`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{
        fontFamily: 'var(--font-orbitron)', fontSize: '0.55rem',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(0,0,0,0.4)', marginBottom: 1,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-xs)',
        fontWeight: 700, color: 'var(--ink)',
      }}>
        {value}
      </span>
    </div>
  )
}
