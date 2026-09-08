'use client'

import { createPortal } from 'react-dom'
import type { Character, CharacterSkill, HudSkill } from '@/lib/types'
import type { PendingAction, PendingActionType } from '@/hooks/usePendingActions'
import { InitiativeRollBody } from '@/components/player-hud/InitiativeRollModal'
import { RichText } from '@/components/ui/RichText'

// Same per-type glyph/name map and description copy as
// HudNotificationsDrawer.tsx (desktop) — every action_type in the
// migration-117 CHECK constraint gets an entry, even though only
// `initiative` (and, from Prompt 4b, `vendor_offer`) have real resolve UI.
const TYPE_META: Record<PendingActionType, { glyph: string; name: string }> = {
  initiative:         { glyph: '⚡', name: 'Initiative' },
  destiny_generate:   { glyph: '☄', name: 'Destiny Pool — Contribute' },
  critical_injury:    { glyph: '✚', name: 'Critical Injury — Roll Required' },
  conflict_ack:       { glyph: '☯', name: 'Conflict Gained' },
  vendor_offer:       { glyph: '⬡', name: 'Vendor Offer' },
  loot_reveal:        { glyph: '◆', name: 'Loot Awarded' },
  gm_dialog:          { glyph: '✦', name: 'Transmission' },
  force_rating_offer: { glyph: '◈', name: 'Force Sensitivity Awakens' },
}

const INIT_TYPE_LABEL: Record<string, string> = { cool: 'Cool', vigilance: 'Vigilance' }

function describe(action: PendingAction): string {
  const p = action.payload as { initiativeType?: string }
  switch (action.action_type) {
    case 'initiative': {
      const t = INIT_TYPE_LABEL[p.initiativeType ?? ''] ?? 'Initiative'
      return `The GM has requested your ${t.toLowerCase()} initiative roll. Combat is waiting on you.`
    }
    case 'destiny_generate':   return 'Roll your Force die to seed the session’s Destiny pool.'
    case 'critical_injury':    return 'Roll to determine the injury you have taken.'
    case 'conflict_ack':       return 'The GM has assigned you Conflict. Acknowledge to continue.'
    case 'vendor_offer':       return 'A vendor has made you an offer.'
    case 'loot_reveal':        return 'Loot has been awarded to you.'
    case 'gm_dialog':          return 'The GM has sent you a message.'
    case 'force_rating_offer': return 'You may purchase Force Rating 1.'
    default:                   return 'Awaiting your decision.'
  }
}

function titleFor(action: PendingAction): string {
  const base = TYPE_META[action.action_type]?.name ?? 'Pending Action'
  if (action.action_type === 'initiative') {
    const p = action.payload as { initiativeType?: string }
    const t = INIT_TYPE_LABEL[p.initiativeType ?? '']
    return t ? `${base} — ${t}` : base
  }
  return base
}

export interface MobileNotificationsSheetProps {
  open: boolean
  onClose: () => void
  actions: PendingAction[]
  resolve: (id: string, resultPayload?: Record<string, unknown>) => Promise<void>
  character: Character
  charSkills: CharacterSkill[]
  hudSkills: HudSkill[]
  forceRating: number
  campaignId: string | null
  onOpenStorefront: () => void
}

export function MobileNotificationsSheet({
  open, onClose, actions, resolve, character, charSkills, hudSkills, forceRating, campaignId, onOpenStorefront,
}: MobileNotificationsSheetProps) {
  if (!open) return null

  return createPortal(
    <div className="m-notif-root" data-mobile-shell="">
      <div className="m-combat-header">
        <span className="m-combat-title">Notifications</span>
        <button type="button" className="m-icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="m-combat-body">
        {actions.length === 0 ? (
          <div className="m-placeholder">
            <div className="m-placeholder-title">All caught up</div>
            <div className="m-placeholder-body">Nothing needs your attention right now.</div>
          </div>
        ) : (
          actions.map(action => {
            const meta = TYPE_META[action.action_type]
            return (
              <div key={action.id} className={`m-notif-card${action.is_blocking ? ' is-blocking' : ''}`}>
                <div className="m-notif-head">
                  <span className="m-notif-glyph" aria-hidden="true">{meta?.glyph ?? '●'}</span>
                  <span className="m-notif-title">{titleFor(action)}</span>
                </div>
                <div className="m-notif-desc"><RichText text={describe(action)} /></div>

                {action.action_type === 'initiative' && campaignId ? (
                  <div className="m-notif-initiative-wrap">
                    <InitiativeRollBody
                      character={character}
                      skills={charSkills}
                      initiativeType={((action.payload as { initiativeType?: string }).initiativeType === 'vigilance' ? 'vigilance' : 'cool')}
                      campaignId={campaignId}
                      forceRating={forceRating}
                      hudSkills={hudSkills}
                      requestedSkillKey={(action.payload as { skillKey?: string }).skillKey}
                      pendingRow={action}
                      resolvePendingAction={resolve}
                    />
                  </div>
                ) : action.action_type === 'vendor_offer' && campaignId ? (
                  <button type="button" className="m-market-open-btn" onClick={onOpenStorefront}>
                    Open Storefront
                  </button>
                ) : (
                  <div className="m-notif-placeholder">
                    This surface is not wired to the queue yet — resolve it from its own popup.
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>,
    document.body,
  )
}
