"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          zIndex: 300,
          fontFamily: 'var(--font-rajdhani)',
        },
      }}
      style={
        {
          "--normal-bg": "var(--bs-panel)",
          "--normal-text": "var(--bs-ink)",
          "--normal-border": "var(--bs-bdr-strong)",
          "--border-radius": "2px",
          zIndex: 300,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
