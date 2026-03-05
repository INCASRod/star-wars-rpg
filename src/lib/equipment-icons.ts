/**
 * Category-to-fallback icon mapping constants.
 * Maps OggDude weapon categories, armor categories, and gear types
 * to their corresponding SVG fallback icon names in /images/fallback/.
 */

export const WEAPON_FALLBACK_MAP: Record<string, string> = {
  'Blaster Pistol': 'blaster-pistol',
  'Heavy Blaster Pistol': 'blaster-pistol',
  'Holdout Blaster': 'blaster-pistol',
  'Pistol': 'blaster-pistol',
  'Blaster Rifle': 'blaster-rifle',
  'Heavy Blaster Rifle': 'blaster-rifle',
  'Rifle': 'blaster-rifle',
  'Heavy Rifle': 'blaster-rifle',
  'Carbine': 'blaster-rifle',
  'Heavy Blaster Carbine': 'blaster-rifle',
  'Blaster Carbine': 'blaster-rifle',
  'Heavy Carbine': 'blaster-rifle',
  'Blaster': 'blaster-rifle',
  'Lightsaber': 'lightsaber',
  'Lightsaber Hilt': 'lightsaber',
  'Cutting Edge Melee': 'melee-blade',
  'Ancient Relics': 'melee-blade',
  'Bludgeoning Melee': 'melee-blunt',
  'Bludgeoning Brawl': 'melee-blunt',
  'Powered Melee': 'melee-blunt',
  'Powered Brawl': 'melee-blunt',
  'Grenade': 'grenade',
  'Explosive': 'grenade',
  'Mine': 'mine',
  'Space Mine': 'mine',
  'Missile': 'missile',
  'Rocket': 'missile',
  'Micro-Rocket': 'missile',
  'Proton Torpedo': 'missile',
  'Proton Bomb': 'missile',
  'Portable Gunnery': 'heavy-weapon',
  'Flak': 'heavy-weapon',
  'Suppression': 'heavy-weapon',
  'Bow': 'bow',
  'Bowcaster': 'bow',
  'Beamdrill': 'beam',
  'Laser': 'beam',
  'Ion': 'beam',
  'Tractor': 'beam',
  'Shield': 'shield',
  'Whip': 'whip',
  'Ranged': 'ranged-generic',
}

export const ARMOR_FALLBACK_MAP: Record<string, string> = {
  'Full Body': 'armor-heavy',
  'Hard': 'armor-heavy',
  'Heavy': 'armor-heavy',
  'Half Body': 'armor-light',
  'Light': 'armor-light',
  'Resistant': 'armor-light',
  'Sealable': 'armor-sealed',
  'Sealed': 'armor-sealed',
}

export const GEAR_TYPE_FALLBACK_MAP: Record<string, string> = {
  'Medical': 'gear-medical',
  'Antidotes': 'gear-medical',
  'Drugs and Consumables': 'gear-medical',
  'Poisons': 'gear-medical',
  'Tools/Electronics': 'gear-tool',
  'Construction/Salvage Tools': 'gear-tool',
  'Slicing Tools': 'gear-tool',
  'Communications': 'gear-comms',
  'Cybernetics': 'gear-cybernetic',
  'Security/Espionage': 'gear-security',
  'Detection/Surveillance Devices': 'gear-security',
  'Carrying/Storage': 'gear-storage',
  'Survival': 'gear-survival',
  'Droids': 'gear-droid',
  'Remotes': 'gear-droid',
  'Holocrons/Ancient Lore': 'gear-holocron',
  'Ancient Talismans': 'gear-holocron',
  'Alchemical Potion': 'gear-holocron',
  'Alchemical Talisman': 'gear-holocron',
  'Focuses, Fetishes, and Figurines': 'gear-holocron',
  'Luxury Items': 'gear-luxury',
  'Entertainment': 'gear-luxury',
  'Award/Medal': 'gear-luxury',
  'Trophies': 'gear-luxury',
  'Uniforms and Accessories': 'gear-luxury',
  'Reloads/Ammo': 'gear-ammo',
  'Riding Beasts': 'gear-beast',
  'Trainable Beasts': 'gear-beast',
  'Black Market': 'gear-blackmarket',
  'Slaver Tech': 'gear-blackmarket',
  'Generic': 'gear-generic',
}

/** Generic fallback per item type when no category match exists */
export const GENERIC_FALLBACK: Record<string, string> = {
  weapon: 'weapon-generic',
  armor: 'armor-generic',
  gear: 'gear-generic',
}

/**
 * Resolve the fallback SVG icon name for an item.
 * Returns the icon filename (without .svg extension) from /images/fallback/.
 */
export function resolveFallbackIcon(
  itemType: 'weapon' | 'armor' | 'gear',
  categories?: string[],
  gearType?: string,
): string {
  if (itemType === 'weapon' && categories) {
    for (const cat of categories) {
      if (WEAPON_FALLBACK_MAP[cat]) return WEAPON_FALLBACK_MAP[cat]
    }
  }

  if (itemType === 'armor' && categories) {
    for (const cat of categories) {
      if (ARMOR_FALLBACK_MAP[cat]) return ARMOR_FALLBACK_MAP[cat]
    }
  }

  if (itemType === 'gear') {
    if (gearType && GEAR_TYPE_FALLBACK_MAP[gearType]) {
      return GEAR_TYPE_FALLBACK_MAP[gearType]
    }
    if (categories) {
      for (const cat of categories) {
        if (GEAR_TYPE_FALLBACK_MAP[cat]) return GEAR_TYPE_FALLBACK_MAP[cat]
      }
    }
  }

  return GENERIC_FALLBACK[itemType] || 'gear-generic'
}
