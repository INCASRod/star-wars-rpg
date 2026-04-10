'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { MapToken } from '@/hooks/useMapTokens'

// Pixi.js v7 — loaded dynamically to avoid SSR issues
let PIXI: typeof import('pixi.js') | null = null

const BORDER_COLOURS: Record<string, number> = {
  pc:          0xC8AA50,  // gold
  allied_npc:  0x52e08a,  // green
  minion:      0xe05252,  // red
  rival:       0xFF9800,  // orange
  nemesis:     0xDC143C,  // crimson
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
  tokenScale?:         number   // GM-only visual scale multiplier; players always see 1.0
}

export function MapCanvas({
  mapImageUrl, tokens, isGM, currentCharacterId,
  onTokenMove, gridEnabled, gridSize, onTokenContextMenu,
  tokenScale = 1,
}: MapCanvasProps) {
  const containerRef       = useRef<HTMLDivElement>(null)
  const appRef             = useRef<InstanceType<typeof import('pixi.js').Application> | null>(null)
  const tokensRef          = useRef<Map<string, InstanceType<typeof import('pixi.js').Container>>>(new Map())
  const draggingTokenIdRef = useRef<string | null>(null)

  // Map image bounds within the canvas (updated by rebuildMap)
  const mapWRef       = useRef(800)
  const mapHRef       = useRef(600)
  const mapOffsetXRef = useRef(0)
  const mapOffsetYRef = useRef(0)

  // Always-current props ref — the async init closure reads this after it resolves
  const propsRef = useRef({ mapImageUrl, gridEnabled, gridSize })
  propsRef.current = { mapImageUrl, gridEnabled, gridSize }

  // ── Pixi bootstrap ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    import('pixi.js').then((px) => {
      if (destroyed || !containerRef.current) return
      PIXI = px

      const app = new px.Application({
        resizeTo:        containerRef.current,
        backgroundColor: 0x060D09,
        antialias:       true,
        resolution:      window.devicePixelRatio || 1,
        autoDensity:     true,
      }) as InstanceType<typeof import('pixi.js').Application>

      containerRef.current.appendChild(app.view as HTMLCanvasElement)
      appRef.current = app
      app.stage.sortableChildren = true

      setupPan(app)
      setupZoom(app, containerRef.current)

      // KEY: call rebuildMap NOW — the earlier effect already returned
      // because appRef was null when mapImageUrl first arrived.
      const { mapImageUrl: url, gridEnabled: ge, gridSize: gs } = propsRef.current
      if (url) {
        rebuildMap(app, px, url, ge, gs, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef)
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
    rebuildMap(app, PIXI, mapImageUrl, gridEnabled, gridSize, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef)
  }, [mapImageUrl, gridEnabled, gridSize])

  // ── Sync tokens ─────────────────────────────────────────────
  const onTokenMoveRef = useRef(onTokenMove)
  onTokenMoveRef.current = onTokenMove
  const onContextRef  = useRef(onTokenContextMenu)
  onContextRef.current = onTokenContextMenu

  const syncTokensCb = useCallback(() => {
    const app = appRef.current
    if (!app || !PIXI) return
    syncTokens(
      app, PIXI, tokens, isGM, currentCharacterId,
      onTokenMoveRef, onContextRef, tokensRef,
      mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef,
      draggingTokenIdRef, tokenScale,
    )
  }, [tokens, isGM, currentCharacterId, tokenScale])

  useEffect(() => { syncTokensCb() }, [syncTokensCb])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: 'grab', overflow: 'hidden' }}
    />
  )
}

// ── Pan ──────────────────────────────────────────────────────
function setupPan(app: InstanceType<typeof import('pixi.js').Application>) {
  let panning    = false
  let panStart   = { x: 0, y: 0 }
  let stageStart = { x: 0, y: 0 }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stage = app.stage as any
  stage.eventMode = 'static'
  stage.hitArea   = new (PIXI!.Rectangle)(0, 0, app.screen.width, app.screen.height)

  stage.on('pointerdown', (e: { globalX: number; globalY: number; target: { name?: string } }) => {
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
) {
  el.addEventListener('wheel', (e) => {
    e.preventDefault()
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
) {
  // Remove old bg/grid layers
  const toRemove = app.stage.children.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.name === 'mapBg' || c.name === 'grid',
  )
  toRemove.forEach(c => app.stage.removeChild(c))

  const cw = app.screen.width
  const ch = app.screen.height

  try {
    const texture = await px.Assets.load(imageUrl)

    // Uniform scale — contain within canvas, preserve aspect ratio
    const scaleX = cw / texture.width
    const scaleY = ch / texture.height
    const scale  = Math.min(scaleX, scaleY)

    const mapW    = Math.round(texture.width  * scale)
    const mapH    = Math.round(texture.height * scale)
    const offsetX = Math.round((cw - mapW) / 2)
    const offsetY = Math.round((ch - mapH) / 2)

    // Update refs so token positioning uses the correct bounds
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
}

// ── Sync token sprites ────────────────────────────────────────
function syncTokens(
  app:                 InstanceType<typeof import('pixi.js').Application>,
  px:                  typeof import('pixi.js'),
  tokens:              MapToken[],
  isGM:                boolean,
  currentCharId:       string | null,
  onMoveRef:           React.MutableRefObject<(id: string, x: number, y: number) => void>,
  onContextRef:        React.MutableRefObject<((id: string, e: MouseEvent) => void) | undefined>,
  tokensRef:           React.MutableRefObject<Map<string, InstanceType<typeof import('pixi.js').Container>>>,
  mapWRef:             React.MutableRefObject<number>,
  mapHRef:             React.MutableRefObject<number>,
  mapOffsetXRef:       React.MutableRefObject<number>,
  mapOffsetYRef:       React.MutableRefObject<number>,
  draggingTokenIdRef:  React.MutableRefObject<string | null>,
  tokenScale:          number,
) {
  const existing = new Set(tokensRef.current.keys())

  for (const token of tokens) {
    const mapW    = mapWRef.current
    const mapH    = mapHRef.current
    const offsetX = mapOffsetXRef.current
    const offsetY = mapOffsetYRef.current

    if (tokensRef.current.has(token.id)) {
      const c = tokensRef.current.get(token.id)!
      // Skip position update for the token currently being dragged — remote
      // realtime events would otherwise snap it back to the last persisted position.
      if (draggingTokenIdRef.current !== token.id) {
        c.x = offsetX + token.x * mapW
        c.y = offsetY + token.y * mapH
      }
      c.scale.set(tokenScale)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(c as any).alpha = (!isGM && !token.is_visible) ? 0 : (isGM && !token.is_visible ? 0.4 : 1)
      existing.delete(token.id)
      continue
    }

    const canDrag = isGM || (token.participant_type === 'pc' && token.character_id === currentCharId)
    const sprite  = buildTokenSprite(
      px, token, canDrag,
      mapW, mapH, offsetX, offsetY,
      onMoveRef, onContextRef, draggingTokenIdRef,
      mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef,
    )
    sprite.scale.set(tokenScale)
    app.stage.addChild(sprite)
    tokensRef.current.set(token.id, sprite)
    existing.delete(token.id)
  }

  for (const staleId of existing) {
    const c = tokensRef.current.get(staleId)
    if (c) { app.stage.removeChild(c); c.destroy({ children: true }) }
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
  draggingTokenIdRef:  React.MutableRefObject<string | null>,
  mapWRef:             React.MutableRefObject<number>,
  mapHRef:             React.MutableRefObject<number>,
  mapOffsetXRef:       React.MutableRefObject<number>,
  mapOffsetYRef:       React.MutableRefObject<number>,
): InstanceType<typeof import('pixi.js').Container> {
  const SIZE   = 24 * (token.token_size ?? 1)
  const RADIUS = SIZE / 2
  const colour = BORDER_COLOURS[token.alignment ?? 'pc'] ?? 0xffffff

  const c = new px.Container()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).name = `token-${token.id}`
  c.zIndex = 10
  c.sortableChildren = true

  const ring = new px.Graphics()
  ring.lineStyle(2, colour, 1)
  ring.drawCircle(0, 0, RADIUS + 1)
  ring.zIndex = 2
  c.addChild(ring)

  if (token.token_image_url) {
    const mask = new px.Graphics()
    mask.beginFill(0xffffff)
    mask.drawCircle(0, 0, RADIUS)
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
    bg.drawCircle(0, 0, RADIUS)
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

  const lbl = new px.Text(token.label ?? '', {
    fontFamily:         'Rajdhani, sans-serif',
    fontSize:           6,
    fill:               0xE8DFC8,
    align:              'center',
    dropShadow:         true,
    dropShadowDistance: 1,
    dropShadowColor:    0x000000,
  })
  lbl.anchor.set(0.5, 0)
  lbl.y      = RADIUS + 2
  lbl.zIndex = 4
  c.addChild(lbl)

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

  if (!canDrag) return c

  let dragging = false
  let offX = 0, offY = 0

  // ── Stage-level handlers attached/detached per drag ──────────
  // Using the stage (c.parent) for pointermove/pointerup means the token
  // follows the cursor even when it moves faster than the token's hit area,
  // and coordinate conversion via toLocal() accounts for stage pan/zoom so
  // there is no speed mismatch between pointer and token.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    c.zIndex = 10
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stage = c.parent as any
    stage.off('pointermove',    onStageMove)
    stage.off('pointerup',      onStageUp)
    stage.off('pointerupoutside', onStageUp)
    // Use live ref values — captures current map bounds even if canvas resized since build
    const mW = mapWRef.current
    const mH = mapHRef.current
    const ox = mapOffsetXRef.current
    const oy = mapOffsetYRef.current
    const nx = Math.max(0, Math.min(1, (c.x - ox) / mW))
    const ny = Math.max(0, Math.min(1, (c.y - oy) / mH))
    onMoveRef.current(token.id, nx, ny)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointerdown', (e: { stopPropagation: () => void; globalX: number; globalY: number }) => {
    e.stopPropagation()
    dragging = true
    draggingTokenIdRef.current = token.id
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
