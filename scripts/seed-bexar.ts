/**
 * Seeds Bexar test data into Supabase via direct PostgreSQL.
 *
 * Usage: npx tsx scripts/seed-bexar.ts
 */

import postgres from 'postgres'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  console.log('Seeding Bexar test data...\n')

  // 1. Campaign
  const [campaign] = await sql`
    INSERT INTO campaigns (name, gm_pin, settings)
    VALUES ('Edge of the Outer Rim', '1234', '{"system":"Edge of the Empire","session":4}')
    ON CONFLICT DO NOTHING
    RETURNING id
  `
  const campaignId = campaign?.id || (await sql`SELECT id FROM campaigns LIMIT 1`)[0].id
  console.log(`Campaign: ${campaignId}`)

  // 2. Player
  const [player] = await sql`
    INSERT INTO players (display_name, campaign_id, is_gm)
    VALUES ('Natalia', ${campaignId}, false)
    RETURNING id
  `
  console.log(`Player: ${player.id}`)

  // 3. GM Player
  const [gm] = await sql`
    INSERT INTO players (display_name, campaign_id, is_gm)
    VALUES ('Rodrigo (GM)', ${campaignId}, true)
    RETURNING id
  `
  console.log(`GM: ${gm.id}`)

  // 4. Character
  const [char] = await sql`
    INSERT INTO characters (
      campaign_id, player_id, name, species_key, career_key, gender, portrait_url,
      brawn, agility, intellect, cunning, willpower, presence,
      wound_threshold, wound_current, strain_threshold, strain_current,
      soak, defense_ranged, defense_melee,
      xp_total, xp_available, credits, encumbrance_threshold,
      morality_value, morality_strength_key, morality_weakness_key,
      obligation_type, obligation_value, duty_type, duty_value,
      backstory, notes
    ) VALUES (
      ${campaignId}, ${player.id}, 'BX-9R "Bexar"', 'DROID', 'BOUNT', 'Female',
      'https://i.pinimg.com/736x/4f/0b/10/4f0b109046c41fbe31cb93550f6da801.jpg',
      3, 3, 2, 2, 1, 1,
      13, 0, 12, 0,
      6, 1, 1,
      200, 15, 500, 11,
      30, 'EMPATHY', 'OBSTINENCE',
      'Collateral Accountability', 12, 'Loss Prevention', 12,
      'BX-9R, designation "Bexar", is a modified combat droid repurposed as a bounty hunter.', ''
    )
    RETURNING id
  `
  console.log(`Character: ${char.id}`)

  // 5. Specialization
  await sql`
    INSERT INTO character_specializations (character_id, specialization_key, is_starting, purchase_order)
    VALUES (${char.id}, 'ASSAS', true, 0)
  `

  // 6. Skills
  const skills = [
    { key: 'BRAWL', rank: 1, career: true },
    { key: 'GUNN', rank: 0, career: false },
    { key: 'MELEE', rank: 0, career: true },
    { key: 'RANGHVY', rank: 2, career: true },
    { key: 'RANGLT', rank: 1, career: false },
    { key: 'ATHL', rank: 1, career: true },
    { key: 'COOL', rank: 1, career: false },
    { key: 'PERC', rank: 1, career: true },
    { key: 'SKUL', rank: 1, career: true },
    { key: 'STEAL', rank: 1, career: true },
    { key: 'SW', rank: 1, career: true },
    { key: 'VIGIL', rank: 1, career: true },
    { key: 'PILOTPL', rank: 0, career: true },
    { key: 'PILOTSP', rank: 0, career: true },
    { key: 'WARF', rank: 1, career: false },
  ]
  for (const sk of skills) {
    await sql`
      INSERT INTO character_skills (character_id, skill_key, rank, is_career)
      VALUES (${char.id}, ${sk.key}, ${sk.rank}, ${sk.career})
      ON CONFLICT (character_id, skill_key) DO NOTHING
    `
  }
  console.log(`Skills: ${skills.length}`)

  // 7. Talents
  await sql`INSERT INTO character_talents (character_id, talent_key, specialization_key, ranks, xp_cost)
    VALUES (${char.id}, 'ENDUR', 'DROID', 1, 0)`
  await sql`INSERT INTO character_talents (character_id, talent_key, specialization_key, tree_row, tree_col, ranks, xp_cost)
    VALUES (${char.id}, 'GRIT', 'ASSAS', 0, 0, 1, 5)`
  await sql`INSERT INTO character_talents (character_id, talent_key, specialization_key, tree_row, tree_col, ranks, xp_cost)
    VALUES (${char.id}, 'PRECAIM', 'ASSAS', 1, 0, 1, 10)`
  console.log('Talents: 3')

  // 8. Weapons (custom — not in ref_weapons, so use NULL weapon_key)
  await sql`INSERT INTO character_weapons (character_id, weapon_key, custom_name, is_equipped)
    VALUES (${char.id}, NULL, 'PB08 Heavy Blaster Pistol', true)`
  await sql`INSERT INTO character_weapons (character_id, weapon_key, custom_name, is_equipped)
    VALUES (${char.id}, NULL, 'BX E11A Experimental Pulse Cannon', true)`
  console.log('Weapons: 2')

  // 9. Armor (custom)
  await sql`INSERT INTO character_armor (character_id, armor_key, custom_name, is_equipped)
    VALUES (${char.id}, NULL, 'BX Droid Armor Plating', true)`
  console.log('Armor: 1')

  // 10. Gear (custom)
  await sql`INSERT INTO character_gear (character_id, gear_key, custom_name, quantity, is_equipped, notes)
    VALUES (${char.id}, NULL, 'BX Droid Modular Storage Unit', 1, true, '+3 Encumbrance, Self-Destruct')`
  console.log('Gear: 1')

  console.log(`\nBexar fully seeded! Character ID: ${char.id}`)
  console.log(`Visit: http://localhost:3000/character/${char.id}`)

  await sql.end()
}

main().catch(async (err) => {
  console.error(err)
  await sql.end()
  process.exit(1)
})
