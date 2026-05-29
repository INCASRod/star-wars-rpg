"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { FONT_BODY, Z } from '@/lib/tokens'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          zIndex: Z.toast,
          fontFamily: FONT_BODY,
        },
      }}
      style={
        {
          "--normal-bg": "var(--hud-panel)",
          "--normal-text": "var(--hud-text)",
          "--normal-border": "var(--hud-border-strong)",
          "--border-radius": "2px",
          zIndex: Z.toast,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
