'use client'

import { Modal } from '@/components/ui/Modal'
import { RichText } from '@/components/ui/RichText'
import { usePlayerRecaps, type PlayerRecap } from '@/hooks/usePlayerRecaps'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, EASE } from '@/lib/tokens'

/** Reader for one recap. `eyebrow` differs between the new-recap pop-up and opening an old one from the notes list. */
export function RecapReader({ recap, eyebrow, onClose }: { recap: PlayerRecap | null; eyebrow: string; onClose: () => void }) {
  const paragraphs = (recap?.summary ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  return (
    <Modal open={!!recap} onClose={onClose} maxWidth="34rem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[3], padding: SP[4], fontFamily: FONT_BODY, maxHeight: '80vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.gold }}>
          <span aria-hidden style={{ fontSize: FS.sm }}>✉</span>{eyebrow}
        </div>
        <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: HUD.text }}>
          Session {recap?.n} · {recap?.title || 'Untitled'}
        </h2>
        {recap?.session_date && <div style={{ fontSize: FS.label, color: HUD.textDim }}>{recap.session_date}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2], overflowY: 'auto', minHeight: 0, fontSize: FS.sm, lineHeight: 1.6, color: HUD.text }}>
          {paragraphs.map((p, i) => <p key={i} style={{ margin: 0 }}><RichText text={p} /></p>)}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            alignSelf: 'flex-end', cursor: 'pointer', flexShrink: 0,
            fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, color: HUD.gold,
            padding: `${SP[2]} ${SP[4]}`, borderRadius: RADIUS.md, transition: EASE.quick,
            background: 'color-mix(in srgb, var(--gold) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)',
          }}
        >
          Got it
        </button>
      </div>
    </Modal>
  )
}

/** One-time pop-up on the owning player's sheet when the GM shares a new recap (on load, or live mid-session). */
export function RecapModal() {
  const { unseen, markSeen } = usePlayerRecaps()
  return <RecapReader recap={unseen} eyebrow="New recap from the GM" onClose={() => { if (unseen) markSeen(unseen.session_id) }} />
}
