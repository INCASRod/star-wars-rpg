/**
 * characterSheetPDF.ts
 *
 * Overlays character data onto the official FFG Age of Rebellion character
 * sheet template using pdf-lib.
 *
 * Coordinates are calibrated for the actual 603×783pt page (bottom-left origin).
 * pdf-lib coordinate system: (0,0) = bottom-left, y increases upward.
 * PNG scale: 1257×1632px → 0.4798 pts/px; x_pts = px*0.4797; y_pts = (1632-py)*0.4798
 */

import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { RANGE_LABELS, ACTIVATION_LABELS } from './types'

import type {
  Character,
  CharacterSkill,
  CharacterTalent,
  CharacterWeapon,
  CharacterArmor,
  CharacterGear,
  CharacterCriticalInjury,
  RefSkill,
  RefTalent,
  RefWeapon,
  RefArmor,
  RefGear,
  RefWeaponQuality,
  RefSpecialization,
} from './types'

// ── Constants ─────────────────────────────────────────────────────────────────

const BLACK = rgb(0, 0, 0)
const WHITE = rgb(1, 1, 1)

// Set to false for final clean output
const DEBUG_BOXES = true

// ── Skill layout: ordered exactly as they appear on the official sheet ────────

// Skill y-positions calibrated from sheet-page1.png:
// Skills section header dark band at y=540-546px → pts=524-521
// First data row immediately below at pts≈520; row spacing 11pts (matches template)
const GENERAL_SKILLS: Array<{ key: string; y: number }> = [
  { key: 'ASTRO',   y: 520 },
  { key: 'ATHL',    y: 509 },
  { key: 'CHARM',   y: 498 },
  { key: 'COERC',   y: 487 },
  { key: 'COMP',    y: 476 },
  { key: 'COOL',    y: 465 },
  { key: 'COORD',   y: 454 },
  { key: 'DECEP',   y: 443 },
  { key: 'DISC',    y: 432 },
  { key: 'LEAD',    y: 421 },
  { key: 'MECH',    y: 410 },
  { key: 'MED',     y: 399 },
  { key: 'NEG',     y: 388 },
  { key: 'PERC',    y: 377 },
  { key: 'PILOTPL', y: 366 },
  { key: 'PILOTSP', y: 355 },
  { key: 'RESIL',   y: 344 },
  { key: 'SKUL',    y: 333 },
  { key: 'STEALTH', y: 322 },
  { key: 'STWISE',  y: 311 },
  { key: 'SURV',    y: 300 },
  { key: 'VIGIL',   y: 289 },
]

const COMBAT_SKILLS: Array<{ key: string; y: number }> = [
  { key: 'BRAWL',   y: 520 },
  { key: 'GUNN',    y: 509 },
  { key: 'MELEE',   y: 498 },
  { key: 'RANGLT',  y: 487 },
  { key: 'RANGHVY', y: 476 },
]

const KNOWLEDGE_SKILLS: Array<{ key: string; y: number }> = [
  { key: 'CORE',  y: 443 },
  { key: 'EDU',   y: 432 },
  { key: 'LORE',  y: 421 },
  { key: 'OUTER', y: 410 },
  { key: 'UNDER', y: 399 },
  { key: 'WARF',  y: 388 },
  { key: 'XENO',  y: 377 },
]

// y positions for the 14 talent rows on page 2
// Calibrated from sheet-page2.png: talent header at pts≈219, rows measured from dark separator bands
const TALENT_ROW_Y = [211, 202, 192, 182, 171, 165, 158, 152, 143, 137, 130, 124, 115, 109]

// ── Public input type ─────────────────────────────────────────────────────────

export interface CharacterSheetInput {
  character:           Character
  playerName:          string
  careerName:          string
  speciesName:         string
  specNames:           string
  skills:              CharacterSkill[]
  refSkills:           RefSkill[]
  refSkillMap:         Record<string, RefSkill>
  talents:             CharacterTalent[]
  refTalentMap:        Record<string, RefTalent>
  weapons:             CharacterWeapon[]
  refWeaponMap:        Record<string, RefWeapon>
  refWeaponQualityMap: Record<string, RefWeaponQuality>
  armor:               CharacterArmor[]
  refArmorMap:         Record<string, RefArmor>
  gear:                CharacterGear[]
  refGearMap:          Record<string, RefGear>
  crits:               CharacterCriticalInjury[]
  refSpecMap:          Record<string, RefSpecialization>
  effectiveStats: {
    soak:            number
    defenseMelee:    number
    defenseRanged:   number
    woundThreshold:  number
    strainThreshold: number
  } | null
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function generateCharacterSheetPDF(
  input: CharacterSheetInput,
): Promise<void> {
  const templateBytes = await fetch('/character-sheet-template.pdf').then(r => {
    if (!r.ok) throw new Error(`Template fetch failed: ${r.status}`)
    return r.arrayBuffer()
  })

  const pdfDoc = await PDFDocument.load(templateBytes)
  const pages  = pdfDoc.getPages()
  const page1  = pages[0]
  const page2  = pages[1] ?? null

  const font     = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  fillPage1(page1, font, fontBold, input)
  if (page2) fillPage2(page2, font, fontBold, input)

  const pdfBytes = await pdfDoc.save()
  const blob     = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url      = URL.createObjectURL(blob)
  const a        = document.createElement('a')
  a.href         = url
  a.download     = `${input.character.name.replace(/[^A-Za-z0-9_-]/g, '_')}_CharacterSheet.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Page 1 ────────────────────────────────────────────────────────────────────

function fillPage1(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  input: CharacterSheetInput,
) {
  const { character, playerName, careerName, speciesName, specNames,
          skills, weapons, refWeaponMap, refWeaponQualityMap, effectiveStats } = input

  // Build skill lookup: skill_key (upper) → { rank, is_career }
  const skillData: Record<string, { rank: number; is_career: boolean }> = {}
  for (const cs of skills) {
    skillData[cs.skill_key.toUpperCase()] = { rank: cs.rank, is_career: cs.is_career }
  }

  // ── HEADER ────────────────────────────────────────────────────────────────
  // y-positions calibrated from sheet-page1.png brightness scans
  t(page, bold,  character.name,  50, 760, 14)
  t(page, font,  speciesName,     50, 728, 9)
  t(page, font,  careerName,      50, 720, 9)
  t(page, font,  clip(specNames, font, 8, 300), 50, 711, 8)
  t(page, font,  playerName,     450, 711, 9)
  // XP boxes at bottom: total (left box) + available (right box), y≈64pts from bottom
  t(page, font,  String(character.xp_total),      56, 64, 9)
  t(page, font,  String(character.xp_available),  480, 64, 9)

  // ── SOAK / WOUNDS / STRAIN / DEFENSE ──────────────────────────────────────
  // White value boxes measured at y=265-320px → pts≈643; x-positions spread across page
  const soak   = effectiveStats?.soak            ?? character.soak
  const woundT = effectiveStats?.woundThreshold  ?? character.wound_threshold
  const strT   = effectiveStats?.strainThreshold ?? character.strain_threshold
  const defM   = effectiveStats?.defenseMelee    ?? character.defense_melee
  const defR   = effectiveStats?.defenseRanged   ?? character.defense_ranged

  t(page, bold, String(soak),                     95,  643, 18)
  t(page, bold, String(woundT),                  210,  643, 14)
  t(page, bold, String(character.wound_current), 270,  643, 14)
  t(page, bold, String(strT),                    350,  643, 14)
  t(page, bold, String(character.strain_current),410,  643, 14)
  t(page, bold, String(defR),                    472,  643, 14)
  t(page, bold, String(defM),                    530,  643, 14)

  // ── CHARACTERISTICS ───────────────────────────────────────────────────────
  // Dials at y=400-510px → center pts≈565
  t(page, bold, String(character.brawn),     68,  565, 20)
  t(page, bold, String(character.agility),  165,  565, 20)
  t(page, bold, String(character.intellect),262,  565, 20)
  t(page, bold, String(character.cunning),  358,  565, 20)
  t(page, bold, String(character.willpower),455,  565, 20)
  t(page, bold, String(character.presence), 550,  565, 20)

  // ── GENERAL SKILLS (left column) ─────────────────────────────────────────
  for (const { key, y } of GENERAL_SKILLS) {
    const cs = skillData[key] ?? { rank: 0, is_career: false }
    if (cs.is_career) {
      page.drawCircle({ x: 170, y, size: 3, color: BLACK })
    }
    drawSkillPips(page, 220, y, cs.rank)
  }

  // ── COMBAT SKILLS (right column) ─────────────────────────────────────────
  for (const { key, y } of COMBAT_SKILLS) {
    const cs = skillData[key] ?? { rank: 0, is_career: false }
    if (cs.is_career) {
      page.drawCircle({ x: 455, y, size: 3, color: BLACK })
    }
    drawSkillPips(page, 500, y, cs.rank)
  }

  // ── KNOWLEDGE SKILLS (right column) ──────────────────────────────────────
  for (const { key, y } of KNOWLEDGE_SKILLS) {
    const cs = skillData[key] ?? { rank: 0, is_career: false }
    if (cs.is_career) {
      page.drawCircle({ x: 455, y, size: 3, color: BLACK })
    }
    drawSkillPips(page, 500, y, cs.rank)
  }

  // ── WEAPONS TABLE ─────────────────────────────────────────────────────────
  // Calibrated: section top border at y=1243px (pts=187), first data row starts pts=166
  const WEAPON_ROWS = [166, 147, 128, 109, 90]
  weapons.slice(0, 5).forEach((cw, i) => {
    const rowY = WEAPON_ROWS[i]
    if (rowY === undefined) return
    const rw = refWeaponMap[cw.weapon_key]
    if (!rw) {
      t(page, font, cw.custom_name ?? cw.weapon_key, 52, rowY, 7)
      return
    }
    const weaponName = cw.custom_name ?? rw.name
    const skillName  = input.refSkillMap[rw.skill_key]?.name ?? rw.skill_key
    const damageStr  = rw.damage_add != null ? `+${rw.damage_add}` : String(rw.damage ?? 0)
    const qualStr    = (rw.qualities ?? []).map(q => {
      const qName = refWeaponQualityMap[q.key]?.name ?? q.key
      return q.count && q.count > 1 ? `${qName} ${q.count}` : qName
    }).join(', ')

    t(page, font, clip(weaponName, font, 7, 72), 52,  rowY, 7)
    t(page, font, clip(skillName,  font, 7, 72), 130, rowY, 7)
    t(page, font, damageStr,                     210, rowY, 7)
    t(page, font, String(rw.crit ?? '—'),         280, rowY, 7)
    t(page, font, RANGE_LABELS[rw.range_value] ?? rw.range_value, 330, rowY, 7)
    t(page, font, clip(qualStr || '—', font, 7, 150), 400, rowY, 7)
  })
}

// ── Page 2 ────────────────────────────────────────────────────────────────────

function fillPage2(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  input: CharacterSheetInput,
) {
  const { character, speciesName, careerName,
          talents, refTalentMap,
          weapons, refWeaponMap,
          armor,   refArmorMap,
          gear,    refGearMap,
          crits } = input

  // ── MOTIVATIONS (top section) — mapped to duty / obligation ───────────────
  // Left box = duty, right box = obligation
  if (character.duty_type) {
    t(page, font, character.duty_custom_name ?? character.duty_type, 115, 748, 9)
    t(page, font, `Magnitude: ${character.duty_value ?? 0}`,         115, 736, 8)
  }
  if (character.obligation_type) {
    t(page, font, character.obligation_custom_name ?? character.obligation_type, 310, 748, 9)
    t(page, font, `Value: ${character.obligation_value ?? 0}`,                   310, 736, 8)
  }

  // ── CHARACTER DESCRIPTION (right column) ─────────────────────────────────
  t(page, font, speciesName || '—', 450, 748, 9)
  t(page, font, careerName  || '—', 450, 720, 9)
  t(page, font, character.gender || '—', 450, 706, 9)
  // age / height / build / hair / eyes: not stored on Character — leave blank

  // ── DUTIES ────────────────────────────────────────────────────────────────
  if (character.duty_type) {
    t(page, font, character.duty_custom_name ?? character.duty_type, 115, 620, 9)
    t(page, font, String(character.duty_value ?? 0),                 115, 595, 9)
  }
  if (character.obligation_type) {
    t(page, font, character.obligation_custom_name ?? character.obligation_type, 310, 620, 9)
    t(page, font, String(character.obligation_value ?? 0),                       310, 595, 9)
  }

  // ── EQUIPMENT LOG ─────────────────────────────────────────────────────────
  t(page, bold, String(character.credits.toLocaleString()), 115, 480, 9)

  const wepLine = weapons
    .map(cw => cw.custom_name ?? refWeaponMap[cw.weapon_key]?.name ?? cw.weapon_key)
    .concat(armor.map(ca => ca.custom_name ?? refArmorMap[ca.armor_key]?.name ?? ca.armor_key))
    .join(', ') || '—'
  drawWrapped(page, font, wepLine, 115, 455, 8, 150)

  const gearLine = gear.map(cg => {
    const name = cg.custom_name ?? refGearMap[cg.gear_key]?.name ?? cg.gear_key
    return cg.quantity > 1 ? `${name} ×${cg.quantity}` : name
  }).join(', ') || '—'
  drawWrapped(page, font, gearLine, 310, 455, 8, 150)

  // ── CRITICAL INJURIES ─────────────────────────────────────────────────────
  const critRowYs = [480, 465, 450, 435, 420, 405]
  crits
    .filter(c => !c.is_healed)
    .slice(0, 6)
    .forEach((c, i) => {
      const ry = critRowYs[i]
      if (ry === undefined) return
      t(page, font, c.severity?.toUpperCase() ?? '—',               440, ry, 8)
      t(page, font, clip(c.custom_name ?? `Roll ${c.roll_result ?? '—'}`, font, 8, 140), 490, ry, 8)
    })

  // ── TALENTS TABLE ─────────────────────────────────────────────────────────
  talents.slice(0, TALENT_ROW_Y.length).forEach((ct, i) => {
    const rowY = TALENT_ROW_Y[i]
    if (rowY === undefined) return
    const rt = refTalentMap[ct.talent_key]
    if (!rt) {
      t(page, font, ct.talent_key, 52, rowY, 7)
      return
    }
    const ranked     = rt.is_ranked && ct.ranks > 1 ? ` ${ct.ranks}` : ''
    const activation = ACTIVATION_LABELS[rt.activation] ?? rt.activation ?? '—'
    const desc       = (rt.description ?? '').replace(/<[^>]+>/g, '').slice(0, 120)

    t(page, font, clip(`${rt.name}${ranked}`, font, 7, 95), 52,  rowY, 7)
    t(page, font, clip(activation,            font, 7, 80), 200, rowY, 7)
    drawWrapped(page, font, desc, 235, rowY, 7, 320, 2)
  })
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

/** Draw text at (x, y) — shorthand to keep layout code readable. */
function t(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size: number) {
  if (!text) return
  if (DEBUG_BOXES) {
    page.drawRectangle({
      x: x - 2,
      y: y - 2,
      width: 80,
      height: size + 4,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.5,
      borderOpacity: 0.5,
      opacity: 0,
    })
  }
  page.drawText(text, { x, y, size, font, color: BLACK })
}

/**
 * Draw skill rank pips starting at (x, y).
 * Filled circles for rank, open circles for remainder up to 5.
 * Each pip is radius 3, spaced 7pt apart.
 */
function drawSkillPips(page: PDFPage, x: number, y: number, rank: number) {
  if (DEBUG_BOXES) {
    page.drawRectangle({
      x: x - 2,
      y: y - 5,
      width: 38,
      height: 10,
      borderColor: rgb(0.7, 0.85, 1.0),
      borderWidth: 0.5,
      borderOpacity: 0.5,
      opacity: 0,
    })
  }
  const r = Math.max(0, Math.min(5, rank))
  for (let i = 0; i < 5; i++) {
    const cx = x + i * 7
    if (i < r) {
      // Filled
      page.drawCircle({ x: cx, y, size: 3, color: BLACK })
    } else {
      // Open — white fill with black border
      page.drawCircle({ x: cx, y, size: 3, color: WHITE, borderColor: BLACK, borderWidth: 0.8 })
    }
  }
}

/**
 * Clip text so it does not exceed maxWidth at the given font size.
 * Appends '…' if truncated.
 */
function clip(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
  let s = text
  while (s.length > 0 && font.widthOfTextAtSize(s + '…', size) > maxWidth) {
    s = s.slice(0, -1)
  }
  return s + '…'
}

/**
 * Draw text wrapped to maxWidth, stepping y down by (size+2) per line.
 * maxLines defaults to 3 to prevent overflow into adjacent fields.
 */
function drawWrapped(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  maxWidth: number,
  maxLines = 3,
) {
  const words  = text.split(' ')
  const lines: string[] = []
  let current  = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)

  lines.slice(0, maxLines).forEach((line, i) => {
    page.drawText(line, { x, y: y - i * (size + 2), size, font, color: BLACK })
  })
}
