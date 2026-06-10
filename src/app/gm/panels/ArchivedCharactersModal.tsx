'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { restoreCharacter, deleteCharacter } from '@/lib/characters'
import { FONT_BODY, HUD, FS, SP, RADIUS } from '@/lib/tokens'
import type { Character } from '@/lib/types'

interface Props {
  isOpen:     boolean
  onClose:    () => void
  campaignId: string
  onRestored: (char: Character) => void
}

export function ArchivedCharactersModal({ isOpen, onClose, campaignId, onRestored }: Props) {
  const [chars, setChars]         = useState<Character[]>([])
  const [loading, setLoading]     = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busyId, setBusyId]       = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('characters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_archived', true)
      .order('archived_at', { ascending: false })
      .then(({ data }) => {
        setChars((data as Character[]) ?? [])
        setLoading(false)
      })
  }, [isOpen, campaignId])

  async function handleRestore(char: Character) {
    setBusyId(char.id)
    try {
      await restoreCharacter(char.id)
      setChars(prev => prev.filter(c => c.id !== char.id))
      onRestored({ ...char, is_archived: false, archived_at: undefined })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    try {
      await deleteCharacter(id)
      setChars(prev => prev.filter(c => c.id !== id))
      setConfirmId(null)
    } finally {
      setBusyId(null)
    }
  }

  function formatDate(iso: string | undefined) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Modal open={isOpen} onClose={onClose} maxWidth="28rem">
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        `${SP[3]} ${SP[4]}`,
        borderBottom:   `1px solid ${HUD.border}`,
      }}>
        <span style={{
          fontFamily:    FONT_BODY,
          fontSize:      FS.overline,
          fontWeight:    700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         HUD.textDim,
        }}>
          Archived Characters
        </span>
        <button
          onClick={onClose}
          style={{
            background:   'none',
            border:       'none',
            color:        HUD.textDim,
            fontFamily:   FONT_BODY,
            fontSize:     FS.sm,
            cursor:       'pointer',
            padding:      `2px ${SP[1]}`,
            borderRadius: RADIUS.sm,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: SP[3] }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: SP[4], fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim }}>
            Loading…
          </div>
        )}

        {!loading && chars.length === 0 && (
          <div style={{ textAlign: 'center', padding: SP[4], fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim }}>
            No archived characters.
          </div>
        )}

        {!loading && chars.map((char, i) => (
          <div
            key={char.id}
            style={{
              borderTop: i === 0 ? 'none' : `1px solid ${HUD.border}`,
              padding:   `${SP[2]} 0`,
            }}
          >
            {/* Name row */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: SP[1] }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 600, color: HUD.text }}>
                {char.name}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim }}>
                {formatDate(char.archived_at)}
              </span>
            </div>

            {/* Action row */}
            {confirmId === char.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--state-failure)' }}>
                  Delete permanently?
                </span>
                <button
                  onClick={() => setConfirmId(null)}
                  disabled={busyId === char.id}
                  className="arch-btn-cancel"
                  style={{
                    background:    'rgba(150,168,180,0.06)',
                    border:        '1px solid rgba(150,168,180,0.2)',
                    color:         HUD.textDim,
                    fontFamily:    FONT_BODY,
                    fontSize:      FS.overline,
                    padding:       `2px ${SP[2]}`,
                    borderRadius:  RADIUS.md,
                    cursor:        'pointer',
                    letterSpacing: '0.1em',
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(char.id)}
                  disabled={busyId === char.id}
                  className="arch-btn-delete"
                  style={{
                    background:    'rgba(224,80,80,0.1)',
                    border:        '1px solid rgba(224,80,80,0.4)',
                    color:         'var(--state-failure)',
                    fontFamily:    FONT_BODY,
                    fontSize:      FS.overline,
                    padding:       `2px ${SP[2]}`,
                    borderRadius:  RADIUS.md,
                    cursor:        'pointer',
                    letterSpacing: '0.1em',
                    opacity:       busyId === char.id ? 0.5 : 1,
                  }}
                >
                  {busyId === char.id ? 'DELETING…' : 'DELETE'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: SP[2] }}>
                <button
                  onClick={() => handleRestore(char)}
                  disabled={!!busyId}
                  className="arch-btn-restore"
                  style={{
                    background:    'rgba(150,168,180,0.06)',
                    border:        '1px solid rgba(150,168,180,0.2)',
                    color:         HUD.textDim,
                    fontFamily:    FONT_BODY,
                    fontSize:      FS.overline,
                    padding:       `2px ${SP[2]}`,
                    borderRadius:  RADIUS.md,
                    cursor:        'pointer',
                    letterSpacing: '0.1em',
                    opacity:       busyId ? 0.5 : 1,
                  }}
                >
                  {busyId === char.id ? 'RESTORING…' : 'RESTORE'}
                </button>
                <button
                  onClick={() => setConfirmId(char.id)}
                  disabled={!!busyId}
                  className="arch-btn-del-trigger"
                  style={{
                    background:    'rgba(224,80,80,0.06)',
                    border:        '1px solid rgba(224,80,80,0.25)',
                    color:         'var(--state-failure)',
                    fontFamily:    FONT_BODY,
                    fontSize:      FS.overline,
                    padding:       `2px ${SP[2]}`,
                    borderRadius:  RADIUS.md,
                    cursor:        'pointer',
                    letterSpacing: '0.1em',
                    opacity:       busyId ? 0.5 : 1,
                  }}
                >
                  DELETE
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}
