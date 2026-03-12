/**
 * OggDude XML → JSON ETL Pipeline
 *
 * Parses the OggDude Custom Dataset and outputs JSON files
 * ready for Supabase seeding.
 *
 * Usage: npx tsx scripts/parse-oggdude.ts
 */

import { XMLParser } from 'fast-xml-parser'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'oggdude', 'DataCustom')
const OUT_DIR = path.join(__dirname, '..', 'oggdude', 'parsed')

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => {
    // Force arrays for collection elements (NOT 'Key' — it's context-dependent)
    return [
      'Skill', 'Talent', 'Weapon', 'Armor', 'Gear',
      'Quality', 'Category', 'Direction', 'TalentRow',
      'Source', 'Option', 'OptionChoice', 'SkillTraining',
      'Mod', 'ItemChange',
      'Morality', 'Obligation', 'Duty', 'ItemDescriptor',
      'AbilityRow', 'ForceAbility',
    ].includes(name)
  },
})

function ensureArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return []
  return Array.isArray(val) ? val : [val]
}

function readXML(filePath: string): unknown {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return parser.parse(xml)
}

// ── Skills ──
function parseSkills() {
  const data = readXML(path.join(DATA_DIR, 'Skills.xml')) as { Skills: { Skill: unknown[] } }
  return ensureArray(data.Skills.Skill).map((s: any) => ({
    key: s.Key,
    name: s.Name,
    description: s.Description || null,
    characteristic_key: s.CharKey,
    type: s.TypeValue,
  }))
}

// ── Species ──
function parseSpecies() {
  const speciesDir = path.join(DATA_DIR, 'Species')
  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.xml'))
  return files.map(f => {
    const data = readXML(path.join(speciesDir, f)) as { Species: any }
    const s = data.Species
    return {
      key: s.Key,
      name: s.Name,
      description: s.Description || null,
      brawn: parseInt(s.StartingChars?.Brawn) || 2,
      agility: parseInt(s.StartingChars?.Agility) || 2,
      intellect: parseInt(s.StartingChars?.Intellect) || 2,
      cunning: parseInt(s.StartingChars?.Cunning) || 2,
      willpower: parseInt(s.StartingChars?.Willpower) || 2,
      presence: parseInt(s.StartingChars?.Presence) || 2,
      wound_threshold: parseInt(s.StartingAttrs?.WoundThreshold) || 10,
      strain_threshold: parseInt(s.StartingAttrs?.StrainThreshold) || 10,
      starting_xp: parseInt(s.StartingAttrs?.Experience) || 100,
      abilities: s.SubSpeciesList || s.OptionChoices || null,
      option_choices: s.OptionChoices || null,
      source_book: ensureArray(s.Sources?.Source ?? s.Source)?.[0]?.['#text'] ??
                    (typeof (s.Sources?.Source ?? s.Source) === 'string' ? (s.Sources?.Source ?? s.Source) : null),
      source_page: parseInt(ensureArray(s.Sources?.Source ?? s.Source)?.[0]?.['@_Page']) || null,
    }
  })
}

// ── Careers ──
function parseCareers() {
  const careersDir = path.join(DATA_DIR, 'Careers')
  const files = fs.readdirSync(careersDir).filter(f => f.endsWith('.xml'))
  return files.map(f => {
    const data = readXML(path.join(careersDir, f)) as { Career: any }
    const c = data.Career
    return {
      key: c.Key,
      name: c.Name,
      description: c.Description || null,
      career_skill_keys: ensureArray(c.CareerSkills?.Key),
      specialization_keys: ensureArray(c.Specializations?.Key),
    }
  })
}

// ── Specializations ──
function parseSpecializations() {
  const specDir = path.join(DATA_DIR, 'Specializations')
  const files = fs.readdirSync(specDir).filter(f => f.endsWith('.xml'))
  return files.map(f => {
    const data = readXML(path.join(specDir, f)) as { Specialization: any }
    const s = data.Specialization
    const talentRows = ensureArray(s.TalentRows?.TalentRow).map((row: any, rowIdx: number) => ({
      index: row.Index !== undefined ? parseInt(row.Index) : rowIdx,
      cost: parseInt(row.Cost),
      talents: ensureArray(row.Talents?.Key),
      directions: ensureArray(row.Directions?.Direction).map((d: any) => ({
        up: d.Up === 'true' || d.Up === true,
        down: d.Down === 'true' || d.Down === true,
        left: d.Left === 'true' || d.Left === true,
        right: d.Right === 'true' || d.Right === true,
      })),
    }))

    // Determine career_key by checking which career lists this spec
    return {
      key: s.Key,
      name: s.Name,
      description: s.Description || null,
      career_key: null, // Will be filled in post-processing
      career_skill_keys: ensureArray(s.CareerSkills?.Key),
      talent_tree: { rows: talentRows },
    }
  })
}

// ── Talents ──
function parseTalents() {
  const data = readXML(path.join(DATA_DIR, 'Talents.xml')) as { Talents: { Talent: unknown[] } }
  return ensureArray(data.Talents.Talent).map((t: any) => {
    const attrs = t.Attributes || {}
    const modifiers: Record<string, number> = {}
    if (attrs.WoundThreshold) modifiers.wound_threshold = parseInt(attrs.WoundThreshold)
    if (attrs.StrainThreshold) modifiers.strain_threshold = parseInt(attrs.StrainThreshold)
    if (attrs.SoakValue) modifiers.soak = parseInt(attrs.SoakValue)
    if (attrs.DefenseRanged) modifiers.defense_ranged = parseInt(attrs.DefenseRanged)
    if (attrs.DefenseMelee) modifiers.defense_melee = parseInt(attrs.DefenseMelee)
    if (attrs.ForceRating) modifiers.force_rating = parseInt(attrs.ForceRating)
    return {
      key: t.Key,
      name: t.Name,
      description: t.Description || null,
      activation: t.ActivationValue || 'taPassive',
      is_force_talent: t.ForceTalent === 'true' || t.ForceTalent === true || false,
      is_ranked: t.Ranked === 'true' || t.Ranked === true || false,
      modifiers: Object.keys(modifiers).length > 0 ? modifiers : null,
    }
  })
}

// ── Weapons ──
function parseWeapons() {
  const data = readXML(path.join(DATA_DIR, 'Weapons.xml')) as { Weapons: { Weapon: unknown[] } }
  return ensureArray(data.Weapons.Weapon).map((w: any) => ({
    key: w.Key,
    name: w.Name,
    description: w.Description || null,
    skill_key: w.SkillKey || null,
    damage: w.Damage != null ? parseInt(w.Damage) || 0 : 0,
    damage_add: w.DamageAdd != null ? parseInt(w.DamageAdd) || 0 : null,
    crit: parseInt(w.Crit) || 0,
    range_value: w.RangeValue || null,
    encumbrance: parseInt(w.Encumbrance) || 0,
    hard_points: parseInt(w.HP) || 0,
    price: parseInt(w.Price) || 0,
    rarity: parseInt(w.Rarity) || 0,
    restricted: w.Restricted === 'true' || w.Restricted === true || false,
    qualities: ensureArray(w.Qualities?.Quality).map((q: any) => ({
      key: q.Key,
      count: parseInt(q.Count) || null,
    })),
    categories: ensureArray(w.Categories?.Category),
  }))
}

// ── Armor ──
function parseArmor() {
  const data = readXML(path.join(DATA_DIR, 'Armor.xml')) as { Armors: { Armor: unknown[] } }
  return ensureArray(data.Armors.Armor).map((a: any) => ({
    key: a.Key,
    name: a.Name,
    description: a.Description || null,
    defense: parseInt(a.Defense) || 0,
    soak: parseInt(a.Soak) || 0,
    encumbrance: parseInt(a.Encumbrance) || 0,
    hard_points: parseInt(a.HP) || 0,
    price: parseInt(a.Price) || 0,
    rarity: parseInt(a.Rarity) || 0,
  }))
}

// ── Gear ──
function parseGear() {
  const data = readXML(path.join(DATA_DIR, 'Gear.xml')) as { Gears: { Gear: unknown[] } }
  return ensureArray(data.Gears.Gear).map((g: any) => {
    // Check BaseMods for ENCTADD (encumbrance threshold add, e.g. backpacks)
    let encumbrance_bonus = 0
    if (g.BaseMods?.Mod) {
      const mods = ensureArray(g.BaseMods.Mod)
      for (const m of mods) {
        if (m.Key === 'ENCTADD') encumbrance_bonus += parseInt(m.Count) || 0
      }
    }
    return {
      key: g.Key,
      name: g.Name,
      description: g.Description || null,
      encumbrance: parseInt(g.Encumbrance) || 0,
      price: parseInt(g.Price) || 0,
      rarity: parseInt(g.Rarity) || 0,
      encumbrance_bonus: encumbrance_bonus || null,
    }
  })
}

// ── Moralities ──
function parseMoralities() {
  const data = readXML(path.join(DATA_DIR, 'Moralities.xml')) as { Moralities: { Morality: unknown[] } }
  return ensureArray(data.Moralities.Morality).map((m: any) => ({
    key: m.Key,
    name: m.Name,
    description: m.Description || null,
    type: m.ModifierType || null,
    paired_key: m.PairedKey || null,
  }))
}

// ── Obligations ──
function parseObligations() {
  const data = readXML(path.join(DATA_DIR, 'Obligations.xml')) as { Obligations: { Obligation: unknown[] } }
  return ensureArray(data.Obligations.Obligation).map((o: any) => ({
    key: o.Key,
    name: o.Name,
    description: o.Description || null,
  }))
}

// ── Duties ──
function parseDuties() {
  const data = readXML(path.join(DATA_DIR, 'Duty.xml')) as { Duties: { Duty: unknown[] } }
  return ensureArray(data.Duties.Duty).map((d: any) => ({
    key: d.Key,
    name: d.Name,
    description: d.Description || null,
  }))
}

// ── Item Descriptors ──
function parseItemDescriptors() {
  const data = readXML(path.join(DATA_DIR, 'ItemDescriptors.xml')) as { ItemDescriptors: { ItemDescriptor: unknown[] } }
  return ensureArray(data.ItemDescriptors.ItemDescriptor).map((d: any) => ({
    key: d.Key,
    name: d.Name,
    description: d.Description || null,
    is_passive: d.IsPassive === 'true' || d.IsPassive === true || false,
  }))
}

// ── Force Powers ──
function parseForcePowers() {
  const fpDir = path.join(DATA_DIR, 'Force Powers')
  if (!fs.existsSync(fpDir)) return []
  const files = fs.readdirSync(fpDir).filter(f => f.endsWith('.xml'))
  return files.map(f => {
    const data = readXML(path.join(fpDir, f)) as { ForcePower: any }
    const fp = data.ForcePower
    const sources = ensureArray(fp.Sources?.Source ?? fp.Source).map((s: any) => ({
      book: typeof s === 'string' ? s : s['#text'] || '',
      page: typeof s === 'string' ? null : parseInt(s['@_Page']) || null,
    }))

    const abilityRows = ensureArray(fp.AbilityRows?.AbilityRow).map((row: any, rowIdx: number) => {
      const abilities = ensureArray(row.Abilities?.Key)
      const directions = ensureArray(row.Directions?.Direction).map((d: any) => ({
        up: d.Up === 'true' || d.Up === true,
        down: d.Down === 'true' || d.Down === true,
        left: d.Left === 'true' || d.Left === true,
        right: d.Right === 'true' || d.Right === true,
      }))
      const spans = ensureArray(row.AbilitySpan?.Span).map((s: any) => parseInt(s) || 0)
      const costs = ensureArray(row.Costs?.Cost).map((c: any) => parseInt(c) || 0)
      return {
        index: rowIdx,
        abilities,
        directions,
        spans,
        costs,
      }
    })

    return {
      key: fp.Key,
      name: fp.Name,
      description: fp.Description || null,
      min_force_rating: parseInt(fp.MinForceRating) || 1,
      sources: sources.length ? sources : null,
      ability_tree: { rows: abilityRows },
    }
  })
}

// ── Force Abilities ──
function parseForceAbilities(forcePowers: { key: string; name: string }[]) {
  const filePath = path.join(DATA_DIR, 'Force Abilities.xml')
  if (!fs.existsSync(filePath)) return []
  // Build name→key map from force powers
  const nameToKey: Record<string, string> = {}
  for (const fp of forcePowers) nameToKey[fp.name] = fp.key
  const data = readXML(filePath) as { ForceAbilities: { ForceAbility: unknown[] } }
  return ensureArray(data.ForceAbilities.ForceAbility).map((a: any) => {
    const sources = ensureArray(a.Sources?.Source ?? a.Source).map((s: any) => ({
      book: typeof s === 'string' ? s : s['#text'] || '',
      page: typeof s === 'string' ? null : parseInt(s['@_Page']) || null,
    }))
    const rawPower = a.Power || null
    const powerKey = rawPower ? (nameToKey[rawPower] || rawPower) : null
    return {
      key: a.Key,
      name: a.Name,
      description: a.Description || null,
      power_key: powerKey,
      sources: sources.length ? sources : null,
    }
  })
}

// ── Main ──
function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log('Parsing OggDude XML dataset...')

  const skills = parseSkills()
  console.log(`  Skills: ${skills.length}`)

  const species = parseSpecies()
  console.log(`  Species: ${species.length}`)

  const careers = parseCareers()
  console.log(`  Careers: ${careers.length}`)

  const specializations = parseSpecializations()
  // Post-process: set career_key from career data
  for (const career of careers) {
    for (const specKey of career.specialization_keys) {
      const spec = specializations.find(s => s.key === specKey)
      if (spec) spec.career_key = career.key
    }
  }
  console.log(`  Specializations: ${specializations.length}`)

  const talents = parseTalents()
  console.log(`  Talents: ${talents.length}`)

  const weapons = parseWeapons()
  console.log(`  Weapons: ${weapons.length}`)

  const armor = parseArmor()
  console.log(`  Armor: ${armor.length}`)

  const gear = parseGear()
  console.log(`  Gear: ${gear.length}`)

  const moralities = parseMoralities()
  console.log(`  Moralities: ${moralities.length}`)

  const obligations = parseObligations()
  console.log(`  Obligations: ${obligations.length}`)

  const duties = parseDuties()
  console.log(`  Duties: ${duties.length}`)

  const itemDescriptors = parseItemDescriptors()
  console.log(`  Item Descriptors: ${itemDescriptors.length}`)

  const forcePowers = parseForcePowers()
  console.log(`  Force Powers: ${forcePowers.length}`)

  const forceAbilities = parseForceAbilities(forcePowers)
  console.log(`  Force Abilities: ${forceAbilities.length}`)

  // Write JSON files
  const outputs = {
    'ref_skills.json': skills,
    'ref_species.json': species,
    'ref_careers.json': careers,
    'ref_specializations.json': specializations,
    'ref_talents.json': talents,
    'ref_weapons.json': weapons,
    'ref_armor.json': armor,
    'ref_gear.json': gear,
    'ref_moralities.json': moralities,
    'ref_obligations.json': obligations,
    'ref_duties.json': duties,
    'ref_item_descriptors.json': itemDescriptors,
    'ref_force_powers.json': forcePowers,
    'ref_force_abilities.json': forceAbilities,
  }

  for (const [filename, data] of Object.entries(outputs)) {
    fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(data, null, 2))
    console.log(`  Wrote ${filename}`)
  }

  console.log('\nDone! JSON files in oggdude/parsed/')
}

main()
