'use client'

import { C, SYM, FONT_RAJDHANI, panelBase, type DiceType } from './design-tokens'
import { DiceFace } from '@/components/dice/DiceFace'
import type { RollEntry } from '@/hooks/useRollFeed'

// ── Palette ───────────────────────────────────────────────────────────────────
const FORCE_BLUE   = '#7EC8E3'
const FORCE_PURPLE = 'rgba(139,43,226,0.9)'
const FONT_CINZEL  = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const FONT_MONO    = "'Share Tech Mono', 'Courier New', monospace"

// ── Fluid font sizes (clamp — no hardcoded px) ────────────────────────────────
const FS_NAME    = 'clamp(0.82rem, 1.3vw, 0.95rem)'
const FS_TIME    = 'clamp(0.58rem, 0.88vw, 0.68rem)'
const FS_TYPE    = 'clamp(0.72rem, 1.1vw, 0.85rem)'
const FS_RESULT  = 'clamp(0.72rem, 1.1vw, 0.85rem)'
const FS_COMPACT = 'clamp(0.65rem, 1vw, 0.78rem)'

// ── Roll classification ───────────────────────────────────────────────────────
type RollCategory = 'skill' | 'combat' | 'force' | 'initiative' | 'system'

function classifyRoll(entry: RollEntry): RollCategory {
  if (entry.roll_type === 'force')      return 'force'
  if (entry.roll_type === 'initiative') return 'initiative'
  if (entry.roll_type === 'system' || entry.alignment === 'system') return 'system'
  if (entry.roll_type === 'combat')     return 'combat'
  // Legacy: detect force rolls by pool.force > 0 (pre-migration-024 entries)
  if ((entry.pool?.force ?? 0) > 0) return 'force'
  // Legacy: detect combat by roll_label pattern
  if (entry.roll_label?.match(/^(Ranged|Melee) Attack/)) return 'combat'
  return 'skill'
}

// ── Initiative grouping (30-second window) ────────────────────────────────────
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

// ── Alignment colour helper ───────────────────────────────────────────────────
function alignColor(roll: RollEntry, isOwn: boolean): string {
  if (isOwn)                       return C.gold
  if (roll.is_dm)                  return '#9060D0'
  if (roll.alignment === 'enemy')  return '#E05050'
  if (roll.alignment === 'allied') return '#4EC87A'
  return '#5AAAE0'  // player (default)
}

// ── Relative time ─────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// ── Corner brackets ───────────────────────────────────────────────────────────
function CornerBrackets() {
  const s = { position: 'absolute' as const, width: 6, height: 6 }
  return (
    <>
      <div style={{ ...s, top: 0,    left:  0, borderTop:    `1px solid ${C.gold}`, borderLeft:   `1px solid ${C.gold}` }} />
      <div style={{ ...s, top: 0,    right: 0, borderTop:    `1px solid ${C.gold}`, borderRight:  `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, left:  0, borderBottom: `1px solid ${C.gold}`, borderLeft:   `1px solid ${C.gold}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${C.gold}`, borderRight:  `1px solid ${C.gold}` }} />
    </>
  )
}

// ── Force pip row ─────────────────────────────────────────────────────────────
function ForcePips({ light, dark }: { light: number; dark: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {Array.from({ length: light }).map((_, i) => (
        <div key={`l${i}`} style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: FORCE_BLUE, boxShadow: `0 0 4px ${FORCE_BLUE}80` }} />
      ))}
      {light > 0 && dark > 0 && (
        <span style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.55rem, 0.88vw, 0.68rem)', color: 'rgba(232,223,200,0.3)', margin: '0 2px' }}>·</span>
      )}
      {Array.from({ length: dark }).map((_, i) => (
        <div key={`d${i}`} style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: FORCE_PURPLE }} />
      ))}
    </div>
  )
}

// ── Dice pool row ─────────────────────────────────────────────────────────────
const POOL_ORDER: DiceType[] = ['proficiency', 'ability', 'boost', 'challenge', 'difficulty', 'setback']

function DicePoolRow({ pool }: { pool: Record<DiceType, number> }) {
  const dice: DiceType[] = []
  for (const t of POOL_ORDER) {
    const n = pool[t] ?? 0
    for (let i = 0; i < n; i++) dice.push(t)
  }
  if (dice.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
      {dice.map((t, i) => <DiceFace key={i} type={t} size={14} />)}
    </div>
  )
}

function ForceDiceRow({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => <DiceFace key={i} type="force" size={14} />)}
    </div>
  )
}

// ── Outcome label helpers ─────────────────────────────────────────────────────
function outcomeLabel(netSuccess: number): string {
  if (netSuccess > 0) return 'SUCCESS'
  if (netSuccess < 0) return 'FAILURE'
  return 'WASH'
}

function outcomeColor(netSuccess: number): string {
  if (netSuccess > 0) return '#4CAF50'
  if (netSuccess < 0) return '#f44336'
  return 'rgba(232,223,200,0.5)'
}

// ── Result symbols row ────────────────────────────────────────────────────────
function ResultSymbols({ result }: { result: RollEntry['result'] }) {
  const items: { icon: string; color: string; n: number }[] = []
  if (result.netSuccess  > 0)  items.push({ icon: SYM.S.icon, color: SYM.S.color, n: result.netSuccess })
  if (result.netSuccess  < 0)  items.push({ icon: SYM.F.icon, color: SYM.F.color, n: Math.abs(result.netSuccess) })
  if (result.netAdvantage > 0) items.push({ icon: SYM.A.icon, color: SYM.A.color, n: result.netAdvantage })
  if (result.netAdvantage < 0) items.push({ icon: SYM.H.icon, color: SYM.H.color, n: Math.abs(result.netAdvantage) })
  if (result.triumph > 0)      items.push({ icon: SYM.T.icon, color: SYM.T.color, n: result.triumph })
  if (result.despair  > 0)     items.push({ icon: SYM.D.icon, color: SYM.D.color, n: result.despair })
  if (items.length === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT_MONO, fontSize: FS_RESULT }}>
      {items.map(({ icon, color, n }, idx) => (
        <span key={idx} style={{ color }}>
          <i className={`ffi ffi-${icon}`} />
          {n > 1 ? n : ''}
        </span>
      ))}
    </div>
  )
}

// ── Shared card header ────────────────────────────────────────────────────────
function CardHeader({ roll, isOwn, ac }: { roll: RollEntry; isOwn: boolean; ac: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: ac, boxShadow: `0 0 6px ${ac}60` }} />
      <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_NAME, fontWeight: 600, color: ac, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {roll.is_dm ? 'GM' : roll.character_name}
      </span>
      <span style={{ fontFamily: FONT_MONO, fontSize: FS_TIME, color: 'rgba(232,223,200,0.3)', whiteSpace: 'nowrap' }}>
        {relativeTime(roll.rolled_at)}
      </span>
    </div>
  )
}

// ── Hidden placeholder ────────────────────────────────────────────────────────
function HiddenBadge({ forGm }: { forGm: boolean }) {
  return (
    <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, color: forGm ? '#9060D0' : C.textFaint, fontStyle: 'italic' }}>
      {forGm ? '[HIDDEN FROM PLAYERS]' : '[Hidden]'}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SKILL CARD
// ═══════════════════════════════════════════════════════════════════
function SkillCard({ roll, isOwn, isGm }: { roll: RollEntry; isOwn: boolean; isGm: boolean }) {
  const ac       = alignColor(roll, isOwn)
  const isHidden = roll.hidden && !isOwn

  return (
    <div style={{ ...panelBase, padding: '10px 12px', borderLeft: `3px solid ${ac}`, background: isOwn ? 'rgba(200,170,80,0.04)' : C.panelBg }}>
      <CornerBrackets />
      <CardHeader roll={roll} isOwn={isOwn} ac={ac} />

      {roll.roll_label && (
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, color: 'rgba(232,223,200,0.55)', fontStyle: 'italic', marginBottom: 6 }}>
          {roll.roll_label}
        </div>
      )}

      {isHidden && !isGm ? (
        <HiddenBadge forGm={false} />
      ) : (
        <>
          {isGm && roll.hidden && <HiddenBadge forGm={true} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_RESULT, fontWeight: 700, color: outcomeColor(roll.result.netSuccess) }}>
              {outcomeLabel(roll.result.netSuccess)}
            </span>
            <ResultSymbols result={roll.result} />
          </div>
          <DicePoolRow pool={roll.pool} />
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMBAT CARD
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

function CombatCard({ roll, isOwn, isGm }: { roll: RollEntry; isOwn: boolean; isGm: boolean }) {
  const ac       = alignColor(roll, isOwn)
  const isHidden = roll.hidden && !isOwn

  const weaponName = roll.weapon_name || roll.roll_label || 'Attack'
  const targetName = roll.target_name
  const rangeBand  = roll.range_band

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
        ? `${base}+${brawnMod}+${damageAdd}(Brawn)+${netSuc} = ${total}`
        : `${base}+${brawnMod}+${netSuc} = ${total}`
    : null

  return (
    <div style={{ ...panelBase, padding: '10px 12px', borderLeft: `3px solid ${ac}`, background: isOwn ? 'rgba(200,170,80,0.04)' : C.panelBg }}>
      <CornerBrackets />
      <CardHeader roll={roll} isOwn={isOwn} ac={ac} />

      {/* Weapon → Target line */}
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, fontStyle: 'italic', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ color: C.gold, fontWeight: 600 }}>⚔ {weaponName}</span>
        {targetName && <>
          <span style={{ color: 'rgba(232,223,200,0.4)' }}>→</span>
          <span style={{ color: '#E05050' }}>{targetName}</span>
          {rangeBand && <span style={{ color: 'rgba(232,223,200,0.4)' }}>· {rangeBand}</span>}
        </>}
      </div>

      {isHidden && !isGm ? (
        <HiddenBadge forGm={false} />
      ) : (
        <>
          {isGm && roll.hidden && <HiddenBadge forGm={true} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_RESULT, fontWeight: 700, color: outcomeColor(roll.result.netSuccess) }}>
              {outcomeLabel(roll.result.netSuccess)}
            </span>
            <ResultSymbols result={roll.result} />
          </div>
          {dmgLine && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.68rem, 1.05vw, 0.8rem)', color: C.gold, marginBottom: 4 }}>
              Dmg: {dmgLine}
            </div>
          )}
          {meta?.critEligible && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 7px', borderRadius: 3, marginBottom: 4,
              background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.4)',
              fontFamily: FONT_MONO, fontSize: 'clamp(0.58rem, 0.88vw, 0.68rem)',
              color: '#FF9800', fontWeight: 700, letterSpacing: '0.05em',
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
  )
}

// ═══════════════════════════════════════════════════════════════════
// FORCE CARD
// ═══════════════════════════════════════════════════════════════════
function ForceCard({ roll, isOwn, isGm }: { roll: RollEntry; isOwn: boolean; isGm: boolean }) {
  const isHidden = roll.hidden && !isOwn

  const powerName  = roll.weapon_name || roll.roll_label || 'Force Power'
  const light      = roll.result.netSuccess    // totalLight
  const dark       = roll.result.netAdvantage  // totalDark
  const darkUsed   = roll.result.triumph       // darkPipsUsed
  const forceCount = roll.pool?.force ?? 0

  return (
    <div style={{ ...panelBase, padding: '10px 12px', borderLeft: `3px solid ${FORCE_BLUE}`, background: isOwn ? 'rgba(200,170,80,0.04)' : C.panelBg }}>
      <CornerBrackets />
      <CardHeader roll={roll} isOwn={isOwn} ac={FORCE_BLUE} />

      {/* Force power label */}
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, color: FORCE_BLUE, fontStyle: 'italic', marginBottom: 6 }}>
        ✦ {powerName} (Force Power)
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isHidden ? 0 : 6 }}>
        <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_RESULT, fontWeight: 700, color: FORCE_BLUE }}>
          ACTIVATED
        </span>
        {isHidden && !isGm && <HiddenBadge forGm={false} />}
      </div>

      {(!isHidden || isGm) && (
        <>
          {isGm && roll.hidden && <HiddenBadge forGm={true} />}

          {/* Pip display */}
          {(light > 0 || dark > 0) && (
            <div style={{ marginBottom: 6 }}>
              <ForcePips light={light} dark={dark} />
            </div>
          )}

          {/* FP summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.68rem, 1.05vw, 0.8rem)', marginBottom: 4 }}>
            {light > 0 && <span style={{ color: FORCE_BLUE }}>{light} Light FP</span>}
            {dark > 0 && <>
              {light > 0 && <span style={{ color: 'rgba(232,223,200,0.3)' }}>·</span>}
              <span style={{ color: FORCE_PURPLE }}>{dark} Dark FP</span>
              {darkUsed > 0 && <span style={{ color: 'rgba(200,80,80,0.8)' }}>({darkUsed} used)</span>}
            </>}
          </div>

          {/* Force dice pool icons */}
          <ForceDiceRow count={forceCount} />
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// INITIATIVE GROUP CARD
// ═══════════════════════════════════════════════════════════════════
function InitiativeGroupCard({ rolls }: { rolls: RollEntry[] }) {
  const latest = rolls[rolls.length - 1] ?? rolls[0]
  const single  = rolls.length === 1

  return (
    <div style={{ padding: '8px 12px', borderLeft: '3px solid rgba(232,223,200,0.15)', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, color: 'rgba(232,223,200,0.4)', fontStyle: 'italic', flex: 1 }}>
          ⚙ Initiative Rolled · {single ? rolls[0].character_name : `${rolls.length} participants`}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: FS_TIME, color: 'rgba(232,223,200,0.25)', whiteSpace: 'nowrap' }}>
          {relativeTime(latest.rolled_at)}
        </span>
      </div>
      {single && (
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.65rem, 1vw, 0.78rem)', color: 'rgba(232,223,200,0.28)', marginTop: 2 }}>
          {rolls[0].result.netSuccess} success{rolls[0].result.netSuccess !== 1 ? 'es' : ''}
          {rolls[0].result.netAdvantage > 0 && ` · ${rolls[0].result.netAdvantage} adv`}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SYSTEM CARD
// ═══════════════════════════════════════════════════════════════════
function SystemCard({ roll }: { roll: RollEntry }) {
  return (
    <div style={{ padding: '6px 12px', borderLeft: '3px solid rgba(232,223,200,0.15)', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, color: 'rgba(232,223,200,0.35)' }}>
        ⚙ {roll.roll_label ?? 'System Message'}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CARD ROUTER
// ═══════════════════════════════════════════════════════════════════
function RollFeedCard({ roll, isOwn, isGm, category }: { roll: RollEntry; isOwn: boolean; isGm: boolean; category: RollCategory }) {
  if (category === 'force')  return <ForceCard  roll={roll} isOwn={isOwn} isGm={isGm} />
  if (category === 'combat') return <CombatCard roll={roll} isOwn={isOwn} isGm={isGm} />
  if (category === 'system') return <SystemCard roll={roll} />
  return                            <SkillCard  roll={roll} isOwn={isOwn} isGm={isGm} />
}

// ═══════════════════════════════════════════════════════════════════
// FULL FEED PANEL (Feed tab)
// ═══════════════════════════════════════════════════════════════════
export function RollFeedPanel({ rolls, ownCharacterId, isGm = false }: {
  rolls:           RollEntry[]
  ownCharacterId:  string
  isGm?:           boolean
}) {
  if (rolls.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, color: C.textFaint }}>
        No rolls yet this session.
      </div>
    )
  }

  const grouped = groupRolls([...rolls].reverse())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: FONT_RAJDHANI, fontSize: 'clamp(0.58rem, 0.88vw, 0.68rem)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim, marginBottom: 4 }}>
        Live Table Roll History
      </div>
      {grouped.map((g, idx) =>
        g.kind === 'initiative-group' ? (
          <InitiativeGroupCard key={idx} rolls={g.rolls} />
        ) : (
          <RollFeedCard
            key={g.roll.id}
            roll={g.roll}
            isOwn={g.roll.character_id === ownCharacterId}
            isGm={isGm}
            category={g.category}
          />
        )
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPACT MINI FEED (Latest Rolls panel — 3 entries max)
// ═══════════════════════════════════════════════════════════════════
export function RollFeedMini({ rolls, ownCharacterId, onExpand }: {
  rolls:           RollEntry[]
  ownCharacterId:  string
  onExpand:        () => void
}) {
  // Initiative and system are too low-signal for the compact view
  const filtered = [...rolls]
    .reverse()
    .filter(r => { const c = classifyRoll(r); return c !== 'initiative' && c !== 'system' })
    .slice(0, 3)

  if (filtered.length === 0) return null

  return (
    <div style={{ ...panelBase, padding: '10px 12px' }}>
      <CornerBrackets />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textDim }}>
          Latest Rolls
        </div>
        <button
          onClick={onExpand}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT_RAJDHANI, fontSize: FS_TYPE, fontWeight: 600, color: C.gold, letterSpacing: '0.08em' }}
        >
          All →
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(roll => {
          const category = classifyRoll(roll)
          const isOwn    = roll.character_id === ownCharacterId
          const ac       = category === 'force' ? FORCE_BLUE : alignColor(roll, isOwn)
          const isHidden = roll.hidden && !isOwn

          return (
            <div
              key={roll.id}
              onClick={onExpand}
              style={{ padding: '5px 8px', borderRadius: 3, cursor: 'pointer', borderLeft: `2px solid ${ac}`, background: 'transparent', transition: '.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${C.gold}08` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {/* Row 1: name + time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_COMPACT, color: ac }}>
                  {roll.is_dm ? 'GM' : roll.character_name}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)', color: 'rgba(232,223,200,0.25)' }}>
                  {relativeTime(roll.rolled_at)}
                </span>
              </div>

              {/* Row 2: type-specific compact content */}
              {isHidden ? (
                <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_COMPACT, color: C.textFaint }}>[Hidden]</div>
              ) : category === 'force' ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_COMPACT, color: FORCE_BLUE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                    {roll.weapon_name || roll.roll_label || 'Force'}
                  </span>
                  <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_COMPACT, color: FORCE_BLUE }}>·</span>
                  <span style={{ fontFamily: FONT_CINZEL, fontSize: FS_COMPACT, color: FORCE_BLUE, fontWeight: 700 }}>ACTIVATED</span>
                  {roll.result.netSuccess > 0 && Array.from({ length: Math.min(roll.result.netSuccess, 4) }).map((_, i) => (
                    <div key={`l${i}`} style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: FORCE_BLUE }} />
                  ))}
                  {roll.result.netAdvantage > 0 && Array.from({ length: Math.min(roll.result.netAdvantage, 4) }).map((_, i) => (
                    <div key={`d${i}`} style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: FORCE_PURPLE }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                  {/* Skill name or weapon name */}
                  {(roll.roll_label || roll.weapon_name) && (
                    <>
                      <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_COMPACT, color: 'rgba(232,223,200,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                        {category === 'combat' ? (roll.weapon_name || roll.roll_label) : roll.roll_label}
                      </span>
                      <span style={{ color: 'rgba(232,223,200,0.3)', fontSize: FS_COMPACT }}>·</span>
                    </>
                  )}
                  {/* Outcome */}
                  <span style={{ fontFamily: FONT_RAJDHANI, fontSize: FS_COMPACT, fontWeight: 700, color: outcomeColor(roll.result.netSuccess) }}>
                    {outcomeLabel(roll.result.netSuccess)}
                  </span>
                  {/* Net symbols */}
                  {roll.result.netSuccess !== 0 && (
                    <span style={{ fontFamily: FONT_MONO, fontSize: FS_COMPACT, color: roll.result.netSuccess > 0 ? SYM.S.color : SYM.F.color }}>
                      <i className={`ffi ffi-${roll.result.netSuccess > 0 ? SYM.S.icon : SYM.F.icon}`} />{Math.abs(roll.result.netSuccess)}
                    </span>
                  )}
                  {roll.result.netAdvantage !== 0 && (
                    <span style={{ fontFamily: FONT_MONO, fontSize: FS_COMPACT, color: roll.result.netAdvantage > 0 ? SYM.A.color : SYM.H.color }}>
                      <i className={`ffi ffi-${roll.result.netAdvantage > 0 ? SYM.A.icon : SYM.H.icon}`} />{Math.abs(roll.result.netAdvantage)}
                    </span>
                  )}
                  {roll.result.triumph > 0 && <i className={`ffi ffi-${SYM.T.icon}`} style={{ fontSize: FS_COMPACT, color: SYM.T.color }} />}
                  {roll.result.despair  > 0 && <i className={`ffi ffi-${SYM.D.icon}`} style={{ fontSize: FS_COMPACT, color: SYM.D.color }} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
