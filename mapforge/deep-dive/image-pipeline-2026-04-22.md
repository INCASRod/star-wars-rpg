# Deep Dive: AI Image Pipeline & Interactive Map Layer
**Date:** 2026-04-22  
**Files covered:** `imageGen.js`, `assetPicker.js`, `vite.config.js`, `renderer.js`, `main.js`

---

## What Was Built

This session replaced the tile-based grid renderer with an AI-generated background image from fal.ai Flux Pro Ultra. On top of that image, a transparent gameplay grid is overlaid, and users can drag-and-drop sprite assets from a sidebar panel into the map. The system has:

1. A **Vite dev-server proxy** that forwards browser requests to Anthropic and fal.ai APIs
2. A **structured prompt builder** that combines environment spec + raw user text → a detailed image generation prompt
3. A **blob-URL CORS workaround** to avoid WebGL canvas taint
4. A **PixiJS EventBoundary polyfill** to bridge a version incompatibility between pixi-viewport v5 and PixiJS v7.4
5. A **loading overlay** with animated progress bar and step-dot track
6. An **asset drag-and-drop layer** for placing sprites onto the live map

---

## File 1: `vite.config.js` — The Browser → API Bridge

### Overview

Browsers block cross-origin requests to third-party APIs like Anthropic and fal.ai. The Vite dev server acts as a local proxy: the browser calls `/api/anthropic/...`, Vite forwards it to `https://api.anthropic.com/...`, strips browser headers, and returns the response.

### Code

```js
proxy: {
  '/api/anthropic': {
    target: 'https://api.anthropic.com',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api\/anthropic/, ''),
    configure: proxy => {
      proxy.on('proxyReq', proxyReq => {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      });
    },
  },
```

### Concepts Explained

**Why does `changeOrigin: true` matter?**  
Without it, Vite forwards the `Host` header as `localhost:5173`. The upstream API sees `Host: localhost` and may reject the request. `changeOrigin` replaces `Host` with the target domain.

**Why strip `origin` and `referer`?**  
Anthropic's API checks the `Origin` header. If it sees `localhost`, it knows it's a browser request and requires specific CORS headers. By stripping these, the request looks like it came from a server-side Node.js client, which bypasses those restrictions.

**The `rewrite` function**  
`path.replace(/^\/api\/anthropic/, '')` strips the proxy prefix before forwarding. `/api/anthropic/v1/messages` becomes `/v1/messages` at the target.

**Critical: proxy changes require server restart**  
The proxy config only loads at startup — `vite.config.js` is not hot-reloaded. Every time you change it, you must stop and restart `npm run dev`.

### Alternatives
- **Direct API call from frontend**: Only works for services that set `Access-Control-Allow-Origin: *`. Most paid APIs don't.
- **Backend server (Express/Fastify)**: More robust for production. This proxy pattern is dev-only; in production you'd need a real server function.
- **Serverless functions (Vercel/Netlify edge functions)**: The production equivalent of this pattern.

---

## File 2: `src/imageGen.js` — Prompt Engineering + fal.ai

### Overview

Takes a parsed `spec` object (from Claude) plus the raw user text string, builds a detailed image generation prompt, POSTs to fal.ai Flux Pro Ultra, and returns a blob URL.

### Prompt Construction

```js
export function buildImagePrompt(spec, rawPrompt = '') {
  const envDesc = ENV_PROMPTS[spec.environment] ?? ENV_PROMPTS.spaceship;
  // ...
  const userDetail = rawPrompt.trim()
    ? `, ${rawPrompt.trim().replace(/["""]/g, '').slice(0, 300)}`
    : '';

  return [
    'Top-down tabletop RPG battlemap, star wars science fiction',
    envDesc + centreDesc,
    userDetail,
    "bird's eye view directly overhead, no perspective distortion",
    'dramatic overhead lighting, dark oppressive atmosphere',
    'professional VTT dungeon master map art style, highly detailed painterly illustration, 4K',
  ].filter(Boolean).join(', ');
}
```

**Why inject `rawPrompt` directly?**  
The Claude parser extracts structured data: `{ environment: 'spaceship', faction: 'imperial' }`. But it loses tone-carrying adjectives like "abandoned", "debris-covered", "claustrophobic". Injecting the raw string after the structured prompts preserves these details without requiring Claude to perfectly capture every nuance.

**Concepts:**
- **Prompt engineering**: Ordering matters in diffusion model prompts. More important terms earlier, style/quality tags at the end.
- `raw: true` in the API payload disables fal.ai's own post-processing smoothing, resulting in more texture and detail.

### The Blob URL CORS Workaround

```js
const imgRes = await fetch(url);     // fetch the image URL fal.ai returned
const blob   = await imgRes.blob();  // convert response to a binary blob
return URL.createObjectURL(blob);    // create a local `blob:http://...` URL
```

**Why is this necessary?**  
WebGL has a security rule: if you load an image from a cross-origin URL (like `cdn.fal.ai/...`) into a texture, the canvas is "tainted". Tainted canvases block calls to `gl.readPixels()` and `canvas.toDataURL()`.

By fetching the image through Vite's proxy and creating a local `blob:` URL, the browser treats the image as same-origin. The blob URL lives at `blob:http://localhost:5173/...` — same origin as the app.

**Lifecycle:** `URL.createObjectURL()` creates a reference that lives in memory. For a persistent app you'd call `URL.revokeObjectURL()` to free it when done. In this project the map is replaced on each generation, so the previous blob gets GC'd eventually (not a memory leak for typical usage).

---

## File 3: `src/renderer.js` — PixiJS + the EventBoundary Polyfill

### The Incompatibility Problem

pixi-viewport v5 was written for PixiJS v6/v7.0, which used an `interactive: boolean` property on display objects to mark them as clickable. PixiJS v7.4 replaced this with an `isInteractive(): boolean` method and an `eventMode` enum (`'static' | 'passive' | 'dynamic' | 'none' | 'auto'`).

When viewport calls its own internal hit-testing routines, they eventually reach PixiJS v7.4's `EventBoundary`, which calls `currentTarget.isInteractive()` — a method that doesn't exist on objects created by old pixi-viewport code. Result: `TypeError: currentTarget.isInteractive is not a function`.

### The Fix (Prototype Polyfill)

```js
const boundary = app.renderer.events?.boundary;
if (boundary) {
  const proto = Object.getPrototypeOf(boundary);
  for (const method of ['hitTestRecursive', 'hitTestMoveRecursive']) {
    const orig = proto[method];
    if (!orig) continue;
    proto[method] = function (currentTarget, ...args) {
      if (currentTarget && typeof currentTarget.isInteractive !== 'function') {
        const wasInteractive = currentTarget.interactive === true;
        currentTarget.isInteractive = () => wasInteractive;
        if (!currentTarget.eventMode)
          currentTarget.eventMode = wasInteractive ? 'static' : 'passive';
      }
      return orig.call(this, currentTarget, ...args);
    };
  }
}
```

**What this does, step by step:**

1. Gets the `EventBoundary` instance from PixiJS's event system
2. Gets its prototype (shared across all instances — patching prototype affects all instances)
3. Wraps the two hit-testing methods: `hitTestRecursive` and `hitTestMoveRecursive`
4. Before calling the original method, checks if `currentTarget` is missing `isInteractive`
5. If missing: reads the old `interactive` boolean property, creates a shim function `isInteractive = () => wasInteractive`
6. Also sets `eventMode` so the new system understands the intent
7. Calls through to the original method

**Why not just upgrade pixi-viewport?**  
pixi-viewport v5 is the last version compatible with PixiJS v7 API. v6 requires PixiJS v8 which has a very different API surface. The polyfill is the least invasive fix.

**Why patch the prototype rather than each object?**  
The objects in question are internal to pixi-viewport and created at runtime — we don't control when they're made. Patching the prototype of `EventBoundary` intercepts all hit-tests globally, so the polyfill applies regardless of which object is being tested.

### The Two Render Modes

```js
if (bgImageUrl) {
  await _drawImageBackground(viewport, bgImageUrl, worldW, worldH);
  _drawGrid(viewport, W, H);
} else {
  // full programmatic tile render
}
```

**AI mode**: One `PIXI.Sprite` scaled to world dimensions, plus a vignette overlay (8-step gradient, 4 directions), plus a 9%-opacity white grid.

**Programmatic fallback**: Full tile loop — floor plates with seams, ambient-occlusion shadows, walls with face caps, doors with accent stripes, prop sprites.

**The vignette pattern** (`_drawImageBackground`):
```js
// 8 gradient steps from alpha=0.55 to alpha=0
for (let s = 0; s < steps; s++) {
  const alpha = 0.55 * (1 - s / steps);
  // draw a thin rectangle slice
}
```
This is a software-rendered gradient (PixiJS Graphics doesn't natively support gradient fills). Each iteration draws a slightly thinner, more transparent black rectangle, simulating a gradient falloff from the edges inward. It softens the hard crop of the AI image.

---

## File 4: `src/assetPicker.js` — Drag-and-Drop Sprites

### Two Layers of Drag-and-Drop

This file handles **two separate drag systems** that had to coexist:

1. **HTML5 Drag from sidebar to map** — browser native DnD, crosses the DOM→canvas boundary
2. **PixiJS pointer drag within the map** — after placement, assets can be repositioned inside the WebGL canvas

### HTML5 DnD (sidebar → map)

In `buildAssetPickerHTML()`:
```html
<div class="asset-thumb" draggable="true" data-type="crate">
```

In `main.js`:
```js
el.addEventListener('dragstart', e => {
  e.dataTransfer.setData('text/plain', el.dataset.type);
  e.dataTransfer.effectAllowed = 'copy';
});

mapArea.addEventListener('drop', async e => {
  const type = e.dataTransfer.getData('text/plain');
  const vp = getViewport();
  const canvas = mapArea.querySelector('canvas');
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = canvas.width / rect.width;        // device pixel ratio
  const canvasX = (e.clientX - rect.left) * pixelRatio;
  const canvasY = (e.clientY - rect.top)  * pixelRatio;
  const world = vp.toWorld(canvasX, canvasY);           // viewport → world space
  await placeAsset(type, world.x, world.y);
});
```

**The coordinate chain:** Mouse position → subtract canvas rect offset → multiply by pixel ratio (for HiDPI displays) → `vp.toWorld()` converts from canvas pixels to world-space pixels (accounting for zoom and pan).

### PixiJS In-Map Drag

```js
sprite.on('pointerdown', e => {
  e.stopPropagation();         // stop viewport from also receiving the event
  vp.plugins.pause('drag');    // tell pixi-viewport "don't pan right now"
  // record offset between sprite center and cursor
});
sprite.on('globalpointermove', e => {
  if (!dragging) return;
  const world = vp.toWorld(e.global.x, e.global.y);
  sprite.x = world.x - offX;  // apply offset so grab point stays under cursor
  sprite.y = world.y - offY;
});
sprite.on('pointerup', () => {
  vp.plugins.resume('drag');   // restore viewport panning
});
```

**Why `globalpointermove` instead of `pointermove`?**  
`pointermove` only fires when the pointer is over the sprite's hit area. If the user drags quickly, the cursor can outrun the sprite and events stop. `globalpointermove` fires regardless of where the cursor is on the stage.

**Why pause/resume viewport drag?**  
Both the sprite and the viewport listen to pointer events. Without pausing, both respond simultaneously — the map pans while the sprite moves, creating chaotic behaviour.

**Right-click removal:**
```js
sprite.on('rightclick', () => {
  _layer.removeChild(sprite);
  sprite.destroy({ children: true });
});
```
`destroy({ children: true })` cascades — the drop shadow ellipse (added as a child of the sprite) is also destroyed, freeing GPU texture memory.

---

## File 5: `src/main.js` — The Generation Pipeline

### The Overlay + Progress System

The overlay has 5 named steps (PARSE → LAYOUT → IMAGE → ASSETS → RENDER). `setStep(idx, label, detail, pct)` updates the heading text and dots. `_setPct(n)` moves the progress bar fill.

**Concurrent animation during API wait:**

```js
animatePct(36, 80, 14000);                          // start animating (non-blocking)
bgImageUrl = await generateMapImage(imageSpec, promptText);  // wait for API
_setPct(82);                                        // jump to actual position
```

`animatePct` uses `requestAnimationFrame` — it's fire-and-forget. The rAF loop runs while the `await` suspends the async function. This gives users visual feedback that something is happening during the ~10-14 second fal.ai call.

```js
function animatePct(from, to, ms) {
  const start = performance.now();
  const tick = now => {
    const t = Math.min((now - start) / ms, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    _setPct(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
```

**Ease-out cubic** `1 - (1-t)³`: starts fast, slows near the end — feels natural for a loading bar that's waiting on something uncertain.

### Fallback Chain

```js
try {
  spec = await parsePromptWithClaude(promptText);
} catch (err) {
  const parsed = parsePrompt(promptText);  // keyword fallback
}
// ...
try {
  bgImageUrl = await generateMapImage(imageSpec, promptText);
} catch (err) {
  // fall through to programmatic render
}
```

Two levels of fallback:
1. Claude API fails → keyword parser extracts env/faction from word list
2. fal.ai fails → programmatic tile renderer takes over

---

## Architecture Summary

```
User prompt
    │
    ▼
parsePromptWithClaude() ──[fail]──► parsePrompt() (keywords)
    │
    ▼
generateBSP/Cellular/SingleRoom()  ← layout still generated regardless
    │
    ▼
generateMapImage() ──[fail]──► programmatic tile render
    │
    ▼ (on success)
_drawImageBackground() + _drawGrid()
    │
    ▼
initAssetLayer() → PIXI Container for drag-drop assets
```

**Key insight:** The tile layout is always generated — even in AI image mode. It's there as data (room count, room positions) even though it's not rendered. This means a future feature could use the layout to intelligently position sprite assets.

---

## Further Reading

- **fal.ai Flux Pro Ultra**: https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra — parameter reference, model capabilities
- **PixiJS v7 Event System**: https://pixijs.com/8.x/guides/components/events — `eventMode` docs (note: v8 docs, same concept)
- **pixi-viewport**: https://davidfig.github.io/pixi-viewport/jsdoc/ — `plugins.pause/resume`, `toWorld()`
- **Ease functions reference**: https://easings.net/ — visual reference for all common easing curves
- **HTML5 Drag and Drop API**: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- **WebGL CORS / canvas taint**: https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
- **Vite server proxy**: https://vite.dev/config/server-options#server-proxy
- **`URL.createObjectURL`**: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
