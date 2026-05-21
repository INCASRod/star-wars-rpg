'use client'

import { useState, type ReactNode }                       from 'react'
import { FONT_BODY, RADIUS, SYM, FS, type DiceType }      from '@/lib/tokens'
import { DiceFace }                                        from '@/components/dice/DiceFace'
import type { RollEntry }                                  from '@/hooks/useRollFeed'

// Alignment / force colours are not in the design token system — they are
// specific to the roll feed's alignment identity system.
const FORCE_BLUE   = '#1A78A0'
const FORCE_PURPLE = 'rgba(139,43,226,0.9)'

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
  if (isOwn)                       return '#C8AA50'
  if (roll.is_dm)                  return '#9060D0'
  if (roll.alignment === 'enemy')  return '#8B3025'
  if (roll.alignment === 'allied') return '#2D6B3A'
  return '#6A5840'
}

function nameColor(roll: RollEntry, isOwn: boolean): string {
  if (isOwn)      return '#C8AA50'
  if (roll.is_dm) return '#9060D0'
  return 'var(--hud-text)'
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
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)', margin: '0 2px' }}>·</span>
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
  if (n > 0) return '#C8AA50'
  if (n < 0) return '#C04040'
  return 'var(--hud-text-faint)'
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
    <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: forGm ? '#9060D0' : 'var(--hud-text-faint)', fontStyle: 'italic', marginBottom: 3 }}>
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
          <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: 'var(--hud-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
            {roll.roll_label}
          </span>
        )}
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', whiteSpace: 'nowrap', marginLeft: 4 }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : '#0D0E12' }}>
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
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: 'var(--hud-text-faint)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 4 }}>
          {bandLabel}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', whiteSpace: 'nowrap', marginLeft: 4 }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : '#0D0E12' }}>
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
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: '#C8AA50', marginBottom: 3 }}>
                Dmg: {dmgLine}
              </div>
            )}
            {meta?.critEligible && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 6px', borderRadius: RADIUS.sm, marginBottom: 3,
                background: 'var(--hud-accent-10)', border: '1px solid var(--hud-accent-35)',
                fontFamily: FONT_BODY, fontSize: FS.overline,
                color: 'var(--hud-gold)', fontWeight: 700, letterSpacing: '0.05em',
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
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontStyle: 'italic', color: 'var(--hud-text-faint)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 4 }}>
          ✦ {powerName} · Force Power
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', whiteSpace: 'nowrap', marginLeft: 4 }}>
          {relativeTime(roll.rolled_at)}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: '7px 9px 6px', background: isOwn ? 'var(--hud-surface-mid)' : '#0D0E12' }}>
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
                  {light > 0 && <span style={{ color: 'var(--hud-text-faint)' }}>·</span>}
                  <span style={{ color: FORCE_PURPLE }}>{dark} Dark FP</span>
                  {darkUsed > 0 && <span style={{ color: 'rgba(200,80,80,0.8)' }}>({darkUsed} used)</span>}
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

// ── Temporary stub — replaced in Task 2 ────────────────────────────
export function RollFeedPanel({ rolls, ownCharacterId, isGm = false }: {
  rolls:          RollEntry[]
  ownCharacterId: string
  isGm?:          boolean
}) {
  void rolls; void ownCharacterId; void isGm
  return (
    <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', padding: 12 }}>
      Loading feed…
    </div>
  )
}
