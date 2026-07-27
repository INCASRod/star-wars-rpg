'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { DiceModal } from './DiceModal'
import { HudForcePowerTreeModal } from './HudForcePowerTreeModal'
import { ForceRollModal } from './ForceRollModal'
import { InitiativeRollModal } from './InitiativeRollModal'
import { HudSpendCreditsModal } from './HudSpendCreditsModal'
import { FloatingDiceRollerFAB } from './FloatingDiceRollerFAB'
import { VendorPurchaseDialog, type VendorOffer } from './VendorPurchaseDialog'
import { SkillRollPopover } from '@/components/character/SkillRollPopover'
import { EquipmentImage } from '@/components/ui/EquipmentImage'
import { DestinyRollModal } from '@/components/destiny/DestinyRollModal'
import { DestinySpendConfirmModal } from '@/components/destiny/DestinySpendConfirmModal'
import { DestinyGMFlash, DestinyConsideringBanner } from '@/components/destiny/DestinyGMFlash'
import type { DestinyPoolRecord } from '@/components/destiny/DestinyPoolDisplay'
import type { RollResult } from './dice-engine'
import { FONT_DISPLAY, FONT_BODY } from '@/lib/tokens'
import type { ForceRollResult } from './dice-engine'
import type { HudSkill } from './SkillsPanel'
import type { ForcePowerDisplay } from './ForcePanel'
import type { ForceTreeNode, ForceTreeConnection } from '@/components/character/ForcePowerTree'
import type {
  Character, CharacterSkill, CharacterTalent,
  RefTalent, SpeciesAbility, RefWeaponQuality,
} from '@/lib/types'

interface HudModalsOverlayProps {
  character: Character
  skills: CharacterSkill[]
  talents: CharacterTalent[]
  refTalentMap: Record<string, RefTalent>
  speciesAbilities: SpeciesAbility[]
  forceRating: number
  effectiveCampaignId: string | null
  supabase: SupabaseClient
  isGmMode: boolean
  refWeaponQualityMap: Record<string, RefWeaponQuality>

  rollResult: RollResult | null
  rollLabel: string | undefined
  setRollResult: (r: RollResult | null) => void

  showForceTree: boolean
  setShowForceTree: (b: boolean) => void
  allForcePowers: ForcePowerDisplay[]
  activePowerKey: string | null
  setActivePowerKey: (k: string | null) => void
  forcePowerTreeData: { powerName: string; nodes: ForceTreeNode[]; connections: ForceTreeConnection[]; purchasedCount: number; totalCount: number } | null
  onPurchaseForceAbility: (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => void

  gmDialog: string | null
  setGmDialog: (s: string | null) => void

  gmCritInjuryDialog:    { name: string; severity: string; description: string } | null
  setGmCritInjuryDialog: (d: { name: string; severity: string; description: string } | null) => void

  forceRollResult: ForceRollResult | null
  setForceRollResult: (r: ForceRollResult | null) => void

  initRoll: { type: 'vigilance' | 'cool'; campaignId: string } | null
  setInitRoll: (r: { type: 'vigilance' | 'cool'; campaignId: string } | null) => void

  skillPopover: { skill: HudSkill; anchor: DOMRect } | null
  setSkillPopover: (p: { skill: HudSkill; anchor: DOMRect } | null) => void
  onRoll: (result: RollResult, label?: string, pool?: Record<string, number>) => void

  destinyRollRequest: { poolId: string } | null
  setDestinyRollRequest: (r: { poolId: string } | null) => void
  destinySpendOpen: boolean
  setDestinySpendOpen: (b: boolean) => void
  destinyPoolRecord: DestinyPoolRecord | null
  destinyGmFlash: { prevLight: number; prevDark: number; newLight: number; newDark: number } | null
  setDestinyGmFlash: (f: { prevLight: number; prevDark: number; newLight: number; newDark: number } | null) => void
  destinyConsidering: string | null
  setDestinyConsidering: (s: string | null) => void

  lootReveal: Record<string, unknown> | null
  setLootReveal: (r: Record<string, unknown> | null) => void
  vendorOffer: VendorOffer | null
  setVendorOffer: (o: VendorOffer | null) => void
  onCreditSpend: (amount: number, cid: string) => Promise<void>

  spendCreditsOpen: boolean
  setSpendCreditsOpen: (b: boolean) => void

  pendingForceRatingOffer: boolean
  setPendingForceRatingOffer: (b: boolean) => void
  onPurchaseForceRating: () => Promise<void>

  diceOpen?:         boolean
  onDiceOpenChange?: (open: boolean) => void
}

export function HudModalsOverlay({
  character, skills, talents, refTalentMap, speciesAbilities, forceRating,
  effectiveCampaignId, supabase, isGmMode, refWeaponQualityMap,
  rollResult, rollLabel, setRollResult,
  showForceTree, setShowForceTree, allForcePowers, activePowerKey, setActivePowerKey, forcePowerTreeData, onPurchaseForceAbility,
  gmDialog, setGmDialog,
  gmCritInjuryDialog, setGmCritInjuryDialog,
  forceRollResult, setForceRollResult,
  initRoll, setInitRoll,
  skillPopover, setSkillPopover, onRoll,
  destinyRollRequest, setDestinyRollRequest,
  destinySpendOpen, setDestinySpendOpen, destinyPoolRecord,
  destinyGmFlash, setDestinyGmFlash,
  destinyConsidering, setDestinyConsidering,
  lootReveal, setLootReveal,
  vendorOffer, setVendorOffer, onCreditSpend,
  spendCreditsOpen, setSpendCreditsOpen,
  pendingForceRatingOffer, setPendingForceRatingOffer, onPurchaseForceRating,
  diceOpen, onDiceOpenChange,
}: HudModalsOverlayProps) {
  return (
    <>
      {rollResult && (
        <DiceModal result={rollResult} skillName={rollLabel} onDismiss={() => setRollResult(null)} />
      )}

      <HudForcePowerTreeModal
        open={showForceTree}
        onClose={() => setShowForceTree(false)}
        allForcePowers={allForcePowers}
        activePowerKey={activePowerKey}
        setActivePowerKey={setActivePowerKey}
        forcePowerTreeData={forcePowerTreeData}
        xpAvailable={character.xp_available}
        onPurchaseForceAbility={onPurchaseForceAbility}
      />

      {gmDialog && (
        <div onClick={() => setGmDialog(null)} className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', padding: 'var(--space-6)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', background: 'var(--sand)', border: '2px solid var(--gold)', boxShadow: '0 0 40px var(--gold-glow-s), 0 8px 48px rgba(0,0,0,.3)', padding: 'var(--space-8) 1.75rem var(--space-6)', textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--gold-d)', marginBottom: 'var(--space-4)' }}>INCOMING TRANSMISSION</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--font-md)', color: 'var(--ink)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>{gmDialog}</div>
            <button onClick={() => setGmDialog(null)} style={{ background: 'var(--gold)', border: 'none', padding: 'var(--space-3) 2.5rem', fontFamily: FONT_DISPLAY, fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--white)', cursor: 'pointer' }}>DISMISS</button>
          </div>
        </div>
      )}

      {gmCritInjuryDialog && (
        <div
          onClick={() => setGmCritInjuryDialog(null)}
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 'var(--z-toast)',
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)',
            padding: 'var(--space-6)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              background: 'var(--sand)',
              border: '2px solid rgba(220,20,60,0.55)',
              boxShadow: '0 0 40px rgba(220,20,60,0.2), 0 8px 48px rgba(0,0,0,.4)',
              padding: '1.75rem var(--space-6) 1.25rem',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-overline)',
              fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(220,20,60,0.8)', marginBottom: 'var(--space-2)',
            }}>
              ⚠ Critical Injury Received
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)',
              fontWeight: 700, color: 'var(--ink)', marginBottom: '0.625rem',
            }}>
              {gmCritInjuryDialog.name}
            </div>
            {gmCritInjuryDialog.severity && (
              <div style={{
                display: 'inline-block', marginBottom: '0.875rem',
                background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.35)',
                padding: '2px var(--space-2)',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-overline)',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(220,20,60,0.85)',
              }}>
                {gmCritInjuryDialog.severity}
              </div>
            )}
            {gmCritInjuryDialog.description && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                color: 'var(--ink)', lineHeight: 1.65, marginBottom: 'var(--space-5)',
                borderLeft: '2px solid rgba(220,20,60,0.3)', paddingLeft: '0.625rem',
              }}>
                {gmCritInjuryDialog.description}
              </div>
            )}
            <button
              onClick={() => setGmCritInjuryDialog(null)}
              className="w-full cursor-pointer"
              style={{
                background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.4)',
                padding: '0.625rem 0',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-label)',
                fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(220,20,60,0.9)',
              }}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {forceRollResult && (
        <ForceRollModal result={forceRollResult} forceRating={forceRating} onDismiss={() => setForceRollResult(null)} />
      )}

      {initRoll && (
        <InitiativeRollModal
          character={character}
          skills={skills}
          initiativeType={initRoll.type}
          campaignId={initRoll.campaignId}
          forceRating={forceRating}
          onClose={() => setInitRoll(null)}
        />
      )}

      {skillPopover && (
        <SkillRollPopover
          skill={skillPopover.skill}
          anchor={skillPopover.anchor}
          character={character}
          talentHints={(() => {
            const rankMap = new Map<string, number>()
            for (const t of talents) {
              const ref = refTalentMap[t.talent_key]
              if (!ref?.modifiers?.relevant_skills?.includes(skillPopover.skill.key)) continue
              rankMap.set(t.talent_key, (rankMap.get(t.talent_key) ?? 0) + (t.ranks ?? 1))
            }
            for (const sa of speciesAbilities) {
              if (sa.mechanical_type !== 'talent_rank' || !sa.talent_key) continue
              const ref = refTalentMap[sa.talent_key]
              if (!ref?.modifiers?.relevant_skills?.includes(skillPopover.skill.key)) continue
              rankMap.set(sa.talent_key, (rankMap.get(sa.talent_key) ?? 0) + (sa.rank_add ?? 1))
            }
            const hints = Array.from(rankMap.entries()).map(([key, ranks]) => {
              const ref = refTalentMap[key]!
              return { name: ref.name, activation: ref.activation, description: ref.description ?? '', ranks }
            })
            for (const sa of speciesAbilities) {
              if (sa.mechanical_type !== 'die_modifier') continue
              if (!Array.isArray(sa.affected_skills) || !sa.affected_skills.includes(skillPopover.skill.key)) continue
              hints.push({ name: sa.name, activation: 'taPassive', description: sa.description ?? '', ranks: 1 })
            }
            return hints
          })()}
          onRoll={(result, label, pool) => {
            onRoll(result, label, pool as Record<string, number>)
            setSkillPopover(null)
          }}
          onClose={() => setSkillPopover(null)}
        />
      )}

      {destinyRollRequest && effectiveCampaignId && (
        <DestinyRollModal
          poolId={destinyRollRequest.poolId}
          campaignId={effectiveCampaignId}
          characterId={character.id}
          characterName={character.name}
          supabase={supabase}
          onSubmitted={() => setDestinyRollRequest(null)}
        />
      )}

      {destinySpendOpen && destinyPoolRecord && effectiveCampaignId && (
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

      {destinyGmFlash && (
        <DestinyGMFlash
          prevLightCount={destinyGmFlash.prevLight}
          prevDarkCount={destinyGmFlash.prevDark}
          newLightCount={destinyGmFlash.newLight}
          newDarkCount={destinyGmFlash.newDark}
          onDismiss={() => setDestinyGmFlash(null)}
        />
      )}

      {destinyConsidering && (
        <DestinyConsideringBanner characterName={destinyConsidering} onDismiss={() => setDestinyConsidering(null)} />
      )}

      {lootReveal && (() => {
        const r = lootReveal
        const rarity = (r.rarity as number) || 0
        const color = rarity <= 2 ? 'var(--txt3)' : rarity <= 4 ? 'var(--green)' : rarity <= 6 ? 'var(--blue)' : rarity <= 8 ? '#7B3FA0' : 'var(--gold)'
        const label = rarity <= 2 ? 'Common' : rarity <= 4 ? 'Uncommon' : rarity <= 6 ? 'Rare' : rarity <= 8 ? 'Epic' : 'Legendary'
        return (
          <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)', padding: 'var(--space-6)' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'var(--sand)', border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}, 0 8px 48px rgba(0,0,0,.4)`, padding: 'var(--space-8) 1.75rem var(--space-7)', textAlign: 'center', position: 'relative' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.25em', color, marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>{r.source as string}</div>
              <div className="flex justify-center" style={{ marginBottom: 'var(--space-4)' }}>
                <EquipmentImage itemKey={r.key as string} itemType={r.itemType as 'weapon' | 'armor' | 'gear'} categories={r.categories as string[]} size="lg" style={{ width: 120, height: 120 }} />
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--font-lg)', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--ink)', marginBottom: 'var(--space-2)', lineHeight: 1.2 }}>{r.name as string}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--font-sm)', fontWeight: 700, color, marginBottom: 'var(--space-3)', letterSpacing: '0.1em' }}>Rarity {rarity} — {label}</div>
              <button onClick={() => setLootReveal(null)} className="cursor-pointer" style={{ background: 'var(--gold)', border: 'none', padding: '0.625rem 2rem', fontFamily: FONT_DISPLAY, fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--white)' }}>CLAIM</button>
            </div>
          </div>
        )
      })()}

      {vendorOffer && (
        <VendorPurchaseDialog
          offer={vendorOffer}
          character={character}
          refWeaponQualityMap={refWeaponQualityMap}
          supabase={supabase}
          onCreditSpend={(amount, cid) => onCreditSpend(amount, cid)}
          onClose={() => setVendorOffer(null)}
        />
      )}

      <HudSpendCreditsModal
        open={spendCreditsOpen}
        onClose={() => setSpendCreditsOpen(false)}
        credits={character.credits}
        onConfirm={async (amount) => {
          setSpendCreditsOpen(false)
          await onCreditSpend(amount, effectiveCampaignId!)
        }}
      />

      {/* Optional, dismissible — unlike Dedication, "Later" does NOT revert the
          specialization purchase. The Force tab CTA (ForcePanel) is the deferred path. */}
      {pendingForceRatingOffer && (
        <div
          onClick={() => setPendingForceRatingOffer(false)}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', padding: 'var(--space-6)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              background: 'var(--sand)',
              border: '2px solid var(--die-force)',
              boxShadow: '0 0 40px color-mix(in srgb, var(--die-force) 25%, transparent), 0 8px 48px rgba(0,0,0,.3)',
              padding: 'var(--space-8) 1.75rem var(--space-6)', textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--font-2xs)', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--die-force)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>
              Force Sensitivity Awakens
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--font-md)', color: 'var(--ink)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
              Gain Force Rating 1 for 10 XP now, or defer and purchase it later from the Force tab.
            </div>
            <div className="flex justify-center" style={{ gap: 'var(--space-3)' }}>
              <button
                onClick={() => setPendingForceRatingOffer(false)}
                style={{ background: 'transparent', border: '1px solid var(--hud-border-hi)', padding: 'var(--space-3) 1.5rem', fontFamily: FONT_DISPLAY, fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--ink)', cursor: 'pointer' }}
              >
                LATER
              </button>
              <button
                onClick={async () => { setPendingForceRatingOffer(false); await onPurchaseForceRating() }}
                disabled={character.xp_available < 10}
                style={{
                  background: character.xp_available < 10 ? 'var(--hud-surface-lo)' : 'var(--die-force)',
                  border: 'none', padding: 'var(--space-3) 2.5rem',
                  fontFamily: FONT_DISPLAY, fontSize: 'var(--text-label)', fontWeight: 700, letterSpacing: '0.15em',
                  color: character.xp_available < 10 ? 'var(--hud-text-faint)' : 'var(--white)',
                  cursor: character.xp_available < 10 ? 'not-allowed' : 'pointer',
                }}
              >
                GAIN FOR 10 XP
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingDiceRollerFAB
        characterId={character.id}
        characterName={character.name}
        campaignId={effectiveCampaignId}
        open={diceOpen}
        onOpenChange={onDiceOpenChange}
      />
    </>
  )
}
