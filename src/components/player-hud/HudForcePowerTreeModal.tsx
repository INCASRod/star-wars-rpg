'use client'

import { ForcePowerTree, type ForceTreeNode, type ForceTreeConnection } from '@/components/character/ForcePowerTree'
import { FONT_RAJDHANI, FS_LABEL, FS_OVERLINE } from './design-tokens'
import type { ForcePowerDisplay } from './ForcePanel'

interface HudForcePowerTreeModalProps {
  open: boolean
  onClose: () => void
  allForcePowers: ForcePowerDisplay[]
  activePowerKey: string | null
  setActivePowerKey: (key: string) => void
  forcePowerTreeData: { powerName: string; nodes: ForceTreeNode[]; connections: ForceTreeConnection[]; purchasedCount: number; totalCount: number } | null
  xpAvailable: number
  onPurchaseForceAbility: (abilityKey: string, row: number, col: number, cost: number, powerKey: string) => void
}

export function HudForcePowerTreeModal({
  open,
  onClose,
  allForcePowers,
  activePowerKey,
  setActivePowerKey,
  forcePowerTreeData,
  xpAvailable,
  onPurchaseForceAbility,
}: HudForcePowerTreeModalProps) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '1100px', maxHeight: '95vh', overflowY: 'auto', background: 'var(--hud-bg)', border: `1px solid var(--hud-border)`, boxShadow: '0 8px 48px rgba(0,0,0,.7)', borderRadius: 8, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Power selector tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {allForcePowers.map(fp => {
            const isActive = activePowerKey === fp.powerKey
            return (
              <button
                key={fp.powerKey}
                onClick={() => setActivePowerKey(fp.powerKey)}
                style={{
                  background: isActive ? 'rgba(224,58,30,0.15)' : 'var(--hud-surface-lo)',
                  border: `1px solid ${isActive ? 'rgba(224,58,30,0.55)' : 'var(--hud-border)'}`,
                  borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
                  fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-dim)',
                  transition: 'all .15s',
                }}
              >
                {fp.powerName}
                <span style={{ fontSize: FS_OVERLINE, color: isActive ? 'var(--hud-gold)' : 'var(--hud-text-faint)', marginLeft: 6 }}>
                  {fp.purchasedCount}/{fp.totalCount}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tree */}
        {forcePowerTreeData ? (
          <ForcePowerTree
            powerName={forcePowerTreeData.powerName}
            nodes={forcePowerTreeData.nodes}
            connections={forcePowerTreeData.connections}
            onPurchase={(abilityKey, row, col, cost) => onPurchaseForceAbility(abilityKey, row, col, cost, activePowerKey!)}
            xpAvailable={xpAvailable}
            purchasedCount={forcePowerTreeData.purchasedCount}
            totalCount={forcePowerTreeData.totalCount}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL, color: 'var(--hud-text-faint)' }}>No force power tree data.</div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            display: 'block', margin: '4px auto 0',
            background: 'rgba(224,58,30,0.08)',
            border: '1px solid rgba(224,58,30,0.3)',
            borderRadius: 4, padding: '10px 40px',
            fontFamily: FONT_RAJDHANI, fontSize: FS_LABEL,
            fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--hud-gold)', cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
