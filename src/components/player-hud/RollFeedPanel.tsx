'use client'

import { useState, type ReactNode }                       from 'react'
import { FONT_BODY, RADIUS, SYM, FS, HUD, type DiceType } from '@/lib/tokens'
import { DiceFace }                                        from '@/components/dice/DiceFace'
import type { RollEntry }                                  from '@/hooks/useRollFeed'

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
// Collapsed row palette — dark near-black values not in the token system
const COL_BG     = '#0A0B0F'
const COL_BORDER = '#141318'
const COL_NAME   = '#5A4A38'
const COL_TYPE   = '#3A3228'
const COL_TIME   = '#2A2228'
const COL_SUC    = '#8A7030'
const COL_FAIL   = '#8A3020'

// ── Roll classification ─────────────────────────────────────────────
type RollCategory = 'skill' | 'combat' | 'force' | 'initiative' | 'system'

function classifyRoll(entry: RollEntry): RollCategory {
  if (entry.roll_type === 'force')      return 'force'
  if (entry.roll_type === 'initiative') return 'initiative'
  if (
    entry.roll_type === 'system' ||
    entry.roll_type === 'Item Award' ||
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {Array.from({ length: light }).map((_, i) => (
        <div key={`l${i}`} style={{ width: 10, height: 10, borderRadius: RADIUS.full, flexShrink: 0, background: FORCE_BLUE, boxShadow: `0 0 4px ${FORCE_BLUE}80` }} />
      ))}
      {light > 0 && dark > 0 && (
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textFaint, margin: '0 2px' }}>·</span>
      )}
      {Array.from({ length: dark }).map((_, i) => (
        <div key={`d${i}`} style={{ width: 10, height: 10, borderRadius: RADIUS.full, flexShrink: 0, background: FORCE_PURPLE }} />
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
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
      {dice.map((t, i) => <DiceFace key={i} type={t} size={12} />)}
    </div>
  )
}

function ForceDiceRow({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
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
  if (n < 0) return 'var(--hud-accent-60)'
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT_BODY, fontSize: FS.sm }}>
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
function bandStyle(ac: string) {
  return {
    background:   `${ac}12`,
    borderBottom: `1px solid ${ac}26`,
    display:      'flex',
    alignItems:   'center',
    gap:          6,
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
    <div style={{ borderRadius: RADIUS.md, overflow: 'hidden', border: `1px solid ${ac}30` }}>
      {/* Band */}
      <div
        style={{ ...bandStyle(ac), cursor: onCollapse ? 'pointer' : 'default' }}
        onClick={onCollapse}
      >
        <div style={{ width: 5, height: 5, borderRadius: RADIUS.full, flexShrink: 0, background: ac, boxShadow: `0 0 5px ${ac}80` }} />
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: nameColor(roll, isOwn), flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {roll.character_name}
        </span>
        {roll.roll_label && (
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: HUD.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
            {roll.roll_label}
          </span>
        )}
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, whiteSpace: 'nowrap', marginLeft: 4 }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : HUD.panel }}>
        {isHidden && !isGm ? (
          <HiddenBadge forGm={false} />
        ) : (
          <>
            {isGm && roll.hidden && <HiddenBadge forGm={true} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
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
    <div style={{ borderRadius: RADIUS.md, overflow: 'hidden', border: `1px solid ${ac}30` }}>
      {/* Band */}
      <div
        style={{ ...bandStyle(ac), cursor: onCollapse ? 'pointer' : 'default' }}
        onClick={onCollapse}
      >
        <div style={{ width: 5, height: 5, borderRadius: RADIUS.full, flexShrink: 0, background: ac, boxShadow: `0 0 5px ${ac}80` }} />
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: nameColor(roll, isOwn), whiteSpace: 'nowrap' }}>
          {roll.character_name}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: HUD.textFaint, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 4 }}>
          {bandLabel}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, whiteSpace: 'nowrap', marginLeft: 4 }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : HUD.panel }}>
        {isHidden && !isGm ? (
          <HiddenBadge forGm={false} />
        ) : (
          <>
            {isGm && roll.hidden && <HiddenBadge forGm={true} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
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
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 6px', borderRadius: RADIUS.sm, marginBottom: 3,
                background: 'var(--hud-accent-10)', border: '1px solid var(--hud-accent-35)',
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

// ═══════════════════════════════════════════════════════════════════
// FORCE CARD (Design B)
// ═══════════════════════════════════════════════════════════════════
function ForceCard({
  roll, isOwn, isGm, onCollapse,
}: {
  roll: RollEntry; isOwn: boolean; isGm: boolean; onCollapse?: () => void
}) {
  const isHidden   = roll.hidden && !isOwn
  const powerName  = roll.weapon_name || roll.roll_label || 'Force Power'
  const light      = roll.result.netSuccess
  const dark       = roll.result.netAdvantage
  const darkUsed   = roll.result.triumph
  const forceCount = roll.pool?.force ?? 0

  return (
    <div style={{ borderRadius: RADIUS.md, overflow: 'hidden', border: `1px solid ${FORCE_BLUE}30` }}>
      {/* Band — force-blue tint */}
      <div
        style={{ ...bandStyle(FORCE_BLUE), cursor: onCollapse ? 'pointer' : 'default' }}
        onClick={onCollapse}
      >
        <div style={{ width: 5, height: 5, borderRadius: RADIUS.full, flexShrink: 0, background: FORCE_BLUE, boxShadow: `0 0 5px ${FORCE_BLUE}80` }} />
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: FORCE_BLUE, whiteSpace: 'nowrap' }}>
          {roll.character_name}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: HUD.textFaint, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 4 }}>
          ✦ {powerName} · Force Power
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, whiteSpace: 'nowrap', marginLeft: 4 }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : HUD.panel }}>
        {isHidden && !isGm ? (
          <HiddenBadge forGm={false} />
        ) : (
          <>
            {isGm && roll.hidden && <HiddenBadge forGm={true} />}
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 900, color: FORCE_BLUE, marginBottom: 4 }}>
              ACTIVATED
            </div>
            {(light > 0 || dark > 0) && (
              <div style={{ marginBottom: 4 }}>
                <ForcePips light={light} dark={dark} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontFamily: FONT_BODY, fontSize: FS.caption, marginBottom: 3 }}>
              {light > 0 && <span style={{ color: FORCE_BLUE }}>{light} Light FP</span>}
              {dark > 0 && (
                <>
                  {light > 0 && <span style={{ color: HUD.textFaint }}>·</span>}
                  <span style={{ color: FORCE_PURPLE }}>{dark} Dark FP</span>
                  {darkUsed > 0 && <span style={{ color: FORCE_DARK_USED }}>({darkUsed} used)</span>}
                </>
              )}
            </div>
            <ForceDiceRow count={forceCount} />
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
    <div style={{ padding: '3px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: HUD.textFaint, flex: 1 }}>
        ⚙ Initiative Rolled · {label}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, whiteSpace: 'nowrap' }}>
        {relativeTime(latest.rolled_at)}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SYSTEM ROW — compact; long messages get an expand toggle
// ═══════════════════════════════════════════════════════════════════
const SYSTEM_LONG_THRESHOLD = 60

function SystemRow({ roll }: { roll: RollEntry }) {
  const [expanded, setExpanded] = useState(false)
  const label  = roll.roll_label ?? 'System Message'
  const isLong = label.length > SYSTEM_LONG_THRESHOLD

  if (roll.roll_type === 'Item Award') {
    const splitIdx   = label.indexOf(' awarded to ')
    const itemPart   = splitIdx >= 0 ? label.slice(0, splitIdx) : label
    const recipients = splitIdx >= 0 ? label.slice(splitIdx + ' awarded to '.length) : ''
    return (
      <div style={{ padding: '3px 4px', fontFamily: FONT_BODY, fontSize: FS.overline }}>
        <span>🎁 </span>
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
    <div style={{ padding: '3px 4px', fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
      <span>⚙ </span>
      {isLong ? (
        <>
          <span>{expanded ? label : `${label.slice(0, SYSTEM_LONG_THRESHOLD)}…`}</span>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: HUD.textFaint, fontFamily: FONT_BODY, fontSize: FS.overline, marginLeft: 4, padding: 0 }}
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
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 7px', width: '100%', textAlign: 'left',
        background: COL_BG, border: `1px solid ${COL_BORDER}`,
        borderRadius: RADIUS.sm, cursor: 'pointer',
        fontFamily: FONT_BODY,
      }}
    >
      <div style={{ width: 4, height: 4, borderRadius: RADIUS.full, flexShrink: 0, background: ac }} />
      <span style={{ fontSize: FS.overline, color: COL_NAME, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {roll.character_name}
      </span>
      <span style={{ fontSize: FS.overline, color: COL_TYPE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
        {typeLabel}
      </span>
      <span style={{ fontSize: FS.overline, fontWeight: 700, color: abbrColor, minWidth: 28, textAlign: 'right' }}>
        {abbr}
      </span>
      <span style={{ fontSize: FS.overline, color: COL_TIME, whiteSpace: 'nowrap' }}>
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
}: {
  rolls:          RollEntry[]
  ownCharacterId: string
  isGm?:          boolean
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
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
      nodes.push(<SystemRow key={roll.id} roll={roll} />)
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
            color: HUD.textFaint, padding: '4px 2px 2px', opacity: 0.5,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {nodes}
    </div>
  )
}
