'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConsoleBridge } from '@/lib/consoleBridge'
import { HUD, FONT_BODY, FS } from '@/lib/tokens'

interface Props {
  campaignId: string | null
}

/** Hosts the vendored external Console app (public/console/index.html) in a
 * full-viewport iframe and wires it to Supabase via ConsoleBridge. See
 * docs/architecture.md's Console section. */
export function ConsoleHost({ campaignId }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!campaignId) return
    const iframe = iframeRef.current
    if (!iframe) return

    const supabase = createClient()
    const bridge = new ConsoleBridge(supabase, campaignId, iframe.contentWindow as Window)
    // Attach BEFORE setting src so the child's "hello" is never missed.
    bridge.attach()
    iframe.src = '/console/index.html'

    return () => bridge.teardown()
  }, [campaignId])

  if (!campaignId) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{ background: HUD.bg, color: 'var(--hud-text-dim)', fontFamily: FONT_BODY, fontSize: FS.body }}
      >
        No campaign selected — open the Console from a GM session link with a ?campaign= id.
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="Console"
      className="h-screen w-screen border-0 block"
    />
  )
}
