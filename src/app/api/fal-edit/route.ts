import { NextRequest, NextResponse } from 'next/server'

const FAL_EDIT_URL = 'https://fal.run/openai/gpt-image-2/edits'

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })

  const { prompt, imageUrl } = await req.json()
  if (!prompt || !imageUrl) return NextResponse.json({ error: 'prompt and imageUrl are required' }, { status: 400 })

  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 500 })
  const imgBlob = await imgRes.blob()

  const form = new FormData()
  form.append('image', imgBlob, 'image.png')
  form.append('prompt', prompt)
  form.append('n', '1')
  form.append('size', '1536x1024')
  form.append('quality', 'high')

  const upstream = await fetch(FAL_EDIT_URL, {
    method: 'POST',
    headers: { 'Authorization': `Key ${apiKey}` },
    body: form,
  })

  const text = await upstream.text()
  console.log('[fal-edit] status:', upstream.status, 'body:', text.slice(0, 400))
  let data: unknown
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return NextResponse.json(data, { status: upstream.status })
}
