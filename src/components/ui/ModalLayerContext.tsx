'use client'

import { createContext, useContext } from 'react'
import { Z } from '@/lib/tokens'

/** The two stacking layers a modal uses: its scrim and its panel. */
export interface ModalLayers {
  backdrop: number
  modal:    number
}

/** Player view and everywhere outside the GM shell. */
export const DEFAULT_MODAL_LAYERS: ModalLayers = { backdrop: Z.backdrop, modal: Z.modal }

/** GM shell: modals must cover the GM left rail and top bar. */
export const GM_MODAL_LAYERS: ModalLayers = { backdrop: Z.gmModalBackdrop, modal: Z.gmModal }

/**
 * GmShell wraps its tree once with GM_MODAL_LAYERS. Every modal reads its layers from here
 * instead of hardcoding Z.modal / Z.backdrop, so the same component stacks correctly in the
 * GM view and stays exactly as before in the player view. Portals keep React context, so
 * modals rendered into document.body still see the provider.
 */
export const ModalLayerContext = createContext<ModalLayers>(DEFAULT_MODAL_LAYERS)

export function useModalLayers(): ModalLayers {
  return useContext(ModalLayerContext)
}
