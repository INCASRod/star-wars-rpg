export type DoorSpec = {
  side: 'north' | 'south' | 'east' | 'west'
  size: 'single' | 'double' | 'wide'
  count: number
}

export type PropSpec = {
  type: string
  placement: 'scattered' | 'walls' | 'corners' | 'center' | 'back' | 'front'
  count: number
}

export type CenterpieceSpec = {
  type: string | null
  tint: string | null
} | null

export type MapSpec = {
  environment: 'spaceship' | 'warehouse' | 'jungle' | 'cave' | 'desert' | 'city' | 'base' | 'cantina' | 'ice'
  faction: 'imperial' | 'rebel' | 'criminal' | 'neutral'
  layout: 'single' | 'multi'
  mapSize: 'small' | 'medium' | 'large'
  centerpiece: CenterpieceSpec
  props: PropSpec[]
  doors: DoorSpec[]
  roomCount: number
}

const SYSTEM_PROMPT = `You are a Star Wars D&D tactical map generator assistant. Parse natural language map descriptions into structured JSON specs.

Return ONLY valid JSON with this exact shape — no markdown, no explanation:
{
  "environment": "spaceship|warehouse|jungle|cave|desert|city|base|cantina|ice",
  "faction": "imperial|rebel|criminal|neutral",
  "layout": "single|multi",
  "mapSize": "small|medium|large",
  "centerpiece": { "type": "shuttle|transport|cargo_shuttle|troop_transport|tank|reactor|hologram|null", "tint": null } | null,
  "props": [
    { "type": "crate|crate_stack|container|computer|duty_station|turret|hologram|generator|tank|cannon|table|chair|reactor|shuttle|transport|cargo_shuttle", "placement": "scattered|walls|corners|center|back|front", "count": 3 }
  ],
  "doors": [
    { "side": "north|south|east|west", "size": "single|double|wide", "count": 1 }
  ],
  "roomCount": 1
}

Rules:
- "garage", "hangar", "bay", "single room" → layout: "single", roomCount: 1
- shuttle/ship/vessel → centerpiece shuttle or cargo_shuttle, environment: spaceship or base
- cargo containers, crates everywhere → props with placement: "scattered"
- "large roller door" / "big door at front" → doors with size: "wide"
- "smaller doors at back" → doors with side matching "north" typically, size: "single", count: 2
- "painted black" → centerpiece tint: "#111111"
- default environment based on context: hangar/garage → base, bar/cantina → cantina, forest/jungle → jungle
- roomCount: 1 for single room, 3-8 for multi-room layouts
- mapSize: use "large" for garages/hangars with vehicles, "medium" for most, "small" for compact
- If uncertain about any field, pick the most contextually appropriate value
`

export async function parsePromptWithClaude(promptText: string): Promise<MapSpec> {
  const res = await fetch('/api/anthropic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: promptText }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw: string = data.content?.[0]?.text ?? ''

  // Strip markdown code fences if the model wraps the response
  const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  return JSON.parse(json) as MapSpec
}
