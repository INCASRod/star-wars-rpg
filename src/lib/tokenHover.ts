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

export function attachTokenHover(
  container:  AnyContainer,
  px:         PixiNS,
  colour:     number,
  ticker:     AnyTicker,
  size:       number,
  isRect:     boolean,
): void {
  const radius     = size / 2
  const glowRadius = radius + 4

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glowRing = new (px.Graphics as any)()
  glowRing.name   = 'glowRing'
  glowRing.alpha  = 0
  glowRing.zIndex = 1

  // Inner ring — brighter, thinner
  glowRing.lineStyle(3, colour, 0.7)
  if (isRect) {
    glowRing.drawRoundedRect(-radius - 4, -radius - 4, size + 8, size + 8, 4)
  } else {
    glowRing.drawCircle(0, 0, glowRadius)
  }

  // Outer halo — dimmer, thicker
  glowRing.lineStyle(6, colour, 0.15)
  if (isRect) {
    glowRing.drawRoundedRect(-radius - 7, -radius - 7, size + 14, size + 14, 6)
  } else {
    glowRing.drawCircle(0, 0, glowRadius + 3)
  }

  container.sortableChildren = true
  container.addChild(glowRing)

  // Hover state
  container._hoverActive   = false
  container._hoverScale    = 1.0
  container._glowAlpha     = 0
  container._baseAlpha     = container.alpha ?? 1
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

    // Lerp scale toward 1.08
    const currentScale = container.scale?.x ?? 1
    const targetScale  = 1.08
    const nextScale    = lerp(currentScale, targetScale, 0.18)
    container.scale?.set(nextScale)

    // Lerp glow alpha toward 0.9
    if (glowRing) {
      const nextAlpha = lerp(glowRing.alpha, 0.9, 0.18)
      glowRing.alpha  = nextAlpha
    }

    // Settle check
    const scaleDone = Math.abs((container.scale?.x ?? 1) - targetScale) < 0.01
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
  // Restore base scale before hover (stored tokenScale, not necessarily 1.0)
  // We lerp back toward the pre-hover scale. Use 1.0 as the resting hover scale target.
  const restScale = container._restScale ?? 1.0

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
