'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

// ── Force Presence — ambient alignment smoke (Prompt B2) ─────────────────────
//
// KOTOR homage — alignment smoke intentionally uses red/blue, NOT the app's
// violet dark-side token. Do not unify. This is a deliberate exception to the
// design-token system: the whole point of this layer is a colour pair the
// token system doesn't have. A WebGL shader uniform can't consume a CSS
// custom property any more than an SVG stroke/fill can (tokens.ts's
// ACCENT_HEX carries the same "CSS vars unsupported in this rendering
// context" exception) — this is that same exception, applied here.
const KOTOR_RED_HEX     = 0xb03020
const KOTOR_BLUE_HEX    = 0x3080c8
const NEUTRAL_SMOKE_HEX = 0xd8ccb8 // off-white/warm neutral — axis 0 (Balanced)

// CSS-string forms of the exact same three colours, exported for the
// reduced-motion static wash in ForcePresenceCard.tsx — single source of
// truth, never a second literal set to drift out of sync with these.
export const KOTOR_RED_CSS     = '#b03020'
export const KOTOR_BLUE_CSS    = '#3080c8'
export const NEUTRAL_SMOKE_CSS = '#d8ccb8'

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

// Single fullscreen plane, poor-man's-Perlin value noise (no external noise
// lib, no texture asset) — 3 fbm octaves for soft organic wisps, a vertical
// band mask biasing density toward the pip scale (~55% down the card,
// thinning to the tally/edges), slow upward scroll + horizontal wander driven
// entirely by uTime. uColor/uOpacity/uSpeed are the only per-frame JS inputs.
const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSpeed;
  uniform vec3  uColor;
  varying vec2  vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0; float amp = 0.5;
    for (int i = 0; i < 3; i++) { v += amp * noise(p); p *= 2.0; amp *= 0.5; }
    return v;
  }

  void main() {
    vec2 drift = vec2(sin(uTime * 0.15) * 0.10, -uTime * 0.06 * uSpeed);
    float n = fbm(vUv * 3.0 + drift);
    float band = clamp(1.0 - abs(vUv.y - 0.55) * 1.5, 0.0, 1.0);
    float alpha = smoothstep(0.35, 0.85, n) * band * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`

/** axis in [-1, 1] -> smoke colour. Shared axis convention with
 * ForcePresenceCard's own accentColorFor — same clamp, same sign meaning
 * (negative = Dark, positive = Light). Never recompute axis independently. */
function colorForAxis(axis: number): THREE.Color {
  const t = Math.min(1, Math.abs(axis))
  const toward = axis >= 0 ? KOTOR_BLUE_HEX : KOTOR_RED_HEX
  return new THREE.Color(NEUTRAL_SMOKE_HEX).lerp(new THREE.Color(toward), t)
}

export interface PresenceSmokeProps {
  /** Clamped [-1, 1], identical value ForcePresenceCard's accentColorFor and
   * mote drift already use — passed down, never recomputed here. */
  axis: number
  /** Ceremony edge, mirrored verbatim from ForcePresenceCard's own `ceremony`
   * state (Fall on 'dark', Paragon on 'light') — the same transition-edge
   * detection that already gates the ceremony overlay, not a second watcher. */
  surge: 'light' | 'dark' | null
}

// Budget: one 2-triangle plane, one fragment shader pass, renderer pixel
// ratio capped at 1.5 — no particle system, no per-frame JS geometry work,
// just three uniform writes per frame. Chosen over particle sprites because
// there is no discrete puff shape to preserve here; pure noise-driven
// diffusion needs zero texture asset and zero per-particle CPU/GC churn, only
// GPU-side noise — the cheapest path to "soft organic smoke" at this scale.
export function PresenceSmoke({ axis, surge }: PresenceSmokeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ axis, surge })
  stateRef.current = { axis, surge }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    // Capped at 1 regardless of devicePixelRatio — this is soft diffuse smoke,
    // not a sharp-edged asset; the softening from rendering at 1x and letting
    // the browser's normal image scaling handle any HiDPI upscale is a net
    // win, not a visible loss, and keeps the fragment shader's per-frame
    // pixel count from scaling with the display's pixel ratio at all. Live
    // frame-time measurement drove this down from an initial 1.5 cap after
    // that cap alone dropped a measured 60fps (reduced-motion, no canvas)
    // baseline to ~40fps with the layer running.
    renderer.setPixelRatio(1)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader:   VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent:    true,
      depthTest:      false,
      depthWrite:     false,
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 0.16 },
        uSpeed:   { value: 1 },
        uColor:   { value: colorForAxis(stateRef.current.axis) },
      },
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const resize = () => {
      const w = container.clientWidth || 1
      const h = container.clientHeight || 1
      renderer.setSize(w, h, false)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // Colour/density are driven by GSAP tweens on plain numeric targets
    // (opacity, speed, and a 0..1 lerp progress toward the current target
    // colour) — mirrors how ForcePresenceCard/PresenceFlash already drive
    // every other numeric animation in this feature via gsap, rather than
    // inventing a second animation mechanism for this one layer.
    const anim = { opacity: 0.16, speed: 1 }
    const colorTarget = new THREE.Color().copy(material.uniforms.uColor.value as THREE.Color)
    let lastAxis = stateRef.current.axis
    let lastSurge: 'light' | 'dark' | null = null

    const clock = new THREE.Clock()
    let running = true

    function frame() {
      if (!running) return
      const { axis: currentAxis, surge: currentSurge } = stateRef.current

      // Flip sweep — colour target retargeted on every axis change, tweened
      // over the same 300ms (--ease-smooth) window ForcePresenceCard's own
      // border-color/state-word CSS transitions use, so the whole card reads
      // as one synchronized move rather than the smoke lagging behind.
      if (currentAxis !== lastAxis) {
        lastAxis = currentAxis
        gsap.to(colorTarget, { r: colorForAxis(currentAxis).r, g: colorForAxis(currentAxis).g, b: colorForAxis(currentAxis).b, duration: 0.3, ease: 'power2.out' })
      }

      // Threshold surge — momentarily denser + faster, rushing toward fully
      // saturated colour, then settles as the ceremony overlay itself
      // resolves (ForcePresenceCard clears `ceremony` on its own timeline's
      // onComplete — this only reacts to that same edge, never re-detects).
      if (currentSurge !== lastSurge) {
        if (currentSurge) {
          const surgeColor = currentSurge === 'dark' ? KOTOR_RED_HEX : KOTOR_BLUE_HEX
          gsap.to(colorTarget, { r: new THREE.Color(surgeColor).r, g: new THREE.Color(surgeColor).g, b: new THREE.Color(surgeColor).b, duration: 0.5, ease: 'power2.out' })
          gsap.to(anim, { opacity: 0.34, speed: 2.4, duration: 0.4, ease: 'power2.out' })
        } else {
          gsap.to(colorTarget, { r: colorForAxis(currentAxis).r, g: colorForAxis(currentAxis).g, b: colorForAxis(currentAxis).b, duration: 0.6, ease: 'power2.inOut' })
          gsap.to(anim, { opacity: 0.16, speed: 1, duration: 0.6, ease: 'power2.inOut' })
        }
        lastSurge = currentSurge
      }

      material.uniforms.uTime.value = clock.getElapsedTime()
      material.uniforms.uOpacity.value = anim.opacity
      material.uniforms.uSpeed.value = anim.speed
      ;(material.uniforms.uColor.value as THREE.Color).copy(colorTarget)
      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(frame)

    return () => {
      running = false
      renderer.setAnimationLoop(null)
      gsap.killTweensOf(colorTarget)
      gsap.killTweensOf(anim)
      ro.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    // Mount-once lifecycle — axis/surge are read live via stateRef inside the
    // animation loop instead of restarting the renderer on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    />
  )
}
