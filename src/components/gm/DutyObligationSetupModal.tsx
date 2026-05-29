'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import type { Character, RefDutyType, RefObligationType } from '@/lib/types'
import { stripBBCode } from '@/lib/utils'
import { HUD, FONT_BODY, RADIUS, EASE, FS } from '@/lib/tokens'

// ── Design tokens ─────────────────────────────────────────────────────────────
// Pre-approved: rgba(0,0,0,*) overlay on darkInput background.
// Duty blue (#4FC3F7) and obligation red (#E05050) map to CSS state tokens.
const BLUE = 'var(--state-info)'     // duty colour
const RED  = 'var(--state-failure)'  // obligation colour

const darkInput: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: `1px solid ${HUD.borderHi}`,
  borderRadius: RADIUS.md,
  color: HUD.text,
  fontFamily: FONT_BODY,
  fontSize: FS.body,
  padding: '0.4375rem 0.625rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const darkTextarea: React.CSSProperties = {
  ...darkInput,
  resize: 'vertical',
  minHeight: '4.5rem',
  lineHeight: 1.6,
}

const fieldLabel: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: FS.overline,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: HUD.textDim,
  marginBottom: '0.25rem',
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

  return (
    <Modal open onClose={onClose} maxWidth={680}>
      <div style={{ padding: '1.5rem 1.75rem' }}>
        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.textDim, marginBottom: '0.25rem' }}>
            GM Setup
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.h4, fontWeight: 700, color: HUD.gold }}>
            Duty & Obligation — {character.name}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* ── DUTY ─────────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, borderBottom: '1px solid rgba(79,195,247,0.2)', paddingBottom: '0.375rem' }}>
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
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, marginTop: '0.375rem', lineHeight: 1.5 }}>
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
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, marginTop: '0.25rem', lineHeight: 1.4 }}>
                Replaces the type name everywhere it appears. Leave blank to use the standard name.
              </div>
            </div>

            <div>
              <div style={fieldLabel}>Starting Value</div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {STARTING_VALUES.map(v => (
                  <button
                    key={v}
                    onClick={() => setDutyValue(v)}
                    style={{
                      flex: 1, padding: '0.375rem 0',
                      background: dutyValue === v ? 'rgba(79,195,247,0.2)' : 'rgba(79,195,247,0.05)',
                      border: `1px solid ${dutyValue === v ? 'rgba(79,195,247,0.6)' : 'rgba(79,195,247,0.15)'}`,
                      borderRadius: RADIUS.md, cursor: 'pointer',
                      fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700,
                      color: dutyValue === v ? BLUE : HUD.textDim,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: RED, borderBottom: '1px solid rgba(224,80,80,0.2)', paddingBottom: '0.375rem' }}>
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
                <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, marginTop: '0.375rem', lineHeight: 1.5 }}>
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
              <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: HUD.textDim, marginTop: '0.25rem', lineHeight: 1.4 }}>
                Replaces the type name everywhere it appears. Leave blank to use the standard name.
              </div>
            </div>

            <div>
              <div style={fieldLabel}>Starting Value</div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {STARTING_VALUES.map(v => (
                  <button
                    key={v}
                    onClick={() => setOblValue(v)}
                    style={{
                      flex: 1, padding: '0.375rem 0',
                      background: oblValue === v ? 'rgba(224,80,80,0.2)' : 'rgba(224,80,80,0.05)',
                      border: `1px solid ${oblValue === v ? 'rgba(224,80,80,0.6)' : 'rgba(224,80,80,0.15)'}`,
                      borderRadius: RADIUS.md, cursor: 'pointer',
                      fontFamily: FONT_BODY, fontSize: FS.body, fontWeight: 700,
                      color: oblValue === v ? RED : HUD.textDim,
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
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--state-failure)', marginTop: '1rem' }}>
            Error: {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${HUD.border}` }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, letterSpacing: '0.1em',
              padding: '0.5rem 1.25rem', border: `1px solid ${HUD.border}`,
              borderRadius: RADIUS.md, background: 'transparent', color: HUD.textDim, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!allFilled || busy}
            style={{
              fontFamily: FONT_BODY, fontSize: FS.sm, fontWeight: 700, letterSpacing: '0.1em',
              padding: '0.5rem 1.5rem',
              border: `1px solid ${allFilled && !busy ? HUD.gold : 'var(--hud-surface-hi)'}`,
              borderRadius: RADIUS.md,
              background: allFilled && !busy ? 'rgba(200,170,80,0.15)' : 'rgba(200,170,80,0.04)',
              color: allFilled && !busy ? HUD.gold : HUD.textDim,
              cursor: allFilled && !busy ? 'pointer' : 'not-allowed',
              transition: EASE.quick,
            }}
          >
            {busy ? 'Saving...' : character.duty_obligation_configured ? 'Update' : 'Save & Configure'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
