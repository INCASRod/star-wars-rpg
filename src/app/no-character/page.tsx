import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, EASE } from '@/lib/tokens'

export const metadata = { title: 'No character yet · Holocron' }

/** Signed in, but this account is not bound to a character (proxy.ts sends unbound non-GM accounts here). */
export default function NoCharacterPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SP[6],
        background: HUD.bg,
        fontFamily: FONT_BODY,
        color: HUD.text,
      }}
    >
      <div
        style={{
          maxWidth: '28rem',
          width: '100%',
          padding: SP[6],
          textAlign: 'center',
          border: `1px solid ${HUD.border}`,
          borderRadius: RADIUS.lg,
          background: HUD.surfaceLo,
        }}
      >
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h3, margin: 0, marginBottom: SP[3] }}>No character yet</h1>
        <p style={{ fontSize: FS.sm, color: HUD.textDim, margin: 0, marginBottom: SP[5] }}>
          This account is not linked to a character. Ask your GM for an invite link, open it, and your character will appear here.
        </p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="hov-lift"
            style={{
              fontFamily: FONT_BODY,
              fontSize: FS.overline,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: `${SP[2]} ${SP[5]}`,
              borderRadius: RADIUS.sm,
              border: `1px solid ${HUD.border}`,
              background: 'transparent',
              color: HUD.text,
              cursor: 'pointer',
              transition: `border-color ${EASE.quick}`,
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  )
}
