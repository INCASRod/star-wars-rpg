'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

/**
 * Private character notes (migration 162: `character_notes`, owner-only RLS) and the autosave engine shared with
 * the backstory editor. Rules this file enforces:
 *  - a failed load is an error state, never an empty list (so nothing can be typed over data that did not load)
 *  - every write checks `{ error }` and the affected-row count; "saved" is only ever reported after a real success
 *  - one save in flight at a time; typing during a save is saved after it lands (no out-of-order writes)
 *  - pending text is flushed on leave: unmount, tab hidden, pagehide, beforeunload
 */

export type NoteType = 'text' | 'npc' | 'story' | 'location'

export interface CharacterNote {
  id: string
  character_id: string
  type: NoteType
  title: string
  body: string
  created_at: string
  updated_at: string
}

export interface NoteDraft { id: string | null; type: NoteType; title: string; body: string }

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export const SAVE_STATUS_TEXT: Record<SaveStatus, string> = {
  idle: 'Not saved yet',
  dirty: 'Unsaved changes',
  saving: 'Saving...',
  saved: 'Saved · just now',
  error: 'Not saved, tap Save to retry',
}

/**
 * Debounced, serialised autosave. `save` returns true on success. On failure the value is kept pending, the status
 * becomes 'error', and the next `schedule` or `flush` (the Save button) retries it.
 */
export function useAutosave<T>(save: (value: T) => Promise<boolean>, initial: SaveStatus = 'idle', delayMs = 800) {
  const [status, setStatus] = useState<SaveStatus>(initial)
  const saveRef = useRef(save)
  const pending = useRef<{ value: T } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const running = useRef<Promise<void> | null>(null)

  useEffect(() => { saveRef.current = save })

  const run = useCallback((): Promise<void> => {
    if (running.current) return running.current
    const p = (async () => {
      while (pending.current) {
        const job = pending.current
        pending.current = null
        setStatus('saving')
        let ok = false
        try { ok = await saveRef.current(job.value) } catch { ok = false }
        if (!ok) {
          if (!pending.current) pending.current = job // keep the text for the retry
          setStatus('error')
          return
        }
        if (!pending.current) setStatus('saved')
      }
    })().finally(() => { running.current = null })
    running.current = p
    return p
  }, [])

  const schedule = useCallback((value: T) => {
    pending.current = { value }
    setStatus('dirty')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { timer.current = null; void run() }, delayMs)
  }, [delayMs, run])

  /** Write whatever is pending now. Resolves true when nothing is left unwritten (false = a save failed). */
  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    await run()
    return pending.current === null
  }, [run])

  /** Drop pending text (used right before deleting the note it belongs to). Waits for an in-flight save first. */
  const discard = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    pending.current = null
    await running.current
    pending.current = null
  }, [])

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') void flush() }
    const onLeave = () => { void flush() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onLeave)
    window.addEventListener('beforeunload', onLeave)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onLeave)
      window.removeEventListener('beforeunload', onLeave)
      void flush() // unmount: write whatever is still pending
    }
  }, [flush])

  /** True while the editor holds text the database does not have yet (typed, saving, or failed). */
  const unsaved = status === 'dirty' || status === 'saving' || status === 'error'
  return { status, unsaved, schedule, flush, discard }
}

function byNewest(a: CharacterNote, b: CharacterNote) {
  return a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0
}

/**
 * `gm` = the GM's redacted view (Notes B3). The GM's client NEVER touches `character_notes`: the list comes from the
 * `gm_character_note_meta` function (id, type, dates only), title/body stay '' here, there is no realtime
 * subscription (RLS would block it), and saveNote/deleteNote refuse. The caller re-reads with `reload`.
 */
export function useCharacterNotes(characterId: string, gm = false) {
  const [notes, setNotes] = useState<CharacterNote[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')

  /** Read the list; a failed read leaves the last good list in place (and the error state if there never was one). */
  const load = useCallback(() => {
    if (gm) {
      return Promise.resolve(createClient().rpc('gm_character_note_meta', { p_character_id: characterId }))
        .then(({ data, error }) => {
          if (error || !data) { setLoadState(s => (s === 'ready' ? s : 'error')); return }
          setNotes((data as { id: string; type: NoteType; created_at: string; updated_at: string }[])
            .map(m => ({ ...m, character_id: characterId, title: '', body: '' })))
          setLoadState('ready')
        })
    }
    return createClient()
      .from('character_notes').select('*').eq('character_id', characterId).order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) { setLoadState(s => (s === 'ready' ? s : 'error')); return }
        setNotes(data as CharacterNote[])
        setLoadState('ready')
      })
  }, [characterId, gm])

  useEffect(() => {
    if (gm) { void load(); return }
    const supabase = createClient()
    const channel = supabase
      .channel(`character-notes-${characterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'character_notes', filter: `character_id=eq.${characterId}` }, payload => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string }).id
          if (id) setNotes(prev => prev.filter(n => n.id !== id))
          return
        }
        const row = payload.new as CharacterNote
        setNotes(prev => [row, ...prev.filter(n => n.id !== row.id)].sort(byNewest))
      })
      // Re-read on (re)subscribe so a change made while disconnected (and any missed delete) shows up.
      .subscribe(status => { if (status === 'SUBSCRIBED') void load() })
    void load().then(() => undefined)
    return () => { void supabase.removeChannel(channel) }
  }, [characterId, load, gm])

  const retry = useCallback(() => { setLoadState('loading'); void load() }, [load])

  /** Insert (no id) or update (id) exactly title/body/type of one note. Returns the id on success. */
  const saveNote = useCallback(async (draft: NoteDraft): Promise<{ ok: boolean; id: string | null }> => {
    if (gm) return { ok: false, id: null }
    const supabase = createClient()
    const fields = { type: draft.type, title: draft.title, body: draft.body }
    if (!draft.id) {
      const { data, error } = await supabase.from('character_notes').insert({ character_id: characterId, ...fields }).select('*').single()
      if (error || !data) { toast.error('Note not saved'); return { ok: false, id: null } }
      setNotes(prev => [data as CharacterNote, ...prev.filter(n => n.id !== (data as CharacterNote).id)].sort(byNewest))
      return { ok: true, id: (data as CharacterNote).id }
    }
    const { data, error } = await supabase.from('character_notes').update(fields).eq('id', draft.id).select('*')
    if (error || !data || data.length === 0) { toast.error('Note not saved'); return { ok: false, id: draft.id } }
    const row = data[0] as CharacterNote
    setNotes(prev => [row, ...prev.filter(n => n.id !== row.id)].sort(byNewest))
    return { ok: true, id: row.id }
  }, [characterId, gm])

  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    if (gm) return false
    const { data, error } = await createClient().from('character_notes').delete().eq('id', id).select('id')
    if (error || !data || data.length === 0) { toast.error('Note not deleted'); return false }
    setNotes(prev => prev.filter(n => n.id !== id))
    return true
  }, [gm])

  const reload = useCallback(() => { void load() }, [load])

  return { notes, loadState, retry, reload, saveNote, deleteNote }
}
