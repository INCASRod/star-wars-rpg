/**
 * Parser for "Copy for Archive" blocks pasted from the Legacy of Rebellion
 * console (format "lor-console/adversary@1"). Pure function — no Supabase
 * calls. Output plugs directly into AdversaryEditor's form-state shape.
 */

export interface ConsoleWeapon {
  raw: string
  kind: 'weapon' | 'armor' | 'gear'
  name: string
  skill: string | null
  damage: string | null
  critical: string | null
  range: string | null
  qualities: string[]
  soak: number | null
  defense: number | null
}

export interface ConsoleAdversaryBlock {
  format: string
  exportedAt?: string
  source?: { docId?: string; docTitle?: string; blockId?: string }
  name: string
  tier: 'Minion' | 'Rival' | 'Nemesis' | null
  subtitle: string | null
  tierRaw?: string | null
  characteristics: Partial<Record<'brawn' | 'agility' | 'intellect' | 'cunning' | 'willpower' | 'presence', number | null>>
  soak: number | null
  wounds: number | null
  strain: number | null
  defense: { ranged: number | null; melee: number | null; raw?: string }
  skills: { name: string; rank: number | null }[]
  skillsRaw?: string
  talents: { name: string; rank: number | null; text: string; raw: string }[]
  talentsRaw?: string
  abilitiesRaw?: string
  equipment: ConsoleWeapon[]
  equipmentRaw?: string
  extraRows: { label: string; value: string }[]
}

/* ── Form-value shapes — mirror AdversaryEditor's local entry types ─────── */
export interface ImportedSkillEntry { skill: string; rank: number; characteristicOverride?: string }
export interface ImportedWeaponEntry { name: string; skillCategory: string; damage: string; range: string; qualities: string; crit: string }
export interface ImportedGearEntry { name: string; encumbrance: string; description: string; soak: string }
export interface ImportedTalentEntry { name: string; description: string }

export interface ImportedAdversaryFormValues {
  name: string
  type: 'minion' | 'rival' | 'nemesis'
  brawn: number; agility: number; intellect: number
  cunning: number; willpower: number; presence: number
  wt: number
  st: number | ''
  defMelee: number
  defRanged: number
  skills: ImportedSkillEntry[]
  weapons: ImportedWeaponEntry[]
  gear: ImportedGearEntry[]
  talents: ImportedTalentEntry[]
  abilities: ImportedTalentEntry[]
  description: string
}

export interface ImportReportFlag {
  field: string
  message: string
}

export interface ImportReport {
  docTitle: string | null
  flags: ImportReportFlag[]
}

export type ImportConsoleAdversaryResult =
  | { ok: true; formValues: ImportedAdversaryFormValues; report: ImportReport }
  | { ok: false; error: string }

const VALID_RANGES = ['Engaged', 'Short', 'Medium', 'Long', 'Extreme']

/** "Knowledge (Underworld)" → "Knowledge: Underworld" to match ALL_SKILLS' colon form.
 *  Every other bracketed skill ("Piloting (Space)", "Ranged (Light)") already matches
 *  ALL_SKILLS verbatim, so this is the one special case. */
function normalizeSkillName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  const knowledgeMatch = trimmed.match(/^Knowledge\s*\(([^)]+)\)$/i)
  if (knowledgeMatch) return `Knowledge: ${knowledgeMatch[1].trim()}`
  return trimmed
}

function matchSkillName(name: string, knownSkills: string[]): string | null {
  const normalized = normalizeSkillName(name).toLowerCase()
  const found = knownSkills.find(s => s.toLowerCase() === normalized)
  return found ?? null
}

function tierToType(tier: ConsoleAdversaryBlock['tier']): 'minion' | 'rival' | 'nemesis' {
  if (tier === 'Minion') return 'minion'
  if (tier === 'Rival') return 'rival'
  return 'nemesis'
}

/**
 * Parse a pasted console adversary block into AdversaryEditor form values.
 * @param pasted Raw pasted text (expected to be JSON matching ConsoleAdversaryBlock).
 * @param knownSkills The editor's skill name list (AdversaryEditor's ALL_SKILLS) — passed
 *   in rather than imported statically so this stays a pure function of its inputs.
 * @param existingNames Names of custom adversaries already in this campaign, for a
 *   duplicate-name warning (caller decides how to surface it; not a blocking flag here).
 */
export function importConsoleAdversary(
  pasted: string,
  knownSkills: string[],
): ImportConsoleAdversaryResult {
  let block: ConsoleAdversaryBlock
  try {
    block = JSON.parse(pasted)
  } catch {
    return { ok: false, error: 'Could not parse pasted text as JSON.' }
  }

  if (!block || typeof block !== 'object' || block.format !== 'lor-console/adversary@1') {
    return { ok: false, error: 'Pasted block is not a recognized console export (expected format "lor-console/adversary@1").' }
  }
  if (!block.name || typeof block.name !== 'string') {
    return { ok: false, error: 'Pasted block has no adversary name.' }
  }

  const flags: ImportReportFlag[] = []

  /* ── Tier / type ───────────────────────────────────────────────────── */
  const type = tierToType(block.tier)
  if (!block.tier) {
    flags.push({ field: 'type', message: 'Tier missing from block — defaulted to Rival. Verify.' })
  }

  /* ── Characteristics ──────────────────────────────────────────────── */
  const CHAR_KEYS = ['brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence'] as const
  const chars: Record<(typeof CHAR_KEYS)[number], number> = {
    brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2,
  }
  for (const key of CHAR_KEYS) {
    const v = block.characteristics?.[key]
    if (v == null) {
      flags.push({ field: key, message: `${key} missing — defaulted to 2. Verify.` })
    } else {
      chars[key] = v
    }
  }

  /* ── Wounds / strain ──────────────────────────────────────────────── */
  const wt = block.wounds ?? 10
  if (block.wounds == null) flags.push({ field: 'wt', message: 'Wound threshold missing — defaulted to 10. Verify.' })

  let st: number | '' = ''
  if (type === 'nemesis') {
    if (block.strain != null) st = block.strain
    else flags.push({ field: 'st', message: 'Nemesis with no strain threshold in block. Verify.' })
  }

  /* ── Defense ───────────────────────────────────────────────────────── */
  const defMelee = block.defense?.melee ?? 0
  const defRanged = block.defense?.ranged ?? 0
  if (block.defense?.melee == null) flags.push({ field: 'defMelee', message: 'Melee defense missing — defaulted to 0.' })
  if (block.defense?.ranged == null) flags.push({ field: 'defRanged', message: 'Ranged defense missing — defaulted to 0.' })

  /* ── Skills ────────────────────────────────────────────────────────── */
  const skills: ImportedSkillEntry[] = []
  for (const s of block.skills ?? []) {
    const matched = matchSkillName(s.name, knownSkills)
    if (!matched) {
      flags.push({ field: 'skills', message: `Skill "${s.name}" did not match any known skill — not added. Add manually.` })
      continue
    }
    if (s.rank == null) {
      flags.push({ field: 'skills', message: `Skill "${matched}" has no rank in block — left off. Add manually if needed.` })
      continue
    }
    skills.push({ skill: matched, rank: s.rank })
  }

  /* ── Weapons + armor/gear ─────────────────────────────────────────── */
  const weapons: ImportedWeaponEntry[] = []
  const gear: ImportedGearEntry[] = []
  for (const item of block.equipment ?? []) {
    if (item.kind === 'weapon') {
      const range = item.range && VALID_RANGES.includes(item.range) ? item.range : 'Short'
      if (item.range && !VALID_RANGES.includes(item.range)) {
        flags.push({ field: 'weapons', message: `Weapon "${item.name}" range "${item.range}" not a standard range — defaulted to Short. Verify.` })
      }
      const critNum = item.critical && /^\d+$/.test(item.critical) ? Number(item.critical) : null
      if (item.critical && item.critical !== '-' && critNum === null) {
        flags.push({ field: 'weapons', message: `Weapon "${item.name}" critical rating "${item.critical}" is not a plain number — left blank. Fill it in manually.` })
      }
      weapons.push({
        name: item.name,
        skillCategory: item.skill ?? '',
        damage: item.damage ?? '0',
        range,
        qualities: (item.qualities ?? []).join(', '),
        crit: critNum != null ? String(critNum) : '',
      })
      flags.push({ field: 'weapons', message: `Weapon "${item.name}" imported as custom (this creator has no ref_weapons match/override path).` })
    } else {
      // armor / gear — soak is preserved as-is; do NOT add the block's total
      // soak anywhere. AdversaryEditor computes final soak = brawn + sum(gear.soak)
      // on save, so an armor item's own soak bonus reproduces the block's final
      // soak naturally as long as brawn + armor soak == block.soak.
      gear.push({
        name: item.name,
        encumbrance: '',
        description: item.raw,
        soak: item.soak != null ? String(item.soak) : '',
      })
    }
  }

  // Reconciliation: the console's soak is always FINAL. Some adversaries carry
  // soak the equipment list doesn't explain (natural toughness, droid plating,
  // species traits not modeled as a gear line) — if we don't account for it here,
  // AdversaryEditor's own save-time `brawn + sum(gear.soak)` computation would
  // silently save a lower soak than the console block says. If the console soak
  // is instead LOWER than brawn + armor, we do not strip armor to force a match —
  // that would delete a real gear line — we just flag the mismatch for the GM.
  const gearSoakSum = gear.reduce((sum, g) => sum + (g.soak !== '' ? Number(g.soak) : 0), 0)
  const computedSoak = chars.brawn + gearSoakSum
  if (block.soak != null && block.soak > computedSoak) {
    const diff = block.soak - computedSoak
    gear.push({ name: 'Natural soak (console)', encumbrance: '', description: '', soak: String(diff) })
    flags.push({
      field: 'soak',
      message: `Console soak (${block.soak}) exceeds Brawn + armour (${computedSoak}) — added a "Natural soak (console) +${diff}" gear line to reconcile. Rename or remove it if it's wrong.`,
    })
  } else if (block.soak != null && block.soak < computedSoak) {
    flags.push({
      field: 'soak',
      message: `Console soak (${block.soak}) is LOWER than Brawn + armour (${computedSoak}). Armour was not removed — review and adjust manually if needed.`,
    })
  }

  /* ── Talents ───────────────────────────────────────────────────────── */
  const talents: ImportedTalentEntry[] = (block.talents ?? []).map(t => ({
    name: t.rank != null ? `${t.name} ${t.rank}` : t.name,
    description: t.text,
  }))

  /* ── Notes (description) — subtitle, talentsRaw fallback, abilitiesRaw, extraRows ── */
  const noteLines: string[] = []
  if (block.subtitle) noteLines.push(`Subtitle: ${block.subtitle}`)
  if (block.talentsRaw) noteLines.push(`Talents (raw): ${block.talentsRaw}`)
  if (block.abilitiesRaw) noteLines.push(`Abilities: ${block.abilitiesRaw}`)
  for (const row of block.extraRows ?? []) {
    noteLines.push(`${row.label}: ${row.value}`)
  }
  const description = noteLines.join('\n\n')

  if (block.subtitle) {
    flags.push({ field: 'description', message: 'Subtitle has no dedicated field in this creator — prefixed into Description.' })
  }

  const report: ImportReport = {
    docTitle: block.source?.docTitle ?? null,
    flags,
  }

  const formValues: ImportedAdversaryFormValues = {
    name: block.name,
    type,
    brawn: chars.brawn, agility: chars.agility, intellect: chars.intellect,
    cunning: chars.cunning, willpower: chars.willpower, presence: chars.presence,
    wt,
    st,
    defMelee,
    defRanged,
    skills,
    weapons,
    gear,
    talents,
    abilities: [],
    description,
  }

  return { ok: true, formValues, report }
}
