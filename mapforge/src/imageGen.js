const FAL_KEY = import.meta.env.VITE_FAL_KEY;

const ENV_PROMPTS = {
  spaceship: 'starship interior with metal grating floors, glowing blue conduits and control panels lining the walls',
  warehouse: 'industrial storage facility with worn durasteel floors, heavy shelving and loading equipment',
  jungle:    'dense alien jungle clearing with twisted exotic roots, large canopy leaves overhead and muddy earthen paths cutting through undergrowth',
  cave:      'subterranean cave system with rocky uneven floor, stalactites hanging from above and veins of glowing crystals embedded in the walls',
  desert:    'desert outpost interior with cracked sandy floors, thick adobe walls and salvaged equipment',
  city:      'urban back-alley district with duracrete floors, graffiti-covered walls and scattered cargo under neon lighting',
  base:      'military installation with reinforced blast-proof floors, security equipment and tactical wall-mounted panels',
  cantina:   'dimly lit cantina interior with worn mosaic floor tiles, bar and booth seating arrangements',
  ice:       'frozen facility interior with ice-encrusted floors, frost-covered exposed pipes and flickering emergency lighting',
};

const CENTERPIECE_PROMPTS = {
  shuttle:        'a parked shuttle craft in the centre',
  cargo_shuttle:  'a crashed cargo shuttle in the centre with burn marks and impact debris scattered around it',
  transport:      'a large military transport vehicle in the centre',
  troop_transport:'a troop carrier vehicle in the centre',
  reactor:        'a large glowing reactor core in the centre of the room',
  hologram:       'a holographic projector table glowing in the centre',
  tank:           'a military tank in the centre',
};

const PROP_PROMPTS = {
  container:   'large shipping containers',
  crate:       'cargo crates',
  crate_stack: 'stacked cargo crates',
  computer:    'computer terminals and workstations',
  turret:      'automated defense turrets',
  cannon:      'heavy weapons emplacements',
  table:       'tables and workbenches',
  chair:       'chairs and seating',
  generator:   'power generator units',
};

export function buildImagePrompt(spec, rawPrompt = '') {
  const envDesc = ENV_PROMPTS[spec.environment] ?? ENV_PROMPTS.spaceship;

  const cp = spec.centerpiece;
  const centreDesc = (cp && cp.type && cp.type !== 'null')
    ? `, ${CENTERPIECE_PROMPTS[cp.type] ?? 'a large vehicle in the centre'}`
    : '';

  // Raw user prompt injected directly — preserves adjectives, mood, specific details
  // that the structured spec loses (e.g. "abandoned", "debris", "clutter")
  const userDetail = rawPrompt.trim()
    ? `, ${rawPrompt.trim().replace(/["""]/g, '').slice(0, 300)}`
    : '';

  return [
    'Top-down tabletop RPG battlemap, star wars science fiction',
    envDesc + centreDesc,
    userDetail,
    'bird\'s eye view directly overhead, no perspective distortion',
    'dramatic overhead lighting, dark oppressive atmosphere',
    'professional VTT dungeon master map art style, highly detailed painterly illustration, 4K',
  ].filter(Boolean).join(', ');
}

export async function generateMapImage(spec, rawPrompt = '') {
  if (!FAL_KEY) throw new Error('VITE_FAL_KEY not set in .env');

  const prompt = buildImagePrompt(spec, rawPrompt);
  console.log('[imageGen] prompt:', prompt);

  const res = await fetch('/api/fal/fal-ai/flux-pro/v1.1-ultra', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio:          '4:3',   // ~2048×1536 at Ultra resolution
      raw:                   true,    // less AI-smoothed, more texture/detail
      num_images:            1,
      enable_safety_checker: false,
      output_format:         'jpeg',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fal.ai ${res.status}: ${err}`);
  }

  const data = await res.json();
  const url = data.images?.[0]?.url;
  if (!url) throw new Error('fal.ai returned no image URL');

  // Fetch as blob so WebGL can use it without CORS taint issues
  const imgRes = await fetch(url);
  const blob   = await imgRes.blob();
  return URL.createObjectURL(blob);
}
