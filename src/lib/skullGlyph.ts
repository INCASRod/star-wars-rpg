// ═══════════════════════════════════════════════════════════════════════════
// Shared "defeated" skull glyph (Prompt 19) — single geometry source used by
// BOTH renderers so the map token (Pixi canvas) and the player tooltip (DOM)
// never draw visually different skulls:
//   - SkullGlyph.tsx renders this path data directly as JSX for the DOM
//     (tooltip watermark + minion pip micro-stamp).
//   - MapCanvas.tsx rasterizes `skullSvgMarkup()` into an Image and loads it
//     as a Pixi texture — Pixi can't read CSS custom properties, so that path
//     takes static hex colors instead of the DOM component's CSS vars.
// ═══════════════════════════════════════════════════════════════════════════

export const SKULL_VIEWBOX    = '0 0 64 64'
export const SKULL_DOME_PATH  = 'M32 6C18.7 6 9 15.8 9 28.2c0 7.4 3.6 13.3 9 17v7.2c0 1.8 1.4 3.2 3.2 3.2h2.6v-6h4v6h8.4v-6h4v6h2.6c1.8 0 3.2-1.4 3.2-3.2v-7.2c5.4-3.7 9-9.6 9-17C55 15.8 45.3 6 32 6Z'
export const SKULL_NOSE_PATH  = 'M32 34.5 28.5 42h7L32 34.5Z'
export const SKULL_LEFT_EYE   = { cx: 22.5, cy: 28, rx: 6, ry: 7 }
export const SKULL_RIGHT_EYE  = { cx: 41.5, cy: 28, rx: 6, ry: 7 }

// Pixi canvas rendering can't read CSS custom properties (same constraint as
// this file's existing BORDER_COLOURS/wound-arc hex constants in
// MapCanvas.tsx) — these mirror the DOM component's default
// var(--hud-text)/var(--hud-bg) values in the Ember Tatooine palette.
export const SKULL_BONE_HEX = '#e8ddd0'
export const SKULL_HOLE_HEX = '#0b0806'

/** Full standalone <svg> markup for the skull glyph at given static hex colors — used to build a data-URI texture for Pixi. `fillHex` is the bone silhouette, `holeHex` is the eye/nose cutout. */
export function skullSvgMarkup(fillHex: string, holeHex: string): string {
  // width/height (not just viewBox) matter here — this markup gets rasterized
  // into an HTMLImageElement for the Pixi texture (see MapCanvas.tsx), and an
  // <svg> with no intrinsic size defaults to the browser's 300×150
  // replaced-element size, not its viewBox. Pinning both keeps
  // naturalWidth/Height a known 64×64 so the Pixi-side scale math has a
  // fixed baseline to work from.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="${SKULL_VIEWBOX}">`
    + `<path fill="${fillHex}" d="${SKULL_DOME_PATH}"/>`
    + `<ellipse cx="${SKULL_LEFT_EYE.cx}" cy="${SKULL_LEFT_EYE.cy}" rx="${SKULL_LEFT_EYE.rx}" ry="${SKULL_LEFT_EYE.ry}" fill="${holeHex}"/>`
    + `<ellipse cx="${SKULL_RIGHT_EYE.cx}" cy="${SKULL_RIGHT_EYE.cy}" rx="${SKULL_RIGHT_EYE.rx}" ry="${SKULL_RIGHT_EYE.ry}" fill="${holeHex}"/>`
    + `<path fill="${holeHex}" d="${SKULL_NOSE_PATH}"/>`
    + `</svg>`
}
