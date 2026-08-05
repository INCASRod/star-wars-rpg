import type { createClient } from '@/lib/supabase/client'
import type { CombatEncounter } from '@/lib/combat'

/**
 * One persistent encounter deck per map (migration 115).
 *
 * Before 115 there were three near-identical copies of this helper
 * (`ensureActiveEncounter` in StagingFloatingToolbar.tsx and GmTokenControls.tsx,
 * plus an inline select in AdversaryLibrary/VehicleLibrary), all keyed on
 * `is_active = true` — which meant the deck only existed while combat was live,
 * and the GM view's Encounter Deck (which used none of them) silently no-opped
 * every add outside combat.
 *
 * `is_active` now means only "combat is live on this row"; the deck's existence
 * is keyed on (campaign_id, map_id) instead, so a new deck is created with
 * `is_active: false` and stays intact across Begin Combat / End Encounter.
 */
export async function ensureEncounterForMap(
  supabase: ReturnType<typeof createClient>,
  campaignId: string,
  mapId: string,
): Promise<CombatEncounter | null> {
  const { data: existing } = await supabase
    .from('combat_encounters')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('map_id', mapId)
    .maybeSingle()
  if (existing) return existing as CombatEncounter

  // Concurrent first-adds on the same map race here; the unique index makes the
  // loser's insert fail rather than create a second deck, so re-read on error.
  const { data: created, error } = await supabase
    .from('combat_encounters')
    .insert({
      campaign_id:        campaignId,
      map_id:             mapId,
      round:              1,
      is_active:          false,
      current_slot_index: 0,
      initiative_type:    'cool',
      initiative_slots:   [],
      adversaries:        [],
      vehicles:           [],
      log_entries:        [],
    })
    .select('*')
    .single()

  if (error) {
    const { data: raced } = await supabase
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('map_id', mapId)
      .maybeSingle()
    return (raced as CombatEncounter) ?? null
  }
  return created as CombatEncounter | null
}

/** Reads a map's encounter deck without creating one. */
export async function fetchEncounterForMap(
  supabase: ReturnType<typeof createClient>,
  campaignId: string,
  mapId: string,
): Promise<CombatEncounter | null> {
  const { data } = await supabase
    .from('combat_encounters')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('map_id', mapId)
    .maybeSingle()
  return (data as CombatEncounter) ?? null
}
