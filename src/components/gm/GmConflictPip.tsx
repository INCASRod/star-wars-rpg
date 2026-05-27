'use client'

import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Z } from '@/lib/tokens'
import { FONT_BODY as FONT } from '@/lib/tokens'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'

const TOOLTIP_W = 240

interface TooltipPos {
  left:    number
  openUp:  boolean
  anchorY: number
  vh:      number
}

interface GmConflictPipProps {
  conflict:   GmConflictRow
  onResolve?: (id: string) => void
}

export function GmConflictPip({ conflict, onResolve }: GmConflictPipProps) {
  const [tooltipOpen, setTooltipOpen]             = useState(false)
  const [tipPos, setTipPos]                       = useState<TooltipPos>({ left: 0, openUp: true, anchorY: 0, vh: 0 })
  const [confirmingResolve, setConfirmingResolve] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    if (tooltipOpen) { setTooltipOpen(false); setConfirmingResolve(false); return }
    if (btnRef.current) {
      const r   = btnRef.current.getBoundingClientRect()
      const vw  = window.innerWidth
      const vh  = window.innerHeight
      const left = Math.max(8, Math.min(r.left + r.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 8))
      const openUp = r.top >= 220
      setTipPos({ left, openUp, anchorY: openUp ? r.top : r.bottom, vh })
    }
    setTooltipOpen(true)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Purple circle pip */}
      <div
        ref={btnRef}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle() } }}
        aria-label={conflict.description ?? 'Conflict'}
        style={{
          width:        10,
          height:       10,
          borderRadius: '50%',
          background:   'rgba(144,96,208,0.8)',
          border:       '1px solid rgba(144,96,208,0.4)',
          cursor:       'pointer',
          flexShrink:   0,
        }}
      />

      {tooltipOpen && createPortal(
        <>
          {/* Click-away backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: Z.backdrop }}
            onClick={() => { setTooltipOpen(false); setConfirmingResolve(false) }}
          />
          <div style={{
            position:             'fixed',
            left:                 tipPos.left,
            ...(tipPos.openUp
              ? { bottom: tipPos.vh - tipPos.anchorY + 10 }
              : { top: tipPos.anchorY + 10 }),
            zIndex:               Z.tooltip,
            width:                TOOLTIP_W,
            background:           'var(--hud-surface-hi)',
            backdropFilter:       'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border:               '1px solid rgba(144,96,208,0.35)',
            borderRadius:         8,
            padding:              '10px 12px',
            boxShadow:            '0 8px 24px rgba(0,0,0,0.8)',
          }}>
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setTooltipOpen(false); setConfirmingResolve(false) }}
              style={{
                position:   'absolute', top: 6, right: 6,
                background: 'none', border: 'none', padding: '2px 4px',
                cursor:     'pointer', lineHeight: 1,
                fontFamily: FONT, fontSize: '0.7rem',
                color:      'rgba(144,96,208,0.5)',
              }}
              aria-label="Close"
            >✕</button>

            {/* Category label */}
            <div style={{
              fontFamily:    FONT,
              fontSize:      'clamp(0.55rem, 0.85vw, 0.62rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color:         'rgba(144,96,208,0.8)',
              marginBottom:  3,
            }}>
              Conflict
            </div>

            {/* Description (title) */}
            <div style={{
              fontFamily:   FONT,
              fontSize:     'clamp(0.82rem, 1.3vw, 0.95rem)',
              color:        '#9060D0',
              fontWeight:   700,
              marginBottom: 6,
            }}>
              {conflict.description ?? 'Conflict'}
            </div>

            <div style={{ height: 1, background: 'rgba(144,96,208,0.2)', marginBottom: 6 }} />

            {/* Narrative */}
            {conflict.narrative && (
              <div style={{
                fontFamily:   FONT,
                fontSize:     'clamp(0.78rem, 1.2vw, 0.9rem)',
                color:        'var(--hud-text)',
                lineHeight:   1.5,
                marginBottom: 6,
              }}>
                {conflict.narrative}
              </div>
            )}

            {/* Session label */}
            {conflict.session_label && (
              <>
                <div style={{ height: 1, background: 'rgba(144,96,208,0.15)', marginBottom: 6 }} />
                <div style={{
                  fontFamily: FONT,
                  fontSize:   'clamp(0.52rem, 0.82vw, 0.6rem)',
                  color:      'var(--hud-text-faint)',
                }}>
                  {conflict.session_label}
                </div>
              </>
            )}

            {/* Resolve button — initial state */}
            {onResolve && !confirmingResolve && (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmingResolve(true) }}
                style={{
                  marginTop:     8,
                  width:         '100%',
                  background:    'rgba(144,96,208,0.1)',
                  border:        '1px solid rgba(144,96,208,0.3)',
                  borderRadius:  4,
                  padding:       '4px 0',
                  fontFamily:    FONT,
                  fontSize:      'clamp(0.7rem, 1.1vw, 0.8rem)',
                  fontWeight:    700,
                  letterSpacing: '0.08em',
                  color:         '#9060D0',
                  cursor:        'pointer',
                }}
              >
                ✓ Resolve Conflict
              </button>
            )}

            {/* Resolve button — confirm state */}
            {onResolve && confirmingResolve && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  fontFamily:   FONT,
                  fontSize:     'clamp(0.78rem, 1.2vw, 0.88rem)',
                  color:        'var(--hud-text)',
                  textAlign:    'center',
                  marginBottom: 6,
                }}>
                  Resolve <strong style={{ color: '#9060D0' }}>{conflict.description ?? 'this conflict'}</strong>?
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onResolve(conflict.id)
                      setTooltipOpen(false)
                      setConfirmingResolve(false)
                    }}
                    style={{
                      flex:         1,
                      padding:      '4px 0',
                      background:   'rgba(144,96,208,0.12)',
                      border:       '1px solid rgba(144,96,208,0.4)',
                      borderRadius: 3,
                      fontFamily:   FONT,
                      fontSize:     'clamp(0.7rem, 1.1vw, 0.78rem)',
                      fontWeight:   700,
                      color:        '#9060D0',
                      cursor:       'pointer',
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmingResolve(false) }}
                    style={{
                      flex:         1,
                      padding:      '4px 0',
                      background:   'transparent',
                      border:       '1px solid rgba(150,168,180,0.2)',
                      borderRadius: 3,
                      fontFamily:   FONT,
                      fontSize:     'clamp(0.7rem, 1.1vw, 0.78rem)',
                      fontWeight:   700,
                      color:        'rgba(150,168,180,0.5)',
                      cursor:       'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}
