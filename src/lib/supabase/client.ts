import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── Preview Only write guard ──────────────────────────────────────────────────
// While `writesBlocked` is true (set by ViewModeProvider in Preview Only), every database write made through a client
// from createClient() is refused: from().insert/update/upsert/delete, rpc() (except the read-only ones below),
// storage uploads/removals and realtime broadcast/presence. It resolves like a failed Supabase call
// ({ data: null, error }), so a missed button can never write. It is a UI-layer safety net: the database itself
// refuses non-owner writes only after the RLS lock-down stage.
let writesBlocked = false
export function setWritesBlocked(blocked: boolean) { writesBlocked = blocked }

const READ_ONLY_RPCS = new Set(['is_gm', 'invite_preview'])
const QUERY_WRITES = new Set(['insert', 'update', 'upsert', 'delete'])
const STORAGE_WRITES = new Set(['upload', 'update', 'remove', 'move', 'copy', 'createSignedUploadUrl', 'uploadToSignedUrl'])
const CHANNEL_WRITES = new Set(['send', 'track', 'untrack'])

const BLOCKED_RESULT = { data: null, error: { message: 'preview_only', details: 'Writes are blocked in Preview Only', hint: null, code: 'PREVIEW' }, count: null, status: 403, statusText: 'Preview Only' }

/** A chainable stand-in for a Supabase builder: every method returns itself, awaiting it yields the blocked result. */
function blocked(label: string): unknown {
  console.warn(`[preview-only] blocked write: ${label}`)
  const handler: ProxyHandler<() => void> = {
    get: (_t, prop) => (prop === 'then'
      ? (resolve: (v: unknown) => unknown) => Promise.resolve(BLOCKED_RESULT).then(resolve)
      : proxy),
    apply: () => proxy,
  }
  const proxy: unknown = new Proxy(() => {}, handler)
  return proxy
}

function guardObject<T extends object>(target: T, writes: Set<string>, label: string, wrapReturn?: (r: unknown) => unknown): T {
  const self: T = new Proxy(target, {
    get(t, prop) {
      const v = Reflect.get(t, prop, t)
      if (typeof v !== 'function') return v
      const name = String(prop)
      return (...args: unknown[]) => {
        if (writes.has(name) && writesBlocked) return blocked(`${label}.${name}`)
        const out = (v as (...a: unknown[]) => unknown).apply(t, args)
        if (out === t) return self // chained builders (channel().on()) stay guarded
        return wrapReturn ? wrapReturn(out) : out
      }
    },
  })
  return self
}

function guardClient(client: SupabaseClient): SupabaseClient {
  return new Proxy(client, {
    get(target, prop) {
      const v = Reflect.get(target, prop, target)
      if (prop === 'from') return (table: string) => guardObject(target.from(table), QUERY_WRITES, table)
      if (prop === 'rpc') {
        return (fn: string, ...args: unknown[]) =>
          writesBlocked && !READ_ONLY_RPCS.has(fn)
            ? blocked(`rpc:${fn}`)
            : (target.rpc as (...a: unknown[]) => unknown)(fn, ...args)
      }
      if (prop === 'storage') {
        return new Proxy(target.storage, {
          get(st, p) {
            const f = Reflect.get(st, p, st)
            if (p === 'from') return (bucket: string) => guardObject(st.from(bucket), STORAGE_WRITES, `storage:${bucket}`)
            return typeof f === 'function' ? f.bind(st) : f
          },
        })
      }
      if (prop === 'channel') {
        return (name: string, ...rest: unknown[]) =>
          guardObject((target.channel as (...a: unknown[]) => object)(name, ...rest), CHANNEL_WRITES, `channel:${name}`)
      }
      return typeof v === 'function' ? v.bind(target) : v
    },
  })
}

// One guarded client per page load: createBrowserClient was already a browser singleton, and callers rely on a
// stable identity (effect dependencies), so the guarding proxy must be stable too.
let cached: SupabaseClient | null = null
export function createClient(): SupabaseClient {
  if (!cached) {
    cached = guardClient(createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    ))
  }
  return cached
}
