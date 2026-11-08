'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useXpHold } from '@/lib/xpSpendingFreeze'
import { createClient } from '@/lib/supabase/client'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, EASE } from '@/lib/tokens'

const WARN = 'var(--state-warning)'

/** Persistent notice on every XP purchase screen while the GM has paused spending. Renders nothing otherwise. */
export function XpHoldBanner() {
  const { frozen, unknown, reason } = useXpHold()
  if (!frozen || unknown) return null
  return (
    <div
      role="status"
      style={{
        display: 'flex', flexDirection: 'column', gap: SP[1],
        padding: `${SP[1]} ${SP[3]}`,
        fontFamily: FONT_BODY, fontSize: FS.sm, color: WARN,
        background: `color-mix(in srgb, ${WARN} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${WARN} 35%, transparent)`,
        borderRadius: RADIUS.md,
      }}
    >
      <span style={{ fontWeight: 700 }}>XP spending is paused by the GM</span>
      {reason && <span style={{ fontSize: FS.label, color: HUD.textDim }}>Reason: {reason}</span>}
    </div>
  )
}

/** Remembered per sign-in and per hold, so one login sees each hold once. A new login, or a new hold, shows it again. */
async function seenKey(): Promise<string | null> {
  try {
    const { data: { user } } = await createClient().auth.getUser()
    return user ? `xp-hold-seen:${user.id}:${user.last_sign_in_at ?? ''}` : null
  } catch { return null }
}

/** One-time pop-up for the owning player: on load while a hold is on, and live when the GM turns one on. */
export function XpHoldModal() {
  const { frozen, unknown, reason, startedAt, loading } = useXpHold()
  const [key, setKey] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)
  const [seen, setSeen] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    void seenKey().then(k => {
      if (!live) return
      setKey(k)
      try { setSeen(k ? localStorage.getItem(k) : null) } catch { /* storage unavailable: show once per page load */ }
      setReady(true)
    })
    return () => { live = false }
  }, [])

  const episode = startedAt ?? 'on'
  const open = ready && !loading && frozen && !unknown && dismissed !== episode && seen !== episode

  function dismiss() {
    setDismissed(episode)
    try { if (key) localStorage.setItem(key, episode) } catch { /* ignore */ }
  }

  return (
    <Modal open={open} onClose={dismiss} maxWidth="26rem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3], padding: SP[4], fontFamily: FONT_BODY }}>
        <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: HUD.gold }}>XP progress halted</h2>
        <p style={{ margin: 0, fontSize: FS.sm, color: HUD.text, lineHeight: 1.5 }}>
          The GM has paused XP spending for now. You can still earn XP, you just can&apos;t spend it until the GM lifts the hold.
        </p>
        {reason && <p style={{ margin: 0, fontSize: FS.sm, color: HUD.textDim }}>Reason: {reason}</p>}
        <button
          type="button"
          onClick={dismiss}
          style={{
            alignSelf: 'flex-end', cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.gold,
            padding: `${SP[2]} ${SP[4]}`, borderRadius: RADIUS.md, transition: EASE.quick,
            background: 'color-mix(in srgb, var(--gold) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)',
          }}
        >
          Understood
        </button>
      </div>
    </Modal>
  )
}
