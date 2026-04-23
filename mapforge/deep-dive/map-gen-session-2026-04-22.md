# Map Generator — Deep Dive
**Session:** 2026-04-22  
**Files covered:** `claudeParser.js` · `generator.js` · `assets.js` · `renderer.js` · `main.js`

---

## Overview

This session wired up the Claude API for intelligent prompt parsing, added a spec-driven map generator (single-room layouts with vehicle centrepieces), and overhauled the floor renderer to eliminate the per-tile grid look. The overall pipeline is:

```
User prompt (natural language)
    ↓  claudeParser.js
Structured JSON spec  ←──── Claude Haiku model
    ↓  main.js (orchestrator)
Grid layout  ←──── generator.js (BSP / cellular / single-room)
    +
Object grid  ←──── placeObjectsFromSpec() or placeObjects()
    ↓  renderer.js
PixiJS scene (WebGL)
```

---

## File 1: `src/claudeParser.js`

### What it does
Sends the user's raw text prompt to the Anthropic API and gets back a **structured JSON map spec** — environment type, layout mode, door positions, prop list, centerpiece vehicle, etc. Converts ambiguous natural language ("a garage with a shuttle painted black") into precise machine-readable instructions.

### Key concepts

#### Direct `fetch()` instead of the Anthropic SDK
```js
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-allow-browser': 'true',  // ← critical
  },
  body: JSON.stringify({ model, max_tokens, system, messages }),
});
```

**Why not the `@anthropic-ai/sdk` npm package?** The Node SDK was built for server-side use and imports Node-only modules (`fs`, `crypto`, etc.) that Vite/browser can't bundle. Using raw `fetch()` works in any environment — browser, Node, Deno, edge workers.

**Why `anthropic-dangerous-allow-browser: true`?** Anthropic blocks API calls from browsers by default to prevent API key exposure in client-side code. This header says "I know the risk, allow it anyway." For a personal tool this is fine; for a public app you'd proxy through your own server.

**When to use this pattern:** Any time you need to call an HTTP API from a browser without a library. Also useful for keeping your bundle size small — `@anthropic-ai/sdk` adds ~200KB.

#### Structured output via system prompt engineering
```js
const SYSTEM_PROMPT = `Return ONLY valid JSON with this exact shape...`;
```

Claude doesn't have a built-in "JSON mode" in v1 of the API (unlike OpenAI). The trick is:
1. Show the exact schema in the system prompt
2. Say "ONLY valid JSON — no markdown, no explanation"
3. Strip code fences defensively: `raw.replace(/^```(?:json)?\s*/i, '')`

**Why this approach over function calling / tool use?** Tool use forces the model to call a function with typed arguments — great for actions. But when you just want structured data back, a schema in the system prompt is simpler and uses fewer tokens. The model also has more flexibility to reason before committing to fields.

**Alternative:** Anthropic's newer models support `type: "json"` response format directly. When this project upgrades to Claude 3.5+ APIs, that's cleaner.

#### Defensive JSON parsing
```js
const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
return JSON.parse(json);
```

Even when you tell a model to return only JSON, it sometimes wraps the response in markdown code fences (` ```json ... ``` `). The regex strips those before parsing. If `JSON.parse` throws, `main.js` catches it and falls back to keyword matching — graceful degradation.

**When to apply this:** Any time you parse LLM-generated structured data. Always strip before parsing, always wrap in try/catch.

---

## File 2: `src/generator.js` — New additions

### `generateSingleRoom(W, H, spec)`

#### What it does
Carves a single floor rectangle filling most of the map, then reads the `spec.doors` array to place doors on the correct walls at the correct positions.

```js
const grid = Array.from({ length: H }, () => new Array(W).fill(T.WALL));
const pad = 2;
const room = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };

for (let y = room.y; y < room.y + room.h; y++)
  for (let x = room.x; x < room.x + room.w; x++)
    grid[y][x] = T.FLOOR;
```

**Why `pad = 2`?** Keeps the room boundary 2 tiles from the canvas edge so walls are always visible and don't get clipped. Without padding, doors placed on the boundary would be off-screen.

**The door placement logic:**
```js
const seg = Math.floor(room.w / (count + 1));
dx = room.x + seg * (i + 1) - Math.floor(size / 2);
```

If you ask for 2 doors on the north wall, `count = 2`, so the wall is divided into 3 segments (`count + 1`). Door 0 goes at 1/3, door 1 at 2/3. The `- Math.floor(size / 2)` centres wide doors on their calculated position. This is called **equidistant interval placement** and is the same algorithm used for evenly spacing items along a line (e.g. CSS `justify-content: space-around`).

### `placeObjectsFromSpec(grid, rooms, W, H, spec)`

#### What it does
Two-pass object placement driven by the Claude spec rather than random density:
1. **Centerpiece pass** — places the primary vehicle/prop dead-centre first
2. **Props pass** — places each item in `spec.props[]` using its declared placement strategy

#### The occupied grid (collision detection)
```js
const occupied = Array.from({ length: H }, () => new Array(W).fill(false));

function canPlace(ox, oy, pw, ph) {
  for (let dy = 0; dy < ph; dy++) for (let dx = 0; dx < pw; dx++) {
    if (occupied[oy + dy][ox + dx]) return false;
  }
  return true;
}
```

This is a **2D boolean bitmask**. Before placing an object, every tile it would occupy is checked. After placing, all those tiles are marked `true`. This ensures a 6×4 shuttle never overlaps a 2×3 container.

**Why not just check `objGrid[y][x]`?** Because `objGrid` only stores an object at its top-left anchor tile — a 6×4 object only has an entry at `[oy][ox]`, not at all 24 cells it occupies. The separate `occupied` mask tracks the full footprint.

**The 40-attempt retry loop:**
```js
for (let attempt = 0; attempt < 40 && !placed; attempt++) {
  // pick position based on placement strategy
  placed = tryPlaceAt(ox, oy, ...);
}
```

Random placement strategies (scattered, walls, corners) pick a position, check it, and retry if occupied. 40 attempts is a balance — enough retries to find a valid spot in a crowded room, not so many that generation blocks the thread noticeably.

**Placement strategies explained:**

| Strategy | Where objects land | Use for |
|---|---|---|
| `scattered` | Anywhere inside the room randomly | Crates, debris |
| `walls` / `back` | Along any of the 4 wall edges | Storage rooms |
| `corners` | One of the 4 corner positions | Large equipment |
| `front` | Near the south edge | Staging areas |
| `center` | Near the middle of the room | Conference tables |

---

## File 3: `src/assets.js` — Vehicle prop defs

```js
shuttle:       { w:6, h:4, srcs:['/sprites/vehicles/shuttle.png'] },
cargo_shuttle: { w:8, h:5, srcs:['/sprites/vehicles/cargo-shuttle.png'] },
transport:     { w:7, h:4, srcs:['/sprites/vehicles/transport.png'] },
```

**Why are vehicles so wide in tile units?** The VTT asset pack images are ~500px per grid square. A shuttle PNG is roughly 3000×2000px — that's 6 tiles wide, 4 tiles tall at 500px/tile. Our engine runs at 140px/tile, so the sprite gets scaled to `6 × 140 = 840px` wide which looks about right for a landed shuttle dominating a hangar.

**The `w/h` values are gameplay constraints, not just display hints.** `canPlace()` uses them to check collision. Get them wrong (too small) and sprites overlap; too large and they'll never fit in any room.

---

## File 4: `src/renderer.js` — Floor overhaul

### The grid problem (what was wrong)

The old renderer drew every tile individually with a 3px inset panel:
```js
// OLD — every tile had a visible border
gBase.drawRect(px + 3, py + 3, TS - 6, TS - 6); // inset panel
```

At 140px per tile, this drew a visible black border around every 134×134px square — creating a perfectly regular chess-board of visible seams. This is the #1 visual tell of a tile-based map renderer.

### The fix: deterministic noise + PLATE-sized seams

```js
const PLATE = 4; // seams only every 4 tiles

const noise = ((x * 17 + y * 31) % 23) / 23; // 0..1, no import needed
gBase.beginFill(lerpColor(env.floorC, env.floorAlt, noise * 0.6));
gBase.drawRect(px, py, TS, TS);
```

**Deterministic noise** — `(x * 17 + y * 31) % 23` is a quick hash that gives a different-looking float for every (x, y) position, but always the same float for the same position (so the map looks identical every time you zoom in/out). No external noise library needed.

**Why `% 23`?** 23 is prime. Using a prime modulus avoids visible repeating patterns that you'd get with powers of 2. Try `% 16` and you'll see a subtle 16-tile repeat; `% 23` with the coefficients above produces a visually aperiodic result.

**PLATE seams vs per-tile borders** — instead of a line every tile, a seam appears every 4 tiles. At 140px/tile that's a seam every 560px — suggesting large structural floor plates rather than individual tiles. The seam is only drawn where the neighbouring cell is also floor, so it doesn't appear at room edges.

### `lerpColor(a, b, t)` — colour interpolation

```js
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  // ...
  return ((Math.round(ar + (br - ar) * t) << 16) | ...);
}
```

**Bit operations on hex colours** — a PixiJS colour is a 24-bit integer: `0xRRGGBB`. `>> 16` shifts the red channel into the lowest 8 bits; `& 0xff` masks off anything above 8 bits. This is faster than string manipulation (`#1e2c38` → split → parse) and avoids creating intermediate strings on every tile.

**Linear interpolation (lerp)** — `ar + (br - ar) * t` is the fundamental lerp formula: start + (end - start) × fraction. At `t=0` you get colour `a`, at `t=1` you get `b`, and anything between is a smooth blend. The same formula appears in animation systems, shader math, and colour pickers.

**When to use this:** Any time you want to blend between two values smoothly. Lerp works on numbers, colours, positions, and rotations (use slerp for quaternions).

### Dual-scale texture overlay

```js
// Pass 1: 5-tile scale, alpha 0.50
const overlay1 = new PIXI.TilingSprite(corridorTex, W * TS, H * TS);
overlay1.tileScale.set((5 * TS) / corridorTex.width);
overlay1.blendMode = PIXI.BLEND_MODES.SCREEN;
overlay1.alpha = 0.5;

// Pass 2: 3-tile scale, offset, alpha 0.18
const overlay2 = new PIXI.TilingSprite(corridorTex, W * TS, H * TS);
overlay2.tileScale.set((3 * TS) / corridorTex.width);
overlay2.tilePosition.set(TS * 1.5, TS * 1.5); // phase-shifted
overlay2.alpha = 0.18;
```

**`TilingSprite`** — a PixiJS sprite that tiles a texture across an arbitrary rectangle. The GPU handles the tiling natively; you're not copying pixels in JS. Only one draw call per overlay regardless of map size.

**`BLEND_MODES.SCREEN`** — one of ~30 blend modes. Screen formula: `1 - (1 - src) * (1 - dst)`. Dark pixels in the texture (near 0) have no effect; bright pixels (near 1) brighten the destination. It's the opposite of Multiply. Used here because `corridor-mid.png` is a texture with bright detail lines on a dark background — SCREEN adds the lines without darkening the floor colour underneath.

**Two passes at different scales** — if you tile at a single scale, the repeat becomes obvious across large maps. A second pass at a different scale (3-tile vs 5-tile) and offset position creates interference patterns that look like natural surface variation. The technique is borrowed from **layered noise in shaders** — each octave adds detail at a different frequency.

**The floor mask pattern:**
```js
const mask = new PIXI.Graphics();
// fill only floor tiles with white
overlay.mask = mask;
```

A `mask` in PixiJS is a Graphics or Sprite that defines which pixels of the masked object are visible: white = show, black = hide. Without the mask, `TilingSprite` would fill the entire world rectangle including walls. This is GPU-accelerated stencil clipping — no per-pixel JS work.

---

## File 5: `src/main.js` — Orchestration pipeline

### The Claude-first fallback pattern

```js
try {
  spec = await parsePromptWithClaude(promptText);
} catch (err) {
  console.warn('Claude parse failed, falling back to keywords:', err);
  const parsed = parsePrompt(promptText);  // keyword matching
  envType = parsed.envType;
}
```

**Why this structure?** The Claude API can fail for many reasons: network down, API key expired, rate limit, malformed response. Wrapping it in try/catch and falling back to the simpler keyword parser means the app always produces *something*. This is called **graceful degradation** — your system's happy path uses the best tool available, but it never crashes entirely.

**The critical weakness currently:** If the API call fails silently (e.g. returns a 200 but with unexpected JSON), `JSON.parse` throws and we fall back — but we don't show the user why their detailed prompt was ignored. A `console.log(spec)` before returning from `parsePromptWithClaude` would let you see the actual spec in DevTools and diagnose issues.

### `collectPropTypes(spec, envType)`

```js
function collectPropTypes(spec, envType) {
  const types = new Set(ENV_PROPS[envType] ?? []);
  if (spec.centerpiece?.type) types.add(spec.centerpiece.type);
  for (const p of (spec.props ?? [])) types.add(p.type);
  return [...types];
}
```

**Why `Set` instead of array?** `Set` automatically deduplicates. If the spec says `crate` and the env also has `crate` in its default props, we only load the crate texture once. Converting back to array (`[...types]`) at the end because `loadAssets()` expects an array.

**Optional chaining (`?.`)** — `spec.centerpiece?.type` returns `undefined` instead of throwing if `centerpiece` is null. Used throughout because Claude might not always return every field.

---

## Key CS Concepts in This Codebase

### Binary Space Partitioning (BSP)
Used in `generateBSP()`. Recursively divides a rectangle into two sub-rectangles, then subdivides those, until nodes are too small to split. Each leaf node gets a room. Parent nodes connect their children's rooms with corridors. BSP is the same algorithm used in classic Doom's rendering engine (to determine draw order) and in many roguelike dungeon generators.

### Cellular Automata
Used in `generateCellular()`. A grid of cells, each alive (FLOOR) or dead (WALL). Each generation, a cell lives if it has fewer than 5 wall neighbours; it dies if it has 5 or more. After 4-5 generations, isolated walls smooth out and caves form organically. This is a simplified version of Conway's Game of Life rules, tuned for cave generation.

### Seeded Pseudo-Random Number Generation (PRNG)
`rng.js` implements a linear congruential generator (LCG): `seed = (seed * 1664525 + 1013904223) >>> 0`. The same seed always produces the same sequence. Seeding with a hash of the prompt means the same prompt always produces the same map — reproducible results are essential for sharing maps with players.

### Bit Manipulation
Used in `lerpColor()` and throughout PixiJS colour handling. Colours stored as 24-bit integers (`0xRRGGBB`). `>> 16` = right-shift 16 bits to isolate red. `& 0xff` = AND with 255 to mask only the lowest 8 bits. `<< 16` = left-shift to put a value back into the red position. This avoids string parsing and is significantly faster in tight loops.

---

## What to Learn Next

- **PixiJS Filters (GLSL shaders)** — the next step for organic terrain (noise-based floor textures instead of tile fills): [PixiJS Filters docs](https://pixijs.com/guides/components/filters)
- **Simplex/Perlin noise** — for genuine terrain height maps: [simplex-noise npm](https://www.npmjs.com/package/simplex-noise)
- **Anthropic tool use** — cleaner than system-prompt JSON for structured output: [Tool use docs](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- **fal.ai Flux image generation** — the planned next step for AI-generated map backgrounds: [fal.ai docs](https://fal.ai/docs)
- **BSP in game dev** — deep dive on the algorithm: [RogueBasin BSP article](http://www.roguebasin.com/index.php/Basic_BSP_Dungeon_generation)
- **PIXI blend modes** — all 30 modes explained: [PixiJS blend modes](https://pixijs.download/v7.x/docs/PIXI.BLEND_MODES.html)

---

## Architecture Snapshot (End of Session)

```
src/
├── claudeParser.js   — fetch → Anthropic API → structured JSON spec
├── prompt.js         — keyword fallback for env/faction detection
├── envs.js           — 9 environment colour palettes + metadata
├── generator.js      — BSP · cellular automata · single-room · object placement
├── assets.js         — PROP_DEFS (17 props + 4 vehicles) · texture loading/caching
├── renderer.js       — PixiJS: floor (noise+seams+texture) · shadows · walls · doors · sprites
├── rng.js            — seeded LCG PRNG
└── main.js           — orchestrates the full parse→generate→place→render pipeline

public/sprites/
├── props/            — 20 PNG sprites (crates, tech, furniture, weapons)
├── vehicles/         — 6 PNG sprites (shuttle, transport, tank, bike)
└── floor/            — corridor-mid.png, corridor-end.png, hangar.png

Next session:
├── Integrate fal.ai image gen for background
├── Claude Vision to extract walkable grid from generated image
└── Asset picker UI (pre-generation prop selection)
```
