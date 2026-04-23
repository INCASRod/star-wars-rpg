const PROMPT_PREFIX = 'Top-down isometric Star Wars environment, cinematic concept art, detailed scenery and architecture, no UI elements'

const EDIT_PREFIX = 'This is a top-down isometric Star Wars environment scene. Preserve the exact perspective, scale, visual style, and all existing scenery. No UI elements, no HUD, no interface, no text overlays. Make only the following change:'

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
    body: JSON.stringify({ prompt, imageUrls: [assetUrl] }),
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

/**
 * Edit an existing scene. The scene is always imageUrls[0]; any reference
 * images the user uploads (ships, props, subjects to incorporate) follow as
 * imageUrls[1..n]. fal.ai passes all of them to gpt-image-2 together.
 */
export async function editMapImage(
  sceneUrl:      string,
  rawPrompt:     string,
  referenceUrls: string[] = [],
): Promise<string> {
  const prompt = buildEditPrompt(rawPrompt)
  console.log('[mapgen] edit prompt:', prompt)
  console.log('[mapgen] edit images:', 1 + referenceUrls.length, '(scene + references)')

  const res = await fetch('/api/fal-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageUrls: [sceneUrl, ...referenceUrls] }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`fal.ai gpt-image-2 edit ${res.status}: ${err}`)
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
      image_size:    { width: 1920, height: 1080 },
      quality:       'medium',
      num_images:    1,
      output_format: 'png',
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
