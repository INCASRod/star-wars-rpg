import type { SupabaseClient } from '@supabase/supabase-js'

/** Weapons that share one inventory row with a count. Grenades only. */
export function isStackableWeapon(categories: string[] | null | undefined): boolean {
  return !!categories?.includes('Grenade')
}

interface GrantWeaponArgs {
  characterId: string
  weaponKey:   string
  quantity?:   number
  equipState?: string
  notes:       string
}

/**
 * The one write path for giving a character a weapon. A stackable weapon adds
 * to an existing untouched row (same key, not dropped, no mods, no custom name);
 * everything else inserts one row per weapon, as before.
 */
export async function grantWeapon(supabase: SupabaseClient, a: GrantWeaponArgs): Promise<void> {
  const qty = Math.max(1, Math.floor(a.quantity ?? 1))
  const equip_state = a.equipState ?? 'carrying'
  const { data: ref } = await supabase.from('ref_weapons').select('categories').eq('key', a.weaponKey).maybeSingle()

  if (isStackableWeapon(ref?.categories)) {
    const { data: rows } = await supabase
      .from('character_weapons')
      .select('id, quantity, attachments, custom_name')
      .eq('character_id', a.characterId)
      .eq('weapon_key', a.weaponKey)
      .eq('is_dropped', false)
    const stack = (rows ?? []).find(r => !r.custom_name && (!Array.isArray(r.attachments) || r.attachments.length === 0))
    if (stack) {
      await supabase.from('character_weapons').update({ quantity: (stack.quantity ?? 1) + qty }).eq('id', stack.id)
      return
    }
    await supabase.from('character_weapons').insert({
      character_id: a.characterId, weapon_key: a.weaponKey,
      is_equipped: false, equip_state, attachments: [], notes: a.notes, quantity: qty,
    })
    return
  }

  await supabase.from('character_weapons').insert(
    Array.from({ length: qty }, () => ({
      character_id: a.characterId, weapon_key: a.weaponKey,
      is_equipped: false, equip_state, attachments: [], notes: a.notes,
    }))
  )
}
