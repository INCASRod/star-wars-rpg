// Console phase 1b — parent-side bridge for the vendored external Console
// app (public/console/index.html), which runs in an iframe and speaks a
// small postMessage protocol (`lor:1`) to the parent frame. The parent owns
// the Supabase client; the console owns no persistence of its own.
//
// Framework-free by design: this module only needs a Supabase client, a
// campaign uuid and an iframe `contentWindow`. React glue lives in
// ConsoleHost.tsx.
//
// See docs/architecture.md's Console section for the full protocol writeup.

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

const RECORD_KINDS = ['arcs', 'threads', 'sessions', 'codex', 'planets', 'links', 'tags'] as const
type RecordKind = typeof RECORD_KINDS[number]

function isRecordKind(k: string): k is RecordKind {
  return (RECORD_KINDS as readonly string[]).includes(k)
}

interface InMsg {
  lor: 1
  id?: number
  op?: 'get' | 'set' | 'del' | 'list' | 'watchDoc' | 'watchColl' | 'ai'
  path?: string
  prompt?: string
  tier?: string
  coll?: string
  limit?: number
  body?: Record<string, unknown>
  evt?: string
}

type OutReply =
  | { lor: 1; id: number; ok: true; result: unknown }
  | { lor: 1; id: number; ok: false; code: string; message: string }

type OutPush =
  | { lor: 1; evt: 'ready'; readOnly: boolean }
  | { lor: 1; evt: 'doc'; path: string; exists: boolean; data: Record<string, unknown> | null }
  | { lor: 1; evt: 'coll'; coll: string; rows: { id: string; data: Record<string, unknown> }[] }

/** Splits a docs/<id> body into its promoted columns + `data`.
 * `body` (derived plain-text duplicate of `blocks`) is stripped ONLY when
 * `blocks` is a non-empty array. For a blockless doc `body` is the sole copy of
 * the content (the console converts it to blocks on first open), so it must be
 * preserved in `data`. Do NOT "tidy" this into an unconditional strip. */
function splitDocBody(doc: Record<string, unknown>) {
  const { title, folder, blocks, body, ...rest } = doc
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0
  return {
    title: (title as string | undefined) ?? null,
    folder: (folder as string | undefined) ?? null,
    blocks: blocks ?? [],
    data: hasBlocks || body === undefined ? rest : { ...rest, body },
  }
}

function reassembleDoc(row: { title: string | null; folder: string | null; blocks: unknown; data: Record<string, unknown> }) {
  return { ...row.data, title: row.title, folder: row.folder, blocks: row.blocks }
}

export class ConsoleBridge {
  private supabase: SupabaseClient
  private campaignId: string
  private target: Window
  private channels: RealtimeChannel[] = []
  private docWatches = new Set<string>()
  private collWatches = new Set<string>()
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private onMessage = (e: MessageEvent) => this.handleMessage(e)
  private helloReceived = false
  /** Reported to the console in the `ready` event; `ai` refuses while true. Nothing flips it today. */
  private readOnly = false
  /** One `ai` call at a time. */
  private aiInFlight = false

  constructor(supabase: SupabaseClient, campaignId: string, target: Window) {
    this.supabase = supabase
    this.campaignId = campaignId
    this.target = target
  }

  /** Attach the listener. Call this BEFORE setting the iframe's src. */
  attach() {
    window.addEventListener('message', this.onMessage)
  }

  teardown() {
    window.removeEventListener('message', this.onMessage)
    for (const ch of this.channels) this.supabase.removeChannel(ch)
    this.channels = []
    for (const t of this.debounceTimers.values()) clearTimeout(t)
    this.debounceTimers.clear()
  }

  private post(msg: OutReply | OutPush) {
    this.target.postMessage(msg, window.location.origin)
  }

  private handleMessage(e: MessageEvent) {
    if (e.source !== this.target) return
    const m = e.data as InMsg
    if (!m || m.lor !== 1) return

    if (m.evt === 'hello') {
      if (this.helloReceived) return
      this.helloReceived = true
      this.post({ lor: 1, evt: 'ready', readOnly: this.readOnly })
      return
    }

    if (m.id != null && m.op) {
      this.handleOp(m.id, m.op, m)
    }
  }

  private async handleOp(id: number, op: NonNullable<InMsg['op']>, m: InMsg) {
    try {
      switch (op) {
        case 'get': {
          const result = await this.get(m.path!)
          this.post({ lor: 1, id, ok: true, result })
          return
        }
        case 'set': {
          await this.set(m.path!, m.body ?? {})
          this.post({ lor: 1, id, ok: true, result: true })
          return
        }
        case 'del': {
          await this.del(m.path!)
          this.post({ lor: 1, id, ok: true, result: true })
          return
        }
        case 'list': {
          const result = await this.list(m.coll!, m.limit ?? 0)
          this.post({ lor: 1, id, ok: true, result })
          return
        }
        case 'watchDoc': {
          this.watchDoc(m.path!)
          this.post({ lor: 1, id, ok: true, result: true })
          return
        }
        case 'watchColl': {
          this.watchColl(m.coll!)
          this.post({ lor: 1, id, ok: true, result: true })
          return
        }
        case 'ai': {
          await this.ai(id, m)
          return
        }
        default:
          this.post({ lor: 1, id, ok: false, code: 'invalid_argument', message: `unknown op ${op}` })
      }
    } catch (err) {
      const code = (err as { code?: string })?.code ?? 'unavailable'
      const message = err instanceof Error ? err.message : String(err)
      this.post({ lor: 1, id, ok: false, code, message })
    }
  }

  // ---- model call ----

  /** One-shot: never retried or queued here. The server route holds the key. */
  private async ai(id: number, m: InMsg) {
    if (this.readOnly) {
      this.post({ lor: 1, id, ok: false, code: 'read_only', message: 'console is read-only' })
      return
    }
    if (this.aiInFlight) {
      this.post({ lor: 1, id, ok: false, code: 'busy', message: 'an AI request is already in progress' })
      return
    }
    this.aiInFlight = true
    try {
      const res = await fetch('/api/gm/console/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: m.prompt, tier: m.tier, campaignId: this.campaignId }),
      })
      const out = await res.json() as { ok: boolean; result?: unknown; code?: string; message?: string }
      if (out.ok) this.post({ lor: 1, id, ok: true, result: out.result })
      else this.post({ lor: 1, id, ok: false, code: out.code ?? 'upstream', message: out.message ?? 'AI request failed' })
    } catch (err) {
      this.post({ lor: 1, id, ok: false, code: 'unavailable', message: err instanceof Error ? err.message : String(err) })
    } finally {
      this.aiInFlight = false
    }
  }

  // ---- path resolution ----

  private async get(path: string): Promise<{ exists: boolean; data: Record<string, unknown> | null }> {
    if (path === 'campaign/state') {
      const { data, error } = await this.supabase
        .from('console_campaign_state')
        .select('data')
        .eq('campaign_id', this.campaignId)
        .maybeSingle()
      if (error) throw errWithCode(error)
      return { exists: !!data, data: data?.data ?? null }
    }

    const [coll, docId] = splitPath(path)
    if (coll === 'docs') {
      const { data, error } = await this.supabase
        .from('console_documents')
        .select('id, title, folder, blocks, data')
        .eq('campaign_id', this.campaignId)
        .eq('id', docId)
        .maybeSingle()
      if (error) throw errWithCode(error)
      return { exists: !!data, data: data ? reassembleDoc(data) : null }
    }

    if (isRecordKind(coll)) {
      const { data, error } = await this.supabase
        .from('console_records')
        .select('data')
        .eq('campaign_id', this.campaignId)
        .eq('kind', coll)
        .eq('id', docId)
        .maybeSingle()
      if (error) throw errWithCode(error)
      return { exists: !!data, data: data?.data ?? null }
    }

    throw invalidArgument(coll)
  }

  private async set(path: string, body: Record<string, unknown>): Promise<void> {
    if (path === 'campaign/state') {
      const { error } = await this.supabase
        .from('console_campaign_state')
        .upsert({ campaign_id: this.campaignId, data: body }, { onConflict: 'campaign_id' })
      if (error) throw errWithCode(error)
      return
    }

    const [coll, docId] = splitPath(path)
    if (coll === 'docs') {
      const split = splitDocBody(body)
      const { error } = await this.supabase
        .from('console_documents')
        .upsert(
          { campaign_id: this.campaignId, id: docId, ...split },
          { onConflict: 'campaign_id,id' }
        )
      if (error) throw errWithCode(error)
      return
    }

    if (isRecordKind(coll)) {
      const { error } = await this.supabase
        .from('console_records')
        .upsert(
          { campaign_id: this.campaignId, kind: coll, id: docId, data: body },
          { onConflict: 'campaign_id,kind,id' }
        )
      if (error) throw errWithCode(error)
      return
    }

    throw invalidArgument(coll)
  }

  private async del(path: string): Promise<void> {
    if (path === 'campaign/state') {
      const { error } = await this.supabase
        .from('console_campaign_state')
        .delete()
        .eq('campaign_id', this.campaignId)
      if (error) throw errWithCode(error)
      return
    }

    const [coll, docId] = splitPath(path)
    if (coll === 'docs') {
      const { error } = await this.supabase
        .from('console_documents')
        .delete()
        .eq('campaign_id', this.campaignId)
        .eq('id', docId)
      if (error) throw errWithCode(error)
      return
    }

    if (isRecordKind(coll)) {
      const { error } = await this.supabase
        .from('console_records')
        .delete()
        .eq('campaign_id', this.campaignId)
        .eq('kind', coll)
        .eq('id', docId)
      if (error) throw errWithCode(error)
      return
    }

    throw invalidArgument(coll)
  }

  private async list(coll: string, limit: number): Promise<{ id: string; data: Record<string, unknown> }[]> {
    if (coll === 'docs') {
      let q = this.supabase
        .from('console_documents')
        .select('id, title, folder, blocks, data')
        .eq('campaign_id', this.campaignId)
      if (limit > 0) q = q.limit(limit)
      const { data, error } = await q
      if (error) throw errWithCode(error)
      return (data ?? []).map(r => ({ id: r.id, data: reassembleDoc(r) }))
    }

    if (isRecordKind(coll)) {
      let q = this.supabase
        .from('console_records')
        .select('id, data')
        .eq('campaign_id', this.campaignId)
        .eq('kind', coll)
      if (limit > 0) q = q.limit(limit)
      const { data, error } = await q
      if (error) throw errWithCode(error)
      return (data ?? []).map(r => ({ id: r.id, data: r.data as Record<string, unknown> }))
    }

    throw invalidArgument(coll)
  }

  // ---- realtime watches ----

  private watchDoc(path: string) {
    if (this.docWatches.has(path)) {
      // Already watching — still push current state so a late onSnapshot gets data.
      this.pushDoc(path)
      return
    }
    this.docWatches.add(path)
    this.pushDoc(path)

    if (path === 'campaign/state') {
      const ch = this.supabase
        .channel(`console-state-${this.campaignId}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'console_campaign_state',
          filter: `campaign_id=eq.${this.campaignId}`,
        }, () => this.debouncedPushDoc(path))
        .subscribe()
      this.channels.push(ch)
    } else if (path.startsWith('docs/')) {
      const ch = this.supabase
        .channel(`console-doc-${this.campaignId}-${path}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'console_documents',
          filter: `campaign_id=eq.${this.campaignId}`,
        }, () => this.debouncedPushDoc(path))
        .subscribe()
      this.channels.push(ch)
    }
  }

  private async pushDoc(path: string) {
    try {
      const { exists, data } = await this.get(path)
      this.post({ lor: 1, evt: 'doc', path, exists, data })
    } catch {
      // Swallow — a failed watch push is not a fatal bridge error.
    }
  }

  private debouncedPushDoc(path: string) {
    const key = `doc:${path}`
    const existing = this.debounceTimers.get(key)
    if (existing) clearTimeout(existing)
    this.debounceTimers.set(key, setTimeout(() => this.pushDoc(path), 150))
  }

  private watchColl(coll: string) {
    if (this.collWatches.has(coll)) {
      this.pushColl(coll)
      return
    }
    this.collWatches.add(coll)
    this.pushColl(coll)

    const table = coll === 'docs' ? 'console_documents' : 'console_records'
    const filter = coll === 'docs'
      ? `campaign_id=eq.${this.campaignId}`
      : `campaign_id=eq.${this.campaignId}`
    // console_records is shared across kinds, so re-filter client side on kind
    // inside pushColl(); the postgres_changes filter can only scope campaign_id.
    void filter

    const ch = this.supabase
      .channel(`console-${coll}-${this.campaignId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table,
        filter: `campaign_id=eq.${this.campaignId}`,
      }, () => this.debouncedPushColl(coll))
      .subscribe()
    this.channels.push(ch)
  }

  private async pushColl(coll: string) {
    try {
      const rows = await this.list(coll, 0)
      this.post({ lor: 1, evt: 'coll', coll, rows })
    } catch {
      // Swallow — a failed watch push is not a fatal bridge error.
    }
  }

  private debouncedPushColl(coll: string) {
    const key = `coll:${coll}`
    const existing = this.debounceTimers.get(key)
    if (existing) clearTimeout(existing)
    this.debounceTimers.set(key, setTimeout(() => this.pushColl(coll), 150))
  }
}

function splitPath(path: string): [string, string] {
  const idx = path.indexOf('/')
  if (idx === -1) return [path, '']
  return [path.slice(0, idx), path.slice(idx + 1)]
}

function invalidArgument(coll: string) {
  return errWithCode({ message: `unknown collection "${coll}"` }, 'invalid_argument')
}

function errWithCode(error: { message?: string } | Error, code = 'unavailable'): Error & { code: string } {
  const e = new Error(error instanceof Error ? error.message : (error.message ?? 'console bridge error')) as Error & { code: string }
  e.code = code
  return e
}
