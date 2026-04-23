const PROMPT_PREFIX = 'Top-down isometric tactical RPG battle map, Star Wars universe, digital painting, highly detailed game asset illustration'

const EDIT_PREFIX = 'This is a top-down isometric Star Wars RPG battle map. Preserve the exact perspective, scale, visual style, and all existing content. Make only the following change:'

export function buildImagePrompt(rawPrompt: string): string {
  return `${PROMPT_PREFIX}, ${rawPrompt.trim()}`
}

export function buildEditPrompt(rawPrompt: string): string {
  return `${EDIT_PREFIX} ${rawPrompt.trim()}`
}

/** Generate a fresh map using a reference asset image as the visual anchor. */
export async function generateMapWithAsset(assetUrl: string, rawPrompt: string): Promise<string> {
  const prompt = buildImagePrompt(rawPrompt)
  console.log('[mapgen] asset-guided prompt:', prompt)

  const res = await fetch('/api/fal-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Lower strength so the map style dominates; the asset provides visual reference
    body: JSON.stringify({ prompt, imageUrl: assetUrl, strength: 0.55 }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`fal.ai asset-guided generation ${res.status}: ${err}`)
  }

  const data = await res.json()
  const url: string | undefined = data.data?.[0]?.url ?? data.images?.[0]?.url
  const b64: string | undefined = data.data?.[0]?.b64_json ?? data.images?.[0]?.b64_json
  if (url) return url
  if (b64) return `data:image/png;base64,${b64}`
  throw new Error('fal.ai returned no image')
}

export async function editMapImage(currentImageUrl: string, rawPrompt: string): Promise<string> {
  const prompt = buildEditPrompt(rawPrompt)
  console.log('[mapgen] edit prompt:', prompt)

  const res = await fetch('/api/fal-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageUrl: currentImageUrl }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`fal.ai flux img2img ${res.status}: ${err}`)
  }

  const data = await res.json()
  const url: string | undefined = data.data?.[0]?.url ?? data.images?.[0]?.url
  const b64: string | undefined = data.data?.[0]?.b64_json ?? data.images?.[0]?.b64_json
  if (url) return url
  if (b64) return `data:image/png;base64,${b64}`
  throw new Error('fal.ai returned no edited image')
}

export async function generateMapImage(rawPrompt: string): Promise<string> {
  const prompt = buildImagePrompt(rawPrompt)
  console.log('[mapgen] image prompt:', prompt)

  const res = await fetch('/api/fal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      n:       1,
      size:    '2560x1440',
      quality: 'medium',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`fal.ai gpt-image-2 ${res.status}: ${err}`)
  }

  const data = await res.json()

  // fal may wrap in OpenAI format (data[]) or its own format (images[])
  const url: string | undefined = data.data?.[0]?.url ?? data.images?.[0]?.url
  const b64: string | undefined = data.data?.[0]?.b64_json ?? data.images?.[0]?.b64_json
  if (url) return url
  if (b64) return `data:image/png;base64,${b64}`
  throw new Error('fal.ai returned no image')
}
