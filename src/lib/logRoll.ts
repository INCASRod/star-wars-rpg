import { createClient } from '@/lib/supabase/client'
import type { RollResult } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/components/player-hud/design-tokens'

/** Optional metadata passed by Combat / Force / Initiative overlays */
export interface RollMeta {
  rollType?:       string   // 'skill' | 'combat' | 'force' | 'initiative'
  weaponName?:     string   // weapon or power name (combat / force)
  targetName?:     string   // target(s) for combat
  rangeBand?:      string   // range band for combat
  weaponDamage?:    number   // base weapon damage (weapon.damage)
  weaponDamageAdd?: number   // brawn modifier (weapon.damage_add, melee only)
  characterBrawn?:  number   // attacker brawn (melee damage modifier)
  attackType?:     'melee' | 'ranged'
  alignment?:      string   // 'player' | 'allied' | 'enemy'
  // Critical hit eligibility (populated by CombatCheckOverlay)
  critEligible?:   boolean
  critRating?:     number
  critModifier?:   number
}

export interface RollLogEntry {
  campaignId:          string
  characterId:         string | null   // null for GM rolls (character_id is UUID, 'gm' is invalid)
  characterName:       string
  label:               string | undefined
  pool:                Record<DiceType, number>
  result:              RollResult
  isDM?:               boolean
  hidden?:             boolean
  meta?:               RollMeta
}

/** Fire-and-forget — does not block the caller */
export function logRoll({
  campaignId, characterId, characterName,
  label, pool, result, isDM = false, hidden = false,
  meta,
}: RollLogEntry): void {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {
    campaign_id:    campaignId,
    character_id:   characterId,
    character_name: characterName,
    roll_label:     label ?? null,
    pool,
    result: {
      netSuccess:   result.net.success,
      netAdvantage: result.net.advantage,
      triumph:      result.net.triumph,
      despair:      result.net.despair,
      succeeded:    result.net.success > 0,
    },
    is_dm:  isDM,
    hidden,
  }

  if (meta?.rollType)   payload.roll_type   = meta.rollType
  if (meta?.weaponName) payload.weapon_name = meta.weaponName
  if (meta?.targetName) payload.target_name = meta.targetName
  if (meta?.rangeBand)  payload.range_band  = meta.rangeBand
  if (meta?.alignment)  payload.alignment   = meta.alignment

  // Force dice rolled as part of a skill/combat pool — stored in the same
  // `dice_results` shape the Force card already uses, so every card type can
  // render per-die light/dark pips from one field.
  const forceDice = result.force?.dice ?? []

  if (
    meta?.weaponDamage != null || meta?.weaponDamageAdd != null || meta?.characterBrawn != null ||
    meta?.attackType || meta?.critEligible != null || meta?.critRating != null || meta?.critModifier != null ||
    forceDice.length > 0
  ) {
    payload.roll_meta = {
      ...(forceDice.length > 0 ? { dice_results: forceDice } : {}),
      ...(meta?.weaponDamage    != null ? { weaponDamage:    meta.weaponDamage }    : {}),
      ...(meta?.weaponDamageAdd != null ? { weaponDamageAdd: meta.weaponDamageAdd } : {}),
      ...(meta?.characterBrawn  != null ? { characterBrawn:  meta.characterBrawn }  : {}),
      ...(meta?.attackType              ? { attackType:      meta.attackType }      : {}),
      ...(meta?.critEligible    != null ? { critEligible:    meta.critEligible }    : {}),
      ...(meta?.critRating      != null ? { critRating:      meta.critRating }      : {}),
      ...(meta?.critModifier    != null ? { critModifier:    meta.critModifier }    : {}),
    }
  }

  supabase.from('roll_log').insert(payload).then(({ error }) => {
    if (error) console.warn('[logRoll] failed:', error.message)
  })
}

export interface PurchaseMeta {
  purchase_type:     'skill' | 'talent' | 'force' | 'specialization'
  xp_cost:           number
  refunded:          boolean
  // skill
  skill_key?:        string
  prev_rank?:        number
  new_rank?:         number
  // talent
  talent_id?:        string   // character_talents row UUID — deleted on refund
  talent_key?:       string
  stat_delta?:       Record<string, number>  // character stat changes to reverse
  // force power
  force_ability_id?: string   // character_force_abilities row UUID — deleted on refund
  force_power_key?:  string
  force_ability_key?: string
  // specialization
  specialization_key?: string
}

/** Fire-and-forget. Writes a GM-only system entry to roll_log for an XP purchase. */
export function logPurchaseNotification({
  campaignId,
  characterId,
  characterName,
  label,
  meta,
}: {
  campaignId:    string
  characterId:   string
  characterName: string
  label:         string
  meta:          PurchaseMeta
}): void {
  const supabase = createClient()
  supabase.from('roll_log').insert({
    campaign_id:    campaignId,
    character_id:   characterId,
    character_name: characterName,
    roll_label:     label,
    roll_type:      'XP Purchase',
    alignment:      'system',
    hidden:         true,
    is_dm:          false,
    pool:           { proficiency: 0, ability: 0, boost: 0, challenge: 0, difficulty: 0, setback: 0, force: 0 },
    result:         { netSuccess: 0, netAdvantage: 0, triumph: 0, despair: 0, succeeded: false },
    roll_meta:      meta,
  }).then(({ error }) => {
    if (error) console.warn('[logPurchaseNotification] failed:', error.message)
  })
}
