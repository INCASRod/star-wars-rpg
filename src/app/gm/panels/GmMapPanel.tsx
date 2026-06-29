'use client'

import type { MapToken } from '@/hooks/useMapTokens'
import type { Character } from '@/lib/types'
import { GmTokenControls } from './GmTokenControls'
import { FONT_BODY } from '@/lib/tokens'

const FONT   = FONT_BODY
const BORDER = 'var(--hud-border)'

const sectionHeader: React.CSSProperties = {
  fontFamily:    FONT,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'var(--hud-text-dim)',
  marginBottom:  '0.375rem',
  paddingBottom: '0.25rem',
  borderBottom:  `1px solid ${BORDER}`,
}

export interface GmMapPanelProps {
  campaignId:      string
  characters:      Character[]
  tokens:          MapToken[]
  addToken:        (token: Omit<MapToken, 'id' | 'updated_at'>) => Promise<MapToken | null>
  removeToken:     (id: string) => Promise<void>
  toggleVisibility:(id: string, visible: boolean) => Promise<void>
  removeAllTokens: () => Promise<void>
}

export function GmMapPanel({
  campaignId, characters, tokens, addToken, removeToken, toggleVisibility, removeAllTokens,
}: GmMapPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: 0, flex: 1 }}>
        <div style={{ ...sectionHeader, margin: '0 0.875rem', marginBottom: '0.5rem' }}>Tokens</div>
        <GmTokenControls
          campaignId={campaignId}
          mapId={null}
          characters={characters}
          tokens={tokens}
          addToken={addToken}
          removeToken={removeToken}
          toggleVisibility={toggleVisibility}
          removeAllTokens={removeAllTokens}
          onOpenCrawl={() => {}}
          isCrawlActive={false}
          crawlLoading={false}
        />
      </div>
    </div>
  )
}
