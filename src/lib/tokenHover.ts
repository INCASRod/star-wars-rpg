/*
 * tokenHover.ts
 * Pixi.js token hover glow and scale animation.
 * Called from MapCanvas.tsx on pointerover/pointerout.
 *
 * Each token gets a glowRing Graphics child added on first hover setup.
 * The ring persists and is shown/hidden via alpha — no repeated construction.
 * Scale lift animates 1.0 → 1.08 on enter, 1.08 → 1.0 on exit.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyContainer = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTicker    = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PixiNS       = any

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ── Attach glow ring to a token container ─────────────────────

/** (Re)draws the glow ring to a w × h footprint. Circles use `w` as the diameter. */
function drawGlow(
  glowRing: AnyContainer,
  colour:   number,
  w:        number,
  h:        number,
  isRect:   boolean,
): void {
  const glowRadius = w / 2 + 4
  glowRing.clear()

  // Inner ring — brighter, thinner
  glowRing.lineStyle(3, colour, 0.7)
  if (isRect) {
    glowRing.drawRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 4)
  } else {
    glowRing.drawCircle(0, 0, glowRadius)
  }

  // Outer halo — dimmer, thicker
  glowRing.lineStyle(6, colour, 0.15)
  if (isRect) {
    glowRing.drawRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 6)
  } else {
    glowRing.drawCircle(0, 0, glowRadius + 3)
  }
}

/** Redraws an already-attached glow ring after the token's footprint changed. */
export function redrawTokenGlow(
  container: AnyContainer,
  colour:    number,
  w:         number,
  h:         number,
  isRect:    boolean,
): void {
  const glowRing = container.getChildByName('glowRing')
  if (glowRing) drawGlow(glowRing, colour, w, h, isRect)
}

export function attachTokenHover(
  container:  AnyContainer,
  px:         PixiNS,
  colour:     number,
  ticker:     AnyTicker,
  size:       number,
  isRect:     boolean,
  height:     number = size,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glowRing = new (px.Graphics as any)()
  glowRing.name   = 'glowRing'
  glowRing.alpha  = 0
  glowRing.zIndex = 1
  drawGlow(glowRing, colour, size, height, isRect)

  container.sortableChildren = true
  container.addChild(glowRing)

  // Hover state
  container._hoverActive   = false
  container._hoverScale    = 1.0
  container._glowAlpha     = 0
  container._baseAlpha     = container.alpha ?? 1
  container._baseScale     = container.scale.x
  container._hoverTickerFn = null
}

// ── Remove any active ticker listener ─────────────────────────

function removeHoverTicker(container: AnyContainer, ticker: AnyTicker): void {
  if (container._hoverTickerFn) {
    ticker.remove(container._hoverTickerFn)
    container._hoverTickerFn = null
  }
}

// ── Hover enter ───────────────────────────────────────────────

export function onTokenPointerOver(
  container: AnyContainer,
  ticker:    AnyTicker,
): void {
  // Capture current (tokenScale) as the rest-after-hover target
  container._restScale = container.scale?.x ?? 1.0

  container._hoverActive = true
  removeHoverTicker(container, ticker)

  const glowRing = container.getChildByName('glowRing')

  const fn = () => {
    if (!container._hoverActive) return

    // Lerp scale toward baseScale * 1.08
    const baseScale    = container._baseScale ?? 1.0
    const currentScale = container.scale?.x ?? baseScale
    // GM resize handles (MapCanvas, Phase C) set `_noHoverLift` so the token keeps its
    // true size while being resized - otherwise drag maths would read an 8%-inflated token.
    const targetScale  = baseScale * (container._noHoverLift ? 1.0 : 1.08)
    const nextScale    = lerp(currentScale, targetScale, 0.18)
    container.scale?.set(nextScale)

    // Lerp glow alpha toward 0.9
    if (glowRing) {
      const nextAlpha = lerp(glowRing.alpha, 0.9, 0.18)
      glowRing.alpha  = nextAlpha
    }

    // Settle check
    const scaleDone = Math.abs((container.scale?.x ?? baseScale) - targetScale) < 0.01
    const alphaDone = !glowRing || Math.abs(glowRing.alpha - 0.9) < 0.01

    if (scaleDone && alphaDone) {
      container.scale?.set(targetScale)
      if (glowRing) glowRing.alpha = 0.9
      removeHoverTicker(container, ticker)
    }
  }

  container._hoverTickerFn = fn
  ticker.add(fn)
}

// ── Hover exit ────────────────────────────────────────────────

export function onTokenPointerOut(
  container: AnyContainer,
  ticker:    AnyTicker,
): void {
  container._hoverActive = false
  removeHoverTicker(container, ticker)

  const glowRing = container.getChildByName('glowRing')
  // Lerp back toward the token's base scale (set at attachTokenHover time)
  const restScale = container._baseScale ?? 1.0

  const fn = () => {
    // Lerp scale toward restScale
    const currentScale = container.scale?.x ?? restScale
    const nextScale    = lerp(currentScale, restScale, 0.14)
    container.scale?.set(nextScale)

    // Lerp glow alpha toward 0
    if (glowRing) {
      const nextAlpha = lerp(glowRing.alpha, 0, 0.14)
      glowRing.alpha  = nextAlpha
    }

    // Settle check
    const scaleDone = Math.abs((container.scale?.x ?? restScale) - restScale) < 0.005
    const alphaDone = !glowRing || glowRing.alpha < 0.005

    if (scaleDone && alphaDone) {
      container.scale?.set(restScale)
      if (glowRing) glowRing.alpha = 0
      removeHoverTicker(container, ticker)
    }
  }

  container._hoverTickerFn = fn
  ticker.add(fn)
}

// ── Cleanup — call before container.destroy() ─────────────────

export function destroyTokenHover(
  container: AnyContainer,
  ticker:    AnyTicker,
): void {
  removeHoverTicker(container, ticker)

  const glowRing = container.getChildByName?.('glowRing')
  if (glowRing) {
    try { glowRing.destroy() } catch { /* already destroyed */ }
  }

  container._hoverActive   = undefined
  container._hoverScale    = undefined
  container._glowAlpha     = undefined
  container._baseAlpha     = undefined
  container._hoverTickerFn = undefined
  container._restScale     = undefined
}
