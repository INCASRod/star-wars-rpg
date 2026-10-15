/**
 * Per-placement token footprint (migration 145).
 *
 * `map_tokens.token_w` / `token_h` / `token_rot` size and turn ONE token
 * placement on ONE map. They are in base units (1.0 = TOKEN_BASE_PX, the same
 * unit as `token_size`) and are multiplied by `maps.token_scale` at render time
 * like every other token dimension — they never touch other tokens or the map.
 *
 * Fallback rule: null `token_w` / `token_h` fall back to `token_size` (itself
 * default 1.0), so a row with no geometry renders exactly as it did before the
 * columns existed. Circle tokens stay circular: they use min(w, h) for both
 * axes. Rectangles use the full w × h. Pointer tokens (`token_type`
 * `pointer_*`) never call this — they ignore all three fields.
 */

export const TOKEN_BASE_PX = 24
/** Smallest footprint edge in pixels — keeps masks/scales away from zero. */
const MIN_EDGE_PX = 4

export interface TokenGeometryInput {
  token_size?:  number | null
  token_w?:     number | null
  token_h?:     number | null
  token_rot?:   number | null
  token_shape?: 'circle' | 'rectangle' | string | null
}

export interface TokenGeometry {
  /** Footprint width in pixels (before maps.token_scale). */
  w: number
  /** Footprint height in pixels (before maps.token_scale). */
  h: number
  rotDeg: number
  rotRad: number
}

const positive = (v: number | null | undefined): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0

export function resolveTokenGeometry(t: TokenGeometryInput): TokenGeometry {
  const base = positive(t.token_size) ? t.token_size : 1
  let w = Math.max(MIN_EDGE_PX, (positive(t.token_w) ? t.token_w : base) * TOKEN_BASE_PX)
  let h = Math.max(MIN_EDGE_PX, (positive(t.token_h) ? t.token_h : base) * TOKEN_BASE_PX)
  if (t.token_shape !== 'rectangle') { const d = Math.min(w, h); w = d; h = d }
  const rotDeg = typeof t.token_rot === 'number' && Number.isFinite(t.token_rot) ? t.token_rot : 0
  return { w, h, rotDeg, rotRad: (rotDeg * Math.PI) / 180 }
}

/** Stable comparison key — equal keys mean nothing visual needs to change. */
export function tokenGeometryKey(g: TokenGeometry): string {
  return `${g.w}|${g.h}|${g.rotDeg}`
}
