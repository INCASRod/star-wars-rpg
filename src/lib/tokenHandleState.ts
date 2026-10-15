/**
 * Shared, non-reactive flags between the on-canvas geometry handles
 * (`MapCanvas.tsx`, Phase C) and the DOM `TokenGeometryInspector`. Both react
 * to the same raw events (Escape, pointerdown) at the document level, and the
 * inspector's listeners run first, so it has to be able to ask "is a handle
 * involved?" without a React round-trip.
 *
 *  - `dragging`   — a handle drag is in progress. Escape then cancels the
 *                   DRAG (restoring the pre-drag geometry) instead of closing
 *                   the inspector.
 *  - `hitTest`    — set by MapCanvas while handles are showing: is this page
 *                   point (clientX/Y) on a handle or the rotation knob? The
 *                   inspector asks it on every press, so a press on a handle is
 *                   never mistaken for a click outside (which would close the
 *                   inspector and remove the handles mid-grab). A direct hit
 *                   test, not hover state: hover goes stale when a handle
 *                   moves under a stationary pointer.
 */
export const tokenHandleState: {
  dragging: boolean
  hitTest: ((clientX: number, clientY: number) => boolean) | null
} = {
  dragging: false,
  hitTest: null,
}
