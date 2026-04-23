import { NextRequest, NextResponse } from 'next/server'

// fal.ai Flux Pro image-to-image — preserves style, applies prompt-driven edits
const FAL_IMG2IMG_URL = 'https://fal.run/fal-ai/flux/dev/image-to-image'

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })

  const { prompt, imageUrl, strength } = await req.json()
  if (!prompt || !imageUrl) return NextResponse.json({ error: 'prompt and imageUrl are required' }, { status: 400 })

  const upstream = await fetch(FAL_IMG2IMG_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_url:  imageUrl,
      strength:   strength ?? 0.8,
      num_images: 1,
    }),
  })

  const text = await upstream.text()
  console.log('[fal-edit] status:', upstream.status, 'body:', text.slice(0, 400))
  let data: unknown
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return NextResponse.json(data, { status: upstream.status })
}
