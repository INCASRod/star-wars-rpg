'use client'

import { useEffect, useRef, useCallback, memo, useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { SP, Z, FS, FONT_BODY } from '@/lib/tokens'
import type { MapToken } from '@/hooks/useMapTokens'
import { runMapWipe } from '@/lib/mapWipe'
import { attachTokenHover, onTokenPointerOver, onTokenPointerOut, destroyTokenHover } from '@/lib/tokenHover'

// Pixi.js v7 — loaded dynamically to avoid SSR issues
let PIXI: typeof import('pixi.js') | null = null

// ── Prompt 13 diagnostic — OFF by default ───────────────────────────────────
// Flip to true locally to (1) draw each token's actual hitArea as a magenta
// translucent overlay directly on the canvas, and (2) console.log the full
// coordinate-mapping bundle (hitArea local bounds, container.getBounds()
// global bounds, canvas getBoundingClientRect, devicePixelRatio, renderer
// resolution/screen size, container clientWidth/Height) on every pointerover.
// Compare the drawn overlay against the visually rendered token: if the
// overlay is solid and lines up with the token but hover still misses inside
// it, the bug is upstream in event/coordinate mapping, not hitArea geometry.
const DEV_DEBUG_HOVER = false

const BORDER_COLOURS: Record<string, number> = {
  pc:          0xC8AA50,  // gold
  allied_npc:  0x5AAAE0,  // blue
  minion:      0xE05252,  // red
  rival:       0xFF9800,  // orange
  nemesis:     0x9060D0,  // purple
  enemy:       0xE05252,  // red fallback for untyped enemy tokens
}

const POINTER_COLOURS: Record<string, number> = {
  pointer_green:  0x22c55e,
  pointer_red:    0xef4444,
  pointer_orange: 0xf97316,
}

export interface MapCanvasProps {
  mapImageUrl:         string
  tokens:              MapToken[]
  isGM:                boolean
  currentCharacterId:  string | null
  onTokenMove:         (id: string, x: number, y: number) => void
  gridEnabled:         boolean
  gridSize:            number
  onTokenContextMenu?: (tokenId: string, e: MouseEvent) => void
  tokenScale?:         number                        // GM-only visual scale multiplier; players always see 1.0
  initialScale?:       number                        // stage zoom applied once on first load (default 1.0)
  bottomOverlayRef?:   React.RefObject<HTMLElement | null>  // ref to element at the bottom; its height shifts the initial vertical centre upward
  // tokenRect is the token's true screen-space bounding box (Pixi container.getBounds()
  // translated into page coordinates) — screenX/screenY alone is just the raw pointer
  // entry point, which varies by which edge the cursor crossed first; a true rect is
  // needed to anchor a tooltip's notch to the token's actual centre (Prompt 11).
  onTokenHover?:       (tokenId: string, screenX: number, screenY: number, tokenRect: DOMRect) => void
  // tokenId identifies which token this "leaving" event is for. The 60ms
  // debounce below (per-token closure) means a hover-end can arrive AFTER
  // the pointer has already landed on a different token — consumers must
  // check this id against whatever they currently think is hovered and
  // treat a mismatch as stale/no-op, not unconditionally clear (Prompt 14 —
  // this is what made quick hover-hopping between tokens show no tooltip
  // at all: token A's delayed hide fired after token B's show and wiped it).
  onTokenHoverEnd?:    (tokenId: string) => void
  onTokenDragStart?:   (tokenId: string) => void
  onTokenDragEnd?:     (tokenId: string) => void
  onTokenClick?:       (tokenId: string, sourceRect: DOMRect) => void
  // Counter the parent increments to request a recentre (e.g. after the
  // Encounter Deck's open/close animation changes the map area's height) —
  // the ResizeObserver only resizes the renderer, it never recentres the map.
  recentreSignal?:     number
  // Token id whose existing hover glow (tokenHover.ts) should be driven
  // programmatically — e.g. from a deck card hover, not a real pointer
  // event. Reuses onTokenPointerOver/onTokenPointerOut as-is; no second
  // glow effect.
  highlightedTokenId?: string | null
}

export const MapCanvas = memo(function MapCanvas({
  mapImageUrl, tokens, isGM, currentCharacterId,
  onTokenMove, gridEnabled, gridSize, onTokenContextMenu,
  tokenScale = 1, initialScale = 1, bottomOverlayRef,
  onTokenHover, onTokenHoverEnd, onTokenDragStart, onTokenDragEnd, onTokenClick,
  recentreSignal, highlightedTokenId,
}: MapCanvasProps) {
  const containerRef       = useRef<HTMLDivElement>(null)
  const appRef             = useRef<InstanceType<typeof import('pixi.js').Application> | null>(null)

  const [isLocked, setIsLocked] = useState(false)
  const isLockedRef = useRef(false)
  const [webGLError, setWebGLError] = useState(false)

  const toggleLock = useCallback(() => {
    isLockedRef.current = !isLockedRef.current
    setIsLocked(isLockedRef.current)
  }, [])

  const resetView = useCallback(() => {
    const app = appRef.current
    if (!app) return
    app.stage.scale.set(1)
    app.stage.x = 0
    app.stage.y = 0
  }, [])
  const tokensRef          = useRef<Map<string, InstanceType<typeof import('pixi.js').Container>>>(new Map())
  const draggingTokenIdRef = useRef<string | null>(null)

  // Programmatic highlight (Prompt 5 — card hover → token glow). Reuses
  // onTokenPointerOver/onTokenPointerOut exactly as the real pointer path
  // does; this effect only tracks which token was highlighted last so it
  // can be cleared before applying a new one (or on unmount/prop clear),
  // same "always clear the previous one" shape as the real hover path's
  // pointerout handler — never depends on a matching pointerout firing.
  const prevHighlightedRef = useRef<string | null>(null)
  useEffect(() => {
    const app = appRef.current
    if (!app) return
    const prevId = prevHighlightedRef.current
    if (prevId && prevId !== highlightedTokenId) {
      const prevContainer = tokensRef.current.get(prevId)
      if (prevContainer) onTokenPointerOut(prevContainer, app.ticker)
    }
    if (highlightedTokenId) {
      const container = tokensRef.current.get(highlightedTokenId)
      if (container) onTokenPointerOver(container, app.ticker)
    }
    prevHighlightedRef.current = highlightedTokenId ?? null
  }, [highlightedTokenId])

  const wipeInProgress = useRef(false)

  // Map image bounds within the canvas (updated by rebuildMap)
  const mapWRef       = useRef(800)
  const mapHRef       = useRef(600)
  const mapOffsetXRef = useRef(0)
  const mapOffsetYRef = useRef(0)

  // Always-current props ref — the async init closure reads this after it resolves
  const propsRef = useRef({ mapImageUrl, gridEnabled, gridSize, tokens, isGM, currentCharacterId, tokenScale })
  propsRef.current = { mapImageUrl, gridEnabled, gridSize, tokens, isGM, currentCharacterId, tokenScale }

  const onTokenHoverRef    = useRef(onTokenHover)
  onTokenHoverRef.current  = onTokenHover
  const onTokenHoverEndRef = useRef(onTokenHoverEnd)
  onTokenHoverEndRef.current = onTokenHoverEnd
  const onTokenDragStartRef = useRef(onTokenDragStart)
  onTokenDragStartRef.current = onTokenDragStart
  const onTokenDragEndRef   = useRef(onTokenDragEnd)
  onTokenDragEndRef.current  = onTokenDragEnd
  const onTokenClickRef     = useRef(onTokenClick)
  onTokenClickRef.current   = onTokenClick

  // ── Pixi bootstrap ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    import('pixi.js').then(async (px) => {
      if (destroyed || !containerRef.current) return
      PIXI = px

      const el = containerRef.current
      // Use Renderer directly rather than Application — Application calls
      // autoDetectRenderer internally, which fails under Turbopack because
      // @pixi/extensions is evaluated in two separate module contexts, leaving
      // the renderers[] list seen by autoDetectRenderer permanently empty even
      // when extensions.add(Renderer) is called from our module context.
      // Constructing Renderer directly bypasses that broken detection path.
      const renderer = (() => {
        try {
          return new px.Renderer({
            width:           el.clientWidth  || 800,
            height:          el.clientHeight || 600,
            backgroundColor: 0x060D09,
            antialias:       true,
            resolution:      window.devicePixelRatio || 1,
            autoDensity:     true,
          })
        } catch {
          setWebGLError(true)
          return null
        }
      })()
      if (!renderer) return
      el.appendChild(renderer.view as HTMLCanvasElement)

      const stage  = new px.Container()
      const ticker = new px.Ticker()
      // Render at LOW priority (-25) so NORMAL-priority animation callbacks
      // (hover glow, scale lerp in tokenHover.ts) always run before the frame.
      ticker.add(() => renderer.render(stage), null, -25)
      ticker.start()

      // ResizeObserver replaces Application's resizeTo option.
      const ro = new ResizeObserver(() => {
        if (!containerRef.current) return
        renderer.resize(containerRef.current.clientWidth || 800, containerRef.current.clientHeight || 600)
      })
      ro.observe(el)

      const app = {
        renderer, stage, ticker,
        view:   renderer.view,
        screen: renderer.screen,
        destroy(removeView: boolean, opts?: { children?: boolean; texture?: boolean; baseTexture?: boolean }) {
          ro.disconnect()
          ticker.destroy()
          stage.destroy(opts)
          renderer.destroy(removeView)
        },
      } as unknown as InstanceType<typeof import('pixi.js').Application>

      appRef.current = app
      app.stage.sortableChildren = true

      setupPan(app, isLockedRef)
      setupZoom(app, containerRef.current, isLockedRef)

      // Await rebuildMap so map dimensions are set before syncing tokens.
      // The sync effect already fired once (when app was null) and won't
      // re-fire unless tokens change — so we sync explicitly here.
      const { mapImageUrl: url, gridEnabled: ge, gridSize: gs } = propsRef.current
      if (url) {
        await rebuildMap(app, px, url, ge, gs, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef)
        if (initialScale !== 1) {
          app.stage.scale.set(initialScale)
          const cw = app.screen.width
          const ch = app.screen.height
          // Re-centre: at scale < 1 the stage origin drifts; shift by the
          // gap that opens up on each side so the map stays centred in the
          // visible area. If a bottom overlay (e.g. initiative strip) is
          // present, its rendered height shifts the vertical centre upward.
          const overlayH = bottomOverlayRef?.current?.offsetHeight ?? 0
          app.stage.x = cw * (1 - initialScale) / 2
          app.stage.y = ch * (1 - initialScale) / 2 - overlayH / 2
        }
      }
      if (!destroyed) {
        const { tokens: t, isGM: gm, currentCharacterId: cid, tokenScale: ts } = propsRef.current
        syncTokens(
          app, px, t, gm, cid,
          onTokenMoveRef, onContextRef, onTokenHoverRef, onTokenHoverEndRef, onTokenDragStartRef, onTokenDragEndRef, onTokenClickRef,
          containerRef, tokensRef, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef,
          draggingTokenIdRef, ts,
        )
      }
    })

    return () => {
      destroyed = true
      const app = appRef.current
      if (app) {
        app.destroy(true, { children: true, texture: true })
        appRef.current = null
      }
      tokensRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rebuild when props change (Pixi already initialised) ────
  useEffect(() => {
    const app = appRef.current
    if (!app || !PIXI || !mapImageUrl) return
    rebuildMap(app, PIXI, mapImageUrl, gridEnabled, gridSize, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, wipeInProgress)
  }, [mapImageUrl, gridEnabled, gridSize])

  // ── Recentre on demand (e.g. after the Encounter Deck's open/close
  // animation changes the map area's height) — separate from the
  // mapImageUrl/gridEnabled/gridSize effect above, which does not fire on
  // container resize. No wipeInProgress ref is passed here, so this always
  // takes rebuildMap's plain (non-wipe) redraw path.
  useEffect(() => {
    const app = appRef.current
    if (!app || !PIXI || !mapImageUrl || recentreSignal === undefined) return
    rebuildMap(app, PIXI, mapImageUrl, gridEnabled, gridSize, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef)
  }, [recentreSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync tokens ─────────────────────────────────────────────
  const onTokenMoveRef = useRef(onTokenMove)
  onTokenMoveRef.current = onTokenMove
  const onContextRef  = useRef(onTokenContextMenu)
  onContextRef.current = onTokenContextMenu

  // Delta sync: skip full sweep when only positions/visibility changed
  const prevTokensMapRef = useRef<Map<string, MapToken>>(new Map())
  const prevScaleRef     = useRef(tokenScale)

  const syncTokensCb = useCallback(() => {
    const app = appRef.current
    if (!app || !PIXI) return

    const prevMap      = prevTokensMapRef.current
    const scaleChanged = tokenScale !== prevScaleRef.current
    prevScaleRef.current = tokenScale

    // Fast path: same token IDs + same image URLs → direct property updates only
    let fastPath = tokens.length === prevMap.size
    if (fastPath) {
      for (const t of tokens) {
        const p = prevMap.get(t.id)
        if (!p || (t.token_image_url ?? null) !== (p.token_image_url ?? null)) { fastPath = false; break }
      }
    }

    if (fastPath) {
      for (const token of tokens) {
        const c = tokensRef.current.get(token.id)
        if (!c) continue
        if (draggingTokenIdRef.current !== token.id) {
          const p = prevMap.get(token.id)!
          if (token.x !== p.x || token.y !== p.y) {
            c.x = mapOffsetXRef.current + token.x * mapWRef.current
            c.y = mapOffsetYRef.current + token.y * mapHRef.current
          }
        }
        if (scaleChanged) {
          // Always keep _baseScale in sync so hover-exit returns to the correct scale
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(c as any)._baseScale = tokenScale
          // Only reset visual scale if not hovering (hover animation manages scale)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!(c as any)._hoverActive) {
            c.scale.set(tokenScale)
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(c as any).__applyLabelScale?.(tokenScale)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(c as any).alpha = (!isGM && !token.is_visible) ? 0 : (isGM && !token.is_visible ? 0.4 : 1)
        prevMap.set(token.id, token)
      }
      return
    }

    // Slow path: rebuild map and do full sync (token added/removed/image changed)
    prevTokensMapRef.current = new Map(tokens.map(t => [t.id, t]))
    syncTokens(
      app, PIXI, tokens, isGM, currentCharacterId,
      onTokenMoveRef, onContextRef, onTokenHoverRef, onTokenHoverEndRef, onTokenDragStartRef, onTokenDragEndRef, onTokenClickRef, containerRef, tokensRef,
      mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef,
      draggingTokenIdRef, tokenScale,
    )
  }, [tokens, isGM, currentCharacterId, tokenScale])

  useEffect(() => { syncTokensCb() }, [syncTokensCb])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', cursor: isLocked ? 'default' : 'grab', overflow: 'hidden' }}
      />
      {webGLError ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ zIndex: Z.overlay }}
        >
          <span style={{ fontSize: FS.sm, fontFamily: FONT_BODY, color: 'var(--hud-text-faint)' }}>
            Map requires WebGL
          </span>
          <span style={{ fontSize: FS.overline, fontFamily: FONT_BODY, color: 'var(--hud-text-faint)', opacity: 0.6 }}>
            Open in Chrome or Edge to use the map
          </span>
        </div>
      ) : (
        <div
          className="absolute flex"
          style={{ top: SP[2], right: SP[2], gap: SP[1], zIndex: Z.overlay, pointerEvents: 'none' }}
        >
          <button
            className="map-ctrl-btn"
            style={{ pointerEvents: 'auto' }}
            onClick={resetView}
            aria-label="Reset map view"
          >
            ↺ Reset
          </button>
          <button
            className={`map-ctrl-btn map-ctrl-btn--icon${isLocked ? ' map-ctrl-btn--locked' : ''}`}
            style={{ pointerEvents: 'auto' }}
            onClick={toggleLock}
            aria-label={isLocked ? 'Unlock map' : 'Lock map'}
          >
            {isLocked ? <Lock size={13} strokeWidth={2} /> : <LockOpen size={13} strokeWidth={2} />}
          </button>
        </div>
      )}
    </div>
  )
})

// ── Pan ──────────────────────────────────────────────────────
function setupPan(app: InstanceType<typeof import('pixi.js').Application>, isLockedRef: React.MutableRefObject<boolean>) {
  let panning    = false
  let panStart   = { x: 0, y: 0 }
  let stageStart = { x: 0, y: 0 }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stage = app.stage as any
  stage.eventMode = 'static'
  stage.hitArea   = new (PIXI!.Rectangle)(0, 0, app.screen.width, app.screen.height)

  stage.on('pointerdown', (e: { globalX: number; globalY: number; target: { name?: string } }) => {
    if (isLockedRef.current) return
    const tname = (e.target as { name?: string })?.name ?? ''
    if (tname === '' || tname === 'mapBg' || tname === 'grid') {
      panning    = true
      panStart   = { x: e.globalX, y: e.globalY }
      stageStart = { x: app.stage.x, y: app.stage.y }
    }
  })
  stage.on('pointermove', (e: { globalX: number; globalY: number }) => {
    if (!panning) return
    app.stage.x = stageStart.x + (e.globalX - panStart.x)
    app.stage.y = stageStart.y + (e.globalY - panStart.y)
  })
  const stopPan = () => { panning = false }
  stage.on('pointerup', stopPan)
  stage.on('pointerupoutside', stopPan)
}

// ── Zoom ──────────────────────────────────────────────────────
function setupZoom(
  app: InstanceType<typeof import('pixi.js').Application>,
  el: HTMLElement,
  isLockedRef: React.MutableRefObject<boolean>,
) {
  el.addEventListener('wheel', (e) => {
    e.preventDefault()
    if (isLockedRef.current) return
    const factor   = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(4, Math.max(0.25, app.stage.scale.x * factor))

    const rect   = (app.view as HTMLCanvasElement).getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldX = (mouseX - app.stage.x) / app.stage.scale.x
    const worldY = (mouseY - app.stage.y) / app.stage.scale.y
    app.stage.scale.set(newScale)
    app.stage.x = mouseX - worldX * newScale
    app.stage.y = mouseY - worldY * newScale
  }, { passive: false })
}

// ── Rebuild map background + grid ────────────────────────────
// Scales the image with Math.min (contain) so aspect ratio is preserved,
// then centres it. mapWRef/mapHRef track the rendered image dimensions;
// mapOffsetXRef/mapOffsetYRef track the top-left corner position within
// the canvas. Token normalised coords (0-1) are relative to the image bounds.
async function rebuildMap(
  app:           InstanceType<typeof import('pixi.js').Application>,
  px:            typeof import('pixi.js'),
  imageUrl:      string,
  gridEnabled:   boolean,
  gridSize:      number,
  mapWRef:       React.MutableRefObject<number>,
  mapHRef:       React.MutableRefObject<number>,
  mapOffsetXRef: React.MutableRefObject<number>,
  mapOffsetYRef: React.MutableRefObject<number>,
  wipeInProgressRef?: React.MutableRefObject<boolean>,
) {
  // Check if there is a previous map to wipe from
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hadPreviousMap = app.stage.children.some((c: any) => c.name === 'mapBg')

  // Remove old bg/grid layers
  const toRemove = app.stage.children.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.name === 'mapBg' || c.name === 'grid',
  )
  toRemove.forEach(c => app.stage.removeChild(c))

  // Skip wipe on first load (no previous map)
  if (!hadPreviousMap || !wipeInProgressRef) {
    const cw = app.screen.width
    const ch = app.screen.height

    try {
      const texture = await px.Assets.load(imageUrl)

      const scaleX = cw / texture.width
      const scaleY = ch / texture.height
      const scale  = Math.min(scaleX, scaleY)

      const mapW    = Math.round(texture.width  * scale)
      const mapH    = Math.round(texture.height * scale)
      const offsetX = Math.round((cw - mapW) / 2)
      const offsetY = Math.round((ch - mapH) / 2)

      mapWRef.current       = mapW
      mapHRef.current       = mapH
      mapOffsetXRef.current = offsetX
      mapOffsetYRef.current = offsetY

      const bg = new px.Sprite(texture)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(bg as any).name = 'mapBg'
      bg.x      = offsetX
      bg.y      = offsetY
      bg.width  = mapW
      bg.height = mapH
      bg.zIndex = 0
      app.stage.addChild(bg)

      if (gridEnabled && gridSize > 0) {
        const g = new px.Graphics()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(g as any).name = 'grid'
        g.zIndex = 1
        g.lineStyle(1, 0xffffff, 0.12)
        for (let x = offsetX; x <= offsetX + mapW; x += gridSize) {
          g.moveTo(x, offsetY); g.lineTo(x, offsetY + mapH)
        }
        for (let y = offsetY; y <= offsetY + mapH; y += gridSize) {
          g.moveTo(offsetX, y); g.lineTo(offsetX + mapW, y)
        }
        app.stage.addChild(g)
      }
    } catch (err) {
      console.error('[MapCanvas] Failed to load map texture:', err)
    }
    return
  }

  // Guard against concurrent wipes
  if (wipeInProgressRef.current) return
  wipeInProgressRef.current = true

  const cw = app.screen.width
  const ch = app.screen.height

  try {
    // Start wipe IN — runs concurrently with texture load
    const wipe = await runMapWipe(app, px)

    const texture = await px.Assets.load(imageUrl)

    const scaleX = cw / texture.width
    const scaleY = ch / texture.height
    const scale  = Math.min(scaleX, scaleY)

    const mapW    = Math.round(texture.width  * scale)
    const mapH    = Math.round(texture.height * scale)
    const offsetX = Math.round((cw - mapW) / 2)
    const offsetY = Math.round((ch - mapH) / 2)

    mapWRef.current       = mapW
    mapHRef.current       = mapH
    mapOffsetXRef.current = offsetX
    mapOffsetYRef.current = offsetY

    const bg = new px.Sprite(texture)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(bg as any).name = 'mapBg'
    bg.x      = offsetX
    bg.y      = offsetY
    bg.width  = mapW
    bg.height = mapH
    bg.zIndex = 0
    app.stage.addChild(bg)

    if (gridEnabled && gridSize > 0) {
      const g = new px.Graphics()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(g as any).name = 'grid'
      g.zIndex = 1
      g.lineStyle(1, 0xffffff, 0.12)
      for (let x = offsetX; x <= offsetX + mapW; x += gridSize) {
        g.moveTo(x, offsetY); g.lineTo(x, offsetY + mapH)
      }
      for (let y = offsetY; y <= offsetY + mapH; y += gridSize) {
        g.moveTo(offsetX, y); g.lineTo(offsetX + mapW, y)
      }
      app.stage.addChild(g)
    }

    // Wipe OUT — reveal the new map
    wipe.reveal()
    await wipe.done
  } catch (err) {
    console.error('[MapCanvas] Failed to load map texture:', err)
  } finally {
    wipeInProgressRef.current = false
  }
}

// ── Sync token sprites ────────────────────────────────────────
function syncTokens(
  app:                  InstanceType<typeof import('pixi.js').Application>,
  px:                   typeof import('pixi.js'),
  tokens:               MapToken[],
  isGM:                 boolean,
  currentCharId:        string | null,
  onMoveRef:            React.MutableRefObject<(id: string, x: number, y: number) => void>,
  onContextRef:         React.MutableRefObject<((id: string, e: MouseEvent) => void) | undefined>,
  onHoverRef:           React.MutableRefObject<((id: string, x: number, y: number, tokenRect: DOMRect) => void) | undefined>,
  onHoverEndRef:        React.MutableRefObject<((tokenId: string) => void) | undefined>,
  onDragStartRef:       React.MutableRefObject<((id: string) => void) | undefined>,
  onDragEndRef:         React.MutableRefObject<((id: string) => void) | undefined>,
  onClickRef:           React.MutableRefObject<((id: string, sourceRect: DOMRect) => void) | undefined>,
  containerRef:         React.RefObject<HTMLDivElement | null>,
  tokensRef:            React.MutableRefObject<Map<string, InstanceType<typeof import('pixi.js').Container>>>,
  mapWRef:              React.MutableRefObject<number>,
  mapHRef:              React.MutableRefObject<number>,
  mapOffsetXRef:        React.MutableRefObject<number>,
  mapOffsetYRef:        React.MutableRefObject<number>,
  draggingTokenIdRef:   React.MutableRefObject<string | null>,
  tokenScale:           number,
) {
  const existing = new Set(tokensRef.current.keys())

  for (const token of tokens) {
    const mapW    = mapWRef.current
    const mapH    = mapHRef.current
    const offsetX = mapOffsetXRef.current
    const offsetY = mapOffsetYRef.current

    if (tokensRef.current.has(token.id)) {
      const c = tokensRef.current.get(token.id)!
      // If token_image_url OR label changed, destroy and rebuild the sprite —
      // e.g. after uploading a token image, or a dossier nickname rename
      // patching `label` directly. The label `Text`/background-pill geometry
      // is only ever computed once at build time (buildTokenSprite), so an
      // in-place `.text` update would leave the pill mis-sized around the new
      // string; a full rebuild reuses the same already-correct layout math.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((c as any).__imageUrl !== (token.token_image_url ?? null) || (c as any).__label !== (token.label ?? null)) {
        destroyTokenHover(c, app.ticker)
        app.stage.removeChild(c)
        c.destroy({ children: true })
        tokensRef.current.delete(token.id)
        // Fall through to the build-new-sprite path below
      } else {
        // Skip position update for the token currently being dragged — remote
        // realtime events would otherwise snap it back to the last persisted position.
        if (draggingTokenIdRef.current !== token.id) {
          c.x = offsetX + token.x * mapW
          c.y = offsetY + token.y * mapH
        }
        c.scale.set(tokenScale)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(c as any)._baseScale = tokenScale
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(c as any).__applyLabelScale?.(tokenScale)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(c as any).alpha = (!isGM && !token.is_visible) ? 0 : (isGM && !token.is_visible ? 0.4 : 1)
        existing.delete(token.id)
        continue
      }
    }

    const canDrag = isGM || (token.participant_type === 'pc' && token.character_id === currentCharId)
    const sprite  = buildTokenSprite(
      px, token, canDrag,
      mapW, mapH, offsetX, offsetY,
      onMoveRef, onContextRef, onHoverRef, onHoverEndRef, onDragStartRef, onDragEndRef, onClickRef, containerRef, draggingTokenIdRef,
      mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef,
      tokenScale,
      app.ticker,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sprite as any).__imageUrl = token.token_image_url ?? null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sprite as any).__label = token.label ?? null
    sprite.scale.set(tokenScale)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sprite as any)._baseScale = tokenScale
    app.stage.addChild(sprite)
    tokensRef.current.set(token.id, sprite)
    existing.delete(token.id)
  }

  for (const staleId of existing) {
    const c = tokensRef.current.get(staleId)
    if (c) { destroyTokenHover(c, app.ticker); app.stage.removeChild(c); c.destroy({ children: true }) }
    tokensRef.current.delete(staleId)
  }
}

// ── Build a single token container ───────────────────────────
function buildTokenSprite(
  px:                  typeof import('pixi.js'),
  token:               MapToken,
  canDrag:             boolean,
  mapW:                number,
  mapH:                number,
  offsetX:             number,
  offsetY:             number,
  onMoveRef:           React.MutableRefObject<(id: string, x: number, y: number) => void>,
  onContextRef:        React.MutableRefObject<((id: string, e: MouseEvent) => void) | undefined>,
  onHoverRef:          React.MutableRefObject<((id: string, x: number, y: number, tokenRect: DOMRect) => void) | undefined>,
  onHoverEndRef:       React.MutableRefObject<((tokenId: string) => void) | undefined>,
  onDragStartRef:      React.MutableRefObject<((id: string) => void) | undefined>,
  onDragEndRef:        React.MutableRefObject<((id: string) => void) | undefined>,
  onClickRef:          React.MutableRefObject<((id: string, sourceRect: DOMRect) => void) | undefined>,
  containerRef:        React.RefObject<HTMLDivElement | null>,
  draggingTokenIdRef:  React.MutableRefObject<string | null>,
  mapWRef:             React.MutableRefObject<number>,
  mapHRef:             React.MutableRefObject<number>,
  mapOffsetXRef:       React.MutableRefObject<number>,
  mapOffsetYRef:       React.MutableRefObject<number>,
  tokenScale:          number,
  ticker:              InstanceType<typeof import('pixi.js').Ticker>,
): InstanceType<typeof import('pixi.js').Container> {
  // ── Pointer tokens — distinct shape, skip all standard rendering ──────────
  if (token.token_type?.startsWith('pointer_')) {
    const SIZE  = 24 * (token.token_size ?? 1)
    const HALF  = SIZE / 2
    const color = POINTER_COLOURS[token.token_type] ?? 0xffffff

    const c = new px.Container()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).name = `token-${token.id}`
    c.zIndex = 10

    const g = new px.Graphics()

    // Diamond: low-opacity fill + solid outline stroke
    g.lineStyle(2, color, 1)
    g.beginFill(color, 0.18)
    g.drawPolygon([0, -HALF, HALF, 0, 0, HALF, -HALF, 0])
    g.endFill()

    // Corner brackets: L-shapes just outside the diamond bounding box
    const BL = Math.max(5, HALF * 0.38)   // bracket leg length, scales with token
    const BO = HALF + 4                    // bracket offset from centre
    g.lineStyle(2.5, color, 1)
    // top-left
    g.moveTo(-BO, -BO + BL); g.lineTo(-BO, -BO); g.lineTo(-BO + BL, -BO)
    // top-right
    g.moveTo( BO - BL, -BO); g.lineTo( BO, -BO); g.lineTo( BO, -BO + BL)
    // bottom-right
    g.moveTo( BO,  BO - BL); g.lineTo( BO,  BO); g.lineTo( BO - BL,  BO)
    // bottom-left
    g.moveTo(-BO + BL,  BO); g.lineTo(-BO,  BO); g.lineTo(-BO,  BO - BL)

    // Centre dot
    g.lineStyle(0)
    g.beginFill(color, 1)
    g.drawCircle(0, 0, 3)
    g.endFill()

    c.addChild(g)
    attachTokenHover(c, px, 0xffffff, ticker, SIZE, false)
    c.x = offsetX + token.x * mapW
    c.y = offsetY + token.y * mapH
    c.scale.set(tokenScale)
    c.alpha = 1  // fast-path sync loop corrects visibility on next update

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).eventMode = 'static'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).cursor = canDrag ? 'pointer' : 'default'

    // Hover glow for pointer tokens
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).on('pointerover', () => { onTokenPointerOver(c, ticker) })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).on('pointerout', () => { onTokenPointerOut(c, ticker) })

    if (!canDrag) return c

    // GM drag — identical logic to standard tokens
    let dragging = false
    let offX = 0, offY = 0

    const onStageMove = (e: { globalX: number; globalY: number }) => {
      if (!dragging) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const local = (c.parent as any).toLocal({ x: e.globalX, y: e.globalY })
      c.x = local.x - offX
      c.y = local.y - offY
    }

    const onStageUp = () => {
      if (!dragging) return
      dragging = false
      draggingTokenIdRef.current = null
      onDragEndRef.current?.(token.id)
      c.zIndex = 10
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stage = c.parent as any
      stage.off('pointermove',      onStageMove)
      stage.off('pointerup',        onStageUp)
      stage.off('pointerupoutside', onStageUp)
      const nx = Math.max(0, Math.min(1, (c.x - mapOffsetXRef.current) / mapWRef.current))
      const ny = Math.max(0, Math.min(1, (c.y - mapOffsetYRef.current) / mapHRef.current))
      onMoveRef.current(token.id, nx, ny)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).on('pointerdown', (e: { stopPropagation: () => void; globalX: number; globalY: number }) => {
      e.stopPropagation()
      dragging = true
      draggingTokenIdRef.current = token.id
      onDragStartRef.current?.(token.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const local = (c.parent as any).toLocal({ x: e.globalX, y: e.globalY })
      offX = local.x - c.x
      offY = local.y - c.y
      c.zIndex = 20
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stage = c.parent as any
      stage.on('pointermove',      onStageMove)
      stage.on('pointerup',        onStageUp)
      stage.on('pointerupoutside', onStageUp)
    })

    return c
  }

  const SIZE   = 24 * (token.token_size ?? 1)
  const RADIUS = SIZE / 2
  const colour = BORDER_COLOURS[token.alignment ?? 'pc'] ?? 0xffffff
  const isRect = token.token_shape === 'rectangle'

  const c = new px.Container()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).name = `token-${token.id}`
  c.zIndex = 10
  c.sortableChildren = true

  const ring = new px.Graphics()
  ring.lineStyle(2, colour, 1)
  if (isRect) {
    ring.drawRoundedRect(-SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2, 4)
  } else {
    ring.drawCircle(0, 0, RADIUS + 1)
  }
  ring.zIndex = 2
  c.addChild(ring)

  attachTokenHover(c, px, colour, ticker, SIZE, isRect)

  if (token.token_image_url) {
    const mask = new px.Graphics()
    mask.beginFill(0xffffff)
    if (isRect) {
      mask.drawRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE)
    } else {
      mask.drawCircle(0, 0, RADIUS)
    }
    mask.endFill()

    const sprite   = px.Sprite.from(token.token_image_url)
    sprite.width   = SIZE
    sprite.height  = SIZE
    sprite.anchor.set(0.5)
    sprite.mask    = mask
    sprite.zIndex  = 1
    mask.zIndex    = 1
    c.addChild(mask, sprite)
  } else {
    const bg = new px.Graphics()
    bg.beginFill(colour, 0.2)
    if (isRect) {
      bg.drawRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE)
    } else {
      bg.drawCircle(0, 0, RADIUS)
    }
    bg.endFill()
    bg.zIndex = 1

    const initial = new px.Text(
      (token.label ?? '?')[0].toUpperCase(),
      { fontFamily: 'Cinzel, serif', fontSize: Math.round(RADIUS * 0.85), fill: colour },
    )
    initial.anchor.set(0.5)
    initial.zIndex = 2
    c.addChild(bg, initial)
  }

  if (token.wound_pct && token.wound_pct > 0) {
    const arc = new px.Graphics()
    arc.lineStyle(2, 0xe05252, 0.85)
    arc.arc(0, 0, RADIUS + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * token.wound_pct)
    arc.zIndex = 3
    c.addChild(arc)
  }

  // Label — crisp text on a solid pill background for readability against any map.
  // The label group is counter-scaled by 1/tokenScale so text stays at a fixed
  // screen size regardless of how large the token is. Its y position is adjusted
  // so the gap between the ring edge and the label top is always 4 screen pixels.
  const lbl = new px.Text(token.label ?? '', {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '700',
    fontSize:   10,
    fill:       0xF0E8C8,
    align:      'center',
  })
  lbl.resolution = 2
  lbl.anchor.set(0.5, 0.5)

  const PAD_X    = 5
  const PAD_Y    = 2
  const lblW     = lbl.width  + PAD_X * 2
  const lblH     = lbl.height + PAD_Y * 2

  const lblBg = new px.Graphics()
  lblBg.beginFill(0x060D09, 0.82)
  lblBg.lineStyle(0.75, colour, 0.55)
  lblBg.drawRoundedRect(-lblW / 2, -lblH / 2, lblW, lblH, 3)
  lblBg.endFill()

  const lblGroup = new px.Container()
  lblGroup.addChild(lblBg, lbl)
  lblGroup.zIndex = 4
  c.addChild(lblGroup) // added BEFORE the first applyLabelScale call below, so getLocalBounds() sees it

  // Keeps label at constant screen size and a fixed 4px gap below the ring.
  const applyLabelScale = (s: number) => {
    lblGroup.scale.set(1 / s)
    lblGroup.y = RADIUS + (4 + lblH / 2) / s
    // Explicit hitArea spanning the disc/rect through the label pill below it —
    // an explicit hitArea makes Pixi test this one shape for the whole
    // container instead of hit-testing each child graphic separately, which
    // was unreliable in practice (hover only fired over the name label, not
    // the disc itself). Computed from Pixi's own getLocalBounds() rather than
    // hand-rolled geometry — a manual rect here previously shrank the
    // hoverable region to near-nothing. Recomputed here (not just at build
    // time) since this fn also re-runs whenever tokenScale changes without a
    // full sprite rebuild.
    const b = c.getLocalBounds()
    const PAD = 4 // px intentional — small buffer so cursor jitter right at the edge doesn't repeatedly cross the boundary
    const hx = b.x - PAD, hy = b.y - PAD, hw = b.width + PAD * 2, hh = b.height + PAD * 2
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).hitArea = new px.Rectangle(hx, hy, hw, hh)

    // Prompt 13 Step 0 diagnostic — draws the ACTUAL hitArea as a visible
    // overlay so it can be compared against the rendered token. Off by
    // default (DEV_DEBUG_HOVER = false above); toggle that const to true to
    // see it. Reuses/redraws a single child rather than stacking a new
    // Graphics on every rescale.
    if (DEV_DEBUG_HOVER) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dbg = (c as any).__debugHitRect as InstanceType<typeof import('pixi.js').Graphics> | undefined
      if (!dbg) {
        dbg = new px.Graphics()
        dbg.zIndex = 999
        c.addChild(dbg)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(c as any).__debugHitRect = dbg
      }
      dbg.clear()
      dbg.beginFill(0xff00ff, 0.25)
      dbg.lineStyle(1, 0xff00ff, 1)
      dbg.drawRect(hx, hy, hw, hh)
      dbg.endFill()
    }
  }
  applyLabelScale(tokenScale)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).__applyLabelScale = applyLabelScale

  // Position using map image bounds (not canvas bounds)
  c.x = offsetX + token.x * mapW
  c.y = offsetY + token.y * mapH
  c.alpha = 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).eventMode = 'static'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).cursor = canDrag ? 'pointer' : 'default'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('rightclick', (e: { nativeEvent: MouseEvent }) => {
    onContextRef.current?.(token.id, e.nativeEvent)
  })

  // Hover — fire callback with screen coordinates derived from canvas rect.
  // No dwell/lock timer — the locked-tooltip mechanic was removed because it
  // created a document.body-portaled overlay with pointerEvents:'auto' that
  // silently swallowed pointerdown before Pixi's EventSystem ever saw it,
  // making the token permanently undraggable until the GM clicked elsewhere.
  //
  // hoverOutDebounce is still needed, independent of that removed lock timer:
  // Pixi fires a spurious pointerout/pointerover pair when the cursor crosses
  // from the token container onto an interactive child (e.g. the glow ring
  // Graphics added by attachTokenHover) without truly leaving the token's hit
  // area. Without absorbing that pair, the plain always-live tooltip driven by
  // onTokenHover/onTokenHoverEnd flickers hide/show/hide. 60ms matches the
  // original dwell-lock-era debounce.
  let hoverOutDebounce: ReturnType<typeof setTimeout> | null = null
  const cancelOutDebounce = () => {
    if (hoverOutDebounce) { clearTimeout(hoverOutDebounce); hoverOutDebounce = null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointerover', (e: { globalX: number; globalY: number }) => {
    cancelOutDebounce()          // re-entering: suppress the pending hide from a spurious out
    onTokenPointerOver(c, ticker)
    if (!onHoverRef.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    // getBounds() is Pixi's own global (renderer-space) bounding box — it already
    // accounts for stage zoom/pan/scale, so this stays correct at any camera state.
    const b = (c as any).getBounds()
    const tokenRect = new DOMRect(rect.left + b.x, rect.top + b.y, b.width, b.height)
    if (DEV_DEBUG_HOVER) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ha = (c as any).hitArea
      // eslint-disable-next-line no-console
      console.log('[hover-diag]' + JSON.stringify({
        tokenId: token.id,
        hitAreaLocal: ha ? { x: ha.x, y: ha.y, w: ha.width, h: ha.height } : null,
        containerGetBoundsGlobal: { x: b.x, y: b.y, w: b.width, h: b.height },
        canvasWrapperRect: { left: rect.left, top: rect.top, w: rect.width, h: rect.height },
        pointerScreen: { x: rect.left + e.globalX, y: rect.top + e.globalY },
        devicePixelRatio: window.devicePixelRatio,
      }))
    }
    onHoverRef.current(token.id, rect.left + e.globalX, rect.top + e.globalY, tokenRect)
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointerout', () => {
    // 60ms debounce: if pointerover fires again within this window (child-bubble
    // spurious pair), the cancelOutDebounce() above suppresses the hide call.
    hoverOutDebounce = setTimeout(() => {
      hoverOutDebounce = null
      onHoverEndRef.current?.(token.id)
    }, 60)
    onTokenPointerOut(c, ticker)
  })

  if (!canDrag) return c

  let dragging = false
  let offX = 0, offY = 0
  let downX = 0, downY = 0, moved = false

  // ── Stage-level handlers attached/detached per drag ──────────
  // Using the stage (c.parent) for pointermove/pointerup means the token
  // follows the cursor even when it moves faster than the token's hit area,
  // and coordinate conversion via toLocal() accounts for stage pan/zoom so
  // there is no speed mismatch between pointer and token.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onStageMove = (e: { globalX: number; globalY: number }) => {
    if (!dragging) return
    // Total Manhattan movement since pointerdown, in screen pixels — once past
    // the threshold this is a drag, not a tap, regardless of subsequent movement.
    if (!moved && (Math.abs(e.globalX - downX) + Math.abs(e.globalY - downY) > 4)) {
      moved = true
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const local = (c.parent as any).toLocal({ x: e.globalX, y: e.globalY })
    c.x = local.x - offX
    c.y = local.y - offY
  }

  const onStageUp = () => {
    if (!dragging) return
    dragging = false
    draggingTokenIdRef.current = null
    onDragEndRef.current?.(token.id)
    c.zIndex = 10
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stage = c.parent as any
    stage.off('pointermove',    onStageMove)
    stage.off('pointerup',      onStageUp)
    stage.off('pointerupoutside', onStageUp)
    if (moved) {
      // Use live ref values — captures current map bounds even if canvas resized since build
      const mW = mapWRef.current
      const mH = mapHRef.current
      const ox = mapOffsetXRef.current
      const oy = mapOffsetYRef.current
      const nx = Math.max(0, Math.min(1, (c.x - ox) / mW))
      const ny = Math.max(0, Math.min(1, (c.y - oy) / mH))
      onMoveRef.current(token.id, nx, ny)
    } else {
      // Pointer never moved past the threshold — a tap, not a drag.
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect && onClickRef.current) {
        const global = c.getGlobalPosition()
        const half = (24 * (token.token_size ?? 1)) / 2
        const rect = new DOMRect(
          containerRect.left + global.x - half,
          containerRect.top + global.y - half,
          half * 2, half * 2,
        )
        onClickRef.current(token.id, rect)
      } else {
        onClickRef.current?.(token.id, new DOMRect())
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointerdown', (e: { stopPropagation: () => void; globalX: number; globalY: number }) => {
    e.stopPropagation()
    dragging = true
    draggingTokenIdRef.current = token.id
    onDragStartRef.current?.(token.id)
    downX = e.globalX
    downY = e.globalY
    moved = false
    // Convert the pointer's canvas-pixel position into stage-local space so
    // offX/offY are in the same coordinate system as c.x/c.y.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const local = (c.parent as any).toLocal({ x: e.globalX, y: e.globalY })
    offX = local.x - c.x
    offY = local.y - c.y
    c.zIndex = 999
    // Attach move/up to the stage so events keep firing even when the
    // cursor leaves the token's hit area during a fast drag.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stage = c.parent as any
    stage.on('pointermove',    onStageMove)
    stage.on('pointerup',      onStageUp)
    stage.on('pointerupoutside', onStageUp)
  })

  return c
}
