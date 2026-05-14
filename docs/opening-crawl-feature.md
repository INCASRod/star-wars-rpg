# Opening Crawl Feature — Implementation Brief

This document is a complete briefing for implementing the Opening Crawl feature. It was produced by auditing the actual codebase against a Claude Desktop proposal and correcting all discrepancies. Hand this file to Claude Code to proceed without re-auditing.

---

## What the feature does

The Opening Crawl renders a Star Wars–style scrolling text sequence (intro text → STAR/WARS logo shrink → perspective crawl) inside the **map viewport slot** — the same area where `MapCanvas` normally renders. It does not overtake any other UI elements. It simply replaces the map in that slot.

The GM composes the crawl text in the staging area, hits Play, and all connected players see `OpeningCrawlCanvas` appear in their Session tab's viewport. The existing `useActiveMap` / `is_active` mechanism handles sync automatically — no new Realtime channel is needed.

---

## Verified asset paths

Both files exist at these exact paths:

| Asset | Path |
|---|---|
| Star Jedi font | `public/fonts/StarJediOutline-y0xm.ttf` |
| Theme audio | `public/sounds/star-wars-theme-song.mp3` |

The CD proposal referenced `public/assets/fonts/` and `public/assets/audio/` — **those paths do not exist.**

---

## Current maps table schema (full column list)

From `supabase/migrations/032_maps.sql` plus subsequent migrations:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `campaign_id` | uuid FK → campaigns | ON DELETE CASCADE |
| `name` | text NOT NULL | |
| `image_url` | text NOT NULL | **Must be made nullable in migration 053** — crawl rows have no image |
| `grid_enabled` | boolean NOT NULL DEFAULT false | |
| `grid_size` | integer DEFAULT 50 | |
| `is_active` | boolean NOT NULL DEFAULT false | |
| `is_visible_to_players` | boolean NOT NULL DEFAULT false | |
| `created_at` | timestamptz DEFAULT now() | |
| `planet_id` | uuid FK → map_planets | added in migration 050 |
| `token_scale` | float | added in migration 035 |

There is a unique partial index `idx_maps_one_active ON maps (campaign_id) WHERE is_active = true` — only one map per campaign can be active.

---

## Architecture corrections (vs CD proposal)

### 1. `StagingMapPanel.tsx` is dead code — do not touch it

`src/components/staging/StagingMapPanel.tsx` is **not imported anywhere in the application**. It is leftover from an earlier architecture. All map management UI (planet folders, Set Active, upload, visibility toggle) lives inside `GmMapView.tsx`. The Opening Crawl controls must go in `GmMapView.tsx`, not `StagingMapPanel.tsx`.

### 2. GM viewport branch belongs in `GmMapView.tsx`, not `gm/page.tsx`

The CD proposal says "In `gm/page.tsx`, locate the conditional around line 190." Line 190 of `gm/page.tsx` is just the `useActiveMap` hook call. The actual `<MapCanvas />` render conditional is in **`src/components/gm/GmMapView.tsx` around line 754**. `gm/page.tsx` calls `<GmMapView activeMap={activeMap} allMaps={allMaps} ... />` and delegates rendering to it.

### 3. `image_url` is NOT NULL — migration must relax this

`032_maps.sql:46` defines `image_url text NOT NULL`. A crawl map row has no image. Migration 053 must include:
```sql
ALTER TABLE maps ALTER COLUMN image_url DROP NOT NULL;
```

### 4. `ActiveMap` TypeScript interface must be extended

`src/hooks/useActiveMap.ts` lines 6–18 define an explicit `ActiveMap` interface listing every column. After migration 053, TypeScript will reject every `map.map_type` and `map.crawl_content` access unless the interface is updated:

```ts
export interface ActiveMap {
  id: string
  campaign_id: string
  name: string
  image_url: string        // now nullable at DB level, keep as string here (empty string default)
  grid_enabled: boolean
  grid_size: number
  is_active: boolean
  is_visible_to_players: boolean
  token_scale: number
  created_at: string
  planet_id: string | null
  map_type: string                          // NEW — 'standard' | 'crawl'
  crawl_content: {                          // NEW — nullable
    heading: string
    subheading: string
    body: string
  } | null
}
```

### 5. `HudSessionTab.tsx` uses an inline prop type for `visibleMap`

The `visibleMap` prop in `HudSessionTab.tsx` (line 149) is typed as a local inline interface, not the full `ActiveMap` type:
```ts
visibleMap: { id: string; image_url: string; grid_enabled: boolean; grid_size?: number; token_scale?: number } | null
```
`map_type` is not in it. Add `map_type?: string` to this inline type, or the `visibleMap?.map_type === 'crawl'` check will be a TypeScript error.

### 6. Crawl map must be filtered from the folder lists in `GmMapView`

`GmMapView.tsx` renders `allMaps` into planet-grouped folder rows (All Maps, per-planet, Unassigned) starting around line 981. Each row renders a thumbnail via `image_url` and shows Set Active / Delete / planet-assignment controls. A crawl map row will appear in "All Maps" and "Unassigned" with a broken thumbnail and confusing controls.

Before the folder renders, filter the crawl row out:
```ts
const standardMaps = allMaps.filter(m => m.map_type !== 'crawl')
```
Use `standardMaps` in the folder lists. The crawl row is shown only in its own dedicated section.

### 7. `previewMap` complication in `GmMapView`

The GM canvas condition uses `(previewMap ?? activeMap)` — not just `activeMap`. The crawl branch must be:
```ts
(previewMap ?? activeMap)?.map_type === 'crawl'
```

---

## Token hiding

**No individual `is_visible` flag manipulation is needed.** Tokens are scoped by `map_id`. When Play activates the crawl map row, `useMapTokens(crawlMap.id)` returns an empty array — all tokens naturally disappear for GM and players because there are no tokens on the crawl map row. When Stop Crawl restores the previous map, `useMapTokens(prevMapId)` returns those tokens with all their original `is_visible` flags intact.

**No UI overlay suppression needed.** The crawl plays in the map viewport slot only. The initiative strip, drawer buttons, floating toolbar, and all other HUD elements remain visible and are not modified.

---

## Step-by-step implementation

### Step 1 — Migration `053_crawl_map_type.sql`

```sql
-- Relax image_url NOT NULL (crawl rows have no image)
ALTER TABLE maps ALTER COLUMN image_url DROP NOT NULL;

-- Add map_type column
ALTER TABLE maps ADD COLUMN IF NOT EXISTS map_type TEXT NOT NULL DEFAULT 'standard';

-- Add crawl_content column
ALTER TABLE maps ADD COLUMN IF NOT EXISTS crawl_content JSONB;

-- Add CHECK constraint (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'maps_map_type_check' AND conrelid = 'maps'::regclass
  ) THEN
    ALTER TABLE maps ADD CONSTRAINT maps_map_type_check
      CHECK (map_type IN ('standard', 'crawl'));
  END IF;
END $$;
```

### Step 2 — New component `src/components/map/OpeningCrawlCanvas.tsx`

Props:
- `heading: string`
- `subheading: string`
- `body: string`

Sequence (in order):
1. **Phase 1 — Intro text**: Black bg + static starfield (~180 random stars, canvas element, seeded on mount, no re-render). Centred italic text `"A long time ago, in a galaxy far, far away…."`. Font: Exo 2, italic, ~15px, colour `#5a7fa8`. Fade in 800ms → hold 2500ms → fade out 800ms.
2. **Phase 2 — Logo**: STAR / WARS stacked, centre-aligned. Font: `StarJediOutline-y0xm` via `@font-face` → `public/fonts/StarJediOutline-y0xm.ttf`. Colour `#ffe84d`, ~88px, `line-height: 1.05`. Fade in 600ms → hold 1500ms → shrink-to-point via `requestAnimationFrame` from `scale(1)` to `scale(0.04)` over 3200ms with ease-in-out; fade out in the final 15% of shrink. Starfield stays visible behind logo throughout.
3. **Phase 3 — Crawl text**: Fade in crawl stage over 300ms once logo gone. Text starts fully below viewport: `bottom: -(trackHeight + viewportHeight * 0.1)px`. Animate via `requestAnimationFrame`, scrolling upward over 70 seconds to `bottom: viewportHeight * 1.8px`. Perspective container: `perspective: 280px`, `perspective-origin: 50% 18%`. Track: `rotateX(28deg)`, `transform-origin: 50% 100%`, width `58%`, centred horizontally. Text layout: Heading (Exo 2, 13px, `letter-spacing: 0.3em`, uppercase, centred, `#ffe84d`), Subheading (Orbitron, 21px, bold, `letter-spacing: 0.08em`, uppercase, centred, `#ffe84d`), Body (Exo 2, 14px, `line-height: 1.85`, justified, `#ffe84d`). Top fade overlay: `linear-gradient(to bottom, #000 25%, transparent)`, height 38%, above crawl track. Bottom fade overlay: `linear-gradient(to top, #000 40%, transparent)`, height 18%, above crawl track.

Audio:
- Load `public/sounds/star-wars-theme-song.mp3` on mount via HTML5 `Audio` API.
- Begin playback at Phase 1 start.
- Hard-stop and unload at exactly 73 seconds via `setTimeout`.
- Clean up on unmount.

Font note: Orbitron and Exo 2 are globally loaded. Only `StarJediOutline-y0xm` needs a `@font-face` declaration, scoped to this component.

Design rules: the `#5a7fa8` intro-text colour and `#ffe84d` crawl colour are crawl-specific values. Add them to `src/lib/tokens.ts` as `CRAWL_INTRO_BLUE` and `CRAWL_GOLD` (or similar) rather than hardcoding in the component.

### Step 3 — Player viewport branch (`HudSessionTab.tsx`)

File: `src/components/player-hud/HudSessionTab.tsx`

1. Add `map_type?: string` to the `visibleMap` inline prop type (line 149).
2. In the viewport conditional (lines 290–313), add a third branch **before** the existing `<MapCanvas>` branch:

```tsx
{visibleMap?.map_type === 'crawl'
  ? <OpeningCrawlCanvas
      heading={visibleMap.crawl_content?.heading ?? ''}
      subheading={visibleMap.crawl_content?.subheading ?? ''}
      body={visibleMap.crawl_content?.body ?? ''}
    />
  : visibleMap
    ? <MapCanvas ... />          // existing branch, unchanged
    : <div>Waiting for GM...</div>  // existing branch, unchanged
}
```

Note: `crawl_content` is on the full `ActiveMap` type, but `visibleMap` is the inline type. Either widen the inline type to include `crawl_content`, or pass it as a separate prop (e.g. `crawlContent`). The cleanest approach is to change `visibleMap`'s prop type to `ActiveMap | null` and update the call site in `PlayerHUDDesktop.tsx`.

### Step 4 — GM viewport branch (`GmMapView.tsx`)

File: `src/components/gm/GmMapView.tsx`

In the canvas conditional at line 754, add the same third branch:
```tsx
{(previewMap ?? activeMap)?.map_type === 'crawl'
  ? <OpeningCrawlCanvas ... />
  : (previewMap ?? activeMap)
    ? <> <MapCanvas ... /> {previewMap && <PreviewBanner />} </>
    : <NoActiveMapPlaceholder />
}
```

Draw `crawl_content` from `(previewMap ?? activeMap)?.crawl_content`.

### Step 5 — Opening Crawl controls in `GmMapView.tsx`

Location: The "Map actions footer" section at line 1057, **below** the `◈ Generate Map` button and **above** the footer hint line. Add a visual separator and an "Opening Crawl" section.

State needed (add to `GmMapView` component state):
```ts
const [crawlHeading,    setCrawlHeading]    = useState('')
const [crawlSubheading, setCrawlSubheading] = useState('')
const [crawlBody,       setCrawlBody]       = useState('')
const [crawlMapId,      setCrawlMapId]      = useState<string | null>(null)
const [previousMapId,   setPreviousMapId]   = useState<string | null>(null)
const [crawlBusy,       setCrawlBusy]       = useState(false)
```

On mount (useEffect on `campaignId`):
1. Query `maps` for a row where `campaign_id = campaignId AND map_type = 'crawl'`.
2. If found: store its `id` in `crawlMapId`, populate form fields from `crawl_content`.
3. If not found: insert a new row with `map_type: 'crawl'`, `is_active: false`, `is_visible_to_players: false`, `name: 'Opening Crawl'`, `image_url: ''`, `crawl_content: { heading: '', subheading: '', body: '' }`. Store the returned `id` in `crawlMapId`.

**Compose form** (inside the library drawer):
- `Heading` — `<input>` single-line
- `Sub-heading` — `<input>` single-line
- `Body` — `<textarea>` multi-line
- **Save Crawl** button: `UPDATE maps SET crawl_content = {heading, subheading, body} WHERE id = crawlMapId`

**Play Opening button**:
1. Save current form values to `crawl_content` (same UPDATE as Save Crawl).
2. Store `activeMap?.id ?? null` in `previousMapId`.
3. Run the two-query activation sequence (matching `GmMapView`'s existing `setActive` function):
   - `UPDATE maps SET is_active = false WHERE campaign_id = campaignId`
   - `UPDATE maps SET is_active = true, is_visible_to_players = true WHERE id = crawlMapId`
4. Disabled if heading, subheading, and body are all empty strings.

**Stop Crawl button**:
1. Visible only when `activeMap?.map_type === 'crawl'`.
2. Set `is_visible_to_players = false` on the crawl row.
3. If `previousMapId` is non-null: run the two-query sequence to restore it as active.
4. If `previousMapId` is null: run only `UPDATE maps SET is_active = false WHERE campaign_id = campaignId`.
5. Clear `previousMapId` from state.

**Filter crawl row from folder lists**: Before the folder renders (~line 981), derive:
```ts
const standardMaps = allMaps.filter(m => m.map_type !== 'crawl')
```
Replace all `allMaps` references in folder renders with `standardMaps`. The `allMaps` prop (which includes the crawl row) is still used for the `useMapTokens` call and counts — be precise about which usages to swap.

---

## Acceptance criteria (from CD proposal — still valid)

1. Running `053_crawl_map_type.sql` adds `map_type` and `crawl_content` without error; re-running is safe.
2. A crawl map row is auto-created for the campaign on first `GmMapView` load if one does not exist.
3. GM can compose heading/subheading/body and Save; values persist on reload.
4. GM pressing Play Opening activates the crawl map; players immediately see `OpeningCrawlCanvas` in the viewport slot.
5. Crawl plays in full: intro text → STAR/WARS logo shrink → perspective crawl scrolling up.
6. Audio begins at sequence start and hard-stops at 73 seconds.
7. GM pressing Stop Crawl restores the previously active map for GM and players; tokens reappear.
8. If no map was active before Play, Stop Crawl leaves all maps inactive and players see the "Waiting for GM" placeholder.
9. Existing map switching, Pixi.js rendering, and all sealed namespaces (`DICE_COLOR`, `SYM_COLOR`, dice CSS classes, `sw-rpg-icons`, `FONT_ICONS`) are unaffected.

---

## Files to create or modify

| File | Action |
|---|---|
| `supabase/migrations/053_crawl_map_type.sql` | Create |
| `src/lib/tokens.ts` | Modify — add `CRAWL_INTRO_BLUE` and `CRAWL_GOLD` constants |
| `src/hooks/useActiveMap.ts` | Modify — add `map_type` and `crawl_content` to `ActiveMap` interface |
| `src/components/map/OpeningCrawlCanvas.tsx` | Create |
| `src/components/player-hud/HudSessionTab.tsx` | Modify — add `map_type` to inline prop type; add crawl branch |
| `src/components/gm/GmMapView.tsx` | Modify — add crawl branch in canvas area; add crawl controls in drawer footer; filter crawl row from folder lists |

**Do not modify:** `StagingMapPanel.tsx` (dead code), `MapCanvas.tsx`, any RLS policies, any dice/icon namespaces.
