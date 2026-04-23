import { NextRequest, NextResponse } from 'next/server'

const FAL_EDIT_URL = 'https://fal.run/openai/gpt-image-2/edits'

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })

  const { prompt, imageUrls } = await req.json()
  if (!prompt || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return NextResponse.json({ error: 'prompt and imageUrls[] are required' }, { status: 400 })
  }

  const upstream = await fetch(FAL_EDIT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_urls:    imageUrls,
      quality:       'high',
      num_images:    1,
      output_format: 'png',
    }),
  })

  const text = await upstream.text()
  console.log('[fal-edit] status:', upstream.status, 'body:', text.slice(0, 400))
  let data: unknown
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return NextResponse.json(data, { status: upstream.status })
}
