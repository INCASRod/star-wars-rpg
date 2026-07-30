'use client'

import { useRef, useState } from 'react'
import { FONT_BODY, FS, SP, RADIUS } from '@/lib/tokens'
import type { Character } from '@/lib/types'
import type { BalancePointState } from '@/lib/forceUtils'
import type { ConsolidatePreviewRow } from '@/hooks/useGmCharacterActions'

// ── GM-facing Force Presence roster panel (Prompt C) ─────────────────────────
//
// Conditional REPLACEMENT for GmToolsPanel's Force tab Morality controls +
// "+ Add Conflict" when campaign_settings.morality_system === 'force_presence'
// — the branch lives in GmToolsPanel.tsx, not in this file.

const DIM         = 'var(--hud-text-dim)'
const FAINT       = 'var(--hud-text-faint)'
const DARK_VIOLET = 'var(--hud-accent-purple)'
const LIGHT_CYAN  = 'var(--die-force)'
const LIGHT_IMG   = '/images/factions/LightSymbol.png'
const DARK_IMG    = '/images/factions/DarkSymbol.png'

function PoleEmblem({ side, size, color }: { side: 'light' | 'dark'; size: number; color: string }) {
  const src = side === 'light' ? LIGHT_IMG : DARK_IMG
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block', flexShrink: 0, width: size, height: size,
        WebkitMask: `url('${src}') center/contain no-repeat`,
        mask: `url('${src}') center/contain no-repeat`,
        background: color,
      }}
    />
  )
}

/** Simplified GM-side read rendering — ForcePresenceCard.tsx (Prompt B)
 * exports no reusable pip sub-component (only the top-level component + its
 * props type), so this is a lightweight static equivalent: no click
 * interaction, no ambient motion, just the 10-pip read. Clickability for the
 * GM's correction path is layered separately below, only when editing. */
function ReadOnlyPipRow({ lightPoints, darkPoints, onPipClick }: { lightPoints: number; darkPoints: number; onPipClick?: (index: number, state: BalancePointState) => void }) {
  const pips: BalancePointState[] = Array.from({ length: 10 }, (_, i) =>
    i < darkPoints ? 'dark' : i >= 10 - lightPoints ? 'light' : 'neutral',
  )
  return (
    <div className="flex items-center" style={{ gap: 2 }}>
      {pips.map((state, i) => (
        <div
          key={i}
          onClick={onPipClick ? () => onPipClick(i, state) : undefined}
          style={{
            width: 10, height: 10, borderRadius: RADIUS.full, flexShrink: 0,
            cursor: onPipClick ? 'pointer' : 'default',
            background: state === 'dark' ? 'color-mix(in srgb, black 85%, transparent)' : state === 'light' ? 'color-mix(in srgb, white 92%, transparent)' : 'transparent',
            boxShadow: state === 'dark' ? `0 0 3px ${DARK_VIOLET}` : state === 'light' ? `0 0 4px ${LIGHT_CYAN}` : 'none',
            border: state === 'neutral' ? `1px solid ${FAINT}` : 'none',
          }}
        />
      ))}
    </div>
  )
}

function nextOptions(state: BalancePointState): { toState: BalancePointState; label: string }[] {
  if (state === 'neutral') return [{ toState: 'light', label: 'Light' }, { toState: 'dark', label: 'Dark' }]
  if (state === 'light')   return [{ toState: 'neutral', label: 'Neutral' }, { toState: 'dark', label: 'Dark' }]
  return [{ toState: 'neutral', label: 'Neutral' }]
}

function RosterRow({
  character, onAwardConflict, onAwardTranquility, onGmFlip,
}: {
  character: Character
  onAwardConflict: (charId: string) => Promise<void>
  onAwardTranquility: (charId: string) => Promise<void>
  onGmFlip: (charId: string, fromState: BalancePointState, toState: BalancePointState) => Promise<void>
}) {
  const [busy, setBusy] = useState<'conflict' | 'tranquility' | null>(null)
  const [editing, setEditing] = useState(false)
  const [chooser, setChooser] = useState<{ index: number; fromState: BalancePointState } | null>(null)
  // Serialization queue for the award buttons — a useState-based guard
  // (`if (busy) return`) is NOT synchronous enough: React's disabled-state
  // re-render doesn't land before a second rapid click can fire, so both
  // presses can slip past the check and race each other's fresh-read,
  // producing only ONE increment from TWO presses (confirmed live). And a
  // guard that simply DROPS the second press (a synchronous useRef boolean)
  // is also wrong here — the spec wants two rapid presses to produce two
  // increments, not silently discard the second one. This chains each press
  // onto a running promise instead, so every press still runs (each getting
  // its own fresh-read-then-write), strictly one at a time, never
  // overlapping — same lesson useEncounterCombatControls.ts already learned
  // about React state re-renders not being synchronous, applied as a queue
  // rather than a drop.
  const queueRef = useRef<Promise<void>>(Promise.resolve())

  const lightPoints = character.light_points ?? 0
  const darkPoints   = character.dark_points  ?? 0

  const press = (kind: 'conflict' | 'tranquility') => {
    queueRef.current = queueRef.current.then(async () => {
      setBusy(kind)
      try {
        await (kind === 'conflict' ? onAwardConflict(character.id) : onAwardTranquility(character.id))
      } finally {
        setBusy(null)
      }
    })
  }

  return (
    <div style={{ borderBottom: `1px solid var(--hud-border-hi)`, padding: `${SP[2]} 0`, position: 'relative' }}>
      <div className="flex items-center justify-between" style={{ gap: SP[2] }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: FONT_BODY, fontSize: FS.sm, color: 'var(--hud-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {character.name}
        </span>
        <ReadOnlyPipRow lightPoints={lightPoints} darkPoints={darkPoints} onPipClick={editing ? (index, state) => setChooser({ index, fromState: state }) : undefined} />
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, flexShrink: 0 }}>
          {character.session_conflict ?? 0}C · {character.session_tranquility ?? 0}T
        </span>
        <button
          onClick={() => press('conflict')}
          disabled={busy !== null}
          style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
            background: 'color-mix(in srgb, var(--hud-accent-purple) 10%, transparent)',
            border: `1px solid color-mix(in srgb, var(--hud-accent-purple) 40%, transparent)`,
            color: DARK_VIOLET, cursor: busy ? 'not-allowed' : 'pointer', flexShrink: 0,
          }}
        >
          +1 Conflict
        </button>
        <button
          onClick={() => press('tranquility')}
          disabled={busy !== null}
          style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
            background: 'color-mix(in srgb, var(--die-force) 10%, transparent)',
            border: `1px solid color-mix(in srgb, var(--die-force) 40%, transparent)`,
            color: LIGHT_CYAN, cursor: busy ? 'not-allowed' : 'pointer', flexShrink: 0,
          }}
        >
          +1 Tranquility
        </button>
        {/* De-emphasized correction path — a backup, not the primary flow */}
        <button
          onClick={() => { setEditing(e => !e); setChooser(null) }}
          style={{
            fontFamily: FONT_BODY, fontSize: FS.overline, padding: `2px ${SP[1]}`, borderRadius: RADIUS.sm,
            background: 'transparent', border: `1px solid ${FAINT}`, color: FAINT, cursor: 'pointer', flexShrink: 0,
          }}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      {chooser && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 2, zIndex: 1,
          display: 'flex', gap: SP[1], padding: SP[1], borderRadius: RADIUS.sm,
          background: 'var(--hud-panel)', border: `1px solid ${FAINT}`,
        }}>
          {nextOptions(chooser.fromState).map(opt => (
            <button
              key={opt.toState}
              onClick={() => { onGmFlip(character.id, chooser.fromState, opt.toState); setChooser(null) }}
              style={{
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, padding: `2px ${SP[2]}`, borderRadius: RADIUS.sm,
                background: 'transparent', cursor: 'pointer',
                border: `1px solid ${opt.toState === 'light' ? LIGHT_CYAN : opt.toState === 'dark' ? DARK_VIOLET : FAINT}`,
                color: opt.toState === 'light' ? LIGHT_CYAN : opt.toState === 'dark' ? DARK_VIOLET : DIM,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export interface ForcePresenceGmPanelProps {
  roster: Character[]
  onAwardConflict: (charId: string) => Promise<void>
  onAwardTranquility: (charId: string) => Promise<void>
  onGmFlip: (charId: string, fromState: BalancePointState, toState: BalancePointState) => Promise<void>
  consolidatePreview: ConsolidatePreviewRow[] | null
  onComputeConsolidatePreview: () => void
  onDismissConsolidatePreview: () => void
  onConfirmConsolidate: () => Promise<void>
  consolidateBusy: boolean
}

export function ForcePresenceGmPanel({
  roster, onAwardConflict, onAwardTranquility, onGmFlip,
  consolidatePreview, onComputeConsolidatePreview, onDismissConsolidatePreview, onConfirmConsolidate, consolidateBusy,
}: ForcePresenceGmPanelProps) {
  return (
    <div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: FAINT, marginBottom: SP[2] }}>
        Force Presence
      </div>

      {roster.length === 0 ? (
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: DIM, textAlign: 'center', padding: `${SP[3]} 0` }}>
          No force-sensitive characters in this campaign.
        </div>
      ) : (
        <div>
          {roster.map(c => (
            <RosterRow key={c.id} character={c} onAwardConflict={onAwardConflict} onAwardTranquility={onAwardTranquility} onGmFlip={onGmFlip} />
          ))}
        </div>
      )}

      {/* Consolidate — acts on the whole roster, visually distinct from the
          per-character award buttons above. */}
      <div style={{ marginTop: SP[4], paddingTop: SP[3], borderTop: `1px solid var(--hud-border-hi)` }}>
        <button
          onClick={onComputeConsolidatePreview}
          disabled={roster.length === 0}
          style={{
            width: '100%', height: '2.25rem', borderRadius: RADIUS.sm,
            background: 'color-mix(in srgb, var(--hud-gold) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--hud-gold) 45%, transparent)',
            fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--hud-gold)', cursor: roster.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Consolidate Session Conflict/Tranquility
        </button>

        {consolidatePreview && (
          <div style={{ marginTop: SP[2], padding: SP[2], borderRadius: RADIUS.sm, background: 'color-mix(in srgb, var(--hud-gold) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--hud-gold) 25%, transparent)' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: FAINT, marginBottom: SP[1], fontStyle: 'italic' }}>
              GM-only readout — read this out at the table, not sent to players.
            </div>
            <div className="flex flex-col" style={{ gap: SP[1] }}>
              {consolidatePreview.map(row => (
                <div key={row.characterId} className="flex items-center justify-between" style={{ gap: SP[2] }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: 'var(--hud-text)' }}>{row.characterName}</span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: DIM, textAlign: 'right' }}>{row.instruction}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center" style={{ gap: SP[2], marginTop: SP[2] }}>
              <button
                onClick={onDismissConsolidatePreview}
                disabled={consolidateBusy}
                style={{
                  flex: 1, fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, padding: `${SP[1]} 0`, borderRadius: RADIUS.sm,
                  background: 'transparent', border: `1px solid ${FAINT}`, color: DIM, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirmConsolidate}
                disabled={consolidateBusy}
                style={{
                  flex: 1, fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, padding: `${SP[1]} 0`, borderRadius: RADIUS.sm,
                  background: 'color-mix(in srgb, var(--hud-gold) 18%, transparent)', border: '1px solid var(--hud-gold)',
                  color: 'var(--hud-gold)', cursor: consolidateBusy ? 'not-allowed' : 'pointer',
                }}
              >
                Confirm & Reset Counters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
