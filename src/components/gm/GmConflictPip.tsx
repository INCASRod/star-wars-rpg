'use client'

import React from 'react'
import { Tooltip } from '@/components/ui/Tooltip'
import { FONT_BODY as FONT } from '@/lib/tokens'
import type { GmConflictRow } from '@/hooks/useGmCampaignConflicts'

interface GmConflictPipProps {
  conflict: GmConflictRow
}

export function GmConflictPip({ conflict }: GmConflictPipProps) {
  const tipContent = (
    <div style={{ fontFamily: FONT, fontSize: 11, lineHeight: 1.4 }}>
      <strong>{conflict.description ?? 'Conflict'}</strong>
      {conflict.session_label && (
        <div style={{ color: 'var(--hud-text-dim)', fontSize: 10, marginTop: 2 }}>
          {conflict.session_label}
        </div>
      )}
    </div>
  )

  return (
    <Tooltip content={tipContent} placement="top" maxWidth={180}>
      <div
        style={{
          width:       10,
          height:      10,
          borderRadius:'50%',
          background:  'rgba(144,96,208,0.8)',
          border:      '1px solid rgba(144,96,208,0.4)',
          cursor:      'default',
          flexShrink:  0,
        }}
      />
    </Tooltip>
  )
}
