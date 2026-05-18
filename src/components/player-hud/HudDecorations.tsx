'use client'

import { C } from './design-tokens'

export function CornerBrackets({ color = C.gold, size = 6 }: { color?: string; size?: number }) {
  const s: React.CSSProperties = { position: 'absolute', width: size, height: size }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  )
}

const BG_SCANLINE: React.CSSProperties = {
  position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
  backgroundImage: 'repeating-linear-gradient(0deg, transparent 2px, rgba(0,0,0,0.025) 4px)',
}
const BG_HEX_GRID_BASE: React.CSSProperties = {
  position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.03,
}
const BG_GLOW_TL: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, width: '40%', height: '40%', zIndex: 0, pointerEvents: 'none',
  background: 'radial-gradient(ellipse at 0% 0%, rgba(78,200,122,0.04) 0%, transparent 70%)',
}
const BG_GLOW_BR: React.CSSProperties = {
  position: 'absolute', bottom: 0, right: 0, width: '40%', height: '40%', zIndex: 0, pointerEvents: 'none',
  background: 'radial-gradient(ellipse at 100% 100%, rgba(90,40,24,0.05) 0%, transparent 70%)',
}
// CSS vars cannot be resolved inside inline SVG data URIs; stroke colour stays hardcoded.
// At opacity:0.03 (applied in BG_HEX_GRID_BASE) this is imperceptible across all themes.
const HEX_SVG_URL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="52"><polygon points="30,1 59,16 59,36 30,51 1,36 1,16" fill="none" stroke="#E03A1E" stroke-width="0.5"/></svg>`
)}")`

export function BackgroundEffects() {
  return (
    <>
      <div style={BG_SCANLINE} />
      <div style={{ ...BG_HEX_GRID_BASE, backgroundImage: HEX_SVG_URL }} />
      <div style={BG_GLOW_TL} />
      <div style={BG_GLOW_BR} />
    </>
  )
}
