'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import type { Character } from '@/lib/types'
import { FONT_BODY, RADIUS } from '@/lib/tokens'

const PURPLE    = '#9060D0'
const PURPLE_BG = 'rgba(144,96,208,0.12)'
const PURPLE_BD = 'rgba(144,96,208,0.4)'

const fieldLabel: React.CSSProperties = {
  fontFamily:    FONT_BODY,
  fontSize:      'var(--text-overline)',
  fontWeight:    700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color:         'rgba(150,168,180,0.5)',
  marginBottom:  4,
}

const darkInput: React.CSSProperties = {
  background:   'rgba(0,0,0,0.4)',
  border:       '1px solid var(--hud-border-hi)',
  color:        'var(--hud-text)',
  fontFamily:   FONT_BODY,
  padding:      '6px 10px',
  borderRadius: RADIUS.sm,
  outline:      'none',
  fontSize:     'var(--text-sm)',
  width:        '100%',
  boxSizing:    'border-box' as const,
}

interface AddConflictModalProps {
  open:       boolean
  onClose:    () => void
  campaignId: string
  characters: Character[]
}

export function AddConflictModal({ open, onClose, campaignId, characters }: AddConflictModalProps) {
  const supabase      = useMemo(() => createClient(), [])
  const forceChars    = characters.filter(c => (c.force_rating ?? 0) > 0)

  const [charId,    setCharId]    = useState('')
  const [type,      setType]      = useState('')
  const [narrative, setNarrative] = useState('')
  const [busy,      setBusy]      = useState(false)

  function handleClose() {
    setCharId('')
    setType('')
    setNarrative('')
    onClose()
  }

  async function handleAdd() {
    if (!charId || !type || busy) return
    setBusy(true)
    const { error } = await supabase.from('character_conflicts').insert({
      character_id:        charId,
      campaign_id:         campaignId,
      description:         type,
      narrative:           narrative.trim() || null,
      session_label:       new Date().toISOString().slice(0, 10),
      is_resolved:         false,
      player_acknowledged: false,
    })
    setBusy(false)
    if (!error) handleClose()
  }

  const canAdd = !!charId && !!type.trim() && !busy

  return (
    <Modal open={open} onClose={handleClose} maxWidth={440} borderColor={PURPLE_BD}>
      <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-sm)', fontWeight: 700, color: PURPLE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Add Conflict
        </div>

        <div>
          <div style={fieldLabel}>Character</div>
          <select value={charId} onChange={e => setCharId(e.target.value)} style={darkInput}>
            <option value="">Select character...</option>
            {forceChars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <div style={fieldLabel}>Type</div>
          <input
            type="text"
            placeholder="e.g. Murder, Coercion, Betrayal"
            value={type}
            onChange={e => setType(e.target.value)}
            style={darkInput}
          />
        </div>

        <div>
          <div style={fieldLabel}>Description (optional)</div>
          <textarea
            placeholder="Narrative detail..."
            value={narrative}
            onChange={e => setNarrative(e.target.value)}
            rows={3}
            style={{ ...darkInput, resize: 'vertical' }}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          style={{
            height:        36,
            borderRadius:  RADIUS.sm,
            background:    canAdd ? PURPLE_BG : 'transparent',
            border:        `1px solid ${PURPLE_BD}`,
            fontFamily:    FONT_BODY,
            fontSize:      'var(--text-caption)',
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         canAdd ? PURPLE : 'rgba(144,96,208,0.35)',
            cursor:        canAdd ? 'pointer' : 'not-allowed',
          }}
        >
          {busy ? 'Adding...' : 'Add Conflict'}
        </button>

      </div>
    </Modal>
  )
}
