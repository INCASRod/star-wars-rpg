import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/** Model for the Console's session-recap ingest. One place to change it.
 * Same model the Archive's other Claude route (mapgen/claudeParser.ts) uses. */
const CONSOLE_AI_MODEL = 'claude-haiku-4-5-20251001'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MAX_PROMPT_CHARS = 200_000
const MAX_OUTPUT_TOKENS = 8192
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const SYSTEM_PROMPT =
  'You are a JSON generator. Respond with a single valid JSON object and nothing else: no prose, no markdown fences.'

type Fail = { ok: false; code: string; message: string }

const hits = new Map<string, number[]>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  return false
}

function fail(code: string, message: string, status = 200) {
  const body: Fail = { ok: false, code, message }
  return NextResponse.json(body, { status })
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** Models sometimes wrap JSON in fences or add a lead-in despite the system
 * prompt; take the outermost {...} span. Returns undefined if nothing parses. */
function parseJsonLoose(text: string): Record<string, unknown> | undefined {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return undefined
  try {
    const v = JSON.parse(text.slice(start, end + 1))
    return v && typeof v === 'object' && !Array.isArray(v) ? v : undefined
  } catch {
    return undefined
  }
}

async function callModel(apiKey: string, prompt: string): Promise<{ text: string } | Fail> {
  let upstream: Response
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CONSOLE_AI_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  } catch (err) {
    return { ok: false, code: 'upstream', message: err instanceof Error ? err.message : 'request failed' }
  }

  let data: { content?: { type: string; text?: string }[]; error?: { message?: string } }
  try {
    data = await upstream.json()
  } catch {
    return { ok: false, code: 'upstream', message: `Anthropic API returned HTTP ${upstream.status} with a non-JSON body` }
  }
  if (!upstream.ok) {
    return { ok: false, code: 'upstream', message: data.error?.message ?? `Anthropic API returned HTTP ${upstream.status}` }
  }
  const text = (data.content ?? []).filter(b => b.type === 'text').map(b => b.text ?? '').join('')
  return { text }
}

export async function POST(req: NextRequest) {
  // Access check. The Archive has no server-side GM session (the GM PIN is a
  // client-side compare on the landing page and is not retained), so this is a
  // campaign-membership check, not real GM auth: same-origin caller, a campaign
  // that actually has console data, and a per-campaign rate limit.
  if (!sameOrigin(req)) return fail('forbidden', 'cross-origin request refused', 403)

  let body: { prompt?: unknown; tier?: unknown; campaignId?: unknown }
  try {
    body = await req.json()
  } catch {
    return fail('invalid_argument', 'body must be JSON', 400)
  }
  const { prompt, tier, campaignId } = body
  if (typeof prompt !== 'string' || !prompt) return fail('invalid_argument', 'prompt is required', 400)
  if (typeof campaignId !== 'string' || !campaignId) return fail('invalid_argument', 'campaignId is required', 400)
  if (prompt.length > MAX_PROMPT_CHARS) return fail('too_large', `prompt exceeds ${MAX_PROMPT_CHARS} characters`)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return fail('not_granted', 'ANTHROPIC_API_KEY is not configured on the server')

  // Anon client on purpose: same access the bridge itself has to these tables,
  // and no dependency on the service-role key being present.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data: known, error: campErr } = await supabase
    .from('console_campaign_state')
    .select('campaign_id')
    .eq('campaign_id', campaignId)
    .maybeSingle()
  if (campErr) return fail('unavailable', 'could not verify campaign')
  if (!known) return fail('forbidden', 'unknown campaign', 403)

  if (rateLimited(campaignId)) return fail('rate_limited', 'too many AI requests, wait a minute')

  // Log only metadata. Never the prompt or the response: both are campaign content.
  console.info('[console-ai]', { tier: typeof tier === 'string' ? tier : null, promptChars: prompt.length })

  let last = ''
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await callModel(apiKey, prompt)
    if ('ok' in out) return NextResponse.json(out)
    const parsed = parseJsonLoose(out.text)
    if (parsed) return NextResponse.json({ ok: true, result: parsed })
    last = out.text
  }
  return fail('bad_json', last.slice(0, 500))
}
