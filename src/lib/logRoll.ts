import { createClient } from '@/lib/supabase/client'
import type { RollResult } from '@/components/player-hud/dice-engine'
import type { DiceType } from '@/components/player-hud/design-tokens'

export interface RollLogEntry {
  campaignId:    string
  characterId:   string
  characterName: string
  label:         string | undefined
  pool:          Record<DiceType, number>
  result:        RollResult
  isDM?:         boolean
  hidden?:       boolean
}

/** Fire-and-forget — does not block the caller */
export function logRoll({
  campaignId, characterId, characterName,
  label, pool, result, isDM = false, hidden = false,
}: RollLogEntry): void {
  const supabase = createClient()

  const payload = {
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

  supabase.from('roll_log').insert(payload).then(({ error }) => {
    if (error) console.warn('[logRoll] failed:', error.message)
  })
}
