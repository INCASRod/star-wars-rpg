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
}

export function MapCanvas({
  mapImageUrl, tokens, isGM, currentCharacterId,
  onTokenMove, gridEnabled, gridSize, onTokenContextMenu,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef       = useRef<InstanceType<typeof import('pixi.js').Application> | null>(null)
  const tokensRef    = useRef<Map<string, InstanceType<typeof import('pixi.js').Container>>>(new Map())
  const mapWRef      = useRef(800)
  const mapHRef      = useRef(600)

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

      mapWRef.current = app.screen.width
      mapHRef.current = app.screen.height

      setupPan(app)
      setupZoom(app, containerRef.current)

      app.stage.sortableChildren = true
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

  // ── Rebuild map bg + grid when map or grid settings change ──
  useEffect(() => {
    const app = appRef.current
    if (!app || !PIXI || !mapImageUrl) return
    rebuildMap(app, PIXI, mapImageUrl, gridEnabled, gridSize, mapWRef, mapHRef)
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
      onTokenMoveRef, onContextRef, tokensRef, mapWRef, mapHRef,
    )
  }, [tokens, isGM, currentCharacterId])

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
  let panning  = false
  let panStart = { x: 0, y: 0 }
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

    // Zoom toward cursor
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
function rebuildMap(
  app:         InstanceType<typeof import('pixi.js').Application>,
  px:          typeof import('pixi.js'),
  imageUrl:    string,
  gridEnabled: boolean,
  gridSize:    number,
  mapWRef:     React.MutableRefObject<number>,
  mapHRef:     React.MutableRefObject<number>,
) {
  // Remove old bg/grid layers
  const toRemove = app.stage.children.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.name === 'mapBg' || c.name === 'grid',
  )
  toRemove.forEach(c => app.stage.removeChild(c))

  const w = app.screen.width
  const h = app.screen.height
  mapWRef.current = w
  mapHRef.current = h

  const bg = px.Sprite.from(imageUrl)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(bg as any).name   = 'mapBg'
  bg.width  = w
  bg.height = h
  bg.zIndex = 0
  app.stage.addChild(bg)

  if (gridEnabled && gridSize > 0) {
    const g  = new px.Graphics()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(g as any).name = 'grid'
    g.zIndex = 1
    g.lineStyle(1, 0xffffff, 0.12)
    for (let x = 0; x <= w; x += gridSize) {
      g.moveTo(x, 0); g.lineTo(x, h)
    }
    for (let y = 0; y <= h; y += gridSize) {
      g.moveTo(0, y); g.lineTo(w, y)
    }
    app.stage.addChild(g)
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
) {
  const existing = new Set(tokensRef.current.keys())

  for (const token of tokens) {
    const mapW = mapWRef.current
    const mapH = mapHRef.current

    if (tokensRef.current.has(token.id)) {
      // Update position only (avoids full rebuild on every move)
      const c = tokensRef.current.get(token.id)!
      c.x = token.x * mapW
      c.y = token.y * mapH
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(c as any).alpha = (!isGM && !token.is_visible) ? 0 : (isGM && !token.is_visible ? 0.4 : 1)
      existing.delete(token.id)
      continue
    }

    const canDrag = isGM || (token.participant_type === 'pc' && token.character_id === currentCharId)
    const sprite  = buildTokenSprite(px, token, canDrag, mapW, mapH, onMoveRef, onContextRef)
    app.stage.addChild(sprite)
    tokensRef.current.set(token.id, sprite)
    existing.delete(token.id)
  }

  // Remove stale sprites
  for (const staleId of existing) {
    const c = tokensRef.current.get(staleId)
    if (c) { app.stage.removeChild(c); c.destroy({ children: true }) }
    tokensRef.current.delete(staleId)
  }
}

// ── Build a single token container ───────────────────────────
function buildTokenSprite(
  px:           typeof import('pixi.js'),
  token:        MapToken,
  canDrag:      boolean,
  mapW:         number,
  mapH:         number,
  onMoveRef:    React.MutableRefObject<(id: string, x: number, y: number) => void>,
  onContextRef: React.MutableRefObject<((id: string, e: MouseEvent) => void) | undefined>,
): InstanceType<typeof import('pixi.js').Container> {
  const SIZE   = 48 * (token.token_size ?? 1)
  const RADIUS = SIZE / 2
  const colour = BORDER_COLOURS[token.alignment ?? 'pc'] ?? 0xffffff

  const c = new px.Container()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).name   = `token-${token.id}`
  c.zIndex = 10
  c.sortableChildren = true

  // Border ring
  const ring = new px.Graphics()
  ring.lineStyle(3, colour, 1)
  ring.drawCircle(0, 0, RADIUS + 2)
  ring.zIndex = 2
  c.addChild(ring)

  // Image or letter fallback
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

  // Wound arc
  if (token.wound_pct && token.wound_pct > 0) {
    const arc = new px.Graphics()
    arc.lineStyle(4, 0xe05252, 0.85)
    arc.arc(0, 0, RADIUS + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * token.wound_pct)
    arc.zIndex = 3
    c.addChild(arc)
  }

  // Name label
  const lbl = new px.Text(token.label ?? '', {
    fontFamily:          'Rajdhani, sans-serif',
    fontSize:            11,
    fill:                0xE8DFC8,
    align:               'center',
    dropShadow:          true,
    dropShadowDistance:  1,
    dropShadowColor:     0x000000,
  })
  lbl.anchor.set(0.5, 0)
  lbl.y      = RADIUS + 4
  lbl.zIndex = 4
  c.addChild(lbl)

  // Position
  c.x = token.x * mapW
  c.y = token.y * mapH

  // Visibility (GM sees hidden tokens at 40%; players don't see them)
  c.alpha = 1

  // Right-click context menu
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).eventMode = 'static'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).cursor    = canDrag ? 'pointer' : 'default'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('rightclick', (e: { nativeEvent: MouseEvent }) => {
    onContextRef.current?.(token.id, e.nativeEvent)
  })

  if (!canDrag) return c

  let dragging = false
  let offX = 0, offY = 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointerdown', (e: { stopPropagation: () => void; globalX: number; globalY: number }) => {
    e.stopPropagation()
    dragging = true
    offX = e.globalX - c.x
    offY = e.globalY - c.y
    c.zIndex = 999
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointermove', (e: { globalX: number; globalY: number }) => {
    if (!dragging) return
    c.x = e.globalX - offX
    c.y = e.globalY - offY
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointerup', () => {
    if (!dragging) return
    dragging = false
    c.zIndex = 10
    const nx = Math.max(0, Math.min(1, c.x / mapW))
    const ny = Math.max(0, Math.min(1, c.y / mapH))
    onMoveRef.current(token.id, nx, ny)
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(c as any).on('pointerupoutside', () => {
    if (!dragging) return
    dragging = false
    c.zIndex = 10
    const nx = Math.max(0, Math.min(1, c.x / mapW))
    const ny = Math.max(0, Math.min(1, c.y / mapH))
    onMoveRef.current(token.id, nx, ny)
  })

  return c
}
