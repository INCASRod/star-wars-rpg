'use client'

import { useState, type ReactNode }                       from 'react'
import { FONT_BODY, FONT_DISPLAY, RADIUS, SP, SYM, FS, HUD, type DiceType } from '@/lib/tokens'
import { RichText } from '@/components/ui/RichText'
import { Tooltip, TipBody }                                from '@/components/ui/Tooltip'
import { DiceFace }                                        from '@/components/dice/DiceFace'
import type { RollEntry }                                  from '@/hooks/useRollFeed'
import type { PurchaseMeta }                               from '@/lib/logRoll'

// Alignment / force colours are not in the design token system — they are
// specific to the roll feed's alignment identity system.
const ALIGN_OWN     = '#C8AA50'
const ALIGN_GM      = '#9060D0'
const ALIGN_ENEMY   = '#8B3025'
const ALIGN_ALLIED  = '#2D6B3A'
const ALIGN_NEUTRAL = '#6A5840'
const FORCE_BLUE      = '#1A78A0'
const FORCE_PURPLE    = 'rgba(139,43,226,0.9)'
const FORCE_DARK_USED = 'rgba(200,80,80,0.8)'
// Collapsed row outcome abbreviation colours — theme-independent
const COL_SUC    = '#C8A030'   // gold-yellow for success
const COL_FAIL   = '#C04040'   // red for failure

// ── Roll classification ─────────────────────────────────────────────
type RollCategory = 'skill' | 'combat' | 'force' | 'initiative' | 'system'

function classifyRoll(entry: RollEntry): RollCategory {
  if (entry.roll_type === 'force')      return 'force'
  if (entry.roll_type === 'initiative') return 'initiative'
  if (
    entry.roll_type === 'system' ||
    entry.roll_type === 'Item Award' ||
    entry.roll_type === 'XP Purchase' ||
    entry.alignment === 'system'
  ) return 'system'
  if (entry.roll_type === 'combat') return 'combat'
  if ((entry.pool?.force ?? 0) > 0) return 'force'
  if (entry.roll_label?.match(/^(Ranged|Melee) Attack/)) return 'combat'
  return 'skill'
}

// ── Initiative grouping (30-second window) ──────────────────────────
type GroupedEntry =
  | { kind: 'single';           roll: RollEntry; category: RollCategory }
  | { kind: 'initiative-group'; rolls: RollEntry[] }

function groupRolls(rolls: RollEntry[]): GroupedEntry[] {
  const out: GroupedEntry[] = []
  let i = 0
  while (i < rolls.length) {
    const entry    = rolls[i]
    const category = classifyRoll(entry)
    if (category === 'initiative') {
      const group: RollEntry[] = [entry]
      const t0 = new Date(entry.rolled_at).getTime()
      let j = i + 1
      while (j < rolls.length && classifyRoll(rolls[j]) === 'initiative') {
        const tN = new Date(rolls[j].rolled_at).getTime()
        if (Math.abs(tN - t0) <= 30_000) { group.push(rolls[j]); j++ }
        else break
      }
      out.push({ kind: 'initiative-group', rolls: group })
      i = j
    } else {
      out.push({ kind: 'single', roll: entry, category })
      i++
    }
  }
  return out
}

// ── Alignment colour helpers ────────────────────────────────────────
function alignColor(roll: RollEntry, isOwn: boolean): string {
  if (isOwn)                       return ALIGN_OWN
  if (roll.is_dm)                  return ALIGN_GM
  if (roll.alignment === 'enemy')  return ALIGN_ENEMY
  if (roll.alignment === 'allied') return ALIGN_ALLIED
  return ALIGN_NEUTRAL
}

function nameColor(roll: RollEntry, isOwn: boolean): string {
  if (isOwn)      return ALIGN_OWN
  if (roll.is_dm) return ALIGN_GM
  return HUD.text
}

// ── Relative time ───────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// ── Force pip row ───────────────────────────────────────────────────
function ForcePips({ light, dark }: { light: number; dark: number }) {
  return (
    <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-1)' }}>
      {Array.from({ length: light }).map((_, i) => (
        <div key={`l${i}`} className="shrink-0" style={{ width: '0.625rem', height: '0.625rem', borderRadius: RADIUS.full, background: FORCE_BLUE, boxShadow: `0 0 4px ${FORCE_BLUE}80` }} />
      ))}
      {light > 0 && dark > 0 && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, margin: '0 2px' }}>·</span>
      )}
      {Array.from({ length: dark }).map((_, i) => (
        <div key={`d${i}`} className="shrink-0" style={{ width: '0.625rem', height: '0.625rem', borderRadius: RADIUS.full, background: FORCE_PURPLE }} />
      ))}
    </div>
  )
}

// ── Dice pool rows ──────────────────────────────────────────────────
const POOL_ORDER: DiceType[] = ['proficiency', 'ability', 'boost', 'challenge', 'difficulty', 'setback']

function DicePoolRow({ pool }: { pool: Record<DiceType, number> }) {
  const dice: DiceType[] = []
  for (const t of POOL_ORDER) {
    const n = pool[t] ?? 0
    for (let i = 0; i < n; i++) dice.push(t)
  }
  if (dice.length === 0) return null
  return (
    <div className="flex flex-wrap" style={{ gap: 3, marginTop: 3 }}>
      {dice.map((t, i) => <DiceFace key={i} type={t} size={12} />)}
    </div>
  )
}

function ForceDiceRow({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <div className="flex flex-wrap" style={{ gap: 3, marginTop: 3 }}>
      {Array.from({ length: count }).map((_, i) => <DiceFace key={i} type="force" size={12} />)}
    </div>
  )
}

// ── Outcome helpers ─────────────────────────────────────────────────
function outcomeLabel(n: number): string {
  if (n > 0) return 'SUCCESS'
  if (n < 0) return 'FAILURE'
  return 'WASH'
}

function outcomeColor(n: number): string {
  if (n > 0) return HUD.gold
  if (n < 0) return 'color-mix(in srgb, var(--hud-accent) 60%, transparent)'
  return HUD.textFaint
}

// ── Result symbols row ──────────────────────────────────────────────
function ResultSymbols({ result }: { result: RollEntry['result'] }) {
  const items: { icon: string; color: string; n: number }[] = []
  if (result.netSuccess   > 0) items.push({ icon: SYM.S.icon, color: SYM.S.color, n: result.netSuccess })
  if (result.netSuccess   < 0) items.push({ icon: SYM.F.icon, color: SYM.F.color, n: Math.abs(result.netSuccess) })
  if (result.netAdvantage > 0) items.push({ icon: SYM.A.icon, color: SYM.A.color, n: result.netAdvantage })
  if (result.netAdvantage < 0) items.push({ icon: SYM.H.icon, color: SYM.H.color, n: Math.abs(result.netAdvantage) })
  if (result.triumph      > 0) items.push({ icon: SYM.T.icon, color: SYM.T.color, n: result.triumph })
  if (result.despair      > 0) items.push({ icon: SYM.D.icon, color: SYM.D.color, n: result.despair })
  if (items.length === 0) return null
  return (
    <div className="flex items-center" style={{ gap: 6, fontFamily: FONT_BODY, fontSize: FS.sm }}>
      {items.map(({ icon, color, n }, idx) => (
        <span key={idx} style={{ color }}>
          <i className={`ffi ffi-${icon}`} />
          {n > 1 ? n : ''}
        </span>
      ))}
    </div>
  )
}

// ── Hidden badge ────────────────────────────────────────────────────
function HiddenBadge({ forGm }: { forGm: boolean }) {
  return (
    <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: forGm ? ALIGN_GM : HUD.textFaint, fontStyle: 'italic', marginBottom: 3 }}>
      {forGm ? '[HIDDEN FROM PLAYERS]' : '[Hidden]'}
    </div>
  )
}

// ── Design B: header band style helper ─────────────────────────────
// ac must be a 6-digit hex string — appending 2-digit alpha hex works.
// Two-line band: line 1 (name + timestamp) is its own flex row inside,
// line 2 (the check/weapon label) sits beneath it — see SkillCard/CombatCard.
function bandStyle(ac: string) {
  return {
    background:   `${ac}12`,
    borderBottom: `1px solid ${ac}26`,
    padding:      '5px 9px',
  }
}

// ═══════════════════════════════════════════════════════════════════
// SKILL CARD (Design B)
// ═══════════════════════════════════════════════════════════════════
function SkillCard({
  roll, isOwn, isGm, onCollapse,
}: {
  roll: RollEntry; isOwn: boolean; isGm: boolean; onCollapse?: () => void
}) {
  const ac       = alignColor(roll, isOwn)
  const isHidden = roll.hidden && !isOwn

  return (
    <div className="overflow-hidden" style={{ borderRadius: RADIUS.md, border: `1px solid ${ac}30` }}>
      {/* Band — line 1: dot + name + timestamp, line 2: check/skill label */}
      <div
        style={{ ...bandStyle(ac), cursor: onCollapse ? 'pointer' : 'default' }}
        onClick={onCollapse}
      >
        <div className="flex items-center" style={{ gap: 6 }}>
          <div className="shrink-0" style={{ width: 5, height: 5, borderRadius: RADIUS.full, background: ac, boxShadow: `0 0 5px ${ac}80` }} />
          <span className="flex-1" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: nameColor(roll, isOwn) }}>
            {roll.character_name}
          </span>
          <span className="whitespace-nowrap" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, marginLeft: 4 }}>
            {relativeTime(roll.rolled_at)}
          </span>
        </div>
        {roll.roll_label && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: HUD.textFaint, marginTop: 2 }}>
            {roll.roll_label}
          </div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : HUD.panel }}>
        {isHidden && !isGm ? (
          <HiddenBadge forGm={false} />
        ) : (
          <>
            {isGm && roll.hidden && <HiddenBadge forGm={true} />}
            <div className="flex items-center flex-wrap" style={{ gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 900, color: outcomeColor(roll.result.netSuccess) }}>
                {outcomeLabel(roll.result.netSuccess)}
              </span>
              <ResultSymbols result={roll.result} />
            </div>
            <DicePoolRow pool={roll.pool} />
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMBAT CARD (Design B)
// ═══════════════════════════════════════════════════════════════════
type RollMetaShape = {
  weaponDamage?:    number
  weaponDamageAdd?: number
  characterBrawn?:  number
  attackType?:      string
  critEligible?:    boolean
  critRating?:      number
  critModifier?:    number
}

function CombatCard({
  roll, isOwn, isGm, onCollapse,
}: {
  roll: RollEntry; isOwn: boolean; isGm: boolean; onCollapse?: () => void
}) {
  const ac         = alignColor(roll, isOwn)
  const isHidden   = roll.hidden && !isOwn
  const weaponName = roll.weapon_name || roll.roll_label || 'Attack'
  const bandLabel  = roll.target_name
    ? `⚔ ${weaponName} → ${roll.target_name}${roll.range_band ? ` · ${roll.range_band}` : ''}`
    : `⚔ ${weaponName}`

  const meta      = roll.roll_meta as RollMetaShape | null | undefined
  const isRanged  = meta?.attackType !== 'melee'
  const base      = meta?.weaponDamage ?? 0
  const damageAdd = isRanged ? 0 : (meta?.weaponDamageAdd ?? 0)
  const brawnMod  = isRanged ? 0 : (meta?.characterBrawn ?? 0)
  const netSuc    = Math.max(0, roll.result.netSuccess)
  const total     = base + brawnMod + damageAdd + netSuc
  const dmgLine   = (meta?.weaponDamage != null && roll.result.netSuccess > 0)
    ? isRanged
      ? `${base}+${netSuc} = ${total}`
      : damageAdd > 0
        ? `${base}+${brawnMod}+${damageAdd}+${netSuc} = ${total}`
        : `${base}+${brawnMod}+${netSuc} = ${total}`
    : null

  return (
    <div className="overflow-hidden" style={{ borderRadius: RADIUS.md, border: `1px solid ${ac}30` }}>
      {/* Band — line 1: dot + name + timestamp, line 2: weapon/target label */}
      <div
        style={{ ...bandStyle(ac), cursor: onCollapse ? 'pointer' : 'default' }}
        onClick={onCollapse}
      >
        <div className="flex items-center" style={{ gap: 6 }}>
          <div className="shrink-0" style={{ width: 5, height: 5, borderRadius: RADIUS.full, background: ac, boxShadow: `0 0 5px ${ac}80` }} />
          <span className="flex-1" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: nameColor(roll, isOwn) }}>
            {roll.character_name}
          </span>
          <span className="whitespace-nowrap" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, marginLeft: 4 }}>
            {relativeTime(roll.rolled_at)}
          </span>
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: HUD.textFaint, marginTop: 2 }}>
          {bandLabel}
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : HUD.panel }}>
        {isHidden && !isGm ? (
          <HiddenBadge forGm={false} />
        ) : (
          <>
            {isGm && roll.hidden && <HiddenBadge forGm={true} />}
            <div className="flex items-center flex-wrap" style={{ gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 900, color: outcomeColor(roll.result.netSuccess) }}>
                {outcomeLabel(roll.result.netSuccess)}
              </span>
              <ResultSymbols result={roll.result} />
            </div>
            {dmgLine && (
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.gold, marginBottom: 3 }}>
                Dmg: {dmgLine}
              </div>
            )}
            {meta?.critEligible && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: '2px var(--space-1-5, 0.375rem)', borderRadius: RADIUS.sm, marginBottom: 3,
                background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)',
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: HUD.gold, fontWeight: 700, letterSpacing: '0.05em',
              }}>
                ⚠ CRITICAL ELIGIBLE
                {(meta.critModifier ?? 0) > 0 && (
                  <span style={{ opacity: 0.75 }}> +{meta.critModifier}</span>
                )}
              </div>
            )}
            <DicePoolRow pool={roll.pool} />
          </>
        )}
      </div>
    </div>
  )
}

// ── ForceRollMeta — shape written into roll_meta for force-type rolls ──
type ForceRollMeta = {
  power_name?:         string
  activated_upgrades?: Array<{ name: string; fp_cost: number; is_dark: boolean }>
  dark_pips_used?:     number
  strain_cost?:        number
}

// ═══════════════════════════════════════════════════════════════════
// FORCE CARD (v2)
// ═══════════════════════════════════════════════════════════════════
function ForceCard({
  roll, isOwn, isGm, onCollapse,
}: {
  roll: RollEntry; isOwn: boolean; isGm: boolean; onCollapse?: () => void
}) {
  const isHidden   = roll.hidden && !isOwn
  const meta       = (roll.roll_meta ?? null) as ForceRollMeta | null
  const powerName  = meta?.power_name ?? roll.weapon_name ?? roll.roll_label ?? 'Force Power'
  const activUpgr  = meta?.activated_upgrades ?? []
  const darkUsed   = meta?.dark_pips_used ?? roll.result.triumph
  const strainCost = meta?.strain_cost ?? (darkUsed > 0 ? darkUsed : 0)
  const lightCount = roll.result.netSuccess
  const PURPLE     = HUD.accentPurple  // var(--hud-accent-purple)

  return (
    <div className="overflow-hidden" style={{ borderRadius: RADIUS.md, border: `1px solid color-mix(in srgb, ${PURPLE} 25%, transparent)` }}>

      {/* ── HEADER ROW ───────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1.5"
        style={{
          padding: '4px 8px', minHeight: 24,
          background: `color-mix(in srgb, ${PURPLE} 8%, transparent)`,
          borderBottom: `1px solid color-mix(in srgb, ${PURPLE} 15%, transparent)`,
          cursor: onCollapse ? 'pointer' : 'default',
        }}
        onClick={onCollapse}
      >
        <span
          className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: HUD.text }}
        >
          {roll.character_name}
        </span>
        <span style={{ color: PURPLE, fontSize: FS.caption, flexShrink: 0 }}>✦</span>
        <span className="whitespace-nowrap shrink-0" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>

      {/* ── POWER NAME BAR ───────────────────────────────────────── */}
      <div style={{ borderLeft: `2px solid ${PURPLE}`, background: `color-mix(in srgb, ${PURPLE} 6%, transparent)`, padding: `${SP[1]} ${SP[2]}` }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, color: `color-mix(in srgb, ${PURPLE} 90%, white)` }}>
          {powerName}
        </span>
      </div>

      {/* ── DIVIDER ──────────────────────────────────────────────── */}
      <div style={{ height: 1, background: `color-mix(in srgb, ${PURPLE} 12%, transparent)` }} />

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div style={{ background: isOwn ? 'var(--hud-surface-mid)' : HUD.panel }}>
        {isHidden && !isGm ? (
          <HiddenBadge forGm={false} />
        ) : (
          <>
            {isGm && roll.hidden && <HiddenBadge forGm={true} />}

            {/* Activated upgrades list */}
            {activUpgr.map((u, i) => (
              <div
                key={i}
                className="flex items-center"
                style={{ gap: 6, padding: `5px ${SP[2]}`, borderBottom: `1px solid color-mix(in srgb, ${PURPLE} 12%, transparent)` }}
              >
                <span style={{ color: PURPLE, opacity: 0.5, flexShrink: 0 }}>◇</span>
                <span
                  className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 600, color: HUD.text }}
                >
                  {u.name}
                </span>
                <span
                  className="shrink-0"
                  style={{
                    background: u.is_dark
                      ? `color-mix(in srgb, ${PURPLE} 80%, black)`
                      : `color-mix(in srgb, ${PURPLE} 55%, white)`,
                    border: `1px solid ${u.is_dark ? `color-mix(in srgb, ${PURPLE} 55%, transparent)` : `color-mix(in srgb, ${PURPLE} 35%, transparent)`}`,
                    borderRadius: RADIUS.sm, padding: '1px 6px',
                    fontFamily: FONT_BODY, fontSize: FS.overline,
                  }}
                >
                  <RichText text={'[FP]'.repeat(Math.max(u.fp_cost, 1))} />
                </span>
              </div>
            ))}

            {/* Pip spend summary */}
            <div className="flex items-center flex-wrap" style={{ gap: SP[1], padding: `${SP[1]} ${SP[2]}` }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.textDim }}>
                Spent
              </span>
              {lightCount > 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: `color-mix(in srgb, ${PURPLE} 55%, white)` }}>
                  {lightCount} <RichText text="[FP]" /> Light
                </span>
              )}
              {lightCount > 0 && darkUsed > 0 && <span style={{ color: HUD.textFaint }}>·</span>}
              {darkUsed > 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: `color-mix(in srgb, ${PURPLE} 90%, black)` }}>
                  {darkUsed} <RichText text="[FP]" /> Dark
                </span>
              )}
            </div>

            {/* Dark side warning — only when dark pips were used and strain was incurred */}
            {darkUsed > 0 && strainCost > 0 && (
              <>
                <div style={{ height: 1, background: `color-mix(in srgb, ${PURPLE} 12%, transparent)` }} />
                <div style={{ borderLeft: `2px solid color-mix(in srgb, ${PURPLE} 50%, transparent)`, background: `color-mix(in srgb, ${PURPLE} 7%, transparent)`, padding: `${SP[1]} ${SP[2]}` }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: `color-mix(in srgb, ${PURPLE} 80%, white)` }}>
                    ⚠ {strainCost} strain suffered · Destiny Point flipped
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Card router ─────────────────────────────────────────────────────
function FullCard({
  roll, isOwn, isGm, category, onCollapse,
}: {
  roll: RollEntry; isOwn: boolean; isGm: boolean; category: RollCategory; onCollapse?: () => void
}) {
  if (category === 'force')  return <ForceCard  roll={roll} isOwn={isOwn} isGm={isGm} onCollapse={onCollapse} />
  if (category === 'combat') return <CombatCard roll={roll} isOwn={isOwn} isGm={isGm} onCollapse={onCollapse} />
  return                            <SkillCard  roll={roll} isOwn={isOwn} isGm={isGm} onCollapse={onCollapse} />
}

// ═══════════════════════════════════════════════════════════════════
// INITIATIVE ROW — compact, non-expandable notification
// ═══════════════════════════════════════════════════════════════════
function InitiativeRow({ group }: { group: { rolls: RollEntry[] } }) {
  const latest = group.rolls[group.rolls.length - 1] ?? group.rolls[0]
  const label  = group.rolls.length === 1
    ? group.rolls[0].character_name
    : `${group.rolls.length} participants`
  return (
    <div className="flex items-center" style={{ padding: '3px var(--space-1)', gap: 6 }}>
      <span className="flex-1" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: HUD.textFaint }}>
        ⚙ Initiative Rolled · {label}
      </span>
      <span className="whitespace-nowrap" style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
        {relativeTime(latest.rolled_at)}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SYSTEM ROW — compact; long messages get an expand toggle
// ═══════════════════════════════════════════════════════════════════
const SYSTEM_LONG_THRESHOLD = 60

function SystemRow({
  roll,
  isGm,
  onRefundPurchase,
}: {
  roll:              RollEntry
  isGm:             boolean
  onRefundPurchase?: (entry: RollEntry) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const label  = roll.roll_label ?? 'System Message'
  const isLong = label.length > SYSTEM_LONG_THRESHOLD

  // ── XP Purchase ───────────────────────────────────────────────────
  if (roll.roll_type === 'XP Purchase') {
    const meta       = roll.roll_meta as PurchaseMeta | null
    const isRefunded = meta?.refunded === true
    const tooltipContent = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <TipBody>{label}</TipBody>
        <TipBody>
          <span style={{ color: HUD.textFaint }}>
            {roll.character_name}
            {meta?.xp_cost != null ? ` · ${meta.xp_cost} XP` : ''}
            {isRefunded ? ' · REFUNDED' : ''}
          </span>
        </TipBody>
      </div>
    )
    return (
      <Tooltip content={tooltipContent} placement="top" maxWidth={320}>
        <div
          className="flex items-center"
          style={{
            padding:    '3px var(--space-1)',
            gap:        4,
            opacity:    isRefunded ? 0.45 : 1,
            fontFamily: FONT_BODY,
            fontSize:   FS.overline,
          }}
        >
          <span style={{ color: HUD.textFaint }}>⬆</span>
          <span style={{ color: HUD.text }}>{roll.character_name}</span>
          <span style={{ color: HUD.textFaint }}>purchased</span>
          <span
            className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ color: HUD.text }}
          >
            {label}
          </span>
          {meta?.xp_cost != null && !isRefunded && (
            <span style={{ color: HUD.textFaint, whiteSpace: 'nowrap' }}>
              · {meta.xp_cost}xp
            </span>
          )}
          {isRefunded ? (
            <span style={{ color: HUD.textFaint, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
              [REFUNDED]
            </span>
          ) : isGm && onRefundPurchase ? (
            <button
              onClick={() => onRefundPurchase(roll)}
              aria-label="Revert purchase and restore XP"
              title={
                meta?.purchase_type === 'talent'
                  ? 'Revert purchase and restore XP — note: may affect adjacent talents in tree'
                  : 'Revert purchase and restore XP'
              }
              className="cursor-pointer"
              style={{
                background:  'none',
                border:      'none',
                color:       HUD.textFaint,
                fontFamily:  FONT_BODY,
                fontSize:    FS.sm,
                padding:     '0 2px',
                lineHeight:  1,
                flexShrink:  0,
              }}
            >
              ↺
            </button>
          ) : null}
        </div>
      </Tooltip>
    )
  }

  if (roll.roll_type === 'Item Award') {
    const isRemoved  = label.includes(' removed from ') || label.includes(' dropped ')
    const splitIdx   = label.indexOf(' awarded to ')
    const itemPart   = splitIdx >= 0 ? label.slice(0, splitIdx) : label
    const recipients = splitIdx >= 0 ? label.slice(splitIdx + ' awarded to '.length) : ''
    const badgeColor = isRemoved ? '#E03020' : '#4EC87A'
    return (
      <div style={{ padding: '3px var(--space-1)', fontFamily: FONT_BODY, fontSize: FS.overline }}>
        <svg
          width="1em" height="1em"
          viewBox="0 0 14 14"
          style={{ display: 'inline-block', verticalAlign: '-0.15em', marginRight: '0.25em' }}
          aria-hidden="true"
        >
          <rect x="1" y="0.5" width="11" height="11" rx="1.5"
            fill="none" stroke={HUD.gold} strokeWidth="1"/>
          <rect x="3.5" y="3" width="6" height="6" rx="0.75"
            fill="none" stroke={HUD.gold} strokeWidth="0.8"/>
          <circle cx="11" cy="11" r="4.5"
            fill="var(--hud-bg)" stroke="var(--hud-bg)" strokeWidth="0.5"/>
          <circle cx="11" cy="11" r="4"
            fill={isRemoved ? '#2E1A1A' : '#1A2E1A'}
            stroke={badgeColor} strokeWidth="0.8"/>
          <line
            x1="11" y1={isRemoved ? '13.5' : '8.5'}
            x2="11" y2={isRemoved ? '9' : '13'}
            stroke={badgeColor} strokeWidth="1.1" strokeLinecap="round"/>
          <polyline
            points={isRemoved ? '9,11 11,9 13,11' : '9,11.5 11,13.5 13,11.5'}
            fill="none" stroke={badgeColor}
            strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
        <span style={{ color: HUD.gold, fontWeight: 700 }}>{itemPart}</span>
        {recipients && (
          <>
            <span style={{ color: HUD.textFaint }}> awarded to </span>
            <span style={{ color: HUD.textDim }}>{recipients}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '3px var(--space-1)', fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
      <span>⚙ </span>
      {isLong ? (
        <>
          <span>{expanded ? label : `${label.slice(0, SYSTEM_LONG_THRESHOLD)}…`}</span>
          <button
            onClick={() => setExpanded(v => !v)}
            className="cursor-pointer"
            style={{ background: 'none', border: 'none', color: HUD.textFaint, fontFamily: FONT_BODY, fontSize: FS.overline, marginLeft: 4, padding: 0 }}
          >
            {expanded ? '‹' : '›'}
          </button>
        </>
      ) : (
        <span>{label}</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COLLAPSED ROW — one-line summary for history entries; click to expand
// ═══════════════════════════════════════════════════════════════════
function outcomeAbbr(n: number): string {
  if (n > 0) return 'SUC'
  if (n < 0) return 'FAIL'
  return '—'
}

function CollapsedRow({
  roll, isOwn, onClick,
}: {
  roll: RollEntry; isOwn: boolean; onClick: () => void
}) {
  const ac       = alignColor(roll, isOwn)
  const category = classifyRoll(roll)
  const typeLabel = category === 'combat'
    ? (roll.weapon_name || roll.roll_label || 'Attack')
    : category === 'force'
    ? (roll.weapon_name || roll.roll_label || 'Force')
    : (roll.roll_label || 'Roll')
  const net       = roll.result.netSuccess
  const abbr      = outcomeAbbr(net)
  const abbrColor = net > 0 ? COL_SUC : net < 0 ? COL_FAIL : HUD.textFaint

  return (
    <button
      onClick={onClick}
      className="flex items-center w-full cursor-pointer"
      style={{
        gap: 5,
        padding: '3px 7px', textAlign: 'left',
        background: HUD.panel, border: `1px solid ${HUD.border}`,
        borderRadius: RADIUS.sm,
        fontFamily: FONT_BODY,
      }}
    >
      <div className="shrink-0" style={{ width: 4, height: 4, borderRadius: RADIUS.full, background: ac }} />
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: FS.overline, color: HUD.text }}>
        {roll.character_name}
      </span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: FS.overline, color: HUD.textDim, maxWidth: 80 }}>
        {typeLabel}
      </span>
      <span style={{ fontSize: FS.overline, fontWeight: 700, color: abbrColor, minWidth: 28, textAlign: 'right' }}>
        {abbr}
      </span>
      <span className="whitespace-nowrap" style={{ fontSize: FS.overline, color: HUD.textFaint }}>
        {relativeTime(roll.rolled_at)}
      </span>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ROLL FEED PANEL — Approach A layout
// ═══════════════════════════════════════════════════════════════════
export function RollFeedPanel({
  rolls,
  ownCharacterId,
  isGm = false,
  onRefundPurchase,
}: {
  rolls:              RollEntry[]
  ownCharacterId:     string
  isGm?:             boolean
  onRefundPurchase?: (entry: RollEntry) => void
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (rolls.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ padding: 'var(--space-12)', fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
        No rolls yet this session.
      </div>
    )
  }

  // Players never see hidden rolls; GMs see everything
  const visible = isGm ? [...rolls].reverse() : [...rolls].reverse().filter(r => !r.hidden)
  const grouped = groupRolls(visible)

  const nodes: ReactNode[] = []
  let expandedSlots  = 0
  let historyStarted = false

  for (let i = 0; i < grouped.length; i++) {
    const g = grouped[i]

    if (g.kind === 'initiative-group') {
      nodes.push(<InitiativeRow key={`init-${i}`} group={g} />)
      continue
    }

    const { roll, category } = g

    if (category === 'system') {
      nodes.push(
        <SystemRow
          key={roll.id}
          roll={roll}
          isGm={isGm}
          onRefundPurchase={onRefundPurchase}
        />
      )
      continue
    }

    const isOwn = roll.character_id === ownCharacterId

    if (expandedSlots < 2) {
      // Always-expanded top-2 cards — no onCollapse, not togglable
      nodes.push(
        <FullCard key={roll.id} roll={roll} isOwn={isOwn} isGm={isGm} category={category} />
      )
      expandedSlots++
    } else {
      // History section
      if (!historyStarted) {
        historyStarted = true
        nodes.push(
          <div key="history-label" style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: HUD.textFaint, padding: 'var(--space-1) 2px 2px',
          }}>
            Earlier this session
          </div>
        )
      }

      if (expandedIds.has(roll.id)) {
        // History-expanded: clicking the band collapses it
        nodes.push(
          <FullCard
            key={roll.id}
            roll={roll}
            isOwn={isOwn}
            isGm={isGm}
            category={category}
            onCollapse={() => toggleExpanded(roll.id)}
          />
        )
      } else {
        nodes.push(
          <CollapsedRow
            key={roll.id}
            roll={roll}
            isOwn={isOwn}
            onClick={() => toggleExpanded(roll.id)}
          />
        )
      }
    }
  }

  return (
    <div className="flex flex-col" style={{ gap: 5 }}>
      {nodes}
    </div>
  )
}
