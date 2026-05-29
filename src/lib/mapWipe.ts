/*
 * mapWipe.ts
 * Pixi.js map wipe transition system.
 * Three wipe types randomly selected per transition:
 *   - diagonal: angled band sweeps left-to-right
 *   - horizontal: full-width bar pushes right
 *   - iris: circular aperture contracts to cover, then expands to reveal
 *
 * Usage:
 *   const wipe = await runMapWipe(app, px)
 *   // add new map sprite here
 *   wipe.reveal()
 *   await wipe.done
 */

import type * as PIXI from 'pixi.js'
import { Z } from '@/lib/tokens'

type PixiApp = InstanceType<typeof PIXI.Application>
type PixiNS  = typeof PIXI

export type WipeType = 'diagonal' | 'horizontal' | 'iris'

export interface MapWipeHandle {
  reveal: () => void   // triggers wipe OUT
  done:   Promise<void> // resolves when wipe OUT completes
}

const WIPE_COLOR    = 0x060D09
const WIPE_DURATION = 400 // ms per half (in or out)

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// ── Draw functions ────────────────────────────────────────────
// progress 0→1 = wipe IN (increasingly covered)
// progress 1→0 (via 1-p passed from reveal) = wipe OUT (decreasingly covered)

function drawHorizontal(
  g: InstanceType<typeof PIXI.Graphics>,
  w: number, h: number,
  progress: number,
): void {
  g.clear()
  if (progress <= 0) return
  g.beginFill(WIPE_COLOR)
  g.drawRect(0, 0, progress * w, h)
  g.endFill()
}

function drawDiagonal(
  g: InstanceType<typeof PIXI.Graphics>,
  w: number, h: number,
  progress: number,
): void {
  g.clear()
  if (progress <= 0) return
  const angle = h * 0.3 // skew amount
  // Leading edge x-position at the top of the canvas
  const leadX = progress * (w + angle) - angle
  // Filled polygon from left edge to the diagonal leading edge
  g.beginFill(WIPE_COLOR)
  g.drawPolygon([
    0,                          0,
    0,                          h,
    Math.max(0, leadX + angle), h,
    Math.max(0, leadX),         0,
  ])
  g.endFill()
}

function drawIris(
  g: InstanceType<typeof PIXI.Graphics>,
  w: number, h: number,
  progress: number,
): void {
  g.clear()
  const maxRadius = Math.sqrt(w * w + h * h) / 2 * 1.1
  // progress=0 → radius=max (big hole, mostly open)
  // progress=1 → radius=0  (no hole, fully covered)
  const radius = (1 - progress) * maxRadius
  if (radius <= 0) {
    // Fully covered — just fill rect
    g.beginFill(WIPE_COLOR)
    g.drawRect(0, 0, w, h)
    g.endFill()
    return
  }
  // Fill canvas then cut out circular hole
  g.beginFill(WIPE_COLOR)
  g.drawRect(0, 0, w, h)
  g.beginHole()
  g.drawCircle(w / 2, h / 2, radius)
  g.endHole()
  g.endFill()
}

function drawWipe(
  g:        InstanceType<typeof PIXI.Graphics>,
  type:     WipeType,
  w:        number,
  h:        number,
  progress: number,
): void {
  if (type === 'horizontal') drawHorizontal(g, w, h, progress)
  else if (type === 'diagonal') drawDiagonal(g, w, h, progress)
  else drawIris(g, w, h, progress)
}

// ── Main export ───────────────────────────────────────────────

export async function runMapWipe(app: PixiApp, px: PixiNS): Promise<MapWipeHandle> {
  const types: WipeType[] = ['diagonal', 'horizontal', 'iris']
  const type = types[Math.floor(Math.random() * 3)]

  const graphics = new px.Graphics() as InstanceType<typeof PIXI.Graphics>
  ;(graphics as unknown as Record<string, unknown>)['name'] = 'mapWipe'
  graphics.zIndex = Z.tooltip
  app.stage.addChild(graphics)
  app.stage.sortChildren()

  const w = app.screen.width
  const h = app.screen.height

  // ── Wipe IN ────────────────────────────────────────────────
  return new Promise<MapWipeHandle>(resolveHandle => {
    let elapsed    = 0
    let appDestroyed = false

    const onTick = () => {
      if (appDestroyed || !app.ticker) return
      elapsed += app.ticker.deltaMS
      const raw     = Math.min(elapsed / WIPE_DURATION, 1)
      const eased   = easeInOut(raw)
      drawWipe(graphics, type, w, h, eased)

      if (raw >= 1) {
        app.ticker.remove(onTick)

        // ── Wipe OUT setup ──────────────────────────────────
        let revealCalled = false
        let resolveDone!: () => void
        const done = new Promise<void>(r => { resolveDone = r })

        const reveal = () => {
          if (revealCalled) return
          revealCalled = true

          let revealElapsed = 0
          const onRevealTick = () => {
            if (appDestroyed || !app.ticker) {
              resolveDone()
              return
            }
            revealElapsed += app.ticker.deltaMS
            const rRaw   = Math.min(revealElapsed / WIPE_DURATION, 1)
            const rEased = easeInOut(rRaw)
            // Reverse: 1-rEased goes 1→0 (full coverage → no coverage)
            drawWipe(graphics, type, w, h, 1 - rEased)

            if (rRaw >= 1) {
              app.ticker.remove(onRevealTick)
              try { app.stage.removeChild(graphics) } catch { /* already removed */ }
              graphics.destroy()
              resolveDone()
            }
          }
          app.ticker.add(onRevealTick)
        }

        // Provide a way for the unmount handler to bail out cleanly
        ;(graphics as unknown as Record<string, unknown>)['_setDestroyed'] = () => {
          appDestroyed = true
        }

        resolveHandle({ reveal, done })
      }
    }

    app.ticker.add(onTick)

    // Allow unmount to flag this wipe as dead
    ;(graphics as unknown as Record<string, unknown>)['_setDestroyed'] = () => {
      appDestroyed = true
    }
  })
}
