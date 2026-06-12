'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { FONT_BODY, FONT_DISPLAY, FS, RADIUS, Z } from '@/lib/tokens'
import type { StowLocation, StowLocationType, StowableAsset } from '@/lib/types'

// ── Stow location visual config ──────────────────────────────────────────────

export const STOW_COLOR: Record<StowLocationType, string> = {
  vehicle:            'var(--die-success)',
  starship:           'var(--die-advantage)',
  safe_house:         'var(--hud-gold)',
  base_of_operations: 'var(--hud-accent-purple)',
}

export const STOW_ICON: Record<StowLocationType, string> = {
  vehicle:            '▶',
  starship:           '◈',
  safe_house:         '◆',
  base_of_operations: '★',
}

const STOW_TYPE_LABEL: Record<'vehicle' | 'starship' | 'safe_house', string> = {
  vehicle:   'Vehicle',
  starship:  'Starship',
  safe_house:'Safe House',
}

// ── StowPill ─────────────────────────────────────────────────────────────────

export function StowPill({ location }: { location: StowLocation }) {
  const color = STOW_COLOR[location.type]
  const icon  = STOW_ICON[location.type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
      padding: '1px 0.4375rem', borderRadius: RADIUS.xl,
      background: `color-mix(in srgb, ${color} 9%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 27%, transparent)`,
      fontFamily: FONT_BODY, fontSize: 'var(--text-overline)',
      color, letterSpacing: '0.04em', flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {icon} {location.name}
    </span>
  )
}

// ── StowLocationModal ─────────────────────────────────────────────────────────

interface StowLocationModalProps {
  itemName:             string
  stowableAssets:       StowableAsset[]
  baseOfOperationsName: string | null
  onConfirm:            (location: StowLocation | null) => void
  onCancel:             () => void
}

export function StowLocationModal({
  itemName, stowableAssets, baseOfOperationsName, onConfirm, onCancel,
}: StowLocationModalProps) {
  const BOO_VALUE = '__boo__'
  const defaultVal = baseOfOperationsName
    ? BOO_VALUE
    : stowableAssets[0]?.id ?? ''

  const [selected, setSelected] = useState(defaultVal)

  const hasOptions = !!baseOfOperationsName || stowableAssets.length > 0

  const handleConfirm = () => {
    if (!selected) {
      onConfirm(null)
      return
    }
    if (selected === BOO_VALUE) {
      onConfirm({ id: null, name: baseOfOperationsName!, type: 'base_of_operations' })
      return
    }
    const asset = stowableAssets.find(a => a.id === selected)
    if (asset) onConfirm({ id: asset.id, name: asset.name, type: asset.type })
    else        onConfirm(null)
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 cursor-pointer"
        style={{ zIndex: Z.dialog, background: 'color-mix(in srgb, black 65%, transparent)' }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: Z.dialog,
        width: 'clamp(300px, 36vw, 420px)',
        background: 'var(--hud-surface-hi)',
        border: '1px solid var(--hud-border-hi)',
        borderRadius: RADIUS.lg,
        padding: 'var(--space-5) 1.375rem',
        boxShadow: '0 16px 48px color-mix(in srgb, black 75%, transparent)',
      }}>
        {/* Header */}
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 'var(--text-body-sm)',
          fontWeight: 700, color: 'var(--hud-gold)', marginBottom: 'var(--space-1)',
        }}>
          Stow Item
        </div>
        <div style={{
          fontFamily: FONT_BODY, fontSize: 'var(--text-label)',
          color: 'var(--hud-text-dim)', marginBottom: '0.875rem', lineHeight: 1.4,
        }}>
          Where would you like to stow{' '}
          <span style={{ color: 'var(--hud-text)', fontWeight: 600 }}>{itemName}</span>?
        </div>

        <div style={{ height: 1, background: 'var(--hud-border)', marginBottom: 'var(--space-4)' }} />

        {/* Location picker */}
        {hasOptions ? (
          <>
            <div style={{
              fontFamily: FONT_BODY, fontSize: 'var(--text-overline)',
              fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--hud-text-faint)', marginBottom: 'var(--space-2)',
            }}>
              Storage Location
            </div>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-2) 0.625rem',
                background: 'var(--hud-surface-lo)',
                border: '1px solid var(--hud-border)',
                borderRadius: RADIUS.md,
                color: 'var(--hud-text)',
                fontFamily: FONT_BODY, fontSize: 'var(--text-label)',
                outline: 'none', cursor: 'pointer',
                marginBottom: '1.125rem',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888' opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.625rem center',
                paddingRight: '1.75rem',
              }}
            >
              <option value="">— No specific location —</option>
              {baseOfOperationsName && (
                <option value={BOO_VALUE}>
                  ★ {baseOfOperationsName} (Base of Operations)
                </option>
              )}
              {stowableAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {STOW_ICON[a.type]} {a.name} ({STOW_TYPE_LABEL[a.type as keyof typeof STOW_TYPE_LABEL] ?? a.type}){a.is_group_storage ? ' [Shared]' : ''}
                </option>
              ))}
            </select>

            {/* Preview pill for selected location */}
            {selected && selected !== '' && (
              <div style={{ marginBottom: '1.125rem' }}>
                {(() => {
                  let loc: StowLocation | null = null
                  if (selected === BOO_VALUE && baseOfOperationsName) {
                    loc = { id: null, name: baseOfOperationsName, type: 'base_of_operations' }
                  } else {
                    const a = stowableAssets.find(x => x.id === selected)
                    if (a) loc = { id: a.id, name: a.name, type: a.type }
                  }
                  const selectedAsset = selected !== BOO_VALUE
                    ? stowableAssets.find(x => x.id === selected)
                    : null
                  return loc ? (
                    <div className="flex items-center" style={{ gap: '0.375rem' }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-overline)', color: 'var(--hud-text-dim)' }}>
                        Will appear as:
                      </span>
                      <StowPill location={loc} />
                      {selectedAsset?.is_group_storage && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '1px 0.4375rem',
                          borderRadius: RADIUS.xl,
                          background: 'color-mix(in srgb, var(--hud-accent) 9%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--hud-accent) 27%, transparent)',
                          fontFamily: FONT_BODY,
                          fontSize: FS.overline,
                          color: 'var(--hud-accent)',
                          letterSpacing: '0.04em',
                        }}>
                          📦 Shared
                        </span>
                      )}
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </>
        ) : (
          <div style={{
            fontFamily: FONT_BODY, fontSize: 'var(--text-label)',
            color: 'var(--hud-text-dim)',
            fontStyle: 'italic', marginBottom: '1.125rem', lineHeight: 1.5,
          }}>
            No group assets available yet. The item will be stowed without a specific location.
            Add vehicles, starships, or safe houses in the Group Sheet to assign a location.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end" style={{ gap: 'var(--space-2)' }}>
          <button
            onClick={onCancel}
            style={{
              height: '2rem', padding: '0 0.875rem', borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 'var(--text-label)',
              background: 'transparent',
              border: '1px solid var(--hud-border)',
              color: 'var(--hud-text-dim)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              height: '2rem', padding: '0 1.125rem', borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 'var(--text-label)', fontWeight: 700,
              background: 'color-mix(in srgb, var(--hud-accent) 14%, transparent)',
              border: '1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)',
              color: 'var(--hud-gold)',
            }}
          >
            Stow
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}
