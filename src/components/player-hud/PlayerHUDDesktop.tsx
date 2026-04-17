'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useCharacterData } from '@/hooks/useCharacterData'
import { LoreContent } from '@/components/character/LoreContent'
import { TalentTree, type TalentTreeNode, type TalentTreeConnection } from '@/components/character/TalentTree'
import { ForcePowerTree, type ForceTreeNode, type ForceTreeConnection } from '@/components/character/ForcePowerTree'
import {
  C, CHAR_COLOR, CHAR_ABBR3, CHAR_REF_MAP,
  FONT_CINZEL, FONT_RAJDHANI, panelBase,
  FS_OVERLINE, FS_CAPTION, FS_LABEL, FS_SM, FS_H4, FS_H3,
  type CharKey,
} from './design-tokens'
import { rollPool, getSkillPool, type RollResult } from './dice-engine'
import { CharacterAvatar } from './CharacterAvatar'
import { DiceModal } from './DiceModal'
import { FloatingDiceRollerFAB } from './FloatingDiceRollerFAB'
import { SkillsPanel, type HudSkill } from './SkillsPanel'
import { SkillRollPopover } from '@/components/character/SkillRollPopover'
import { TalentsPanel, type HudTalent } from './TalentsPanel'
import { InventoryPanel, type WpnDisplay, type ArmDisplay, type GearRow } from './InventoryPanel'
import { ForcePanel, type ForcePowerDisplay, type ConflictEntry } from './ForcePanel'
import { isForceUserSensitive } from '@/lib/forceUtils'
import { ForceRollModal } from './ForceRollModal'
import { rollForceDice, type ForceRollResult } from './dice-engine'
import { CombatCheckOverlay } from '@/components/combat-check/CombatCheckOverlay'
import { CombatCheckButton } from '@/components/character/CombatCheckButton'
import { ForceCheckOverlay } from '@/components/force-check/ForceCheckOverlay'
import { ForceCheckButton } from '@/components/character/ForceCheckButton'
import { isDathomiri } from '@/lib/dathomiriUtils'
import { CombatTransition } from './CombatTransition'
import { RollFeedPanel, RollFeedMini } from './RollFeedPanel'
import { RANGE_LABELS, ACTIVATION_LABELS, type Character, type CharacterSpecialization, type RefSpecialization, type SpeciesAbility } from '@/lib/types'
import { parseOggDudeMarkup } from '@/lib/oggdude-markup'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { useSessionMode } from '@/hooks/useSessionMode'
import { useRollFeed } from '@/hooks/useRollFeed'
import { logRoll, type RollMeta } from '@/lib/logRoll'
import { DerivedStatsPanel } from '@/components/wireframe/DerivedStatsPanel'
import { TalentsPanel as WfTalentsPanel } from '@/components/wireframe/TalentsPanel'
import { InitiativeRollModal } from './InitiativeRollModal'
import { useSessionRollState, getWoundThresholdBonus } from '@/hooks/useSessionRollState'
import { SessionStatusBanner } from '@/components/player/SessionStatusBanner'
import { useDerivedStats } from '@/hooks/useDerivedStats'
import { CriticalInjuryPips, type CritPip } from '@/components/character/CriticalInjuryPip'
import { CriticalInjuryModal } from '@/components/character/CriticalInjuryModal'
import { DestinyPoolDisplay, type DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import { DestinyRollModal } from '@/components/destiny/DestinyRollModal'
import { DestinySpendConfirmModal } from '@/components/destiny/DestinySpendConfirmModal'
import { DestinyGMFlash, DestinyConsideringBanner } from '@/components/destiny/DestinyGMFlash'
import { EncumbranceBar } from '@/components/character/EncumbranceBar'
import type { CriticalInjuryRequest } from '@/lib/types'
import { useActiveMap } from '@/hooks/useActiveMap'
import { useMapTokens } from '@/hooks/useMapTokens'
import { MapCanvas } from '@/components/map/MapCanvas'
import { useEncounterState } from '@/hooks/useEncounterState'
import { VendorPurchaseDialog, type VendorOffer } from './VendorPurchaseDialog'
import { TalentQuickReference } from '@/components/player/TalentQuickReference'
import { AdversaryCardList } from '@/components/player/AdversaryCardList'
import { VehicleCardList } from '@/components/player/VehicleCardList'
import { InitiativeStrip } from '@/components/player/InitiativeStrip'
import { generateCharacterSheetPDF, type CharacterSheetInput } from '@/lib/characterSheetPDF'
import { SpecSelectorList } from '@/components/shared/SpecSelectorList'
import { buildTalentTree as _buildTalentTree } from '@/lib/buildTalentTree'
import { GroupSheet } from '@/components/group/GroupSheet'

const CHAR_TO_FIELD: Record<string, keyof Character> = {
  BR: 'brawn', AG: 'agility', INT: 'intellect', CUN: 'cunning', WIL: 'willpower', PR: 'presence',
}

interface PlayerHUDDesktopProps {
  characterId: string
  isGmMode?:   boolean
  campaignId?: string | null
}

// ── Corner brackets decoration ──────────────────────────────
function CornerBrackets({ color = C.gold, size = 6 }: { color?: string; size?: number }) {
  const s: React.CSSProperties = { position: 'absolute', width: size, height: size }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

// ── Background scanline / hex grid / glows ──────────────────
function BackgroundEffects() {
  const hexSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="52"><polygon points="30,1 59,16 59,36 30,51 1,36 1,16" fill="none" stroke="#C8AA50" stroke-width="0.5"/></svg>`
  )
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent 2px, rgba(0,0,0,0.025) 4px)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: `url("data:image/svg+xml,${hexSvg}")` }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '40%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 0% 0%, rgba(78,200,122,0.04) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40%', height: '40%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 100% 100%, rgba(200,170,80,0.06) 0%, transparent 70%)' }} />
    </>
  )
}

// ── Compact vital bar for top bar ───────────────────────────
function CompactVital({ label, current, threshold, bonus = 0, color }: { label: string; current: number; threshold: number; bonus?: number; color: string }) {
  const effective = threshold + bonus
  const pct = effective > 0 ? Math.min((current / effective) * 100, 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, color: C.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_OVERLINE, color }}>{current}/{threshold}</span>
          {bonus > 0 && <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', color: C.gold }}>+{bonus}</span>}
        </span>
      </div>
      <div style={{ height: 5, background: C.textFaint, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

// ── Full vital bar for left column ──────────────────────────
function VitalBar({ label, current, threshold, bonus = 0, color, onInc, onDec }: {
  label: string; current: number; threshold: number; bonus?: number; color: string
  onInc?: () => void; onDec?: () => void
}) {
  const effective = threshold + bonus
  const pct = effective > 0 ? Math.min((current / effective) * 100, 100) : 0
  const overLimit = current >= effective
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {onDec && <button onClick={onDec} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 16, height: 16, cursor: 'pointer', color: C.textDim, fontSize: FS_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>}
          <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: overLimit ? '#E05050' : color, fontWeight: 700 }}>{current}/{threshold}</span>
          {bonus > 0 && <span style={{ fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', color: C.gold }}>+{bonus}</span>}
          {onInc && <button onClick={onInc} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, width: 16, height: 16, cursor: 'pointer', color: C.textDim, fontSize: FS_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>}
        </div>
      </div>
      <div style={{ height: 6, background: C.textFaint, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: 'width .3s' }} />
      </div>
      {/* Pip row — base pips + bonus pips in gold */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.from({ length: threshold }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: 2,
            background: i < current ? color : 'transparent',
            border: `1px solid ${i < current ? color : C.textFaint}`,
            transition: '.15s',
          }} />
        ))}
        {bonus > 0 && Array.from({ length: bonus }).map((_, i) => (
          <div key={`bonus-${i}`} style={{
            width: 8, height: 8, borderRadius: 2,
            background: (threshold + i) < current ? C.gold : 'transparent',
            border: `1px solid ${C.gold}60`,
            transition: '.15s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Characteristic square ────────────────────────────────────
function CharStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 6, flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}44`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 12px ${color}18`,
    }}>
      <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, color: `${color}BB`, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ── Section label ────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      color: C.textDim, marginBottom: 8, paddingBottom: 4,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {text}
    </div>
  )
}

// ── Tab component ────────────────────────────────────────────
type TabName = 'Skills' | 'Talents' | 'Inventory' | 'Force' | 'Lore' | 'Feed' | 'Session' | 'Group'

const FORCE_TAB_BLUE   = '#7EC8E3'
const FORCE_TAB_PURPLE = '#8B2BE2'
const GROUP_TAB_COLOR  = '#8EC8F0'

function TabBar({ active, onChange, hasCombat, isForceUser, isForceUserFallen, isCombatActive }: { active: TabName; onChange: (t: TabName) => void; hasCombat?: boolean; isForceUser?: boolean; isForceUserFallen?: boolean; isCombatActive?: boolean }) {
  const allTabs: TabName[] = ['Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Feed', 'Session', 'Group']
  const tabs = allTabs.filter(t => {
    if (t === 'Force') return !!isForceUser
    return true
  })
  return (
    <div style={{
      display: 'flex', borderBottom: `1px solid ${C.border}`,
      paddingLeft: 16, gap: 2, flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isFeed       = tab === 'Feed'
        const isForceTab   = tab === 'Force'
        const isSessionTab = tab === 'Session'
        const isGroupTab   = tab === 'Group'
        const forceColor   = isForceUserFallen ? FORCE_TAB_PURPLE : FORCE_TAB_BLUE
        const sessionColor = isCombatActive ? '#E53E3E' : '#52C8A0'
        const tabColor     = isForceTab
          ? forceColor
          : isSessionTab ? sessionColor
          : isGroupTab   ? GROUP_TAB_COLOR
          : (isFeed && hasCombat) ? '#E05050' : C.gold
        const dimColor     = isForceTab
          ? (isForceUserFallen ? 'rgba(139,43,226,0.45)' : 'rgba(126,200,227,0.45)')
          : isSessionTab ? (isCombatActive ? 'rgba(229,62,62,0.45)' : 'rgba(82,200,160,0.45)')
          : isGroupTab   ? 'rgba(142,200,240,0.45)'
          : isFeed && hasCombat ? '#E0505088' : C.textDim
        const sessionIcon  = isCombatActive ? '⚔' : '◉'
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${active === tab ? tabColor : 'transparent'}`,
              padding: '10px 14px', cursor: 'pointer',
              fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 600, letterSpacing: '0.08em',
              color: active === tab ? tabColor : dimColor,
              transition: '.15s', marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 5,
              textShadow: isForceTab && active === tab
                ? (isForceUserFallen ? '0 0 8px rgba(139,43,226,0.6)' : '0 0 10px rgba(126,200,227,0.4)')
                : isSessionTab && active === tab && !isCombatActive ? '0 0 10px rgba(82,200,160,0.4)'
                : isSessionTab && active === tab && isCombatActive ? '0 0 10px rgba(229,62,62,0.4)'
                : 'none',
            }}
          >
            {isGroupTab && (
              <img
                src="/images/factions/rebel.png"
                alt=""
                style={{
                  width: 14, height: 14,
                  filter: `invert(1) hue-rotate(20deg) opacity(${active === tab ? 1 : 0.45})`,
                  mixBlendMode: 'screen',
                  transition: 'filter .15s',
                }}
              />
            )}
            {isSessionTab ? `${sessionIcon} SESSION` : isGroupTab ? 'GROUP' : tab}
          </button>
        )
      })}
    </div>
  )
}

// ── BuySpecButton ─────────────────────────────────────────────
function BuySpecButton({
  character, charSpecs, refSpecs, refSpecMap, onBuy,
}: {
  character: Character
  charSpecs: CharacterSpecialization[]
  refSpecs: RefSpecialization[]
  refSpecMap: Record<string, RefSpecialization>
  onBuy: (specKey: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ownedKeys = new Set(charSpecs.map(s => s.specialization_key))

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(200,170,80,0.06)',
          border: `1px dashed ${C.gold}55`,
          borderRadius: 4,
          padding: '5px 12px',
          cursor: 'pointer',
          fontFamily: FONT_RAJDHANI,
          fontSize: FS_LABEL,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: `${C.gold}88`,
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${C.gold}99`
          el.style.color = C.gold
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${C.gold}55`
          el.style.color = `${C.gold}88`
        }}
      >
        + NEW SPEC
      </button>
    )
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...panelBase,
          background: 'rgba(6,13,9,0.98)',
          border: `1px solid ${C.gold}40`,
          boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px ${C.gold}15`,
          borderRadius: 6,
          padding: '20px 20px 16px',
          width: '100%', maxWidth: 480,
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold,
          }}>
            Buy New Specialization
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: FONT_RAJDHANI, fontSize: FS_H4, color: C.textDim,
              lineHeight: 1, padding: '0 4px',
            }}
          >×</button>
        </div>

        {/* XP info */}
        <div style={{
          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim,
          lineHeight: 1.5,
          background: 'rgba(200,170,80,0.06)', border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '8px 10px',
        }}>
          Career specs cost{' '}
          <span style={{ color: C.gold, fontWeight: 700 }}>{charSpecs.length * 10} XP</span>
          {' '}· Non-career costs{' '}
          <span style={{ color: C.gold, fontWeight: 700 }}>{(charSpecs.length + 1) * 10} XP</span>
          {' '}· Available:{' '}
          <span style={{ color: '#4EC87A', fontWeight: 700 }}>{character.xp_available} XP</span>
        </div>

        {/* Spec search + list (shared component) */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <SpecSelectorList
            refSpecs={refSpecs}
            ownedKeys={ownedKeys}
            careerKey={character.career_key}
            getSpecCost={spec =>
              spec.career_key === character.career_key
                ? charSpecs.length * 10
                : (charSpecs.length + 1) * 10
            }
            canAfford={spec => {
              const cost = spec.career_key === character.career_key
                ? charSpecs.length * 10
                : (charSpecs.length + 1) * 10
              return character.xp_available >= cost
            }}
            onSelect={spec => { onBuy(spec.key); setOpen(false) }}
            autoFocus
          />
        </div>

        {/* Cancel */}
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            padding: '7px',
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: C.textDim, cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#E05050'
            el.style.color = '#E05050'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = C.border
            el.style.color = C.textDim
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export function PlayerHUDDesktop({ characterId, isGmMode = false, campaignId }: PlayerHUDDesktopProps) {
  const router = useRouter()

  // ── Data ──
  const {
    character, skills, talents, weapons, armor, gear, crits, charSpecs,
    charForceAbilities, playerName, loading, error,
    refSkills, refCrits, refCareers, refSpeciesAll, refForcePowers, refForceAbilities,
    refObligationTypes, refDutyTypes,
    refSkillMap, refTalentMap, refWeaponMap, refArmorMap, refGearMap,
    refSpecMap, refDescriptorMap, refForcePowerMap, refForceAbilityMap, refWeaponQualityMap,
    refAttachmentMap,
    forceRating, supabase, refSpecs,
    handleVitalChange, handleVitalAdjust, handleToggleWeaponEquipped, handleToggleEquippedById, handleSetEquipState,
    handleRollCrit, handleHealCrit, handlePortraitUpload, handlePortraitDelete,
    handleCharacteristicChange, handleSoakChange, handleDefenseChange,
    handleMoralityChange, handleMoralityKeyChange, handleObligationChange, handleDutyChange,
    handleRemoveWeapon, handleRemoveEquipment, handleRemoveTalent, handleReduceSkill,
    handlePurchaseTalent, handleResolveDedication, handleCreditSpend, handleBackstoryChange, handleNotesChange,
    handlePurchaseForceAbility, handleBuySpecialization, handleBuySkill,
  } = useCharacterData(characterId)

  // ── Species abilities (needed by derived stats engine) ──
  const speciesAbilities = useMemo(() => {
    const sp = refSpeciesAll.find(s => s.key === character?.species_key)
    return (sp?.special_abilities ?? []) as SpeciesAbility[]
  }, [refSpeciesAll, character])

  // ── Derived stats engine ──
  const derivedStats = useDerivedStats({
    character: character ?? null,
    forceRatingBase: forceRating,
    talents,
    refTalentMap,
    armor,
    refArmorMap,
    refAttachmentMap,
    weapons,
    refWeaponMap,
    refWeaponQualityMap,
    speciesAbilities,
  })
  const effectiveStats = derivedStats?.effectiveStats
  const skillModifiers = derivedStats?.modifiers.skillModifiers ?? {}
  const engineBreakdown = derivedStats?.breakdown

  // Skill keys that have at least one talent/species ability providing a bonus (for "Has Bonus" filter)
  const bonusSkillKeys = useMemo(() => {
    const keys = new Set<string>()
    // Dice-modifier bonuses from the engine
    for (const [key, mod] of Object.entries(skillModifiers)) {
      if (mod.boostAdd > 0 || mod.setbackRemove > 0) keys.add(key)
    }
    // Purchased talents with relevant_skills mappings
    for (const t of talents) {
      const ref = refTalentMap[t.talent_key]
      const relevant = ref?.modifiers?.relevant_skills
      if (Array.isArray(relevant)) {
        for (const sk of relevant) keys.add(sk)
      }
    }
    // Species abilities
    for (const sa of speciesAbilities) {
      if (sa.mechanical_type === 'talent_rank' && sa.talent_key) {
        // Species-granted talent relevant_skills
        const relevant = refTalentMap[sa.talent_key]?.modifiers?.relevant_skills
        if (Array.isArray(relevant)) {
          for (const sk of relevant) keys.add(sk)
        }
      }
      if (sa.mechanical_type === 'die_modifier' && Array.isArray(sa.affected_skills)) {
        for (const sk of sa.affected_skills) { if (sk) keys.add(sk) }
      }
    }
    return keys
  }, [skillModifiers, talents, refTalentMap, speciesAbilities])

  // ── Write-back force_rating to DB when the engine computes a different value ──
  // This fires when talents like WITCHCRAFT grant force_rating via the legacy
  // `modifiers` shape that doesn't update the characters table directly.
  useEffect(() => {
    if (!character || !effectiveStats) return
    const computed = effectiveStats.forceRating
    if (computed === character.force_rating) return
    console.log(`[force_rating write-back] ${character.name}: DB=${character.force_rating} → computed=${computed}`)
    supabase
      .from('characters')
      .update({ force_rating: computed })
      .eq('id', character.id)
      .then(({ error }) => {
        if (error) console.warn('[force_rating write-back] failed:', error.message)
      })
  }, [effectiveStats?.forceRating, character?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Session / roll feed ──
  const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null
  const sessionRollState = useSessionRollState(effectiveCampaignId)
  const woundBonus = character ? getWoundThresholdBonus(character.id, sessionRollState) : 0
  const effectiveCampaignIdRef = useRef(effectiveCampaignId)
  useEffect(() => { effectiveCampaignIdRef.current = effectiveCampaignId }, [effectiveCampaignId])

  // ── Auto-release session on tab/browser close ──────────────────────────────
  useEffect(() => {
    const handlePageHide = () => {
      const key = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
      const cid = effectiveCampaignIdRef.current
      if (!key || !cid) return
      navigator.sendBeacon('/api/release-session', new Blob(
        [JSON.stringify({ session_key: key, campaign_id: cid })],
        { type: 'application/json' },
      ))
    }
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [])
  const { mode: dbMode, round: dbRound, transitionPending: dbTransitionPending, prevMode: dbPrevMode } = useSessionMode(effectiveCampaignId)
  // Broadcast override — GM pushes combat state directly for instant delivery
  const [broadcastSession, setBroadcastSession] = useState<{ mode: 'combat' | 'exploration'; round: number } | null>(null)
  const [broadcastTransition, setBroadcastTransition] = useState<{ pending: boolean; prevMode: 'combat' | 'exploration' | null }>({ pending: false, prevMode: null })
  const sessionMode = broadcastSession?.mode ?? dbMode
  const combatRound = broadcastSession?.round ?? dbRound
  const transitionPending = broadcastTransition.pending || dbTransitionPending
  const prevMode = broadcastTransition.prevMode ?? dbPrevMode
  const sessionModeRef = useRef<'combat' | 'exploration'>('exploration')
  sessionModeRef.current = sessionMode
  const rolls = useRollFeed(effectiveCampaignId)
  const isCombat = sessionMode === 'combat'

  // ── UI State ──
  const TAB_KEY = `holocron:char-tab:${characterId}`
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    if (typeof window === 'undefined') return 'Session'
    const saved = window.localStorage.getItem(TAB_KEY)
    const valid: TabName[] = ['Skills', 'Talents', 'Inventory', 'Force', 'Lore', 'Feed', 'Session', 'Group']
    return valid.includes(saved as TabName) ? (saved as TabName) : 'Session'
  })

  // ── Session tab — subscribe to active map visibility ──
  const { visibleMap } = useActiveMap(effectiveCampaignId)
  const { encounter }  = useEncounterState(effectiveCampaignId)
  const isCombatActive = encounter !== null && encounter.is_active

  const mapTokens = useMapTokens(visibleMap?.id ?? null)
  const visibleMapTokens = mapTokens.tokens.filter(t => t.is_visible)
  const [rollResult, setRollResult]             = useState<RollResult | null>(null)
  const [rollLabel, setRollLabel]               = useState<string | undefined>()
  const [showTalentTree, setShowTalentTree]     = useState(false)
  const [activeSpecKey, setActiveSpecKey]       = useState<string | null>(null)
  const [showForceTree, setShowForceTree]       = useState(false)
  const [activePowerKey, setActivePowerKey]     = useState<string | null>(null)
  const [gmDialog, setGmDialog]                 = useState<string | null>(null)
  const [lootReveal, setLootReveal]             = useState<Record<string, unknown> | null>(null)
  const [vendorOffer, setVendorOffer]           = useState<VendorOffer | null>(null)
  const [initRoll, setInitRoll]                 = useState<{ type: 'cool' | 'vigilance'; campaignId: string } | null>(null)
  const [forceRollResult, setForceRollResult]   = useState<ForceRollResult | null>(null)
  const [skillPopover, setSkillPopover]         = useState<{ skill: HudSkill; anchor: DOMRect } | null>(null)
  const [combatCheckOpen, setCombatCheckOpen]         = useState(false)
  const [forceCheckOpen,  setForceCheckOpen]          = useState(false)
  const [conflicts, setConflicts]                     = useState<ConflictEntry[]>([])
  const [pendingCritRequest, setPendingCritRequest]   = useState<CriticalInjuryRequest | null>(null)
  const [pdfGenerating,     setPdfGenerating]         = useState(false)
  const [pendingDedication, setPendingDedication]     = useState<{ talentId: string; row: number; col: number; specKey: string } | null>(null)
  const [spendCreditsOpen,  setSpendCreditsOpen]      = useState(false)
  const [spendAmount,       setSpendAmount]           = useState('')
  const [woundTipPos,       setWoundTipPos]           = useState<{ top: number; left: number } | null>(null)
  const [strainTipPos,      setStrainTipPos]          = useState<{ top: number; left: number } | null>(null)
  const [talentDrawerOpen,     setTalentDrawerOpen]     = useState(false)
  const [adversaryDrawerOpen,  setAdversaryDrawerOpen]  = useState(false)
  const [sessionCardCollapsed, setSessionCardCollapsed] = useState<Record<string, boolean>>({})
  const [tokenHoverInfo,       setTokenHoverInfo]       = useState<{ tokenId: string; x: number; y: number } | null>(null)

  // ── Prompt for unresolved Dedication purchases on load ──
  useEffect(() => {
    if (!talents.length || pendingDedication) return
    const unresolved = talents.find(t => t.talent_key === 'DEDI' && !t.dedication_characteristic)
    if (unresolved) {
      setPendingDedication({
        talentId: unresolved.id,
        row: unresolved.tree_row ?? 4,
        col: unresolved.tree_col ?? 0,
        specKey: unresolved.specialization_key ?? '',
      })
    }
  // Only run when talents array reference changes (i.e. on initial load)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talents])

  // ── PDF download ──
  async function handleDownloadPDF() {
    if (!character) return
    setPdfGenerating(true)
    try {
      const input: CharacterSheetInput = {
        character,
        playerName,
        careerName,
        speciesName,
        specNames,
        skills,
        refSkills,
        refSkillMap,
        talents,
        refTalentMap,
        weapons,
        refWeaponMap,
        refWeaponQualityMap,
        armor,
        refArmorMap,
        gear,
        refGearMap,
        crits,
        refSpecMap,
        effectiveStats: effectiveStats ?? null,
      }
      await generateCharacterSheetPDF(input)
    } catch (err) {
      console.error('[PDF generation failed]', err)
    } finally {
      setPdfGenerating(false)
    }
  }

  // ── Spend credits ──
  async function handleSpendCredits() {
    if (!character || !effectiveCampaignId) return
    const amount = parseInt(spendAmount, 10)
    if (!amount || amount <= 0 || amount > character.credits) return
    setSpendCreditsOpen(false)
    setSpendAmount('')
    await handleCreditSpend(amount, effectiveCampaignId)
  }

  // ── Load conflicts ──
  useEffect(() => {
    if (!character?.id) return
    supabase
      .from('character_conflicts')
      .select('id, description, session_label, is_resolved, created_at')
      .eq('character_id', character.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setConflicts(data as ConflictEntry[]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.id])

  // ── Critical injury request — load pending on mount + subscribe ──
  useEffect(() => {
    if (!character?.id) return
    // Load any pre-existing pending request
    supabase
      .from('critical_injury_requests')
      .select('*')
      .eq('character_id', character.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setPendingCritRequest(data[0] as CriticalInjuryRequest) })
    // Subscribe to future changes
    const ch = supabase
      .channel(`crit-req-${character.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public',
        table: 'critical_injury_requests',
        filter: `character_id=eq.${character.id}`,
      }, (payload) => {
        const row = payload.new as CriticalInjuryRequest | undefined
        if (row?.status === 'pending') {
          setPendingCritRequest(row)
        } else {
          setPendingCritRequest(prev => (prev?.id === row?.id ? null : prev))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.id])

  // ── Destiny Pool ──
  const [destinyPool, setDestinyPool]           = useState<Array<'light' | 'dark'>>([])
  const [pendingSpend, setPendingSpend]         = useState<number | null>(null)
  const pendingTimer                            = useRef<ReturnType<typeof setTimeout> | null>(null)
  const destinyChannelRef                       = useRef<ReturnType<typeof supabase.channel> | null>(null)
  // ── Destiny Pool DB record ──
  const [destinyPoolRecord,     setDestinyPoolRecord]     = useState<DestinyPoolRecord | null>(null)
  const [destinyRollRequest,    setDestinyRollRequest]    = useState<{ poolId: string } | null>(null)
  const [destinySpendOpen,      setDestinySpendOpen]      = useState(false)
  const [destinyGmFlash,        setDestinyGmFlash]        = useState<{ prevLight: number; prevDark: number; newLight: number; newDark: number } | null>(null)
  const [destinyConsidering,    setDestinyConsidering]    = useState<string | null>(null)

  // Load pool on mount
  useEffect(() => {
    if (!effectiveCampaignId) return
    supabase.from('campaigns').select('settings').eq('id', effectiveCampaignId).single()
      .then(({ data }) => {
        const pool = (data?.settings as Record<string, unknown> | null)?.destiny_pool
        if (Array.isArray(pool)) setDestinyPool(pool as Array<'light' | 'dark'>)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId])

  // postgres_changes — pool syncs when GM or another player updates it
  useEffect(() => {
    if (!effectiveCampaignId) return
    const ch = supabase
      .channel(`destiny-db-${effectiveCampaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${effectiveCampaignId}` },
        (payload) => {
          const pool = (payload.new.settings as Record<string, unknown> | null)?.destiny_pool
          if (Array.isArray(pool)) setDestinyPool(pool as Array<'light' | 'dark'>)
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId])

  // Campaign events — spend notifications from other players
  useEffect(() => {
    if (!effectiveCampaignId) return
    const ch = supabase
      .channel(`campaign-events-${effectiveCampaignId}`)
      .on('broadcast', { event: 'destiny-spent' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if (payload.characterId === characterId) return // own spend, skip
        const who   = payload.characterName as string
        const side  = payload.tokenType === 'light' ? '○ Light' : '● Dark'
        import('sonner').then(m => m.toast.info(`${who} spent a ${side} Side destiny point`))
      })
      .subscribe()
    destinyChannelRef.current = ch
    return () => { supabase.removeChannel(ch); destinyChannelRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId, characterId])

  // ── Destiny pool DB record + broadcast channel ──
  useEffect(() => {
    if (!effectiveCampaignId) return
    // Load active pool
    supabase.from('destiny_pool').select('*').eq('campaign_id', effectiveCampaignId).eq('is_active', true).maybeSingle()
      .then(({ data }) => { if (data) setDestinyPoolRecord(data as DestinyPoolRecord) })
    // Subscribe to pool table changes
    const poolCh = supabase
      .channel(`destiny-pool-player-${effectiveCampaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'destiny_pool', filter: `campaign_id=eq.${effectiveCampaignId}` },
        (payload) => {
          const row = payload.new as DestinyPoolRecord
          if (row.is_active) setDestinyPoolRecord(row)
          else setDestinyPoolRecord(prev => prev?.id === row.id ? null : prev)
        }
      )
      .subscribe()
    // Subscribe to destiny broadcast channel (considering / gm-spent)
    const destCh = supabase
      .channel(`destiny-${effectiveCampaignId}`)
      .on('broadcast', { event: 'destiny_considering' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if ((payload.characterName as string) === character?.name) return
        setDestinyConsidering(payload.characterName as string)
      })
      .on('broadcast', { event: 'destiny_cancelled' }, ({ payload }: { payload: Record<string, unknown> }) => {
        setDestinyConsidering(prev => prev === (payload.characterName as string) ? null : prev)
      })
      .on('broadcast', { event: 'destiny_spent' }, ({ payload }: { payload: Record<string, unknown> }) => {
        setDestinyConsidering(null)
        const who  = payload.characterName as string
        const side = payload.side === 'light' ? '○ Light' : '● Dark'
        import('sonner').then(m => m.toast.info(`${who} spent a ${side} Side destiny point`))
      })
      .subscribe()
    return () => { supabase.removeChannel(poolCh); supabase.removeChannel(destCh) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId])

  const handleSpendDestiny = useCallback(async (idx: number) => {
    const cid = effectiveCampaignIdRef.current
    if (!cid || !character) return

    // Two-tap confirm: first tap highlights, second tap within 2s confirms
    if (pendingSpend !== idx) {
      setPendingSpend(idx)
      if (pendingTimer.current) clearTimeout(pendingTimer.current)
      pendingTimer.current = setTimeout(() => setPendingSpend(null), 2000)
      return
    }
    // Confirmed
    if (pendingTimer.current) clearTimeout(pendingTimer.current)
    setPendingSpend(null)

    const token   = destinyPool[idx]
    const newPool = destinyPool.map((t, i) =>
      i === idx ? (t === 'light' ? 'dark' : 'light') : t
    ) as Array<'light' | 'dark'>

    setDestinyPool(newPool)

    // Persist
    const { data: camp } = await supabase.from('campaigns').select('settings').eq('id', cid).single()
    const settings = ((camp?.settings as Record<string, unknown>) ?? {})
    await supabase.from('campaigns').update({ settings: { ...settings, destiny_pool: newPool } }).eq('id', cid)

    // Notify other players
    destinyChannelRef.current?.send({
      type: 'broadcast', event: 'destiny-spent',
      payload: { characterId: character.id, characterName: character.name, tokenType: token },
    })

    const side = token === 'light' ? '○ Light' : '● Dark'
    import('sonner').then(m => m.toast.success(`Spent a ${side} Side destiny point`))
  }, [destinyPool, character, supabase, pendingSpend])

  // ── GM Broadcast listener ──
  useEffect(() => {
    const channel = supabase
      .channel(`gm-notify-${characterId}`)
      .on('broadcast', { event: 'gm-action' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if (payload.type === 'toast') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          import('sonner').then(m => m.toast(payload.message as any))
        } else if (payload.type === 'combat-state') {
          const newMode = payload.mode as 'combat' | 'exploration'
          const newRound = payload.round as number
          const curMode = sessionModeRef.current
          if (newMode !== curMode) {
            setBroadcastTransition({ pending: true, prevMode: curMode })
            setTimeout(() => {
              setBroadcastSession({ mode: newMode, round: newRound })
              setBroadcastTransition({ pending: false, prevMode: null })
            }, 1200)
          } else {
            setBroadcastSession({ mode: newMode, round: newRound })
          }
        } else if (payload.type === 'loot-reveal') {
          setLootReveal(payload.item as Record<string, unknown>)
        } else if (payload.type === 'loot-dismiss') {
          setLootReveal(null)
        } else if (payload.type === 'initiative-request') {
          const cid = effectiveCampaignIdRef.current
          if (cid) setInitRoll({ type: payload.initiativeType as 'cool' | 'vigilance', campaignId: cid })
        } else if (payload.type === 'destiny-roll-request') {
          setDestinyRollRequest({ poolId: payload.poolId as string })
        } else if (payload.type === 'destiny-gm-spent') {
          try {
            const audio = new Audio('/sounds/laughing.mp3')
            audio.volume = 0.7
            audio.play().catch(() => {})
          } catch (_) {}
          setDestinyGmFlash({
            prevLight: payload.prevLightCount as number,
            prevDark:  payload.prevDarkCount  as number,
            newLight:  payload.newLightCount  as number,
            newDark:   payload.newDarkCount   as number,
          })
        } else if (payload.type === 'vendor-purchase-offer') {
          setVendorOffer(payload as unknown as VendorOffer)
        } else if (payload.type === 'force-logout') {
          const key = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
          const cid = effectiveCampaignIdRef.current
          const doLogout = async () => {
            if (key && cid) {
              await supabase.from('character_sessions').delete().eq('session_key', key).eq('campaign_id', cid)
            }
            router.push('/')
          }
          void doLogout()
        } else {
          setGmDialog(payload.message as string)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  // ── Derived: career / spec / species names ──
  const careerName = useMemo(() =>
    refCareers.find(c => c.key === character?.career_key)?.name || character?.career_key || ''
  , [refCareers, character])

  const specNames = useMemo(() =>
    charSpecs.map(cs => refSpecMap[cs.specialization_key]?.name || cs.specialization_key).join(' / ')
  , [charSpecs, refSpecMap])

  const speciesName = useMemo(() =>
    refSpeciesAll.find(s => s.key === character?.species_key)?.name || character?.species_key || ''
  , [refSpeciesAll, character])

  // ── Skills for HUD ──
  const hudSkills = useMemo((): HudSkill[] => {
    if (!character) return []
    const charSkillMap = Object.fromEntries(skills.map(s => [s.skill_key, s]))
    return refSkills.map(rs => {
      const cs = charSkillMap[rs.key]
      const charKey = CHAR_REF_MAP[rs.characteristic_key] as CharKey
      const charVal = (character[CHAR_TO_FIELD[rs.characteristic_key] as keyof Character] as number) || 0
      return {
        key: rs.key, name: rs.name,
        charKey, charVal,
        rank: cs?.rank || 0, isCareer: cs?.is_career || false,
        type: rs.type,
      }
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [character, skills, refSkills])

  // ── Talents for HUD ──
  // Aggregate by talent_key so ranked talents purchased at multiple tree
  // positions are shown as a single entry with the correct total rank.
  const hudTalents = useMemo((): HudTalent[] => {
    const map = new Map<string, HudTalent>()
    for (const t of talents) {
      const ref = refTalentMap[t.talent_key]
      const existing = map.get(t.talent_key)
      if (existing) {
        existing.rank = (existing.rank ?? 0) + (t.ranks ?? 1)
      } else {
        map.set(t.talent_key, {
          key:         t.talent_key,
          name:        ref?.name || t.talent_key,
          rank:        t.ranks ?? 1,
          activation:  ref ? ACTIVATION_LABELS[ref.activation] || ref.activation : 'Passive',
          description: ref?.description,
        })
      }
    }
    // Append species-granted talents not already in the purchased map
    for (const sa of speciesAbilities) {
      if (sa.mechanical_type !== 'talent_rank' || !sa.talent_key) continue
      const ref = refTalentMap[sa.talent_key]
      if (!ref) continue
      const existing = map.get(sa.talent_key)
      if (existing) {
        // Character also purchased this talent — just add species rank on top
        existing.rank = (existing.rank ?? 0) + (sa.rank_add ?? 1)
      } else {
        map.set(sa.talent_key, {
          key:              `species_${sa.talent_key}`,
          name:             ref.name,
          rank:             sa.rank_add ?? 1,
          activation:       ACTIVATION_LABELS[ref.activation] || ref.activation,
          description:      ref.description,
          isSpeciesGranted: true,
        })
      }
    }
    // Append die_modifier species abilities as Passive talent cards
    for (const sa of speciesAbilities) {
      if (sa.mechanical_type !== 'die_modifier') continue
      if (!Array.isArray(sa.affected_skills) || sa.affected_skills.length === 0) continue
      // Avoid collision with purchased talent keys
      const cardKey = `species_die_${sa.key}`
      if (!map.has(cardKey)) {
        map.set(cardKey, {
          key:              cardKey,
          name:             sa.name,
          rank:             1,
          activation:       'Passive',
          description:      sa.description,
          isSpeciesGranted: true,
        })
      }
    }
    return Array.from(map.values())
  }, [talents, refTalentMap, speciesAbilities])

  // ── Weapons for HUD ──
  const hudWeapons = useMemo((): WpnDisplay[] =>
    weapons.map(w => {
      const ref           = w.weapon_key ? refWeaponMap[w.weapon_key] : null
      const isMeleeSkill  = ['MELEE', 'BRAWL', 'LTSABER'].includes(ref?.skill_key || '')
      const hasBrawnScale = isMeleeSkill && ref?.damage_add != null
      const baseDamage    = hasBrawnScale ? (ref.damage_add ?? 0) : (ref?.damage || 0)
      const quals         = Array.isArray(ref?.qualities)
        ? ref.qualities.map((q: { key: string; count?: number }) => ({ key: q.key, count: q.count }))
        : []
      return {
        id:          w.id,
        name:        w.custom_name || ref?.name || w.weapon_key || 'Unknown',
        damage:      { baseDamage, isMelee: hasBrawnScale, brawn: hasBrawnScale ? (character?.brawn ?? 0) : 0 },
        crit:        ref?.crit || 0,
        range:       ref?.range_value ? RANGE_LABELS[ref.range_value] || '' : '',
        enc:         ref?.encumbrance || 0,
        hardPoints:  ref?.hard_points || 0,
        qualities:   quals,
        equipState:  w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'),
        skillName:   ref?.skill_key ? refSkillMap[ref.skill_key]?.name || '' : '',
        description: ref?.description ?? null,
      }
    })
  , [weapons, refWeaponMap, refSkillMap, character?.brawn])

  // ── Armor for HUD ──
  const hudArmor = useMemo((): ArmDisplay[] =>
    armor.map(a => {
      const ref = a.armor_key ? refArmorMap[a.armor_key] : null
      return {
        id:          a.id,
        name:        a.custom_name || ref?.name || a.armor_key || 'Armor',
        soak:        ref?.soak || 0,
        defense:     ref?.defense || 0,
        enc:         ref?.encumbrance || 0,
        hardPoints:  ref?.hard_points || 0,
        rarity:      ref?.rarity || 0,
        equipState:  a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'),
        description: ref?.description ?? null,
      }
    })
  , [armor, refArmorMap])

  // ── Gear for HUD ──
  const hudGear = useMemo((): GearRow[] =>
    gear.map(g => {
      const ref = g.gear_key ? refGearMap[g.gear_key] : null
      return {
        id:          g.id,
        name:        g.custom_name || ref?.name || g.gear_key || 'Gear',
        qty:         g.quantity,
        enc:         ref?.encumbrance || 0,
        equipState:  g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'),
        description: ref?.description ?? null,
      }
    })
  , [gear, refGearMap])

  // ── Encumbrance ──
  // equipped  → counts (armor -3 for wearing bonus per FFG rules)
  // carrying  → counts full enc (in backpack/on person)
  // stowed    → 0 (in ship locker / external storage)
  const encumbranceCurrent = useMemo(() => {
    let sum = 0
    for (const a of armor) {
      const state = a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      const enc = refArmorMap[a.armor_key]?.encumbrance || 0
      sum += state === 'equipped' ? Math.max(0, enc - 3) : enc
    }
    for (const g of gear) {
      const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      sum += refGearMap[g.gear_key]?.encumbrance || 0
    }
    for (const w of weapons) {
      const state = w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying')
      if (state === 'stowed') continue
      sum += refWeaponMap[w.weapon_key]?.encumbrance || 0
    }
    return sum
  }, [armor, gear, weapons, refArmorMap, refGearMap, refWeaponMap])

  // Storage containers (backpacks, modular storage) increase enc threshold only when equipped
  const encumbranceBonus = useMemo(() =>
    gear.reduce((s, g) => {
      const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying')
      const ref = refGearMap[g.gear_key]
      return s + (state === 'equipped' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0)
    }, 0)
  , [gear, refGearMap])

  // ── Force powers (rich display) ──
  const allForcePowers = useMemo((): ForcePowerDisplay[] => {
    // Count how many times each (power, ability) is purchased — handles ranked upgrades
    const purchaseCount = new Map<string, number>()
    for (const a of charForceAbilities) {
      const k = `${a.force_power_key}:${a.force_ability_key}`
      purchaseCount.set(k, (purchaseCount.get(k) ?? 0) + 1)
    }

    return refForcePowers
      .filter(fp => fp.ability_tree?.rows?.length)
      .map(fp => {
        // Use a Map to deduplicate ranked abilities (same key can appear N times in tree)
        const abilityMap = new Map<string, ForcePowerDisplay['abilities'][number]>()
        for (const row of (fp.ability_tree?.rows ?? [])) {
          for (let col = 0; col < (row.abilities || []).length; col++) {
            const aKey = row.abilities[col]
            const cost = (row.costs || [])[col] ?? 0
            if (!aKey || cost === 0) continue
            const ref = refForceAbilityMap[aKey]
            if (!ref) continue
            const existing = abilityMap.get(aKey)
            if (existing) {
              existing.totalRanks++
            } else {
              const purchased = purchaseCount.get(`${fp.key}:${aKey}`) ?? 0
              abilityMap.set(aKey, { key: aKey, name: ref.name, description: ref.description, purchasedRanks: purchased, totalRanks: 1, cost })
            }
          }
        }
        const abilities = Array.from(abilityMap.values())
        const purchasedCount = abilities.reduce((s, a) => s + Math.min(a.purchasedRanks, a.totalRanks), 0)
        const totalCount     = abilities.reduce((s, a) => s + a.totalRanks, 0)
        const treeData = buildForcePowerTree(fp.key)
        return {
          powerKey: fp.key, powerName: fp.name, description: fp.description,
          purchasedCount, totalCount, abilities,
          treeNodes: treeData?.nodes ?? [],
          treeConnections: treeData?.connections ?? [],
        }
      })
      .sort((a, b) => {
        if (a.purchasedCount > 0 && b.purchasedCount === 0) return -1
        if (a.purchasedCount === 0 && b.purchasedCount > 0) return 1
        return a.powerName.localeCompare(b.powerName)
      })
  }, [charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap])

  // ── Quick Roll skills (rank > 0) ──

  // ── Talent tree building ──
  function buildTalentTree(specKey: string) {
    const refSpec = refSpecMap[specKey]
    if (!refSpec) return null
    const purchasedSet = new Set(
      talents.filter(t => t.specialization_key === specKey).map(t => `${t.tree_row}-${t.tree_col}`)
    )
    return _buildTalentTree(refSpec, refTalentMap, purchasedSet)
  }

  // ── Force power tree building ──
  function buildForcePowerTree(powerKey: string) {
    const refPower = refForcePowerMap[powerKey]
    if (!refPower?.ability_tree?.rows) return null
    const purchasedSet = new Set(charForceAbilities.filter(a => a.force_power_key === powerKey).map(a => `${a.tree_row}-${a.tree_col}`))
    const nodes: ForceTreeNode[] = []
    const connections: ForceTreeConnection[] = []
    for (const row of refPower.ability_tree.rows) {
      const abilities = row.abilities || []
      const dirs = row.directions || []
      const spans = row.spans || []
      const costs = row.costs || []
      for (let col = 0; col < abilities.length; col++) {
        const aKey = abilities[col]
        const ref  = refForceAbilityMap[aKey]
        const span = spans[col] ?? 1
        const cost = costs[col] ?? 0
        const isPurchased = purchasedSet.has(`${row.index}-${col}`)
        const dir = dirs[col] || {}
        let canPurchase = false
        if (!isPurchased && cost > 0) {
          if (row.index === 0) canPurchase = true
          else {
            if (dir.up) canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`)
            if (dir.left && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`)
            if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`)
            if (dir.down) canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`)
          }
        }
        nodes.push({ abilityKey: aKey, name: ref?.name || aKey, description: ref?.description, row: row.index, col, span, cost, purchased: isPurchased, canPurchase })
        if (span > 0) {
          if (dir.right && col < 3) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index, toCol: col + 1 })
          if (dir.down) connections.push({ fromRow: row.index, fromCol: col, toRow: row.index + 1, toCol: col })
        }
      }
    }
    const displayNodes = nodes.filter(n => n.span > 0)
    return { powerName: refPower.name, nodes, connections, purchasedCount: displayNodes.filter(n => n.purchased).length, totalCount: displayNodes.filter(n => n.cost > 0).length }
  }

  const effectiveSpecKey = activeSpecKey || charSpecs[0]?.specialization_key || null
  const talentTreeData = useMemo(() => effectiveSpecKey ? buildTalentTree(effectiveSpecKey) : null, [effectiveSpecKey, charSpecs, refSpecMap, refTalentMap, talents])
  const forcePowerTreeData = useMemo(() => activePowerKey ? buildForcePowerTree(activePowerKey) : null, [activePowerKey, charForceAbilities, refForcePowers, refForcePowerMap, refForceAbilityMap])

  // ── Roll handler ──
  const handleRoll = (result: RollResult, label?: string, pool?: Record<string, number>, meta?: RollMeta) => {
    // Don't pop the DiceModal when the combat check overlay handles the result inline
    if (!combatCheckOpen) {
      setRollResult(result)
      setRollLabel(label)
    }
    if (character && effectiveCampaignId) {
      logRoll({
        campaignId:    effectiveCampaignId,
        characterId:   character.id,
        characterName: character.name,
        label,
        pool:          (pool || {}) as Parameters<typeof logRoll>[0]['pool'],
        result,
        meta,
      })
    }
  }

  const handleSkillRoll = (skill: HudSkill) => {
    const { proficiency, ability } = getSkillPool(skill.charVal, skill.rank)
    const pool = { proficiency, ability, boost: 0, challenge: 0, difficulty: 2, setback: 0, force: 0 }
    const result = rollPool(pool)
    handleRoll(result, skill.name, pool as Record<string, number>)
  }

  const handleSkillUpgrade = (skill: HudSkill) => {
    handleBuySkill(skill.key, skill.rank, skill.isCareer)
  }

  // ── Loading / Error ──
  if (loading) return <HolocronLoader />
  if (error || !character) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_H4, color: '#E05050' }}>{error || 'Character not found'}</div>
      </div>
    )
  }

  const charVals = {
    brawn:     character.brawn,
    agility:   character.agility,
    intellect: character.intellect,
    cunning:   character.cunning,
    willpower: character.willpower,
    presence:  character.presence,
  }

  const encThreshold = character.encumbrance_threshold + encumbranceBonus
  const hasMorality  = character.morality_value !== undefined && character.morality_value !== null

  // ════════════════════════════
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: C.bg }}>
      <BackgroundEffects />
      <CombatTransition pending={transitionPending} prevMode={prevMode} />

      {/* Critical Injury Roll Modal — shown when GM sends a crit request */}
      {pendingCritRequest && (
        <CriticalInjuryModal
          request={pendingCritRequest}
          characterId={character.id}
          characterName={character.name}
          campaignId={effectiveCampaignId}
          refCrits={refCrits}
          currentCrits={crits}
          sessionLabel={null}
          onDismiss={() => setPendingCritRequest(null)}
        />
      )}

      {/* Combat Check Overlay */}
      <CombatCheckOverlay
        open={combatCheckOpen}
        initialAttackType={null}
        onClose={() => setCombatCheckOpen(false)}
        character={character}
        weapons={weapons}
        charSkills={skills}
        refWeaponMap={refWeaponMap}
        refSkillMap={refSkillMap}
        refWeaponQualityMap={refWeaponQualityMap}
        skillModifiers={skillModifiers}
        campaignId={effectiveCampaignId}
        characterId={character.id}
        onRoll={handleRoll}
        speciesAbilities={speciesAbilities}
        speciesName={speciesName}
      />

      {/* Force Check Overlay */}
      <ForceCheckOverlay
        open={forceCheckOpen}
        onClose={() => setForceCheckOpen(false)}
        character={character}
        forceRating={effectiveStats?.forceRating ?? forceRating}
        committedForce={character.force_rating_committed ?? 0}
        forcePowers={allForcePowers}
        isDathomiri={isDathomiri(character)}
        isCombat={isCombat}
        campaignId={effectiveCampaignId}
        characterId={character.id}
      />

      {/* GM mode overlays */}
      {isGmMode && (
        <>
          <button onClick={() => router.push(`/gm?campaign=${campaignId}`)} style={{ position: 'fixed', top: 8, left: 8, zIndex: 200, background: C.gold, border: 'none', padding: '6px 14px', fontFamily: FONT_CINZEL, fontSize: FS_LABEL, fontWeight: 700, letterSpacing: '0.1em', color: C.bg, cursor: 'pointer' }}>← GM</button>
          <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 200, border: `2px solid ${C.gold}`, padding: '3px 12px', fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.15em', color: C.gold }}>GM MODE</div>
        </>
      )}

      {/* Main 3-column grid */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'clamp(220px, 18vw, 320px) 1fr clamp(260px, 20vw, 360px)',
        gridTemplateRows: 'clamp(48px, 4vh, 64px) 1fr',
        height: '100vh',
      }}>

        {/* ══ TOP BAR ══════════════════════════════════════════ */}
        <div style={{
          gridColumn: '1 / -1',
          background: isCombat ? 'rgba(30,4,4,0.96)' : 'rgba(4,9,6,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: isCombat ? '1px solid rgba(224,80,80,0.35)' : `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', gap: 'var(--space-2)',
          zIndex: 10,
          transition: 'background 0.6s, border-color 0.6s',
        }}>
          {/* Logo */}
          <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', whiteSpace: 'nowrap', textShadow: `0 0 12px ${C.gold}60` }}>
            HOLOCRON
          </div>
          <div style={{ width: 1, height: 28, background: C.border }} />
          {/* Character identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 0 10px rgba(255,255,255,0.25)' }}>
              {character.name}
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[careerName, specNames, speciesName].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: C.border }} />
          {/* Destiny Pool */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textDim, whiteSpace: 'nowrap' }}>
              Destiny
            </span>
            <DestinyPoolDisplay
              poolRecord={destinyPoolRecord}
              isGm={false}
              onClickLight={() => setDestinySpendOpen(true)}
              compact
            />
          </div>
          <div style={{ width: 1, height: 28, background: C.border }} />
          {/* Resources */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* XP pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(200,170,80,0.1)', border: '1px solid rgba(200,170,80,0.3)',
              borderRadius: 4, padding: '3px 10px',
            }}>
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold }}>XP</span>
              <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color: '#FFFFFF' }}>{character.xp_available}</span>
            </div>
            {/* Credits pill — click to spend */}
            <button
              onClick={() => { setSpendAmount(''); setSpendCreditsOpen(true) }}
              title="Click to spend credits"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(78,200,122,0.1)', border: '1px solid rgba(78,200,122,0.3)',
                borderRadius: 4, padding: '3px 10px',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,200,122,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,200,122,0.1)' }}
            >
              <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_OVERLINE, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4EC87A' }}>Credits</span>
              <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, color: '#FFFFFF' }}>{character.credits.toLocaleString()}</span>
            </button>
          </div>
          <div style={{ width: 1, height: 28, background: C.border }} />
          {/* Print Sheet */}
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            title="Download printable character sheet PDF"
            style={{
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: pdfGenerating ? C.textFaint : 'rgba(200,170,80,0.6)',
              background: 'transparent',
              border: '1px solid rgba(200,170,80,0.25)',
              borderRadius: 4,
              padding: '3px 9px',
              cursor: pdfGenerating ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color .15s, border-color .15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!pdfGenerating) {
                const el = e.currentTarget as HTMLElement
                el.style.color = C.gold
                el.style.borderColor = 'rgba(200,170,80,0.5)'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'rgba(200,170,80,0.6)'
              el.style.borderColor = 'rgba(200,170,80,0.25)'
            }}
          >
            {pdfGenerating ? 'Generating…' : '⬇ Print Sheet'}
          </button>
          <button
            onClick={async () => {
              const sessionKey = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
              const cid = effectiveCampaignId
              if (sessionKey && cid) {
                await supabase.from('character_sessions').delete()
                  .eq('session_key', sessionKey)
                  .eq('campaign_id', cid)
              }
              router.push('/')
            }}
            style={{
              fontFamily: FONT_RAJDHANI, fontWeight: 700, fontSize: FS_CAPTION,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: C.textDim, background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
              transition: '.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E05050'; (e.currentTarget as HTMLElement).style.borderColor = '#E05050' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.textDim; (e.currentTarget as HTMLElement).style.borderColor = C.border }}
          >⏻ LOGOUT</button>
          {/* Combat mode badge */}
          {isCombat && (
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(224,80,80,0.18)', border: '1px solid rgba(224,80,80,0.5)',
              borderRadius: 4, padding: '3px 10px',
              fontFamily: FONT_CINZEL, fontSize: FS_CAPTION, fontWeight: 700, letterSpacing: '0.18em',
              color: '#E05050', textShadow: '0 0 8px #E05050',
              whiteSpace: 'nowrap',
            }}>
              COMBAT · ROUND {combatRound}
            </div>
          )}
        </div>

        {/* ══ LEFT COLUMN ══════════════════════════════════════ */}
        <div style={{
          background: 'rgba(4,9,6,0.7)',
          borderRight: `1px solid ${C.border}`,
          overflowY: 'auto', overflowX: 'hidden',
          padding: 'var(--space-2) var(--space-2)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
        }}>
          {/* Avatar */}
          <CharacterAvatar
            avatarUrl={character.portrait_url}
            characterName={character.name}
            career={careerName}
            spec={specNames}
            onUpload={handlePortraitUpload}
            onDelete={handlePortraitDelete}
          />

          {/* ── Vitals Panel (wounds + strain + crit pips) ── */}
          {(() => {
            const wThreshold = effectiveStats?.woundThreshold ?? character.wound_threshold
            const sThreshold = effectiveStats?.strainThreshold ?? character.strain_threshold
            const wCurrent = character.wound_current
            const sCurrent = character.strain_current
            const wPct = wThreshold > 0 ? Math.min((wCurrent / (wThreshold + woundBonus)) * 100, 100) : 0
            const sPct = sThreshold > 0 ? Math.min((sCurrent / sThreshold) * 100, 100) : 0
            const wOver = wCurrent >= wThreshold + woundBonus
            const sOver = sCurrent >= sThreshold
            const wFill = wOver ? '#9C27B0' : '#e05252'
            const sFill = sOver ? '#9C27B0' : '#FF9800'

            const LABEL_STYLE: React.CSSProperties = {
              fontFamily: FONT_CINZEL,
              fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(200,170,80,0.5)',
              marginBottom: 5,
            }
            const CTRL_BTN: React.CSSProperties = {
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              width: 22, height: 22,
              cursor: 'pointer',
              color: C.textDim,
              fontFamily: "'Share Tech Mono','Courier New',monospace",
              fontSize: 'clamp(0.7rem, 1.1vw, 0.82rem)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }
            const NUM_STYLE: React.CSSProperties = {
              fontFamily: "'Share Tech Mono','Courier New',monospace",
              fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
              color: 'rgba(232,223,200,0.7)',
              userSelect: 'none',
            }

            const critPips: CritPip[] = crits.map(c => ({
              id:          c.id,
              severity:    c.severity,
              name:        c.custom_name || 'Injury',
              description: c.description,
              rollResult:  c.roll_result,
              sessionLabel:c.session_label,
            }))

            // Group breakdown sources by label and sum values (e.g. two Grit entries → "Grit: +2")
            const groupSources = (sources: { label: string; value: number }[]) => {
              const map = new Map<string, number>()
              for (const s of sources) {
                map.set(s.label, (map.get(s.label) ?? 0) + s.value)
              }
              return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
            }

            const woundBreakdown  = groupSources(engineBreakdown?.woundThreshold  ?? [])
            const strainBreakdown = groupSources(engineBreakdown?.strainThreshold ?? [])

            const VitalTooltip = ({ breakdown, top, left }: { breakdown: { label: string; value: number }[]; top: number; left: number }) => createPortal(
              <div style={{
                position: 'fixed',
                top, left,
                zIndex: 9999,
                background: 'rgba(8,16,10,0.97)',
                border: '1px solid rgba(200,170,80,0.35)',
                borderRadius: 8,
                padding: '8px 12px',
                minWidth: 140,
                pointerEvents: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
              }}>
                {breakdown.map(({ label, value }, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16,
                    fontFamily: "'Share Tech Mono','Courier New',monospace",
                    fontSize: '0.72rem', color: i === 0 ? 'rgba(232,223,200,0.55)' : 'rgba(232,223,200,0.85)',
                    marginBottom: i < breakdown.length - 1 ? 3 : 0,
                  }}>
                    <span>{label}</span>
                    <span style={{ color: i === 0 ? 'rgba(200,170,80,0.6)' : C.gold }}>{i === 0 ? value : `+${value}`}</span>
                  </div>
                ))}
              </div>,
              document.body,
            )

            return (
              <div style={{
                border: '1px solid rgba(200,170,80,0.2)',
                borderRadius: 10,
                background: 'rgba(8,16,10,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: 14,
              }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {/* WOUNDS */}
                  <div style={{ flex: 1, minWidth: 0, position: 'relative' }}
                    onMouseEnter={e => {
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      setWoundTipPos({ top: r.bottom + 6, left: r.left })
                    }}
                    onMouseLeave={() => setWoundTipPos(null)}
                  >
                    {woundTipPos && woundBreakdown.length > 0 && (
                      <VitalTooltip breakdown={woundBreakdown} top={woundTipPos.top} left={woundTipPos.left} />
                    )}
                    <div style={LABEL_STYLE}>WOUNDS</div>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{
                        height: '100%', width: `${wPct}%`,
                        background: wFill, borderRadius: 5,
                        transition: 'width 300ms ease, background 300ms ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                      <button style={CTRL_BTN} onClick={() => handleVitalAdjust('wound_current', -1)}>−</button>
                      <span style={NUM_STYLE}>
                        {wCurrent}/{wThreshold}
                        {woundBonus > 0 && <span style={{ color: C.gold, marginLeft: 2 }}>+{woundBonus}</span>}
                      </span>
                      <button style={CTRL_BTN} onClick={() => handleVitalAdjust('wound_current', 1)}>+</button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ width: 1, background: 'rgba(200,170,80,0.12)', alignSelf: 'stretch', flexShrink: 0 }} />

                  {/* STRAIN */}
                  <div style={{ flex: 1, minWidth: 0, position: 'relative' }}
                    onMouseEnter={e => {
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      setStrainTipPos({ top: r.bottom + 6, left: r.left })
                    }}
                    onMouseLeave={() => setStrainTipPos(null)}
                  >
                    {strainTipPos && strainBreakdown.length > 0 && (
                      <VitalTooltip breakdown={strainBreakdown} top={strainTipPos.top} left={strainTipPos.left} />
                    )}
                    <div style={LABEL_STYLE}>STRAIN</div>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{
                        height: '100%', width: `${sPct}%`,
                        background: sFill, borderRadius: 5,
                        transition: 'width 300ms ease, background 300ms ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                      <button style={CTRL_BTN} onClick={() => handleVitalAdjust('strain_current', -1)}>−</button>
                      <span style={NUM_STYLE}>{sCurrent}/{sThreshold}</span>
                      <button style={CTRL_BTN} onClick={() => handleVitalAdjust('strain_current', 1)}>+</button>
                    </div>
                  </div>
                </div>

                {/* Encumbrance bar */}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(200,170,80,0.08)' }}>
                  <EncumbranceBar current={encumbranceCurrent} threshold={encThreshold} brawn={character.brawn} />
                </div>

                {/* Critical injury pips */}
                <CriticalInjuryPips crits={critPips} onHeal={handleHealCrit} />
              </div>
            )
          })()}

          {/* ── Characteristics strip ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
          }}>
            {([
              { label: 'Brawn',     value: charVals.brawn },
              { label: 'Agility',   value: charVals.agility },
              { label: 'Intellect', value: charVals.intellect },
              { label: 'Cunning',   value: charVals.cunning },
              { label: 'Willpower', value: charVals.willpower },
              { label: 'Presence',  value: charVals.presence },
            ] as const).map(ch => (
              <div key={ch.label} style={{
                textAlign: 'center',
                padding: '6px 4px',
                background: 'rgba(8,16,10,0.6)',
                border: '1px solid rgba(200,170,80,0.2)',
                borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: "'Share Tech Mono','Courier New',monospace",
                  fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                  fontWeight: 700,
                  color: C.gold,
                  lineHeight: 1,
                }}>
                  {ch.value}
                </div>
                <div style={{
                  fontFamily: FONT_CINZEL,
                  fontSize: 'clamp(0.48rem, 0.72vw, 0.58rem)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'rgba(200,170,80,0.5)',
                  marginTop: 3,
                  textTransform: 'uppercase',
                }}>
                  {ch.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CENTER COLUMN ════════════════════════════════════ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}>
          <TabBar
            active={activeTab}
            onChange={t => { setActiveTab(t); localStorage.setItem(TAB_KEY, t) }}
            hasCombat={isCombat}
            isForceUser={isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating)}
            isForceUserFallen={character.is_dark_side_fallen === true}
            isCombatActive={isCombatActive}
          />

          {/* Session Status Banner — shown when GM has revealed a D100 result */}
          <SessionStatusBanner
            sessionRollState={sessionRollState}
            characterId={character.id}
            characterNames={{ [character.id]: character.name }}
            triggeredObligationType={character.obligation_type}
            ownObligationValue={character.obligation_value}
          />

          <div key={activeTab} style={
            activeTab === 'Session'
              ? { flex: 1, overflow: 'hidden', position: 'relative' }
              : { flex: 1, overflowY: 'auto', padding: 'var(--space-2) var(--space-3)', animation: 'hudTabIn 0.2s ease forwards' }
          }>
            {activeTab === 'Skills' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <DerivedStatsPanel
                  character={character}
                  liveTalents={hudTalents}
                  onVitalChange={handleVitalChange}
                  characterName={character.name}
                  effectiveStats={effectiveStats}
                  engineBreakdown={engineBreakdown}
                />
                <SkillsPanel
                  skills={hudSkills}
                  onRoll={handleSkillRoll}
                  onUpgrade={handleSkillUpgrade}
                  isCombat={isCombat}
                  xpAvailable={character.xp_available}
                  onOpenPopover={(skill, anchor) => setSkillPopover({ skill, anchor })}
                  characterId={characterId}
                  skillModifiers={skillModifiers}
                  speciesAbilities={speciesAbilities}
                  bonusSkillKeys={bonusSkillKeys}
                />
              </div>
            )}
            {activeTab === 'Talents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Spec selector bar */}
                {charSpecs.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    {charSpecs.map(cs => {
                      const ref = refSpecMap[cs.specialization_key]
                      const purchased = talents.filter(t => t.specialization_key === cs.specialization_key).length
                      const total = ref?.talent_tree?.rows?.reduce((s, r) => s + (r.talents?.length || 0), 0) || 0
                      const isActive = (activeSpecKey || charSpecs[0]?.specialization_key) === cs.specialization_key
                      return (
                        <button
                          key={cs.id}
                          onClick={() => setActiveSpecKey(cs.specialization_key)}
                          style={{
                            background: isActive ? 'rgba(200,170,80,0.12)' : 'transparent',
                            border: `1px solid ${isActive ? 'rgba(200,170,80,0.5)' : 'rgba(200,170,80,0.2)'}`,
                            borderRadius: 4, padding: '5px 12px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: FS_CAPTION, fontWeight: 600, letterSpacing: '0.06em',
                            color: isActive ? '#C8AA50' : '#6A8070',
                            transition: '.15s',
                          }}
                        >
                          {ref?.name || cs.specialization_key}
                          <span style={{ fontFamily: "var(--font-rajdhani),'Rajdhani',sans-serif", fontSize: FS_OVERLINE, color: isActive ? '#C8AA5088' : '#2A3A2E', background: 'rgba(200,170,80,0.08)', borderRadius: 8, padding: '0 5px' }}>
                            {purchased}/{total}
                          </span>
                        </button>
                      )
                    })}
                    <BuySpecButton
                      character={character}
                      charSpecs={charSpecs}
                      refSpecs={refSpecs}
                      refSpecMap={refSpecMap}
                      onBuy={specKey => handleBuySpecialization(specKey, setActiveSpecKey)}
                    />
                  </div>
                )}
                {/* ── Quick-Reference panel by activation type ── */}
                <WfTalentsPanel liveTalents={hudTalents} characterName={character.name} characterId={characterId} />
                {/* Inline talent tree */}
                {talentTreeData ? (
                  <TalentTree
                    specName={talentTreeData.specName}
                    nodes={talentTreeData.nodes}
                    connections={talentTreeData.connections}
                    onPurchase={async (talentKey, row, col) => {
                      const specKey = (activeSpecKey || charSpecs[0]?.specialization_key)!
                      if (talentKey === 'DEDI') {
                        const newId = await handlePurchaseTalent(talentKey, row, col, specKey)
                        if (newId) setPendingDedication({ talentId: newId, row, col, specKey })
                        return
                      }
                      handlePurchaseTalent(talentKey, row, col, specKey)
                    }}
                    onRemoveTalent={isGmMode ? handleRemoveTalent : undefined}
                    isGmMode={isGmMode}
                    xpAvailable={character.xp_available}
                  />
                ) : charSpecs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: "var(--font-rajdhani),'Rajdhani',sans-serif", fontSize: FS_SM, color: '#2A3A2E' }}>
                    No specializations purchased yet.
                  </div>
                ) : null}
              </div>
            )}
            {activeTab === 'Inventory' && (
              <InventoryPanel
                weapons={hudWeapons}
                armorItems={hudArmor}
                gearItems={hudGear}
                encumbranceCurrent={encumbranceCurrent}
                encumbranceThreshold={encThreshold}
                refWeaponQualityMap={refWeaponQualityMap}
                onSetWeaponState={(id, s) => handleSetEquipState(id, 'weapon', s)}
                onSetArmorState={(id, s) => handleSetEquipState(id, 'armor', s)}
                onSetGearState={(id, s) => handleSetEquipState(id, 'gear', s)}
                onDiscardWeapon={(id, note) => {
                  const name = hudWeapons.find(w => w.id === id)?.name ?? 'weapon'
                  handleRemoveWeapon(id, isGmMode ? 'gm' : 'player', note)
                  if (effectiveCampaignId && character) {
                    const label = isGmMode ? `GM removed "${name}" from ${character.name}` : `${character.name} dropped "${name}"`
                    supabase.from('roll_log').insert({ campaign_id: effectiveCampaignId, character_id: character.id, character_name: character.name, roll_label: label, roll_type: 'system', pool: { proficiency:0,ability:0,boost:0,challenge:0,difficulty:0,setback:0,force:0 }, result: { netSuccess:0,netAdvantage:0,triumph:0,despair:0,succeeded:false }, is_dm: !!isGmMode, hidden: false }).then(({ error }) => { if (error) console.warn('[discard] log failed:', error.message) })
                  }
                }}
                onDiscardArmor={(id, note) => {
                  const name = hudArmor.find(a => a.id === id)?.name ?? 'armor'
                  handleRemoveEquipment(id, 'armor', isGmMode ? 'gm' : 'player', note)
                  if (effectiveCampaignId && character) {
                    const label = isGmMode ? `GM removed "${name}" from ${character.name}` : `${character.name} dropped "${name}"`
                    supabase.from('roll_log').insert({ campaign_id: effectiveCampaignId, character_id: character.id, character_name: character.name, roll_label: label, roll_type: 'system', pool: { proficiency:0,ability:0,boost:0,challenge:0,difficulty:0,setback:0,force:0 }, result: { netSuccess:0,netAdvantage:0,triumph:0,despair:0,succeeded:false }, is_dm: !!isGmMode, hidden: false }).then(({ error }) => { if (error) console.warn('[discard] log failed:', error.message) })
                  }
                }}
                onDiscardGear={(id, note) => {
                  const name = hudGear.find(g => g.id === id)?.name ?? 'gear'
                  handleRemoveEquipment(id, 'gear', isGmMode ? 'gm' : 'player', note)
                  if (effectiveCampaignId && character) {
                    const label = isGmMode ? `GM removed "${name}" from ${character.name}` : `${character.name} dropped "${name}"`
                    supabase.from('roll_log').insert({ campaign_id: effectiveCampaignId, character_id: character.id, character_name: character.name, roll_label: label, roll_type: 'system', pool: { proficiency:0,ability:0,boost:0,challenge:0,difficulty:0,setback:0,force:0 }, result: { netSuccess:0,netAdvantage:0,triumph:0,despair:0,succeeded:false }, is_dm: !!isGmMode, hidden: false }).then(({ error }) => { if (error) console.warn('[discard] log failed:', error.message) })
                  }
                }}
                isGmMode={isGmMode}
                characterName={character.name}
              />
            )}
            {activeTab === 'Force' && (
              <ForcePanel
                forceRating={effectiveStats?.forceRating ?? forceRating}
                committedForce={character.force_rating_committed ?? 0}
                moralityValue={character.morality_value ?? 50}
                moralityStrength={character.morality_strength_key || ''}
                moralityWeakness={character.morality_weakness_key || ''}
                moralityConfigured={character.morality_configured}
                forcePowers={allForcePowers.filter(fp => fp.purchasedCount > 0)}
                conflicts={conflicts}
                xpAvailable={character.xp_available}
                onPurchasePower={(abilityKey, row, col, cost, powerKey) =>
                  handlePurchaseForceAbility(abilityKey, row, col, cost, powerKey)
                }
                onViewPower={pk => { setActivePowerKey(pk); setShowForceTree(true) }}
                onAdd={() => { setActivePowerKey(allForcePowers[0]?.powerKey ?? null); setShowForceTree(true) }}
                isFallen={character.is_dark_side_fallen === true}
              />
            )}
            {activeTab === 'Lore' && (
              <LoreContent
                characterName={character.name}
                careerName={careerName}
                speciesName={speciesName}
                gender={character.gender}
                backstory={character.backstory || ''}
                notes={character.notes || ''}
                speciesRef={refSpeciesAll.find(s => s.key === character.species_key)}
                motivationType={character.motivation_type || character.obligation_type || character.duty_type}
                motivationSpecific={character.motivation_specific}
                motivationDesc={character.motivation_description || character.obligation_notes || character.duty_notes}
                motivationConfigured={character.motivation_configured}
                dutyType={character.duty_type}
                dutyValue={character.duty_value}
                dutyLore={character.duty_lore}
                dutyCustomName={character.duty_custom_name}
                dutyResolvedType={refDutyTypes.find(d => d.key === character.duty_type)?.name}
                obligationType={character.obligation_type}
                obligationValue={character.obligation_value}
                obligationLore={character.obligation_lore}
                obligationCustomName={character.obligation_custom_name}
                obligationResolvedType={refObligationTypes.find(o => o.key === character.obligation_type)?.name}
                dutyObligationConfigured={character.duty_obligation_configured}
                onBackstoryChange={handleBackstoryChange}
                onNotesChange={handleNotesChange}
              />
            )}
            {activeTab === 'Feed' && (
              <RollFeedPanel
                rolls={rolls}
                ownCharacterId={character.id}
                isGm={false}
              />
            )}
            {activeTab === 'Session' && (
              <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
                {/* Map or placeholder */}
                {visibleMap
                  ? (
                    <MapCanvas
                      mapImageUrl={visibleMap.image_url}
                      tokens={visibleMapTokens}
                      isGM={false}
                      currentCharacterId={character.id}
                      onTokenMove={mapTokens.moveToken}
                      gridEnabled={visibleMap.grid_enabled}
                      gridSize={visibleMap.grid_size ?? 50}
                      tokenScale={visibleMap.token_scale ?? 1}
                      onTokenHover={(id, x, y) => setTokenHoverInfo({ tokenId: id, x, y })}
                      onTokenHoverEnd={() => setTokenHoverInfo(null)}
                    />
                  )
                  : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, background: '#060D09' }}>
                      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Waiting for GM to set a map</div>
                    </div>
                  )
                }

                {/* ── Combat overlays — only when an active encounter exists ── */}
                {isCombatActive && encounter && (
                  <>
                    {/* Initiative strip — full-height glassmorphic wrapper, z:30 sits above panels */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      background: 'rgba(6,13,9,0.85)', backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      zIndex: 30,
                    }}>
                      <InitiativeStrip encounter={encounter} character={character} />
                    </div>
                  </>
                )}

                {/* ── Session drawer trigger buttons — bottom-left, overlaid on map ── */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  display: 'flex', gap: 6,
                  zIndex: 31,
                }}>
                  <button
                    onClick={() => setTalentDrawerOpen(o => !o)}
                    style={{
                      fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: talentDrawerOpen ? '#060D09' : C.gold,
                      background: talentDrawerOpen ? C.gold : 'rgba(6,13,9,0.88)',
                      border: `1px solid rgba(200,170,80,0.5)`,
                      borderRadius: 4, padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                  >Talents</button>
                  {isCombatActive && encounter && (
                    <button
                      onClick={() => setAdversaryDrawerOpen(o => !o)}
                      style={{
                        fontFamily: FONT_RAJDHANI, fontSize: FS_CAPTION, fontWeight: 700,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: adversaryDrawerOpen ? '#060D09' : C.gold,
                        background: adversaryDrawerOpen ? C.gold : 'rgba(6,13,9,0.88)',
                        border: `1px solid rgba(200,170,80,0.5)`,
                        borderRadius: 4, padding: '4px 10px',
                        cursor: 'pointer',
                      }}
                    >{encounter && (encounter.vehicles ?? []).length > 0 ? 'Adversaries & Vehicles' : 'Adversaries'}</button>
                  )}
                </div>

                {/* ── Talents drawer — portal, slides in from left ── */}
                {createPortal(
                  <>
                    <div
                      onClick={() => setTalentDrawerOpen(false)}
                      style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        zIndex: 8999,
                        opacity: talentDrawerOpen ? 1 : 0,
                        pointerEvents: talentDrawerOpen ? 'auto' : 'none',
                        transition: 'opacity 0.26s',
                      }}
                    />
                    <div style={{
                      position: 'fixed', top: 0, left: 0, bottom: 0, width: 320,
                      zIndex: 9000,
                      display: 'flex', flexDirection: 'column',
                      background: 'rgba(6,10,8,0.97)',
                      borderRight: `1px solid ${talentDrawerOpen ? 'rgba(200,170,80,0.36)' : 'transparent'}`,
                      boxShadow: talentDrawerOpen ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
                      transform: talentDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                      transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s',
                      pointerEvents: talentDrawerOpen ? 'auto' : 'none',
                    }}>
                      <div style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 16px', height: 50,
                        borderBottom: 'rgba(200,170,80,0.14)',
                        background: 'rgba(10,18,12,0.92)',
                      }}>
                        <span style={{
                          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, letterSpacing: '0.2em',
                          textTransform: 'uppercase', color: C.gold, fontWeight: 700,
                        }}>Talents</span>
                        <button
                          onClick={() => setTalentDrawerOpen(false)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(106,128,112,1)', fontSize: 18, lineHeight: 1,
                            padding: '4px 6px', borderRadius: 4,
                          }}
                          aria-label="Close talents drawer"
                        >✕</button>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                        <TalentQuickReference talents={hudTalents} />
                      </div>
                    </div>
                  </>,
                  document.body,
                )}

                {/* ── Adversaries drawer — portal, slides in from left ── */}
                {isCombatActive && encounter && createPortal(
                  <>
                    <div
                      onClick={() => setAdversaryDrawerOpen(false)}
                      style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        zIndex: 8999,
                        opacity: adversaryDrawerOpen ? 1 : 0,
                        pointerEvents: adversaryDrawerOpen ? 'auto' : 'none',
                        transition: 'opacity 0.26s',
                      }}
                    />
                    <div style={{
                      position: 'fixed', top: 0, left: 0, bottom: 0, width: 320,
                      zIndex: 9000,
                      display: 'flex', flexDirection: 'column',
                      background: 'rgba(6,10,8,0.97)',
                      borderRight: `1px solid ${adversaryDrawerOpen ? 'rgba(200,170,80,0.36)' : 'transparent'}`,
                      boxShadow: adversaryDrawerOpen ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
                      transform: adversaryDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                      transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), border-color 0.2s',
                      pointerEvents: adversaryDrawerOpen ? 'auto' : 'none',
                    }}>
                      <div style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 16px', height: 50,
                        borderBottom: 'rgba(200,170,80,0.14)',
                        background: 'rgba(10,18,12,0.92)',
                      }}>
                        <span style={{
                          fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, letterSpacing: '0.2em',
                          textTransform: 'uppercase', color: C.gold, fontWeight: 700,
                        }}>{(encounter.vehicles ?? []).length > 0 ? 'Adversaries & Vehicles' : 'Adversaries'}</span>
                        <button
                          onClick={() => setAdversaryDrawerOpen(false)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(106,128,112,1)', fontSize: 18, lineHeight: 1,
                            padding: '4px 6px', borderRadius: 4,
                          }}
                          aria-label="Close adversaries drawer"
                        >✕</button>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                        <AdversaryCardList
                          revealedAdversaries={encounter.adversaries.filter(a => a.revealed)}
                          currentSlot={encounter.initiative_slots.find(s => s.current)}
                          initiativeSlots={encounter.initiative_slots}
                          cardCollapsed={sessionCardCollapsed}
                          setCardCollapsed={setSessionCardCollapsed}
                          weaponRef={{}}
                        />
                        {(encounter.vehicles ?? []).length > 0 && (
                          <VehicleCardList
                            vehicles={(encounter.vehicles ?? []).filter(v => v.revealed)}
                            currentSlot={encounter.initiative_slots.find(s => s.current)}
                            initiativeSlots={encounter.initiative_slots}
                            cardCollapsed={sessionCardCollapsed}
                            setCardCollapsed={setSessionCardCollapsed}
                          />
                        )}
                      </div>
                    </div>
                  </>,
                  document.body,
                )}

                {/* Token hover tooltip — portal to body */}
                {tokenHoverInfo && encounter && isCombatActive && (() => {
                  const hovToken = visibleMapTokens.find(t => t.id === tokenHoverInfo.tokenId)
                  if (!hovToken || hovToken.is_visible === false) return null
                  const slot = hovToken.slot_key
                    ? encounter.initiative_slots.find(s => s.id === hovToken.slot_key)
                    : null
                  const adv = slot?.adversaryInstanceId
                    ? encounter.adversaries.find(a => a.instanceId === slot.adversaryInstanceId)
                    : null
                  if (!adv || !adv.revealed) return null
                  const wMax = adv.type === 'minion' ? adv.woundThreshold * adv.groupSize : adv.woundThreshold
                  return createPortal(
                    <div style={{
                      position: 'fixed',
                      left: tokenHoverInfo.x + 14,
                      top: tokenHoverInfo.y - 40,
                      zIndex: 9999,
                      background: 'rgba(6,13,9,0.96)',
                      border: '1px solid rgba(200,170,80,0.45)',
                      borderRadius: 6, padding: '8px 12px',
                      fontFamily: FONT_RAJDHANI,
                      minWidth: 150, pointerEvents: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                    }}>
                      <div style={{ color: C.gold, fontWeight: 700, fontSize: FS_SM, marginBottom: 4 }}>{adv.name}</div>
                      <div style={{ color: 'rgba(232,223,200,0.7)', fontSize: FS_CAPTION, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {adv.type === 'minion' && (
                          <div>Group: {adv.groupSize} · W: {adv.woundsCurrent ?? 0}/{wMax}</div>
                        )}
                        {adv.type !== 'minion' && (
                          <div>Wounds: {adv.woundsCurrent ?? 0}/{wMax}</div>
                        )}
                        {adv.strainThreshold != null && adv.type !== 'minion' && (
                          <div>Strain: {adv.strainCurrent ?? 0}/{adv.strainThreshold}</div>
                        )}
                      </div>
                    </div>,
                    document.body,
                  )
                })()}
              </div>
            )}
            {activeTab === 'Group' && effectiveCampaignId && (
              <GroupSheet
                campaignId={effectiveCampaignId}
                characterName={character.name}
              />
            )}
            {activeTab === 'Group' && !effectiveCampaignId && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12, padding: 40 }}>
                <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, color: C.textFaint }}>NO CAMPAIGN</div>
                <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textFaint }}>Join a campaign to see the group sheet</div>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════ */}
        <div style={{
          background: 'rgba(4,9,6,0.7)',
          overflowY: 'auto', overflowX: 'hidden',
          padding: 'var(--space-2)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
        }}>
          <CombatCheckButton
            onOpen={() => setCombatCheckOpen(true)}
            isInCombat={isCombat}
          />
          {isForceUserSensitive(character, effectiveStats?.forceRating ?? forceRating) && (
            <div style={{ marginTop: 8 }}>
              <ForceCheckButton onOpen={() => setForceCheckOpen(true)} />
            </div>
          )}
          {rolls.length > 0 && (
            <RollFeedMini
              rolls={rolls}
              ownCharacterId={character.id}
              onExpand={() => setActiveTab('Feed')}
            />
          )}
        </div>
      </div>

      {/* ── Dice Result Modal ─────────────────────────────── */}
      {rollResult && (
        <DiceModal result={rollResult} skillName={rollLabel} onDismiss={() => setRollResult(null)} />
      )}

      {/* ── Talent Tree Modal ──────────────────────────────── */}
      {showTalentTree && (
        <div onClick={() => setShowTalentTree(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '1200px', maxHeight: '95vh', overflowY: 'auto', background: 'var(--sand)', border: '1px solid var(--bdr)', boxShadow: '0 8px 48px rgba(0,0,0,.3)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {charSpecs.map(cs => {
                const ref = refSpecMap[cs.specialization_key]
                const isActive = activeSpecKey === cs.specialization_key
                return (
                  <button key={cs.id} onClick={() => setActiveSpecKey(cs.specialization_key)} style={{ background: isActive ? 'var(--gold-glow)' : 'rgba(255,255,255,.6)', border: `1px solid ${isActive ? 'var(--gold)' : 'var(--bdr-l)'}`, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-caption)', fontWeight: isActive ? 700 : 600, letterSpacing: '0.08em', color: isActive ? 'var(--gold-d)' : 'var(--txt2)' }}>
                    {ref?.name || cs.specialization_key}
                    {cs.is_starting && <span style={{ fontSize: 'var(--text-overline)', color: 'var(--txt3)', marginLeft: '8px' }}>START</span>}
                  </button>
                )
              })}
              <BuySpecButton
                character={character}
                charSpecs={charSpecs}
                refSpecs={refSpecs}
                refSpecMap={refSpecMap}
                onBuy={specKey => handleBuySpecialization(specKey, setActiveSpecKey)}
              />
            </div>
            {talentTreeData ? (
              <TalentTree
                specName={talentTreeData.specName}
                nodes={talentTreeData.nodes}
                connections={talentTreeData.connections}
                onPurchase={async (talentKey, row, col) => {
                  if (talentKey === 'DEDI') {
                    const newId = await handlePurchaseTalent(talentKey, row, col, activeSpecKey!)
                    if (newId) setPendingDedication({ talentId: newId, row, col, specKey: activeSpecKey! })
                    return
                  }
                  handlePurchaseTalent(talentKey, row, col, activeSpecKey!)
                }}
                onRemoveTalent={isGmMode ? handleRemoveTalent : undefined}
                isGmMode={isGmMode}
                xpAvailable={character.xp_available}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body-sm)', color: 'var(--txt3)' }}>No talent tree data.</div>
            )}
            <button onClick={() => setShowTalentTree(false)} style={{ display: 'block', margin: '16px auto 0', background: 'rgba(255,255,255,.8)', border: '1px solid var(--bdr)', padding: '12px 32px', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-label)', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--txt2)', cursor: 'pointer' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* ── Force Power Tree Modal ────────────────────────── */}
      {showForceTree && (
        <div onClick={() => setShowForceTree(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '1100px', maxHeight: '95vh', overflowY: 'auto', background: '#060D09', border: `1px solid rgba(200,170,80,0.18)`, boxShadow: '0 8px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(200,170,80,0.08)', borderRadius: 8, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Power selector tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {allForcePowers.map(fp => {
                const isActive = activePowerKey === fp.powerKey
                return (
                  <button
                    key={fp.powerKey}
                    onClick={() => setActivePowerKey(fp.powerKey)}
                    style={{
                      background: isActive ? 'rgba(200,170,80,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(200,170,80,0.55)' : 'rgba(200,170,80,0.14)'}`,
                      borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
                      fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '0.06em',
                      color: isActive ? '#C8AA50' : '#6A8070',
                      transition: 'all .15s',
                    }}
                  >
                    {fp.powerName}
                    <span style={{ fontSize: FS_OVERLINE, color: isActive ? 'rgba(200,170,80,0.6)' : '#3A5040', marginLeft: 6 }}>
                      {fp.purchasedCount}/{fp.totalCount}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Tree */}
            {forcePowerTreeData ? (
              <ForcePowerTree
                powerName={forcePowerTreeData.powerName}
                nodes={forcePowerTreeData.nodes}
                connections={forcePowerTreeData.connections}
                onPurchase={(abilityKey, row, col, cost) => handlePurchaseForceAbility(abilityKey, row, col, cost, activePowerKey!)}
                xpAvailable={character.xp_available}
                purchasedCount={forcePowerTreeData.purchasedCount}
                totalCount={forcePowerTreeData.totalCount}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: '#3A5040' }}>No force power tree data.</div>
            )}

            {/* Close */}
            <button
              onClick={() => setShowForceTree(false)}
              style={{
                display: 'block', margin: '4px auto 0',
                background: 'rgba(200,170,80,0.08)',
                border: '1px solid rgba(200,170,80,0.3)',
                borderRadius: 4, padding: '10px 40px',
                fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#C8AA50', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── GM Dialog ─────────────────────────────────────── */}
      {gmDialog && (
        <div onClick={() => setGmDialog(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', background: 'var(--sand)', border: '2px solid var(--gold)', boxShadow: '0 0 40px var(--gold-glow-s), 0 8px 48px rgba(0,0,0,.3)', padding: '32px 28px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--gold-d)', marginBottom: '16px' }}>INCOMING TRANSMISSION</div>
            <div style={{ fontFamily: 'var(--font-chakra)', fontSize: 'var(--font-md)', color: 'var(--ink)', lineHeight: 1.6, marginBottom: '24px' }}>{gmDialog}</div>
            <button onClick={() => setGmDialog(null)} style={{ background: 'var(--gold)', border: 'none', padding: '12px 40px', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--white)', cursor: 'pointer' }}>DISMISS</button>
          </div>
        </div>
      )}

      {/* ── Force Roll Modal ──────────────────────────────── */}
      {forceRollResult && (
        <ForceRollModal
          result={forceRollResult}
          forceRating={forceRating}
          onDismiss={() => setForceRollResult(null)}
        />
      )}

      {/* ── Initiative Roll Modal ─────────────────────────── */}
      {initRoll && character && (
        <InitiativeRollModal
          character={character}
          skills={skills}
          initiativeType={initRoll.type}
          campaignId={initRoll.campaignId}
          forceRating={forceRating}
          onClose={() => setInitRoll(null)}
        />
      )}

      {/* ── Skill Roll Popover ────────────────────────────── */}
      {skillPopover && (
        <SkillRollPopover
          skill={skillPopover.skill}
          anchor={skillPopover.anchor}
          talentHints={(() => {
            const rankMap = new Map<string, number>()
            // Purchased talents
            for (const t of talents) {
              const ref = refTalentMap[t.talent_key]
              if (!ref?.modifiers?.relevant_skills?.includes(skillPopover.skill.key)) continue
              rankMap.set(t.talent_key, (rankMap.get(t.talent_key) ?? 0) + (t.ranks ?? 1))
            }
            // Species-granted talents
            for (const sa of speciesAbilities) {
              if (sa.mechanical_type !== 'talent_rank' || !sa.talent_key) continue
              const ref = refTalentMap[sa.talent_key]
              if (!ref?.modifiers?.relevant_skills?.includes(skillPopover.skill.key)) continue
              rankMap.set(sa.talent_key, (rankMap.get(sa.talent_key) ?? 0) + (sa.rank_add ?? 1))
            }
            const hints = Array.from(rankMap.entries()).map(([key, ranks]) => {
              const ref = refTalentMap[key]!
              return {
                name: ref.name,
                activation: ref.activation,
                description: ref.description ?? '',
                ranks,
              }
            })
            // Species die_modifier abilities affecting this skill
            for (const sa of speciesAbilities) {
              if (sa.mechanical_type !== 'die_modifier') continue
              if (!Array.isArray(sa.affected_skills) || !sa.affected_skills.includes(skillPopover.skill.key)) continue
              hints.push({
                name: sa.name,
                activation: 'taPassive',
                description: sa.description ?? '',
                ranks: 1,
              })
            }
            return hints
          })()}
          onRoll={(result, label, pool) => {
            handleRoll(result, label, pool as Record<string, number>)
            setSkillPopover(null)
          }}
          onClose={() => setSkillPopover(null)}
        />
      )}

      {/* ── Destiny Roll Modal (mandatory) ───────────────── */}
      {destinyRollRequest && effectiveCampaignId && character && (
        <DestinyRollModal
          poolId={destinyRollRequest.poolId}
          campaignId={effectiveCampaignId}
          characterId={character.id}
          characterName={character.name}
          supabase={supabase}
          onSubmitted={() => setDestinyRollRequest(null)}
        />
      )}

      {/* ── Destiny Spend Confirmation ────────────────────── */}
      {destinySpendOpen && destinyPoolRecord && effectiveCampaignId && character && (
        <DestinySpendConfirmModal
          pool={destinyPoolRecord}
          characterName={character.name}
          campaignId={effectiveCampaignId}
          characterId={character.id}
          supabase={supabase}
          onClose={() => setDestinySpendOpen(false)}
          onConfirmed={() => setDestinySpendOpen(false)}
        />
      )}

      {/* ── GM Destiny Flash ──────────────────────────────── */}
      {destinyGmFlash && (
        <DestinyGMFlash
          prevLightCount={destinyGmFlash.prevLight}
          prevDarkCount={destinyGmFlash.prevDark}
          newLightCount={destinyGmFlash.newLight}
          newDarkCount={destinyGmFlash.newDark}
          onDismiss={() => setDestinyGmFlash(null)}
        />
      )}

      {/* ── Destiny Considering Banner ────────────────────── */}
      {destinyConsidering && (
        <DestinyConsideringBanner
          characterName={destinyConsidering}
          onDismiss={() => setDestinyConsidering(null)}
        />
      )}

      {/* ── Loot Reveal ───────────────────────────────────── */}
      {lootReveal && (() => {
        const r = lootReveal as Record<string, unknown>
        const rarity = (r.rarity as number) || 0
        const color = rarity <= 2 ? 'var(--txt3)' : rarity <= 4 ? 'var(--green)' : rarity <= 6 ? 'var(--blue)' : rarity <= 8 ? '#7B3FA0' : 'var(--gold)'
        const label = rarity <= 2 ? 'Common' : rarity <= 4 ? 'Uncommon' : rarity <= 6 ? 'Rare' : rarity <= 8 ? 'Epic' : 'Legendary'
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'var(--sand)', border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}, 0 8px 48px rgba(0,0,0,.4)`, padding: '32px 28px 28px', textAlign: 'center', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.25em', color, marginBottom: '16px', textTransform: 'uppercase' }}>{r.source as string}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <EquipmentImage itemKey={r.key as string} itemType={r.itemType as 'weapon' | 'armor' | 'gear'} categories={r.categories as string[]} size="lg" style={{ width: 120, height: 120 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-lg)', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--ink)', marginBottom: '8px', lineHeight: 1.2 }}>{r.name as string}</div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)', fontWeight: 700, color, marginBottom: '12px', letterSpacing: '0.1em' }}>Rarity {rarity} — {label}</div>
              <button onClick={() => setLootReveal(null)} style={{ background: 'var(--gold)', border: 'none', padding: '10px 32px', fontFamily: 'var(--font-orbitron)', fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--white)', cursor: 'pointer' }}>CLAIM</button>
            </div>
          </div>
        )
      })()}

      {/* ── Vendor Purchase Dialog ───────────────────────── */}
      {vendorOffer && character && (
        <VendorPurchaseDialog
          offer={vendorOffer}
          character={character}
          refWeaponQualityMap={refWeaponQualityMap}
          supabase={supabase}
          onCreditSpend={(amount, cid) => handleCreditSpend(amount, cid)}
          onClose={() => setVendorOffer(null)}
        />
      )}

      {/* ── Spend Credits modal ───────────────────────────── */}
      {spendCreditsOpen && character && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setSpendCreditsOpen(false)}
        >
          <div
            style={{ background: C.panelBg, border: `1px solid ${C.borderHi}`, borderTop: `3px solid #4EC87A`, padding: '24px 24px 20px', maxWidth: 340, width: '100%', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: '#4EC87A', letterSpacing: '0.15em', marginBottom: 4 }}>SPEND CREDITS</div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, marginBottom: 18 }}>
              Available: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{character.credits.toLocaleString()}</span>
            </div>
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: C.textDim, letterSpacing: '0.08em', marginBottom: 6 }}>HOW MUCH DO YOU WANT TO SPEND?</div>
            <input
              type="number"
              min={1}
              max={character.credits}
              value={spendAmount}
              onChange={e => setSpendAmount(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSpendCredits(); if (e.key === 'Escape') setSpendCreditsOpen(false) }}
              autoFocus
              placeholder="0"
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.borderHi}`, color: '#FFFFFF', fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, padding: '10px 14px', outline: 'none', boxSizing: 'border-box', marginBottom: 18 }}
            />
            {(() => {
              const amt = parseInt(spendAmount, 10)
              const valid = amt > 0 && amt <= character.credits
              return (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setSpendCreditsOpen(false)} style={{ flex: 1, padding: '10px 0', background: 'transparent', border: `1px solid ${C.border}`, fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 600, letterSpacing: '0.1em', color: C.textDim, cursor: 'pointer' }}>
                    CANCEL
                  </button>
                  <button
                    onClick={handleSpendCredits}
                    disabled={!valid}
                    style={{ flex: 2, padding: '10px 0', background: valid ? '#4EC87A' : 'rgba(78,200,122,0.15)', border: `1px solid ${valid ? '#4EC87A' : C.border}`, fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.12em', color: valid ? C.bg : C.textDim, cursor: valid ? 'pointer' : 'default', transition: 'background 0.15s' }}
                  >
                    {valid ? `SPEND ${amt.toLocaleString()} cr` : 'SPEND'}
                  </button>
                </div>
              )
            })()}
          </div>
        </div>,
        document.body,
      )}

      {/* ── Dedication characteristic picker ──────────────── */}
      {pendingDedication && character && createPortal(
        <DedicationModal
          character={character}
          onConfirm={async (charKey) => {
            const { talentId } = pendingDedication
            setPendingDedication(null)
            await handleResolveDedication(talentId, charKey)
          }}
          onCancel={() => setPendingDedication(null)}
        />,
        document.body,
      )}

      {/* ── Floating Dice Roller FAB ──────────────────────── */}
      {character && (
        <FloatingDiceRollerFAB
          characterId={character.id}
          characterName={character.name}
          campaignId={effectiveCampaignId}
        />
      )}
    </div>
  )
}

// ── Dedication Modal ──────────────────────────────────────────────────────────
const CHAR_KEYS_ORDERED: CharKey[] = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence']

const DEDICATION_CHAR_LABEL: Record<CharKey, string> = {
  brawn:     'Brawn',
  agility:   'Agility',
  intellect: 'Intellect',
  cunning:   'Cunning',
  willpower: 'Willpower',
  presence:  'Presence',
}

function DedicationModal({
  character, onConfirm, onCancel,
}: {
  character: Character
  onConfirm: (key: CharKey) => void
  onCancel:  () => void
}) {
  const [selected, setSelected] = useState<CharKey | null>(null)

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onCancel}
    >
      <div
        style={{ background: C.panelBg, border: `1px solid ${C.borderHi}`, borderTop: `3px solid ${C.gold}`, padding: '28px 28px 24px', maxWidth: 400, width: '100%', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ fontFamily: FONT_CINZEL, fontSize: FS_H4, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', marginBottom: 4 }}>
          DEDICATION
        </div>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, color: C.textDim, letterSpacing: '0.05em', marginBottom: 20 }}>
          Choose a characteristic to permanently increase by 1.
        </div>

        {/* Characteristic grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {CHAR_KEYS_ORDERED.map(key => {
            const val = (character[key] as number) ?? 2
            const maxed = val >= 6
            const isSel = selected === key
            const color = CHAR_COLOR[key]
            return (
              <button
                key={key}
                disabled={maxed}
                onClick={() => !maxed && setSelected(key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isSel ? `${color}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSel ? color : C.border}`,
                  outline: isSel ? `1px solid ${color}` : 'none',
                  cursor: maxed ? 'not-allowed' : 'pointer',
                  opacity: maxed ? 0.35 : 1,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 600, color: isSel ? color : C.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {DEDICATION_CHAR_LABEL[key]}
                </span>
                <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_H3, fontWeight: 700, color: isSel ? color : C.textDim, lineHeight: 1 }}>
                  {val} <span style={{ fontSize: FS_CAPTION, color: isSel ? color : '#3A5A45', fontFamily: FONT_RAJDHANI }}>→ {val + 1}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', background: 'transparent', border: `1px solid ${C.border}`, fontFamily: FONT_RAJDHANI, fontSize: FS_SM, fontWeight: 600, letterSpacing: '0.1em', color: C.textDim, cursor: 'pointer' }}>
            CANCEL
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            style={{ flex: 2, padding: '10px 0', background: selected ? C.gold : 'rgba(200,170,80,0.15)', border: `1px solid ${selected ? C.gold : C.border}`, fontFamily: FONT_CINZEL, fontSize: FS_SM, fontWeight: 700, letterSpacing: '0.12em', color: selected ? C.bg : C.textDim, cursor: selected ? 'pointer' : 'default', transition: 'background 0.15s' }}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  )
}
