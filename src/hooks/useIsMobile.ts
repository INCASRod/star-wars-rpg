import { useState, useEffect } from 'react'

/**
 * Mobile/desktop determination by SHORT SIDE, not raw width — a phone in
 * landscape (e.g. 844x390) has a short side of ~390px and must still count
 * as mobile; a tablet (e.g. 820x1180) has a short side of 820px and must
 * stay desktop in both orientations. min(width,height) < breakpoint is
 * exactly `(max-width: Npx) or (max-height: Npx)` — a comma-separated
 * media query list, which is itself an OR — so a single matchMedia query
 * expresses the rule with no manual resize/orientationchange listener and
 * no debouncing needed: `change` only fires when the evaluated boolean
 * actually flips, which already can't thrash on intermediate resize values
 * the way a raw pixel-tracking listener could. It also fires on orientation
 * change for free, since rotation changes width/height, which changes
 * which (if either) query matches (see the FIX prompt this was built for:
 * some browsers fire only one of resize/orientationchange, not both — this
 * approach doesn't depend on either specific event).
 *
 * Known, accepted consequence (per the FIX prompt): a short, wide desktop
 * window (e.g. 1200x600) now has a short side of 600px and renders the
 * mobile shell where it previously rendered desktop. Not special-cased.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px), (max-height: ${breakpoint - 1}px)`)
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}
