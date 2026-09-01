'use client'
import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ItemTable } from '@/lib/itemIconResolver'

interface ItemReadoutPlateProps {
  /** Resolver output — resolveItemIcon(...).path. Always a real path (exact, donor, or fallback glyph). */
  iconUrl: string
  table: ItemTable
  /** Ref key (e.g. weapon_key), shown as the plate's REF designation. Null for custom items with no ref row. */
  refKey?: string | null
  categories?: string[]
  alt?: string
  /**
   * 'row'    — bare tinted artwork only, no plate frame/grid/brackets.
   *            Used at 44px thumbnail size — a full plate is illegible there.
   * 'detail' — full plate: border, coordinate grid, centrelines, corner
   *            brackets, scan-line hover pass. REF/category tags omitted —
   *            at this box's real on-screen size (48-58px) fixed-size text
   *            collided with the artwork (see below).
   * 'hero'   — same plate treatment as 'detail', at item-detail-panel scale
   *            (200px+ box). Large enough for REF designation (top-left) and
   *            category tags (bottom-right) to render without colliding with
   *            the artwork — the two labels 'detail' had to drop.
   */
  size: 'row' | 'detail' | 'hero'
}

/**
 * The artwork is a white-ink-on-transparent PNG. Tinting mechanism: CSS
 * mask-image using the PNG's alpha channel as the mask shape, with
 * background-color painting the visible pixels — this is fully theme-
 * reactive via var(--hud-accent)/var(--hud-gold) with zero JS recoloring,
 * canvas work, or per-theme image variants.
 */
function MaskedArtwork({ iconUrl, alt, color, width, height }: { iconUrl: string; alt?: string; color: string; width: string; height: string }) {
  return (
    <div
      role="img"
      aria-label={alt ?? ''}
      style={{
        width,
        height,
        backgroundColor: color,
        WebkitMaskImage: `url(${iconUrl})`,
        maskImage: `url(${iconUrl})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

function CornerBrackets() {
  const armLen = 8
  const base: React.CSSProperties = { position: 'absolute', width: armLen, height: armLen, pointerEvents: 'none' }
  const c = 'var(--hud-border-strong)'
  return (
    <>
      <div style={{ ...base, top: 0, left: 0, borderTop: `1px solid ${c}`, borderLeft: `1px solid ${c}` }} />
      <div style={{ ...base, top: 0, right: 0, borderTop: `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
      <div style={{ ...base, bottom: 0, left: 0, borderBottom: `1px solid ${c}`, borderLeft: `1px solid ${c}` }} />
      <div style={{ ...base, bottom: 0, right: 0, borderBottom: `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
    </>
  )
}

export function ItemReadoutPlate({ iconUrl, alt, size, refKey, categories, table }: ItemReadoutPlateProps) {
  const reducedMotion = usePrefersReducedMotion()

  if (size === 'row') {
    // Bare artwork only — no frame, no grid, no brackets at 44px.
    return <MaskedArtwork iconUrl={iconUrl} alt={alt} color="var(--hud-gold)" width="2rem" height="2rem" />
  }

  const isHero = size === 'hero'

  return (
    <div
      className="item-readout-plate"
      style={{
        position: 'relative',
        width: '100%', height: '100%',
        border: '1px solid var(--hud-border)',
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        // Faint coordinate grid — decorative, drawn from the same border
        // token as everything else on the plate, not a new color.
        backgroundImage:
          'linear-gradient(color-mix(in srgb, var(--hud-border) 60%, transparent) 1px, transparent 1px),' +
          'linear-gradient(90deg, color-mix(in srgb, var(--hud-border) 60%, transparent) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
        backgroundColor: 'var(--hud-surface-lo)',
      }}
    >
      {/* dashed centrelines */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0, height: 0,
        borderTop: '1px dashed color-mix(in srgb, var(--hud-border-hi) 80%, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0, width: 0,
        borderLeft: '1px dashed color-mix(in srgb, var(--hud-border-hi) 80%, transparent)',
        pointerEvents: 'none',
      }} />

      <CornerBrackets />

      {/* artwork, centred — 84%/72% of the plate (blueprint-treatment-v3.html
          proportions), independent width/height so a landscape illustration
          isn't boxed into a square before mask-size:contain ever runs. This
          leaves an 8%/14% margin clear of the corner brackets on every side
          at any source aspect ratio. REF designation and category tags used
          to render here too, but at this plate's real on-screen size (48-58px
          on both current consumers) fixed-size text always overflowed and
          collided with the artwork — removed rather than gated behind a
          larger variant that doesn't exist yet; see docs/architecture.md. */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MaskedArtwork iconUrl={iconUrl} alt={alt} color="var(--hud-gold)" width="84%" height="72%" />
      </div>

      {/* REF designation + category tags — hero scale only. The box is
          large enough here (200px+) that fixed-size text clears the
          artwork; see the 'detail'-scale note above for why they're absent
          there. */}
      {isHero && refKey && (
        <div style={{
          position: 'absolute', top: '0.625rem', left: '1.5rem',
          fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.2em',
          color: 'var(--hud-gold)', opacity: 0.85, pointerEvents: 'none',
        }}>
          REF·{table === 'weapon' ? 'WPN' : table === 'armor' ? 'ARM' : 'GEA'}·{refKey}
        </div>
      )}
      {isHero && categories && categories.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '0.625rem', right: '1.5rem',
          fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--hud-text-faint)', pointerEvents: 'none',
        }}>
          {categories.join(' · ')}
        </div>
      )}

      {/* scan-line pass on hover — decorative overlay only, transform+opacity
          animate on this absolutely-positioned inner div alone, never the
          plate/card/any ancestor, so nothing here can gate first-paint
          visibility of the artwork/frame/grid above. */}
      {!reducedMotion && <div className="item-readout-plate-scan" />}
    </div>
  )
}
