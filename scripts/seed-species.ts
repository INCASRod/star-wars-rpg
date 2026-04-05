/**
 * Seed ref_species with full special_abilities JSONB from OggDude XMLs.
 *
 * Usage: npx tsx scripts/seed-species.ts
 */

import { XMLParser } from 'fast-xml-parser'
import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const sql = postgres(process.env.DATABASE_URL!)

const DATA_DIR = path.join(__dirname, '..', 'oggdude', 'DataCustom')
const SPECIES_DIR = path.join(DATA_DIR, 'Species')

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) =>
    ['Source', 'SkillModifier', 'TalentModifier', 'OptionChoice', 'Option'].includes(name),
})

function ensureArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return []
  return Array.isArray(val) ? val : [val]
}

function readXML(filePath: string): any {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return parser.parse(xml)
}

// Strip OggDude BBCode tags: [B]...[b], [H4]...[h4], [P], [SETBACK] → "Setback", etc.
function stripBBCode(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/\[SETBACK\]/gi, ' Setback ')
    .replace(/\[BOOST\]/gi, ' Boost ')
    .replace(/\[ABILITY\]/gi, ' Ability ')
    .replace(/\[DIFFICULTY\]/gi, ' Difficulty ')
    .replace(/\[CHALLENGE\]/gi, ' Challenge ')
    .replace(/\[PROFICIENCY\]/gi, ' Proficiency ')
    .replace(/\[SU\]/gi, ' Success ')
    .replace(/\[AD\]/gi, ' Advantage ')
    .replace(/\[FA\]/gi, ' Failure ')
    .replace(/\[TH\]/gi, ' Threat ')
    .replace(/\[TR\]/gi, ' Triumph ')
    .replace(/\[DE\]/gi, ' Despair ')
    .replace(/\[FP\]/gi, ' Force Point ')
    .replace(/\[FO\]/gi, ' Force die ')
    .replace(/\[DI\]/gi, ' difficulty die ')
    .replace(/\[[A-Za-z0-9_]+\]/g, '')  // remaining tags
    .replace(/\s+/g, ' ')
    .trim()
}

function isConditional(desc: string, mechType: string): boolean {
  if (mechType === 'die_modifier') return true
  const lower = desc.toLowerCase()
  return /\bwhen\b|\bif\b|\bremove\b|\benvironmental\b|\bconditions\b|\bconcealment\b|\bopposed\b/.test(lower)
}

// ── Build skill/talent key → name maps ──
function buildSkillMap(): Map<string, string> {
  const map = new Map<string, string>()
  try {
    const data = readXML(path.join(DATA_DIR, 'Skills.xml'))
    const skills = ensureArray(data?.Skills?.Skill)
    for (const s of skills) {
      if (s.Key && s.Name) map.set(String(s.Key), String(s.Name))
    }
  } catch (e) {
    console.warn('Could not load Skills.xml for name mapping')
  }
  return map
}

function buildTalentMap(): Map<string, string> {
  const map = new Map<string, string>()
  try {
    const data = readXML(path.join(DATA_DIR, 'Talents.xml'))
    const talents = ensureArray(data?.Talents?.Talent)
    for (const t of talents) {
      if (t.Key && t.Name) map.set(String(t.Key), String(t.Name))
    }
  } catch (e) {
    console.warn('Could not load Talents.xml for name mapping')
  }
  return map
}

// ── Parse one species file ──
interface SpecialAbility {
  key: string
  name: string
  description: string
  mechanical_type: 'skill_rank' | 'talent_rank' | 'die_modifier' | 'narrative'
  is_conditional: boolean
  affected_skills?: string[]
  rank_start?: number
  rank_limit?: number
  talent_key?: string
  rank_add?: number
}

function parseSpeciesFile(
  filePath: string,
  skillMap: Map<string, string>,
  talentMap: Map<string, string>
): {
  key: string
  name: string
  description: string | null
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number
  wound_threshold: number
  strain_threshold: number
  starting_xp: number
  source_book: string | null
  source_page: number | null
  special_abilities: SpecialAbility[]
} | null {
  try {
    const data = readXML(filePath)
    const s = data?.Species
    if (!s) return null

    const special_abilities: SpecialAbility[] = []

    // ── Top-level SkillModifiers ──
    const skillMods = ensureArray(s.SkillModifiers?.SkillModifier)
    for (const sm of skillMods) {
      const skillKey = String(sm.Key)
      const skillName = skillMap.get(skillKey) ?? skillKey
      const rankStart = parseInt(sm.RankStart) || 1
      const rankLimit = parseInt(sm.RankLimit) || 0
      const desc = rankLimit > 0
        ? `Gain ${rankStart} rank in ${skillName} (max ${rankLimit}).`
        : `Gain ${rankStart} rank in ${skillName}.`
      special_abilities.push({
        key: `${s.Key}_SKILL_${skillKey}`,
        name: `Starting Skill: ${skillName}`,
        description: desc,
        mechanical_type: 'skill_rank',
        is_conditional: false,
        affected_skills: [skillKey],
        rank_start: rankStart,
        ...(rankLimit > 0 ? { rank_limit: rankLimit } : {}),
      })
    }

    // ── Top-level TalentModifiers ──
    const talentMods = ensureArray(s.TalentModifiers?.TalentModifier)
    for (const tm of talentMods) {
      const talentKey = String(tm.Key)
      const talentName = talentMap.get(talentKey) ?? talentKey
      const rankAdd = parseInt(tm.RankAdd) || 1
      const desc = `Gain ${rankAdd} rank in ${talentName}.`
      special_abilities.push({
        key: `${s.Key}_TALENT_${talentKey}`,
        name: `Starting Talent: ${talentName}`,
        description: desc,
        mechanical_type: 'talent_rank',
        is_conditional: false,
        talent_key: talentKey,
        rank_add: rankAdd,
      })
    }

    // ── OptionChoices ──
    const optionChoices = ensureArray(s.OptionChoices?.OptionChoice)
    for (const oc of optionChoices) {
      const options = ensureArray(oc.Options?.Option)
      for (const opt of options) {
        const optKey = String(opt.Key)
        const optName = String(opt.Name ?? '')
        const rawDesc = String(opt.Description ?? '')
        const desc = stripBBCode(rawDesc)

        // Determine mechanical type
        const optSkillMods = ensureArray(opt.SkillModifiers?.SkillModifier)
        const optTalentMods = ensureArray(opt.TalentModifiers?.TalentModifier)
        const hasItemChanges = !!(opt.ItemChanges || opt.WeaponModifiers || opt.ArmorModifiers)

        let mechType: SpecialAbility['mechanical_type']
        const affectedSkills: string[] = []
        let rankStart: number | undefined
        let rankLimit: number | undefined
        let talentKey: string | undefined
        let rankAdd: number | undefined

        if (optSkillMods.length > 0) {
          mechType = 'skill_rank'
          for (const sm of optSkillMods) {
            affectedSkills.push(String(sm.Key))
          }
          rankStart = parseInt(optSkillMods[0]?.RankStart) || 1
          const rl = parseInt(optSkillMods[0]?.RankLimit)
          if (!isNaN(rl) && rl > 0) rankLimit = rl
        } else if (optTalentMods.length > 0) {
          mechType = 'talent_rank'
          talentKey = String(optTalentMods[0].Key)
          rankAdd = parseInt(optTalentMods[0].RankAdd) || 1
        } else if (hasItemChanges) {
          mechType = 'die_modifier'
        } else if (desc.length > 0) {
          // Heuristic: die_modifier if desc contains dice-related keywords
          const diceKeywords = /remove|add|upgrade|downgrade|boost|setback|proficiency|ability|difficulty|challenge/i
          mechType = diceKeywords.test(desc) ? 'die_modifier' : 'narrative'
        } else {
          mechType = 'narrative'
        }

        const ability: SpecialAbility = {
          key: optKey,
          name: optName,
          description: desc,
          mechanical_type: mechType,
          is_conditional: isConditional(desc, mechType),
        }
        if (affectedSkills.length > 0) ability.affected_skills = affectedSkills
        if (rankStart !== undefined) ability.rank_start = rankStart
        if (rankLimit !== undefined) ability.rank_limit = rankLimit
        if (talentKey !== undefined) ability.talent_key = talentKey
        if (rankAdd !== undefined) ability.rank_add = rankAdd

        special_abilities.push(ability)
      }
    }

    // ── Source book/page ──
    const sources = ensureArray(s.Sources?.Source ?? s.Source)
    const firstSource = sources[0]
    let source_book: string | null = null
    let source_page: number | null = null
    if (firstSource) {
      if (typeof firstSource === 'string') {
        source_book = firstSource
      } else {
        source_book = firstSource['#text'] ?? null
        source_page = parseInt(firstSource['@_Page']) || null
      }
    }

    return {
      key: String(s.Key),
      name: String(s.Name),
      description: s.Description ? String(s.Description) : null,
      brawn: parseInt(s.StartingChars?.Brawn) || 2,
      agility: parseInt(s.StartingChars?.Agility) || 2,
      intellect: parseInt(s.StartingChars?.Intellect) || 2,
      cunning: parseInt(s.StartingChars?.Cunning) || 2,
      willpower: parseInt(s.StartingChars?.Willpower) || 2,
      presence: parseInt(s.StartingChars?.Presence) || 2,
      wound_threshold: parseInt(s.StartingAttrs?.WoundThreshold) || 10,
      strain_threshold: parseInt(s.StartingAttrs?.StrainThreshold) || 10,
      starting_xp: parseInt(s.StartingAttrs?.Experience) || 100,
      source_book,
      source_page,
      special_abilities,
    }
  } catch (err: any) {
    console.error(`  Parse error in ${path.basename(filePath)}: ${err.message}`)
    return null
  }
}

async function main() {
  console.log('=== Seeding ref_species with special_abilities ===\n')

  // 1. Add special_abilities column if missing
  await sql.unsafe(`
    ALTER TABLE ref_species
    ADD COLUMN IF NOT EXISTS special_abilities JSONB NOT NULL DEFAULT '[]'::jsonb
  `)
  console.log('✓ special_abilities column ensured\n')

  // 2. Build lookup maps
  const skillMap = buildSkillMap()
  const talentMap = buildTalentMap()
  console.log(`  Skills map: ${skillMap.size} entries`)
  console.log(`  Talents map: ${talentMap.size} entries\n`)

  // 3. Parse all species XMLs
  const files = fs.readdirSync(SPECIES_DIR).filter(f => f.endsWith('.xml')).sort()
  console.log(`Parsing ${files.length} species files...\n`)

  const rows: ReturnType<typeof parseSpeciesFile>[] = []
  const failures: string[] = []

  for (const f of files) {
    const result = parseSpeciesFile(path.join(SPECIES_DIR, f), skillMap, talentMap)
    if (result) {
      rows.push(result)
    } else {
      failures.push(f)
    }
  }

  console.log(`  Parsed: ${rows.length} ok, ${failures.length} failures`)
  if (failures.length > 0) console.log('  Failures:', failures)

  // 4. Upsert in batches
  const batchSize = 20
  let upserted = 0

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).filter(Boolean) as NonNullable<typeof rows[0]>[]
    for (const row of batch) {
      const escapedDesc = (row.description ?? '').replace(/'/g, "''")
      const escapedAbilities = JSON.stringify(row.special_abilities).replace(/'/g, "''")
      await sql.unsafe(`
        INSERT INTO ref_species (
          key, name, description,
          brawn, agility, intellect, cunning, willpower, presence,
          wound_threshold, strain_threshold, starting_xp,
          source_book, source_page, special_abilities
        ) VALUES (
          '${row.key.replace(/'/g, "''")}',
          '${row.name.replace(/'/g, "''")}',
          ${row.description !== null ? `'${escapedDesc}'` : 'NULL'},
          ${row.brawn}, ${row.agility}, ${row.intellect},
          ${row.cunning}, ${row.willpower}, ${row.presence},
          ${row.wound_threshold}, ${row.strain_threshold}, ${row.starting_xp},
          ${row.source_book ? `'${row.source_book.replace(/'/g, "''")}'` : 'NULL'},
          ${row.source_page ?? 'NULL'},
          '${escapedAbilities}'::jsonb
        )
        ON CONFLICT (key) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          brawn = EXCLUDED.brawn,
          agility = EXCLUDED.agility,
          intellect = EXCLUDED.intellect,
          cunning = EXCLUDED.cunning,
          willpower = EXCLUDED.willpower,
          presence = EXCLUDED.presence,
          wound_threshold = EXCLUDED.wound_threshold,
          strain_threshold = EXCLUDED.strain_threshold,
          starting_xp = EXCLUDED.starting_xp,
          source_book = EXCLUDED.source_book,
          source_page = EXCLUDED.source_page,
          special_abilities = EXCLUDED.special_abilities
      `)
      upserted++
    }
    process.stdout.write(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length}\r`)
  }
  console.log(`\n✓ Upserted ${upserted} species\n`)

  // 5. Summary stats
  const [stats] = await sql.unsafe(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE jsonb_array_length(special_abilities) > 0) AS with_abilities,
      COUNT(*) FILTER (WHERE
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(special_abilities) ab
          WHERE ab->>'mechanical_type' != 'narrative'
        )
      ) AS with_mechanical,
      COUNT(*) FILTER (WHERE
        special_abilities = '[]'::jsonb OR
        NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(special_abilities) ab
          WHERE ab->>'mechanical_type' != 'narrative'
        )
      ) AS narrative_only
    FROM ref_species
  `) as any[]

  console.log('=== Summary ===')
  console.log(`  Total species:             ${stats.total}`)
  console.log(`  With any abilities:        ${stats.with_abilities}`)
  console.log(`  With mechanical abilities: ${stats.with_mechanical}`)
  console.log(`  Narrative-only or empty:   ${stats.narrative_only}`)

  // 6. Verification: Gran
  const [gran] = await sql.unsafe(`
    SELECT key, name, jsonb_pretty(special_abilities) AS abilities
    FROM ref_species WHERE key = 'GRAN'
  `) as any[]
  if (gran) {
    console.log('\n=== Gran special_abilities ===')
    console.log(gran.abilities)
  } else {
    console.log('\n  WARNING: Gran not found in ref_species')
  }

  // 7. Verification: Dathomirian
  const [dath] = await sql.unsafe(`
    SELECT key, name, jsonb_pretty(special_abilities) AS abilities
    FROM ref_species WHERE key = 'DATHOMIRIAN'
  `) as any[]
  if (dath) {
    console.log('\n=== Dathomirian special_abilities ===')
    console.log(dath.abilities)
  } else {
    console.log('\n  WARNING: Dathomirian not found in ref_species')
  }

  await sql.end()
  console.log('\nDone.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
