import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

  const body = await req.text()

  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body,
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
