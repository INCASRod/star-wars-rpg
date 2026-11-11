'use client'

import { useRef, useState } from 'react'
import { useCharacterNotes, useAutosave, SAVE_STATUS_TEXT, type CharacterNote, type NoteType } from '@/hooks/useCharacterNotes'
import { usePlayerRecaps, type PlayerRecap } from '@/hooks/usePlayerRecaps'
import { RecapReader } from '@/components/player/RecapNotice'
import { HUD, FONT_BODY, FONT_DISPLAY, FS, SP, RADIUS, EASE, Z } from '@/lib/tokens'

/**
 * Private notes UI (owner only). `NotesDrawer` docks it to the right of the desktop Lore panel; `NotesPanel` is the
 * same content used full height on mobile. Type is a label only; every note is title + text.
 */

const TYPES: { key: NoteType; label: string; glyph: string; color: string }[] = [
  { key: 'text', label: 'Text', glyph: '¶', color: HUD.textDim },
  { key: 'npc', label: 'NPC', glyph: '♟', color: HUD.gold },
  { key: 'story', label: 'Story', glyph: '❖', color: HUD.accent },
  { key: 'location', label: 'Location', glyph: '◉', color: 'var(--state-info)' },
]
const TYPE_BY_KEY = Object.fromEntries(TYPES.map(t => [t.key, t])) as Record<NoteType, (typeof TYPES)[number]>
const RECAP_GLYPH = '✉'

type Filter = 'all' | NoteType | 'recap'
type Row = { kind: 'note'; note: CharacterNote; at: string } | { kind: 'recap'; recap: PlayerRecap; at: string }

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`

const btnBase = {
  fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, cursor: 'pointer',
  borderRadius: RADIUS.md, transition: EASE.quick, color: HUD.text,
  background: 'transparent', border: `1px solid ${HUD.border}`, padding: `${SP[1]} ${SP[2]}`,
} as const

const inputBase = {
  fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text, background: HUD.surfaceLo,
  border: `1px solid ${HUD.border}`, borderRadius: RADIUS.md, padding: `${SP[1]} ${SP[2]}`,
  outline: 'none', boxSizing: 'border-box' as const, minWidth: 0,
}

function NoteEditor({ note, initialType, saveNote, deleteNote, remote, onBack }: {
  note: CharacterNote | null
  initialType: NoteType
  saveNote: ReturnType<typeof useCharacterNotes>['saveNote']
  deleteNote: ReturnType<typeof useCharacterNotes>['deleteNote']
  /** Live copy of this note from the list (changes when another device saves it). */
  remote: CharacterNote | undefined
  onBack: () => void
}) {
  const [draft, setDraft] = useState({ type: note?.type ?? initialType, title: note?.title ?? '', body: note?.body ?? '' })
  const [base, setBase] = useState(note?.updated_at ?? null)
  const [noteId, setNoteId] = useState<string | null>(note?.id ?? null)
  const idRef = useRef<string | null>(note?.id ?? null)
  const [confirming, setConfirming] = useState(false)

  const auto = useAutosave<typeof draft>(async d => {
    // A brand-new note with nothing in it is never written.
    if (!idRef.current && !d.title.trim() && !d.body.trim()) return true
    const res = await saveNote({ id: idRef.current, ...d })
    if (res.id && !idRef.current) { idRef.current = res.id; setNoteId(res.id) }
    return res.ok
  }, note ? 'saved' : 'idle')

  // Another device saved this note: take its text only if nothing here is unsaved. Typing is never overwritten.
  if (remote && remote.updated_at !== base && !auto.unsaved) {
    setDraft({ type: remote.type, title: remote.title, body: remote.body })
    setBase(remote.updated_at)
  }

  const edit = (patch: Partial<typeof draft>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    auto.schedule(next)
  }

  const empty = !noteId && !draft.title.trim() && !draft.body.trim()
  const statusText = empty && auto.status !== 'error' ? SAVE_STATUS_TEXT.idle : SAVE_STATUS_TEXT[auto.status]

  const back = async () => {
    const ok = await auto.flush()
    if (ok) onBack() // a failed save keeps the editor open so the text is not lost
  }

  const remove = async () => {
    if (!noteId) { await auto.discard(); onBack(); return }
    await auto.discard()
    if (await deleteNote(noteId)) onBack()
  }

  const statusColor = auto.status === 'error' ? 'var(--state-warning)' : HUD.textDim

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], padding: `${SP[2]} ${SP[3]}`, borderBottom: `1px solid ${HUD.border}` }}>
        <button type="button" onClick={() => void back()} style={btnBase}>← Notes</button>
        <span role="status" style={{ flex: 1, minWidth: 0, fontFamily: FONT_BODY, fontSize: FS.overline, color: statusColor, textAlign: 'right' }}>{statusText}</span>
        <button type="button" onClick={() => void auto.flush()} style={{ ...btnBase, color: HUD.gold, borderColor: mix(HUD.gold, 40) }}>Save</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2], padding: SP[3], flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1] }}>
          {TYPES.map(t => (
            <button
              key={t.key} type="button" onClick={() => edit({ type: t.key })} aria-pressed={draft.type === t.key}
              style={{
                ...btnBase, color: draft.type === t.key ? t.color : HUD.textDim,
                borderColor: draft.type === t.key ? t.color : HUD.border,
                background: draft.type === t.key ? mix(t.color, 12) : 'transparent',
              }}
            >
              <span aria-hidden>{t.glyph}</span> {t.label}
            </button>
          ))}
        </div>
        <input
          value={draft.title} onChange={e => edit({ title: e.target.value })} placeholder="Title" aria-label="Note title"
          style={{ ...inputBase, fontFamily: FONT_DISPLAY, fontSize: FS.body }}
        />
        <textarea
          className="hud-textarea" value={draft.body} onChange={e => edit({ body: e.target.value })}
          placeholder="Write anything. Saves as you type." aria-label="Note text"
          style={{ flex: 1, minHeight: '8rem', resize: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>
          <span>{remote ?? note ? `Edited ${fmtDate((remote ?? note)!.updated_at)}` : 'New note'}</span>
          {confirming ? (
            <span style={{ display: 'flex', gap: SP[1] }}>
              <button type="button" onClick={() => void remove()} style={{ ...btnBase, color: 'var(--state-warning)', borderColor: mix('var(--state-warning)', 50) }}>Confirm delete</button>
              <button type="button" onClick={() => setConfirming(false)} style={btnBase}>Cancel</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} style={{ ...btnBase, color: 'var(--state-warning)', borderColor: mix('var(--state-warning)', 35) }}>Delete</button>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotesPanel({ characterId, onClose, closeLabel = '✕' }: { characterId: string; onClose: () => void; closeLabel?: string }) {
  const { notes, loadState, retry, saveNote, deleteNote } = useCharacterNotes(characterId)
  const { recaps, unseen, markSeen } = usePlayerRecaps()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<{ key: string; id: string | null; type: NoteType } | null>(null)
  const [reading, setReading] = useState<PlayerRecap | null>(null)

  const openRecap = (r: PlayerRecap) => { setReading(r); if (r === recaps[0]) markSeen(r.session_id) }

  const q = query.trim().toLowerCase()
  const rows: Row[] = [
    ...(filter === 'recap' ? [] : notes.filter(n => filter === 'all' || n.type === filter).map(note => ({ kind: 'note' as const, note, at: note.updated_at }))),
    ...(filter === 'all' || filter === 'recap' ? recaps.map(recap => ({ kind: 'recap' as const, recap, at: recap.shared_at })) : []),
  ]
    .filter(r => !q || (r.kind === 'note' ? `${r.note.title} ${r.note.body}` : `${r.recap.title} ${r.recap.summary}`).toLowerCase().includes(q))
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))

  if (editing) {
    const current = editing.id ? notes.find(n => n.id === editing.id) ?? null : null
    return (
      <NoteEditor
        key={editing.key} note={current} initialType={editing.type} remote={current ?? undefined}
        saveNote={saveNote} deleteNote={deleteNote} onBack={() => setEditing(null)}
      />
    )
  }

  const filterBtn = (key: Filter, label: string, glyph?: string) => (
    <button
      key={key} type="button" onClick={() => setFilter(key)} title={label} aria-label={label} aria-pressed={filter === key}
      style={{
        ...btnBase, color: filter === key ? HUD.gold : HUD.textDim,
        borderColor: filter === key ? mix(HUD.gold, 50) : HUD.border,
        background: filter === key ? mix(HUD.gold, 10) : 'transparent',
      }}
    >
      {glyph ?? 'ALL'}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SP[2], padding: `${SP[2]} ${SP[3]}`, borderBottom: `1px solid ${HUD.border}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.label, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: HUD.gold }}>Notes</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint }}>Only you can see these</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close notes" style={btnBase}>{closeLabel}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2], padding: SP[3], overflowY: 'auto', flex: 1, minHeight: 0 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, letterSpacing: '0.15em', textTransform: 'uppercase', color: HUD.textFaint }}>New note</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SP[1] }}>
          {TYPES.map(t => (
            <button
              key={t.key} type="button" disabled={loadState !== 'ready'}
              onClick={() => setEditing({ key: `new-${Date.now()}`, id: null, type: t.key })}
              style={{ ...btnBase, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[1], color: t.color, borderColor: mix(t.color, 40), opacity: loadState === 'ready' ? 1 : 0.5 }}
            >
              <span aria-hidden style={{ fontSize: FS.h4 }}>{t.glyph}</span>
              <span style={{ fontSize: FS.overline }}>{t.label}</span>
            </button>
          ))}
        </div>

        {recaps[0] && (
          <button
            type="button" onClick={() => openRecap(recaps[0])}
            style={{ ...btnBase, display: 'flex', alignItems: 'center', gap: SP[2], textAlign: 'left', padding: SP[2], borderColor: mix(HUD.gold, 40), background: mix(HUD.gold, 8) }}
          >
            <span aria-hidden style={{ fontSize: FS.h4, color: HUD.gold }}>{RECAP_GLYPH}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: FS.sm, color: HUD.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Session {recaps[0].n} · {recaps[0].title || 'Untitled'}
              </span>
              <span style={{ display: 'block', fontSize: FS.overline, fontWeight: 400, color: HUD.textDim }}>Latest recap from the GM · tap to read</span>
            </span>
            {unseen && <span style={{ fontSize: FS.overline, color: HUD.gold, border: `1px solid ${mix(HUD.gold, 50)}`, borderRadius: RADIUS.sm, padding: `0 ${SP[1]}` }}>NEW</span>}
          </button>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: SP[1] }}>
          {filterBtn('all', 'All')}
          {TYPES.map(t => filterBtn(t.key, t.label, t.glyph))}
          {filterBtn('recap', 'Recaps', RECAP_GLYPH)}
          <input
            value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" aria-label="Search notes"
            style={{ ...inputBase, flex: 1, minWidth: '6rem' }}
          />
        </div>

        {loadState === 'error' ? (
          <div role="alert" style={{ display: 'flex', flexDirection: 'column', gap: SP[2], alignItems: 'flex-start', fontFamily: FONT_BODY, fontSize: FS.sm, color: 'var(--state-warning)' }}>
            <span>Could not load your notes. Nothing has been changed.</span>
            <button type="button" onClick={retry} style={btnBase}>Retry</button>
          </div>
        ) : loadState === 'loading' ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim, fontStyle: 'italic' }}>
            {notes.length === 0 && recaps.length === 0 ? 'No notes yet. Pick a type above to start one.' : 'Nothing here yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
            {rows.map(r => {
              const isNote = r.kind === 'note'
              const color = isNote ? TYPE_BY_KEY[r.note.type].color : HUD.gold
              const title = isNote ? r.note.title || 'Untitled' : `Session ${r.recap.n} · ${r.recap.title || 'Untitled'}`
              const preview = (isNote ? r.note.body : r.recap.summary).replace(/\s+/g, ' ')
              return (
                <button
                  key={isNote ? r.note.id : `recap-${r.recap.session_id}`} type="button"
                  onClick={() => (isNote ? setEditing({ key: r.note.id, id: r.note.id, type: r.note.type }) : openRecap(r.recap))}
                  style={{ ...btnBase, display: 'flex', alignItems: 'center', gap: SP[2], textAlign: 'left', padding: SP[2], fontWeight: 400 }}
                >
                  <span aria-hidden style={{ color, fontSize: FS.h4, flexShrink: 0 }}>{isNote ? TYPE_BY_KEY[r.note.type].glyph : RECAP_GLYPH}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: FS.sm, fontWeight: 700, color: HUD.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                    <span style={{ display: 'block', fontSize: FS.overline, color: HUD.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</span>
                  </span>
                  <span style={{ fontSize: FS.overline, color: HUD.textFaint, flexShrink: 0 }}>{fmtDate(r.at)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <RecapReader recap={reading} eyebrow="Session recap" onClose={() => setReading(null)} />
    </div>
  )
}

/** Desktop: docked to the right side of the Lore panel. Unmounts when closed, which flushes any pending note text. */
export function NotesDrawer({ open, characterId, onClose }: { open: boolean; characterId: string; onClose: () => void }) {
  if (!open) return null
  return (
    <aside
      aria-label="Notes"
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '21rem', maxWidth: '100%', zIndex: Z.overlay,
        display: 'flex', flexDirection: 'column', minHeight: 0,
        background: HUD.panel, borderLeft: `1px solid ${HUD.borderHi}`,
        boxShadow: `0 0 ${SP[6]} color-mix(in srgb, var(--hud-bg) 60%, transparent)`,
      }}
    >
      <NotesPanel characterId={characterId} onClose={onClose} />
    </aside>
  )
}
