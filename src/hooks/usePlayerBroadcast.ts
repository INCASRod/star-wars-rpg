'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { VendorOffer } from '@/components/player-hud/VendorPurchaseDialog'

interface DestinyGMFlashPayload {
  prevLight: number
  prevDark:  number
  newLight:  number
  newDark:   number
}

interface PlayerBroadcastOptions {
  characterId: string
  campaignId: string | null
  supabase: SupabaseClient
  sessionMode: 'combat' | 'exploration'
  onDestinyRollRequest: (payload: { poolId: string }) => void
  onDestinyGmFlash: (payload: DestinyGMFlashPayload) => void
  /** Force Presence (Prompt C) — visual-only notifications, fired once per
   * GM award press. Neither reads nor needs session_conflict/tranquility
   * values; independent of ForcePresenceCard's own separate local reaction
   * (Prompt B) to the counter changing via its own realtime subscription. */
  onConflictAwarded?: () => void
  onTranquilityAwarded?: () => void
}

interface BroadcastSessionState {
  mode: 'combat' | 'exploration'
  round: number
}

export function usePlayerBroadcast({
  characterId,
  campaignId,
  supabase,
  sessionMode,
  onDestinyRollRequest,
  onDestinyGmFlash,
  onConflictAwarded,
  onTranquilityAwarded,
}: PlayerBroadcastOptions) {
  const router = useRouter()
  const sessionModeRef = useRef(sessionMode)
  sessionModeRef.current = sessionMode

  const [broadcastSession, setBroadcastSession] = useState<BroadcastSessionState | null>(null)
  const [broadcastTransition, setBroadcastTransition] = useState<{ pending: boolean; prevMode: 'combat' | 'exploration' | null }>({ pending: false, prevMode: null })
  const [gmDialog, setGmDialog] = useState<string | null>(null)
  const [gmCritInjuryDialog, setGmCritInjuryDialog] = useState<{ name: string; severity: string; description: string } | null>(null)
  const [lootReveal, setLootReveal] = useState<Record<string, unknown> | null>(null)
  const [vendorOffer, setVendorOffer] = useState<VendorOffer | null>(null)
  const [initRoll, setInitRoll] = useState<{ type: 'cool' | 'vigilance'; campaignId: string } | null>(null)
  const campaignIdRef = useRef(campaignId)
  campaignIdRef.current = campaignId

  useEffect(() => {
    const channel = supabase
      .channel(`gm-notify-${characterId}`)
      .on('broadcast', { event: 'gm-action' }, ({ payload }: { payload: Record<string, unknown> }) => {
        if (payload.type === 'toast') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          import('sonner').then(m => m.toast(payload.message as any))
        } else if (payload.type === 'combat-state') {
          const newMode = payload.mode as 'combat' | 'exploration'
          const newRound = payload.round as number
          const curMode = sessionModeRef.current
          if (newMode !== curMode) {
            setBroadcastTransition({ pending: true, prevMode: curMode })
            setTimeout(() => {
              setBroadcastSession({ mode: newMode, round: newRound })
              sessionModeRef.current = newMode
              setBroadcastTransition({ pending: false, prevMode: null })
            }, 1200)
          } else {
            setBroadcastSession({ mode: newMode, round: newRound })
            sessionModeRef.current = newMode
          }
        } else if (payload.type === 'loot-reveal') {
          setLootReveal(payload.item as Record<string, unknown>)
        } else if (payload.type === 'loot-dismiss') {
          setLootReveal(null)
        } else if (payload.type === 'initiative-request') {
          const cid = campaignIdRef.current
          if (cid) setInitRoll({ type: payload.initiativeType as 'cool' | 'vigilance', campaignId: cid })
        } else if (payload.type === 'destiny-roll-request') {
          onDestinyRollRequest({ poolId: payload.poolId as string })
        } else if (payload.type === 'destiny-gm-spent') {
          try {
            const audio = new Audio('/sounds/laughing.mp3')
            audio.volume = 0.7
            audio.play().catch(() => {})
          } catch (_) {}
          onDestinyGmFlash({
            prevLight: payload.prevLightCount as number,
            prevDark:  payload.prevDarkCount  as number,
            newLight:  payload.newLightCount  as number,
            newDark:   payload.newDarkCount   as number,
          })
        } else if (payload.type === 'conflict-awarded') {
          onConflictAwarded?.()
        } else if (payload.type === 'tranquility-awarded') {
          onTranquilityAwarded?.()
        } else if (payload.type === 'vendor-purchase-offer') {
          setVendorOffer(payload as unknown as VendorOffer)
        } else if (payload.type === 'force-logout') {
          const key = typeof window !== 'undefined' ? localStorage.getItem('holocron_session_key') : null
          const cid = campaignIdRef.current
          const doLogout = async () => {
            if (key && cid) {
              await supabase.from('character_sessions').delete().eq('session_key', key).eq('campaign_id', cid)
            }
            router.push('/')
          }
          void doLogout()
        } else if (payload.type === 'crit-injury-added') {
          setGmCritInjuryDialog({
            name:        payload.name        as string,
            severity:    payload.severity    as string,
            description: payload.description as string,
          })
        } else {
          setGmDialog(payload.message as string)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  return {
    broadcastSession, setBroadcastSession,
    broadcastTransition, setBroadcastTransition,
    gmDialog, setGmDialog,
    gmCritInjuryDialog, setGmCritInjuryDialog,
    lootReveal, setLootReveal,
    vendorOffer, setVendorOffer,
    initRoll, setInitRoll,
  }
}
