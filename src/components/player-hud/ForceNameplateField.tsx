'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Z } from '@/lib/tokens'

// ── H9 — Force nameplate shader, ONE shared canvas ──────────────────────────
//
// Architecture (decided, Step 0): a single WebGL context for every Force
// card's header, never one context per card — browsers cap contexts
// (~8-16), and this project already cut Three.js from a surface once for
// exactly this class of reason (see PresenceSmoke.tsx's own history). This
// file follows PresenceSmoke's teardown pattern exactly:
// setAnimationLoop(null) -> ResizeObserver.disconnect() ->
// geometry/material/renderer .dispose() -> DOM removal (no gsap tweens on
// numeric targets here, so no killTweensOf calls are needed — uTime is
// driven directly from a THREE.Clock, not a tween).
//
// Masking: full-viewport canvas, `pointer-events:none`, mounted ON TOP of
// the fan (later in DOM than the cards) rather than behind them — a
// deliberate deviation from "behind", stated in Step 0f: the header sits
// nested inside `.card`'s own OPAQUE background, so a plain transparent
// header wouldn't reveal a canvas positioned behind the whole fan, it would
// reveal `.card`'s own gradient instead. Punching an exact header-shaped
// hole through `.card`'s background would need real CSS-mask surgery on the
// card's structure — the "significant extra work" this prompt explicitly
// permits declining. Painting on top at low alpha (matching PresenceSmoke's
// own 0.16 convention) reads as a shimmer over the header text without
// obscuring it, and is exactly this prompt's own offered Option A: feed each
// nameplate's rect as a uniform, paint only those regions.
//
// Per-frame rect tracking: `headerEl.getBoundingClientRect()` for up to
// MAX_RECTS (8) header elements — NOT the hundreds of DOM reads "expensive
// rect reads" usually implies. GSAP drives every card's transform via
// `el.style.transform` only (a compositor-only property, never invalidates
// layout), so these reads never force a page-wide reflow; they're a plain
// batch of ~8 cheap geometry queries at the top of one rAF callback, nothing
// interleaved with a write. This was chosen over reconstructing each card's
// transform from `gsap.getProperty` + manual matrix math (translate,
// off-center `transform-origin: 50% 118%` rotation, hand-container anchor)
// specifically BECAUSE that hand-rolled math is what H8 already got wrong
// twice before landing on the correct pivot-lever geometry — the browser's
// own rect query is exact by construction (rotation, pivot and all) where
// hand-rolled math is a fragile approximation. The rect is a rectangular
// approximation of the header's own clip-path silhouette (a few px of
// corner-notch bleed, same tolerance H8's fan-width fix already accepted).
const MAX_RECTS = 8

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

// Same value-noise/fbm construction as PresenceSmoke.tsx (no external noise
// lib, no texture asset) — reused technique, not a new one. `uCenters`/
// `uHalves` are screen-pixel-space rects (top-left-origin, JS convention);
// gl_FragCoord is bottom-left-origin, flipped once via `uResolution.y`. Each
// rect gets its own local UV (0..1 within its own box) so the noise pattern
// scales with the header's own size, not the full canvas.
const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  uniform vec2  uResolution;
  uniform int   uCount;
  uniform vec2  uCenters[${MAX_RECTS}];
  uniform vec2  uHalves[${MAX_RECTS}];
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
    vec2 fragPx = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
    float alpha = 0.0;
    for (int i = 0; i < ${MAX_RECTS}; i++) {
      if (i >= uCount) break;
      vec2 half2 = uHalves[i];
      vec2 d = abs(fragPx - uCenters[i]);
      if (d.x > half2.x || d.y > half2.y) continue;
      vec2 local = (fragPx - (uCenters[i] - half2)) / (half2 * 2.0);
      float drift = uTime * 0.12;
      float n = fbm(local * 4.0 + vec2(drift, -drift * 1.4));
      float fleck = smoothstep(0.90, 0.98, fbm(local * 10.0 - vec2(drift * 2.2, 0.0)));
      float a = smoothstep(0.30, 0.75, n) * 0.20 + fleck * 0.55;
      alpha = max(alpha, a);
    }
    gl_FragColor = vec4(uColor, alpha);
  }
`

export interface ForceNameplateFieldProps {
  /** Same Map HandOverlay's H8 layout effect already keys card DOM elements
      by — reused, not a second registry. */
  cardRefs: React.RefObject<Map<string, HTMLDivElement>>
  /** Keys of currently-visible Force cards only (kind === 'force') — bounded
      by owned base powers, realistically 1-8 (Step 0b). Recomputed by
      HandOverlay whenever fan membership changes; read fresh every frame via
      a ref so this component never needs to re-run its mount effect. */
  forceCardKeys: string[]
}

/** ONE shared canvas for every Force nameplate. Mount/unmount IS the gate —
    matches ForcePresenceCard's own established convention for PresenceSmoke
    ("closing the Force tab unmounts this, running its full cleanup rather
    than merely hiding a still-rendering canvas"). HandOverlay only renders
    this when the hand isn't tucked AND at least one Force card is visible;
    reduced motion never renders it at all (caller's responsibility, same
    split ForcePresenceCard already uses between its own static wash and this
    component). */
export function ForceNameplateField({ cardRefs, forceCardKeys }: ForceNameplateFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const keysRef = useRef(forceCardKeys)
  keysRef.current = forceCardKeys
  // Lazily-populated, invalidated whenever a key's cached header element no
  // longer matches what cardRefs currently holds for that key (a card
  // remounting — e.g. discard/return — gets a fresh DOM node under the same
  // key). Avoids re-querying the DOM every frame for cards that haven't
  // changed.
  const headerCacheRef = useRef<Map<string, { owner: HTMLDivElement; header: HTMLElement }>>(new Map())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    // Capped at 1 for the same reason PresenceSmoke caps it — soft diffuse
    // noise, not a sharp-edged asset; keeps per-frame fragment count flat
    // regardless of display pixel ratio.
    renderer.setPixelRatio(1)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new THREE.PlaneGeometry(2, 2)

    const forceSparkHex = getComputedStyle(document.documentElement).getPropertyValue('--force-spark').trim()
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime:       { value: 0 },
        uColor:      { value: new THREE.Color(forceSparkHex || '#9060d0') },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uCount:      { value: 0 },
        uCenters:    { value: Array.from({ length: MAX_RECTS }, () => new THREE.Vector2()) },
        uHalves:     { value: Array.from({ length: MAX_RECTS }, () => new THREE.Vector2()) },
      },
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const resize = () => {
      const w = window.innerWidth || 1
      const h = window.innerHeight || 1
      renderer.setSize(w, h, false)
      ;(material.uniforms.uResolution.value as THREE.Vector2).set(w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)

    const clock = new THREE.Clock()
    let running = true

    function headerFor(key: string): HTMLElement | null {
      const owner = cardRefs.current?.get(key)
      if (!owner) { headerCacheRef.current.delete(key); return null }
      const cached = headerCacheRef.current.get(key)
      if (cached && cached.owner === owner) return cached.header
      const header = owner.querySelector<HTMLElement>('[data-force-nameplate]')
      if (!header) { headerCacheRef.current.delete(key); return null }
      headerCacheRef.current.set(key, { owner, header })
      return header
    }

    function frame() {
      if (!running) return
      const centers = material.uniforms.uCenters.value as THREE.Vector2[]
      const halves  = material.uniforms.uHalves.value as THREE.Vector2[]
      let count = 0
      for (const key of keysRef.current) {
        if (count >= MAX_RECTS) break
        const header = headerFor(key)
        if (!header) continue
        const r = header.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        centers[count].set(r.left + r.width / 2, r.top + r.height / 2)
        halves[count].set(r.width / 2, r.height / 2)
        count++
      }
      material.uniforms.uCount.value = count
      material.uniforms.uTime.value = clock.getElapsedTime()
      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(frame)

    return () => {
      running = false
      renderer.setAnimationLoop(null)
      ro.disconnect()
      headerCacheRef.current.clear()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    // Mount-once lifecycle — forceCardKeys is read live via keysRef inside
    // the loop, same convention as PresenceSmoke's stateRef for axis/surge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: Z.popover }}
    />
  )
}
