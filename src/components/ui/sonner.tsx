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
          fontFamily: 'var(--font-chakra)',
        },
      }}
      style={
        {
          "--normal-bg": "var(--parch)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--bdr)",
          "--border-radius": "2px",
          zIndex: 300,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
