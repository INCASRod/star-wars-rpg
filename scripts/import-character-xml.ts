/**
 * Import an OggDude player XML character into Supabase.
 *
 * Usage: npx tsx scripts/import-character-xml.ts <xml-file-path> [campaign-id]
 *
 * If no campaign-id is given, uses the first campaign in the database.
 * Creates a new player record for the character's player name.
 */

import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { XMLParser } from 'fast-xml-parser'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const sql = postgres(process.env.DATABASE_URL!)

const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  isArray: (name) => [
    'CharCharacteristic', 'CharSkill', 'CharTalent', 'CharSpecialization',
    'CharWeapon', 'CharArmor', 'CharGear', 'CharObligation', 'CharDuty',
    'MoralityPair', 'CharMotivation', 'CharItemAttachment', 'Mod',
    'ItemDescInfo', 'TwoWeaponSet', 'CharOption',
    'CharForcePower', 'CharForceAbility',
  ].includes(name),
})

function ensureArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

function sumRanks(rank: Record<string, number> | undefined | string): number {
  if (!rank || typeof rank === 'string') return 0
  return Object.values(rank).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
}

async function main() {
  const xmlPath = process.argv[2]
  if (!xmlPath) {
    console.error('Usage: npx tsx scripts/import-character-xml.ts <xml-file-path> [campaign-id]')
    process.exit(1)
  }

  const fullPath = path.resolve(xmlPath)
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`)
    process.exit(1)
  }

  console.log(`Parsing: ${path.basename(fullPath)}`)
  const xmlContent = fs.readFileSync(fullPath, 'utf-8')
  const parsed = parser.parse(xmlContent)
  const char = parsed.Character

  // ── Extract character data ──
  const desc = char.Description || {}
  const charName = desc.CharName || 'Unknown'
  const playerName = desc.PlayerName || 'Player'
  const gender = desc.Gender || null
  const speciesKey = char.Species?.SpeciesKey || 'HUMAN'

  // Characteristics
  const characteristics: Record<string, number> = {}
  for (const cc of ensureArray(char.Characteristics?.CharCharacteristic)) {
    characteristics[cc.Key] = sumRanks(cc.Rank)
  }
  const brawn = characteristics.BR || 2
  const agility = characteristics.AG || 2
  const intellect = characteristics.INT || 2
  const cunning = characteristics.CUN || 2
  const willpower = characteristics.WIL || 2
  const presence = characteristics.PR || 2

  // Attributes
  const attrs = char.Attributes || {}
  const soak = sumRanks(attrs.SoakValue)
  const woundThreshold = sumRanks(attrs.WoundThreshold)
  const strainThreshold = sumRanks(attrs.StrainThreshold)
  const defenseRanged = sumRanks(attrs.DefenseRanged)
  const defenseMelee = sumRanks(attrs.DefenseMelee)

  // XP
  const xpTotal = sumRanks(char.Experience?.ExperienceRanks)
  const xpUsed = char.Experience?.UsedExperience || 0
  const xpAvailable = xpTotal - xpUsed

  // Credits
  const credits = char.Credits || 0

  // Specializations
  const specializations = ensureArray(char.Specializations?.CharSpecialization)

  // Career key — OggDude stores this directly in <Career><CareerKey>
  // Fall back to deriving from the starting spec's career if missing
  let derivedCareerKey: string = char.Career?.CareerKey || null
  if (!derivedCareerKey && specializations.length > 0) {
    const startingSpec = specializations.find((s: Record<string, unknown>) => s.isStartingSpec) || specializations[0]
    const specKey = startingSpec.Key
    const [refSpec] = await sql`SELECT career_key FROM ref_specializations WHERE key = ${specKey}`
    if (refSpec?.career_key) derivedCareerKey = refSpec.career_key
  }
  if (!derivedCareerKey) derivedCareerKey = 'BOUNT'

  // Morality
  const moralityPairs = ensureArray(char.Morality?.MoralityPairs?.MoralityPair)
  const moralityValue = char.Morality?.MoralityValue || 50
  const moralityStrengthKey = moralityPairs[0]?.StrengthKey || null
  const moralityWeaknessKey = moralityPairs[0]?.WeaknessKey || null

  // Obligations
  const obligations = ensureArray(char.Obligations?.CharObligation)
  const obligationType = obligations[0]?.Name || null
  const obligationValue = obligations[0]?.Size || 0

  // Duties
  const duties = ensureArray(char.Duties?.CharDuty)
  const dutyType = duties[0]?.Name || null
  const dutyValue = duties[0]?.Size || 0

  // Backstory
  const backstory = char.Story || ''

  // ── Campaign ──
  let campaignId = process.argv[3]
  if (!campaignId) {
    const [c] = await sql`SELECT id FROM campaigns LIMIT 1`
    if (!c) {
      console.error('No campaigns found. Create a campaign first or pass a campaign ID.')
      process.exit(1)
    }
    campaignId = c.id
  }
  console.log(`Campaign: ${campaignId}`)

  // ── Player ──
  const existingPlayer = await sql`
    SELECT id FROM players WHERE campaign_id = ${campaignId} AND display_name = ${playerName} LIMIT 1
  `
  let playerId: string
  if (existingPlayer.length > 0) {
    playerId = existingPlayer[0].id
    console.log(`Existing player: ${playerName} (${playerId})`)
  } else {
    const [newPlayer] = await sql`
      INSERT INTO players (display_name, campaign_id, is_gm)
      VALUES (${playerName}, ${campaignId}, false)
      RETURNING id
    `
    playerId = newPlayer.id
    console.log(`New player: ${playerName} (${playerId})`)
  }

  // ── Check if character already exists ──
  const existingChar = await sql`
    SELECT id, portrait_url, notes FROM characters WHERE campaign_id = ${campaignId} AND name = ${charName} LIMIT 1
  `
  let charId: string
  if (existingChar.length > 0) {
    // Re-import: preserve ID, portrait, and user-edited notes — clear child tables
    charId = existingChar[0].id
    const preservedPortrait = existingChar[0].portrait_url
    const preservedNotes = existingChar[0].notes || ''
    console.log(`\nCharacter "${charName}" already exists (${charId}). Re-importing (preserving ID + portrait)...`)
    await sql`DELETE FROM xp_transactions WHERE character_id = ${charId}`
    await sql`DELETE FROM character_critical_injuries WHERE character_id = ${charId}`
    await sql`DELETE FROM character_gear WHERE character_id = ${charId}`
    await sql`DELETE FROM character_armor WHERE character_id = ${charId}`
    await sql`DELETE FROM character_weapons WHERE character_id = ${charId}`
    await sql`DELETE FROM character_force_abilities WHERE character_id = ${charId}`
    await sql`DELETE FROM character_talents WHERE character_id = ${charId}`
    await sql`DELETE FROM character_skills WHERE character_id = ${charId}`
    await sql`DELETE FROM character_specializations WHERE character_id = ${charId}`
    await sql`
      UPDATE characters SET
        player_id = ${playerId}, species_key = ${speciesKey}, career_key = ${derivedCareerKey}, gender = ${gender},
        brawn = ${brawn}, agility = ${agility}, intellect = ${intellect}, cunning = ${cunning}, willpower = ${willpower}, presence = ${presence},
        wound_threshold = ${woundThreshold}, wound_current = 0, strain_threshold = ${strainThreshold}, strain_current = 0,
        soak = ${soak}, defense_ranged = ${defenseRanged}, defense_melee = ${defenseMelee},
        xp_total = ${xpTotal}, xp_available = ${xpAvailable}, credits = ${credits}, encumbrance_threshold = ${5 + brawn},
        morality_value = ${moralityValue}, morality_strength_key = ${moralityStrengthKey}, morality_weakness_key = ${moralityWeaknessKey},
        obligation_type = ${obligationType}, obligation_value = ${obligationValue}, duty_type = ${dutyType}, duty_value = ${dutyValue},
        backstory = ${backstory}, portrait_url = ${preservedPortrait}, notes = ${preservedNotes}
      WHERE id = ${charId}
    `
  } else {
    // New character
    const [newChar] = await sql`
      INSERT INTO characters (
        campaign_id, player_id, name, species_key, career_key, gender,
        brawn, agility, intellect, cunning, willpower, presence,
        wound_threshold, wound_current, strain_threshold, strain_current,
        soak, defense_ranged, defense_melee,
        xp_total, xp_available, credits, encumbrance_threshold,
        morality_value, morality_strength_key, morality_weakness_key,
        obligation_type, obligation_value, duty_type, duty_value,
        backstory, notes
      ) VALUES (
        ${campaignId}, ${playerId}, ${charName}, ${speciesKey}, ${derivedCareerKey}, ${gender},
        ${brawn}, ${agility}, ${intellect}, ${cunning}, ${willpower}, ${presence},
        ${woundThreshold}, 0, ${strainThreshold}, 0,
        ${soak}, ${defenseRanged}, ${defenseMelee},
        ${xpTotal}, ${xpAvailable}, ${credits}, ${5 + brawn},
        ${moralityValue}, ${moralityStrengthKey}, ${moralityWeaknessKey},
        ${obligationType}, ${obligationValue}, ${dutyType}, ${dutyValue},
        ${backstory}, ''
      )
      RETURNING id
    `
    charId = newChar.id
  }
  console.log(`\nCharacter: ${charName} (${charId})`)
  console.log(`  Species: ${speciesKey}, Career: ${derivedCareerKey}`)
  console.log(`  BR ${brawn} AG ${agility} INT ${intellect} CUN ${cunning} WIL ${willpower} PR ${presence}`)
  console.log(`  WT ${woundThreshold} ST ${strainThreshold} Soak ${soak} Def ${defenseRanged}/${defenseMelee}`)
  console.log(`  XP ${xpTotal} (${xpAvailable} available) Credits ${credits}`)

  // ── Specializations ──
  for (let i = 0; i < specializations.length; i++) {
    const spec = specializations[i]
    await sql`
      INSERT INTO character_specializations (character_id, specialization_key, is_starting, purchase_order)
      VALUES (${charId}, ${spec.Key}, ${!!spec.isStartingSpec}, ${i})
    `
  }
  console.log(`  Specializations: ${specializations.map((s: Record<string, unknown>) => s.Key).join(', ')}`)

  // ── Skills ──
  const xmlSkills = ensureArray(char.Skills?.CharSkill)
  let skillCount = 0
  for (const sk of xmlSkills) {
    const rank = sumRanks(sk.Rank)
    const isCareer = sk.isCareer === true || sk.isCareer === 'true'
    await sql`
      INSERT INTO character_skills (character_id, skill_key, rank, is_career)
      VALUES (${charId}, ${sk.Key}, ${rank}, ${isCareer})
      ON CONFLICT (character_id, skill_key) DO UPDATE SET rank = ${rank}, is_career = ${isCareer}
    `
    skillCount++
  }
  console.log(`  Skills: ${skillCount} (${xmlSkills.filter((s: Record<string, unknown>) => sumRanks(s.Rank as Record<string, number>) > 0).length} trained)`)

  // ── Talents (from specialization trees) ──
  let talentCount = 0
  for (const spec of specializations) {
    const treeTalents = ensureArray(spec.Talents?.CharTalent)
    for (const t of treeTalents) {
      if (t.Purchased) {
        const rowCost = (t.Row + 1) * 5
        await sql`
          INSERT INTO character_talents (character_id, talent_key, specialization_key, tree_row, tree_col, ranks, xp_cost)
          VALUES (${charId}, ${t.Key}, ${spec.Key}, ${t.Row}, ${t.Col}, 1, ${rowCost})
        `
        talentCount++
      }
    }
  }
  console.log(`  Talents: ${talentCount} purchased`)

  // ── Weapons ──
  const xmlWeapons = ensureArray(char.Weapons?.CharWeapon)
  let weaponCount = 0
  for (const w of xmlWeapons) {
    if (w.Innate) continue // Skip unarmed
    const itemKey = w.ItemKey || null
    const customName = w.Rename || null
    const isEquipped = w.Equipped === true || w.Equipped === 'true'

    // Check if weapon key exists in ref_weapons
    let weaponKey = null
    if (itemKey) {
      const [ref] = await sql`SELECT key FROM ref_weapons WHERE key = ${itemKey} LIMIT 1`
      if (ref) weaponKey = itemKey
    }

    // Build attachments array from XML
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attachments = ensureArray(w.PurchasedAttachments?.CharItemAttachment).map((att: any) => ({
      key: att.AttachKey,
      mods: ensureArray(att.AllMods?.Mod).map((m: any) => m.MiscDesc || ''),
    }))

    await sql`
      INSERT INTO character_weapons (character_id, weapon_key, custom_name, is_equipped, attachments, notes)
      VALUES (${charId}, ${weaponKey}, ${customName}, ${isEquipped}, ${JSON.stringify(attachments)}, ${''})
    `
    weaponCount++
    const displayName = customName || itemKey || 'Unknown'
    console.log(`  Weapon: ${displayName}${isEquipped ? ' [equipped]' : ''}${attachments.length ? ` (${attachments.length} attachments)` : ''}`)
  }

  // ── Armor ──
  const xmlArmor = ensureArray(char.Armor?.CharArmor)
  for (const a of xmlArmor) {
    const itemKey = a.ItemKey || null
    const customName = a.Rename || null
    const isEquipped = a.Equipped === true || a.Equipped === 'true'

    let armorKey = null
    if (itemKey) {
      const [ref] = await sql`SELECT key FROM ref_armor WHERE key = ${itemKey} LIMIT 1`
      if (ref) armorKey = itemKey
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attachments = ensureArray(a.PurchasedAttachments?.CharItemAttachment).map((att: any) => ({
      key: att.AttachKey,
      mods: ensureArray(att.AllMods?.Mod).map((m: any) => m.MiscDesc || ''),
    }))

    await sql`
      INSERT INTO character_armor (character_id, armor_key, custom_name, is_equipped, attachments, notes)
      VALUES (${charId}, ${armorKey}, ${customName}, ${isEquipped}, ${JSON.stringify(attachments)}, ${''})
    `
    console.log(`  Armor: ${customName || itemKey || 'Unknown'}${isEquipped ? ' [equipped]' : ''}`)
  }

  // ── Gear ──
  const xmlGear = ensureArray(char.Gear?.CharGear)
  for (const g of xmlGear) {
    const itemKey = g.ItemKey || null
    const customName = g.Rename || null
    const isEquipped = g.Equipped === true || g.Equipped === 'true'
    const quantity = g.Count || 1

    let gearKey = null
    if (itemKey) {
      const [ref] = await sql`SELECT key FROM ref_gear WHERE key = ${itemKey} LIMIT 1`
      if (ref) gearKey = itemKey
    }

    await sql`
      INSERT INTO character_gear (character_id, gear_key, custom_name, quantity, is_equipped, notes)
      VALUES (${charId}, ${gearKey}, ${customName}, ${quantity}, ${isEquipped}, ${''})
    `
    console.log(`  Gear: ${customName || itemKey || 'Unknown'} x${quantity}${isEquipped ? ' [equipped]' : ''}`)
  }

  // ── Force Powers ──
  const xmlForcePowers = ensureArray(char.ForcePowers?.CharForcePower)
  let forceAbilityCount = 0
  for (const fp of xmlForcePowers) {
    const powerKey = fp.Key
    const abilities = ensureArray(fp.ForceAbilities?.CharForceAbility)
    for (const a of abilities) {
      const cost = typeof a.Cost === 'number' ? a.Cost : parseInt(a.Cost) || 0
      const purchased = a.Purchased === true || a.Purchased === 'true'
      if (purchased && cost > 0) {
        await sql`
          INSERT INTO character_force_abilities (character_id, force_power_key, force_ability_key, tree_row, tree_col, xp_cost)
          VALUES (${charId}, ${powerKey}, ${a.Key}, ${a.Row ?? 0}, ${a.Col ?? 0}, ${cost})
          ON CONFLICT (character_id, force_power_key, tree_row, tree_col) DO NOTHING
        `
        forceAbilityCount++
      }
    }
  }
  if (xmlForcePowers.length > 0) {
    console.log(`  Force Powers: ${xmlForcePowers.map((fp: Record<string, unknown>) => fp.Key).join(', ')} (${forceAbilityCount} abilities purchased)`)
  }

  // ── Store all talent tree data for the specialization (purchased + unpurchased) ──
  // This is needed for the talent tree visual component
  console.log('\n  Talent trees:')
  for (const spec of specializations) {
    const treeTalents = ensureArray(spec.Talents?.CharTalent)
    console.log(`    ${spec.Key}: ${treeTalents.length} nodes (${treeTalents.filter((t: Record<string, unknown>) => t.Purchased).length} purchased)`)
  }

  console.log(`\n✓ Import complete! Character ID: ${charId}`)
  console.log(`  Visit: http://localhost:3000/character/${charId}`)

  await sql.end()
}

main().catch(async (err) => {
  console.error('Import failed:', err)
  await sql.end()
  process.exit(1)
})
