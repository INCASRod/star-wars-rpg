import { NextRequest, NextResponse } from 'next/server'

const FAL_URL = 'https://fal.run/openai/gpt-image-2'

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })

  const body = await req.text()

  const upstream = await fetch(FAL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body,
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
