import { createClient } from '@/lib/supabase/client'
import type { RollResult } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/components/player-hud/design-tokens'

/** Optional metadata passed by Combat / Force / Initiative overlays */
export interface RollMeta {
  rollType?:       string   // 'skill' | 'combat' | 'force' | 'initiative'
  weaponName?:     string   // weapon or power name (combat / force)
  targetName?:     string   // target(s) for combat
  rangeBand?:      string   // range band for combat
  weaponDamage?:   number   // base weapon damage (for combat damage display)
  characterBrawn?: number   // attacker brawn (melee damage modifier)
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

  if (
    meta?.weaponDamage != null || meta?.characterBrawn != null || meta?.attackType ||
    meta?.critEligible != null || meta?.critRating != null || meta?.critModifier != null
  ) {
    payload.roll_meta = {
      ...(meta.weaponDamage   != null ? { weaponDamage:   meta.weaponDamage }   : {}),
      ...(meta.characterBrawn != null ? { characterBrawn: meta.characterBrawn } : {}),
      ...(meta.attackType             ? { attackType:     meta.attackType }     : {}),
      ...(meta.critEligible   != null ? { critEligible:   meta.critEligible }   : {}),
      ...(meta.critRating     != null ? { critRating:     meta.critRating }     : {}),
      ...(meta.critModifier   != null ? { critModifier:   meta.critModifier }   : {}),
    }
  }

  supabase.from('roll_log').insert(payload).then(({ error }) => {
    if (error) console.warn('[logRoll] failed:', error.message)
  })
}
