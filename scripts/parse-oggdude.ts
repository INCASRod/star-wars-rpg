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
    const talentRows = ensureArray(s.TalentRows?.TalentRow).map((row: any) => ({
      index: parseInt(row.Index),
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
  return ensureArray(data.Talents.Talent).map((t: any) => ({
    key: t.Key,
    name: t.Name,
    description: t.Description || null,
    activation: t.ActivationValue || 'taPassive',
    is_force_talent: t.ForceTalent === 'true' || t.ForceTalent === true || false,
    is_ranked: t.Ranked === 'true' || t.Ranked === true || false,
  }))
}

// ── Weapons ──
function parseWeapons() {
  const data = readXML(path.join(DATA_DIR, 'Weapons.xml')) as { Weapons: { Weapon: unknown[] } }
  return ensureArray(data.Weapons.Weapon).map((w: any) => ({
    key: w.Key,
    name: w.Name,
    description: w.Description || null,
    skill_key: w.SkillKey || null,
    damage: parseInt(w.Damage) || 0,
    damage_add: parseInt(w.DamageAdd) || 0,
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
  return ensureArray(data.Gears.Gear).map((g: any) => ({
    key: g.Key,
    name: g.Name,
    description: g.Description || null,
    encumbrance: parseInt(g.Encumbrance) || 0,
    price: parseInt(g.Price) || 0,
    rarity: parseInt(g.Rarity) || 0,
  }))
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
  }

  for (const [filename, data] of Object.entries(outputs)) {
    fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(data, null, 2))
    console.log(`  Wrote ${filename}`)
  }

  console.log('\nDone! JSON files in oggdude/parsed/')
}

main()
