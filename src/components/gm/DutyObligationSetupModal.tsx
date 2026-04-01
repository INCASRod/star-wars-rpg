'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import { stripBBCode } from '@/lib/utils'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FC = "var(--font-rajdhani), 'Rajdhani', sans-serif"
const GOLD = '#C8AA50'
const TEXT = '#C8D8C0'
const DIM = '#6A8070'
const FAINT = '#2A3A2E'
const BORDER = 'rgba(200,170,80,0.14)'
const BORDER_HI = 'rgba(200,170,80,0.36)'
const BG_MODAL = 'rgba(4, 10, 6, 0.96)'

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${BORDER_HI}`,
  borderRadius: 4,
  color: TEXT,
  fontFamily: FC,
  fontSize: 13,
  padding: '7px 10px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const darkTextarea: React.CSSProperties = {
  ...darkInput,
  resize: 'vertical',
  minHeight: 72,
  lineHeight: 1.6,
}

const fieldLabel: React.CSSProperties = {
  fontFamily: FC,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: DIM,
  marginBottom: 4,
}

const STARTING_VALUES = [5, 10, 15, 20]

interface DutyObligationSetupModalProps {
  character: Character
  dutyTypes: RefDutyType[]
  obligationTypes: RefObligationType[]
  onClose: () => void
  onSaved: (updated: Partial<Character>) => void
}

export function DutyObligationSetupModal({
  character,
  dutyTypes,
  obligationTypes,
  onClose,
  onSaved,
}: DutyObligationSetupModalProps) {
  const [dutyTypeKey, setDutyTypeKey]           = useState(character.duty_type ?? '')
  const [dutyCustomName, setDutyCustomName]     = useState(character.duty_custom_name ?? '')
  const [dutyValue, setDutyValue]               = useState<number>(character.duty_value ?? 10)
  const [dutyLore, setDutyLore]                 = useState(character.duty_lore ?? '')
  const [oblTypeKey, setOblTypeKey]             = useState(character.obligation_type ?? '')
  const [oblCustomName, setOblCustomName]       = useState(character.obligation_custom_name ?? '')
  const [oblValue, setOblValue]                 = useState<number>(character.obligation_value ?? 10)
  const [oblLore, setOblLore]                   = useState(character.obligation_lore ?? '')
  const [busy, setBusy]                         = useState(false)
  const [error, setError]                       = useState<string | null>(null)

  const dutyDesc    = dutyTypes.find(d => d.key === dutyTypeKey)?.description
  const oblDesc     = obligationTypes.find(o => o.key === oblTypeKey)?.description
  const dutyDescClean = dutyDesc ? stripBBCode(dutyDesc) : undefined
  const oblDescClean  = oblDesc  ? stripBBCode(oblDesc)  : undefined

  const allFilled = !!dutyTypeKey && !!oblTypeKey && dutyLore.trim().length > 0 && oblLore.trim().length > 0

  const handleSave = useCallback(async () => {
    if (!allFilled) return
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const updates = {
      duty_type:                    dutyTypeKey,
      duty_custom_name:             dutyCustomName.trim() || null,
      duty_value:                   dutyValue,
      duty_lore:                    dutyLore.trim(),
      obligation_type:              oblTypeKey,
      obligation_custom_name:       oblCustomName.trim() || null,
      obligation_value:             oblValue,
      obligation_lore:              oblLore.trim(),
      duty_obligation_configured:   true,
    }
    const { error: err } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', character.id)
    if (err) { setError(err.message); setBusy(false); return }
    onSaved(updates)
    onClose()
  }, [allFilled, character.id, dutyTypeKey, dutyCustomName, dutyValue, dutyLore, oblTypeKey, oblCustomName, oblValue, oblLore, onSaved, onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: BG_MODAL,
        border: `1px solid ${BORDER_HI}`,
        borderRadius: 8,
        width: '100%',
        maxWidth: 680,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px 28px',
      }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: FC, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: DIM, marginBottom: 4 }}>
            GM Setup
          </div>
          <div style={{ fontFamily: FC, fontSize: 18, fontWeight: 700, color: GOLD }}>
            Duty & Obligation — {character.name}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* ── DUTY ─────────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: FC, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4FC3F7', borderBottom: '1px solid rgba(79,195,247,0.2)', paddingBottom: 6 }}>
              Duty
            </div>

            <div>
              <div style={fieldLabel}>Type</div>
              <select
                value={dutyTypeKey}
                onChange={e => setDutyTypeKey(e.target.value)}
                style={{ ...darkInput }}
              >
                <option value="">Select duty type...</option>
                {dutyTypes.map(d => (
                  <option key={d.key} value={d.key}>{d.name}</option>
                ))}
              </select>
              {dutyDescClean && (
                <div style={{ fontFamily: FC, fontSize: 10, color: DIM, marginTop: 6, lineHeight: 1.5 }}>
                  {dutyDescClean}
                </div>
              )}
            </div>

            <div>
              <div style={fieldLabel}>Custom Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
              <input
                type="text"
                value={dutyCustomName}
                onChange={e => setDutyCustomName(e.target.value)}
                placeholder={dutyTypes.find(d => d.key === dutyTypeKey)?.name ?? 'Override display name…'}
                style={darkInput}
              />
              <div style={{ fontFamily: FC, fontSize: 10, color: DIM, marginTop: 4, lineHeight: 1.4 }}>
                Replaces the type name everywhere it appears. Leave blank to use the standard name.
              </div>
            </div>

            <div>
              <div style={fieldLabel}>Starting Value</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {STARTING_VALUES.map(v => (
                  <button
                    key={v}
                    onClick={() => setDutyValue(v)}
                    style={{
                      flex: 1, padding: '6px 0',
                      background: dutyValue === v ? 'rgba(79,195,247,0.2)' : 'rgba(79,195,247,0.05)',
                      border: `1px solid ${dutyValue === v ? 'rgba(79,195,247,0.6)' : 'rgba(79,195,247,0.15)'}`,
                      borderRadius: 4, cursor: 'pointer',
                      fontFamily: FC, fontSize: 13, fontWeight: 700,
                      color: dutyValue === v ? '#4FC3F7' : DIM,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={fieldLabel}>Lore / Notes *</div>
              <textarea
                value={dutyLore}
                onChange={e => setDutyLore(e.target.value)}
                placeholder="Why does this character serve the Alliance? What drives their commitment?"
                style={darkTextarea}
              />
            </div>
          </div>

          {/* ── OBLIGATION ────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: FC, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#E05050', borderBottom: '1px solid rgba(224,80,80,0.2)', paddingBottom: 6 }}>
              Obligation
            </div>

            <div>
              <div style={fieldLabel}>Type</div>
              <select
                value={oblTypeKey}
                onChange={e => setOblTypeKey(e.target.value)}
                style={{ ...darkInput }}
              >
                <option value="">Select obligation type...</option>
                {obligationTypes.map(o => (
                  <option key={o.key} value={o.key}>{o.name}</option>
                ))}
              </select>
              {oblDescClean && (
                <div style={{ fontFamily: FC, fontSize: 10, color: DIM, marginTop: 6, lineHeight: 1.5 }}>
                  {oblDescClean}
                </div>
              )}
            </div>

            <div>
              <div style={fieldLabel}>Custom Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
              <input
                type="text"
                value={oblCustomName}
                onChange={e => setOblCustomName(e.target.value)}
                placeholder={obligationTypes.find(o => o.key === oblTypeKey)?.name ?? 'Override display name…'}
                style={darkInput}
              />
              <div style={{ fontFamily: FC, fontSize: 10, color: DIM, marginTop: 4, lineHeight: 1.4 }}>
                Replaces the type name everywhere it appears. Leave blank to use the standard name.
              </div>
            </div>

            <div>
              <div style={fieldLabel}>Starting Value</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {STARTING_VALUES.map(v => (
                  <button
                    key={v}
                    onClick={() => setOblValue(v)}
                    style={{
                      flex: 1, padding: '6px 0',
                      background: oblValue === v ? 'rgba(224,80,80,0.2)' : 'rgba(224,80,80,0.05)',
                      border: `1px solid ${oblValue === v ? 'rgba(224,80,80,0.6)' : 'rgba(224,80,80,0.15)'}`,
                      borderRadius: 4, cursor: 'pointer',
                      fontFamily: FC, fontSize: 13, fontWeight: 700,
                      color: oblValue === v ? '#E05050' : DIM,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={fieldLabel}>Lore / Notes *</div>
              <textarea
                value={oblLore}
                onChange={e => setOblLore(e.target.value)}
                placeholder="What burden does this character carry? Who does it involve?"
                style={darkTextarea}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontFamily: FC, fontSize: 11, color: '#E05050', marginTop: 16 }}>
            Error: {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: FC, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
              padding: '8px 20px', border: `1px solid ${BORDER}`,
              borderRadius: 4, background: 'transparent', color: DIM, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!allFilled || busy}
            style={{
              fontFamily: FC, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
              padding: '8px 24px',
              border: `1px solid ${allFilled && !busy ? GOLD : FAINT}`,
              borderRadius: 4,
              background: allFilled && !busy ? 'rgba(200,170,80,0.15)' : 'rgba(200,170,80,0.04)',
              color: allFilled && !busy ? GOLD : DIM,
              cursor: allFilled && !busy ? 'pointer' : 'not-allowed',
              transition: '.15s',
            }}
          >
            {busy ? 'Saving...' : character.duty_obligation_configured ? 'Update' : 'Save & Configure'}
          </button>
        </div>
      </div>
    </div>
  )
}
