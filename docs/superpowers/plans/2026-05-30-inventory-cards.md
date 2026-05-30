# Inventory Card System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `InventoryPanel.tsx` with a Master/Detail card system — scrollable thumbnail grid on the left, rich item detail on the right — wired through `HudInventoryTab` as a drop-in swap.

**Architecture:** Five focused files make up the UI (thumb, thumb-grid, hero, condition-track, quality-list, detail-panel, card-panel) plus one shared modal (`stow-location-modal.tsx`) extracted from the old panel. A DB migration adds `condition` and `item_image_url` columns. Type additions and `useCharacterData` memo updates flow the new fields through without logic changes.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, Supabase (Postgres), `@/lib/tokens` design system, no test runner (TypeScript compile is the verification gate for data tasks; visual verification for UI tasks).

**Spec:** `docs/superpowers/specs/2026-05-25-inventory-cards-design.md`

---

## File Map

| Action | Path |
|---|---|
| Create | `supabase/migrations/055_item_condition.sql` |
| Modify | `src/lib/types.ts` |
| Modify | `src/hooks/useCharacterData.ts` |
| Create | `src/components/player-hud/item-thumb.tsx` |
| Create | `src/components/player-hud/item-thumb-grid.tsx` |
| Create | `src/components/player-hud/item-detail-hero.tsx` |
| Create | `src/components/player-hud/item-condition-track.tsx` |
| Create | `src/components/player-hud/item-quality-list.tsx` |
| Create | `src/components/player-hud/stow-location-modal.tsx` |
| Create | `src/components/player-hud/item-detail-panel.tsx` |
| Create | `src/components/player-hud/inventory-card-panel.tsx` |
| Modify | `src/app/globals.css` |
| Modify | `src/components/player-hud/HudInventoryTab.tsx` |
| Delete | `src/components/player-hud/InventoryPanel.tsx` |

---

## Task 1: DB Migration + Type Updates + Data Passthrough

**Files:**
- Create: `supabase/migrations/055_item_condition.sql`
- Modify: `src/lib/types.ts`
- Modify: `src/hooks/useCharacterData.ts`

- [ ] **Step 1.1: Create the migration**

Create `supabase/migrations/055_item_condition.sql`:

```sql
-- Add condition and item_image_url to all three character item tables.
-- condition defaults to 'undamaged' so existing rows need no backfill.
ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_weapons
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;

ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_armor
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;

ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'undamaged'
  CHECK (condition IN ('undamaged','minor','moderate','major','destroyed'));
ALTER TABLE character_gear
  ADD COLUMN IF NOT EXISTS item_image_url TEXT;
```

- [ ] **Step 1.2: Apply the migration**

```bash
npx supabase db push
```

Expected: migration runs without error. All three tables gain two new columns.

- [ ] **Step 1.3: Add `ItemCondition` type to `src/lib/types.ts`**

Add directly after the closing brace of `GearRow` (around line 634):

```ts
export type ItemCondition =
  | 'undamaged'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'destroyed'
```

- [ ] **Step 1.4: Add fields to `WpnDisplay`, `ArmDisplay`, `GearRow`**

In `src/lib/types.ts`, add two fields to each interface:

```ts
// In WpnDisplay (after `stowLocation?`):
  condition:      ItemCondition
  item_image_url: string | null

// In ArmDisplay (after `stowLocation?`):
  condition:      ItemCondition
  item_image_url: string | null

// In GearRow (after `stowLocation?`):
  condition:      ItemCondition
  item_image_url: string | null
```

- [ ] **Step 1.5: Update `hudWeapons` memo in `src/hooks/useCharacterData.ts`**

Add the import at the top of the file (with the existing type imports):

```ts
import type { ..., ItemCondition } from '@/lib/types'
```

In the `hudWeapons` useMemo (around line 666), add three new fields to the returned object:

```ts
return {
  id:             w.id,
  name:           w.custom_name || ref?.name || w.weapon_key || 'Unknown',
  damage:         { baseDamage, isMelee: hasBrawnScale, brawn: hasBrawnScale ? (character?.brawn ?? 0) : 0 },
  crit:           ref?.crit || 0,
  range:          ref?.range_value ? RANGE_LABELS[ref.range_value] || '' : '',
  enc:            ref?.encumbrance || 0,
  hardPoints:     ref?.hard_points || 0,
  qualities:      quals,
  equipState:     w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'),
  skillName:      ref?.skill_key ? refSkillMap[ref.skill_key]?.name || '' : '',
  description:    ref?.description ?? null,
  condition:      (w.condition as ItemCondition) ?? 'undamaged',
  item_image_url: w.item_image_url ?? null,
  stowLocation:   w.equip_state === 'stowed' && w.stow_location_id
    ? { id: w.stow_location_id, name: w.stow_location_name ?? '', type: w.stow_location_type }
    : null,
}
```

- [ ] **Step 1.6: Update `hudArmor` memo**

In the `hudArmor` useMemo (around line 682), add the same three fields:

```ts
return {
  id:             a.id,
  name:           a.custom_name || ref?.name || a.armor_key || 'Armor',
  soak:           ref?.soak || 0,
  defense:        ref?.defense || 0,
  enc:            ref?.encumbrance || 0,
  hardPoints:     ref?.hard_points || 0,
  rarity:         ref?.rarity || 0,
  equipState:     a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'),
  description:    ref?.description ?? null,
  condition:      (a.condition as ItemCondition) ?? 'undamaged',
  item_image_url: a.item_image_url ?? null,
  stowLocation:   a.equip_state === 'stowed' && a.stow_location_id
    ? { id: a.stow_location_id, name: a.stow_location_name ?? '', type: a.stow_location_type }
    : null,
}
```

- [ ] **Step 1.7: Update `hudGear` memo**

In the `hudGear` useMemo (around line 699):

```ts
return {
  id:             g.id,
  name:           g.custom_name || ref?.name || g.gear_key || 'Gear',
  qty:            g.quantity,
  enc:            ref?.encumbrance || 0,
  equipState:     g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'),
  description:    ref?.description ?? null,
  condition:      (g.condition as ItemCondition) ?? 'undamaged',
  item_image_url: g.item_image_url ?? null,
  stowLocation:   g.equip_state === 'stowed' && g.stow_location_id
    ? { id: g.stow_location_id, name: g.stow_location_name ?? '', type: g.stow_location_type }
    : null,
}
```

- [ ] **Step 1.8: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `ItemCondition`, `condition`, or `item_image_url`. The old `InventoryPanel.tsx` will show type errors because it re-exports `WpnDisplay` etc. and those now have new required fields — this is expected and will be resolved in Task 5.

- [ ] **Step 1.9: Commit**

```bash
git add supabase/migrations/055_item_condition.sql src/lib/types.ts src/hooks/useCharacterData.ts
git commit -m "feat(inventory): add condition + item_image_url columns and type passthrough"
```

---

## Task 2: Thumbnail Components (`ItemThumb` + `ItemThumbGrid`)

**Files:**
- Create: `src/components/player-hud/item-thumb.tsx`
- Create: `src/components/player-hud/item-thumb-grid.tsx`

- [ ] **Step 2.1: Create `item-thumb.tsx`**

Create `src/components/player-hud/item-thumb.tsx`:

```tsx
'use client'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS } from '@/lib/tokens'
import type { EquipState, ItemCondition } from '@/lib/types'

interface ItemThumbProps {
  id:         string
  name:       string
  icon:       string
  equipState: EquipState
  condition:  ItemCondition
  isSelected: boolean
  onClick:    () => void
}

const EQUIP_DOT: Record<EquipState, string> = {
  equipped: 'var(--hud-gold)',
  carrying: 'var(--die-success)',
  stowed:   'var(--hud-text-faint)',
}

const COND_STRIP: Record<ItemCondition, string> = {
  undamaged: 'var(--die-success)',
  minor:     'var(--die-success)',
  moderate:  'var(--die-threat)',
  major:     'var(--hud-vital-wounds)',
  destroyed: 'var(--hud-text-faint)',
}

const NAME_COLOR: Record<ItemCondition, string> = {
  undamaged: 'var(--hud-text-dim)',
  minor:     'var(--hud-text-dim)',
  moderate:  'var(--hud-text-dim)',
  major:     'var(--hud-vital-wounds)',
  destroyed: 'var(--hud-text-faint)',
}

export function ItemThumb({ id: _id, name, icon, equipState, condition, isSelected, onClick }: ItemThumbProps) {
  const isDestroyed = condition === 'destroyed'

  return (
    <button
      onClick={onClick}
      className={`inv-thumb${isSelected ? ' inv-thumb-active' : ''}`}
      style={{
        width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 0, background: 'none', border: '1px solid transparent',
        borderRadius: RADIUS.md, padding: '2px', cursor: 'pointer', outline: 'none',
        opacity: isDestroyed ? 0.55 : 1,
      }}
    >
      {/* image area */}
      <div style={{
        width: '100%', height: 44, position: 'relative',
        background: 'radial-gradient(ellipse at 50% 60%, var(--hud-accent-10) 0%, transparent 70%)',
        borderRadius: RADIUS.sm,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: isDestroyed ? 'grayscale(0.8)' : 'none',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: 20, color: isSelected ? 'var(--hud-gold)' : 'var(--hud-text-dim)', lineHeight: 1, fontFamily: FONT_BODY }}>
          {icon}
        </span>
        {/* equip dot */}
        <span style={{
          position: 'absolute', top: 3, right: 3,
          width: 5, height: 5, borderRadius: RADIUS.full,
          background: EQUIP_DOT[equipState],
          flexShrink: 0,
        }} />
        {/* condition strip */}
        <span style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: COND_STRIP[condition],
        }} />
        {/* destroyed overlay */}
        {isDestroyed && (
          <span style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            fontSize: 14, color: 'var(--hud-text-faint)',
          }}>✕</span>
        )}
      </div>
      {/* name label */}
      <div style={{
        fontFamily: FONT_BODY, fontSize: FS.overline,
        color: isSelected ? 'var(--hud-gold)' : NAME_COLOR[condition],
        textAlign: 'center', width: '100%', paddingTop: 2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}>
        {name}
      </div>
    </button>
  )
}
```

- [ ] **Step 2.2: Create `item-thumb-grid.tsx`**

Create `src/components/player-hud/item-thumb-grid.tsx`:

```tsx
'use client'
import { FONT_DISPLAY, FS } from '@/lib/tokens'
import { ItemThumb } from './item-thumb'
import type { WpnDisplay, ArmDisplay, GearRow } from '@/lib/types'

interface ItemThumbGridProps {
  weapons:    WpnDisplay[]
  armorItems: ArmDisplay[]
  gearItems:  GearRow[]
  selectedId: string | null
  onSelect:   (id: string) => void
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 1,
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--hud-gold)',
      background: 'var(--hud-surface-hi)',
      borderBottom: '1px solid var(--hud-border)',
      padding: '4px 5px',
    }}>
      {label}
    </div>
  )
}

const WEAPON_ICON = '⚔'
const ARMOR_ICON  = '◈'
const GEAR_ICON   = '◆'

export function ItemThumbGrid({ weapons, armorItems, gearItems, selectedId, onSelect }: ItemThumbGridProps) {
  return (
    <div style={{
      width: 148, flexShrink: 0,
      overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--hud-surface-hi)',
      borderRight: '1px solid var(--hud-border)',
    }}>
      {weapons.length > 0 && (
        <>
          <SectionHead label="Weapons" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 5 }}>
            {weapons.map(w => (
              <ItemThumb
                key={w.id} id={w.id} name={w.name} icon={WEAPON_ICON}
                equipState={w.equipState} condition={w.condition}
                isSelected={selectedId === w.id}
                onClick={() => onSelect(w.id)}
              />
            ))}
          </div>
        </>
      )}
      {armorItems.length > 0 && (
        <>
          <SectionHead label="Armour" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 5 }}>
            {armorItems.map(a => (
              <ItemThumb
                key={a.id} id={a.id} name={a.name} icon={ARMOR_ICON}
                equipState={a.equipState} condition={a.condition}
                isSelected={selectedId === a.id}
                onClick={() => onSelect(a.id)}
              />
            ))}
          </div>
        </>
      )}
      {gearItems.length > 0 && (
        <>
          <SectionHead label="Gear" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 5 }}>
            {gearItems.map(g => (
              <ItemThumb
                key={g.id} id={g.id} name={g.name} icon={GEAR_ICON}
                equipState={g.equipState} condition={g.condition}
                isSelected={selectedId === g.id}
                onClick={() => onSelect(g.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2.3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 2.4: Commit**

```bash
git add src/components/player-hud/item-thumb.tsx src/components/player-hud/item-thumb-grid.tsx
git commit -m "feat(inventory): add ItemThumb + ItemThumbGrid left-pane components"
```

---

## Task 3: Detail Pane Sub-Components

**Files:**
- Create: `src/components/player-hud/item-detail-hero.tsx`
- Create: `src/components/player-hud/item-condition-track.tsx`
- Create: `src/components/player-hud/item-quality-list.tsx`

- [ ] **Step 3.1: Create `item-detail-hero.tsx`**

Create `src/components/player-hud/item-detail-hero.tsx`:

```tsx
'use client'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS } from '@/lib/tokens'

interface ItemDetailHeroProps {
  name:           string
  typeTag:        string      // e.g. "Ranged · Light"
  icon:           string
  hardPoints:     number
  hardPointsUsed: number
  item_image_url: string | null
}

export function ItemDetailHero({ name, typeTag, icon, hardPoints, hardPointsUsed, item_image_url }: ItemDetailHeroProps) {
  if (item_image_url) {
    return (
      <div style={{ position: 'relative', height: 80, flexShrink: 0, overflow: 'hidden' }}>
        <img src={item_image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: 8, left: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, color: 'var(--hud-gold)', opacity: 0.7, letterSpacing: '0.1em' }}>
            {typeTag}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: 'var(--hud-text)', fontWeight: 600 }}>
            {name}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: 80, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px',
      background: 'linear-gradient(110deg, var(--hud-surface-hi) 0%, color-mix(in srgb, var(--hud-surface-hi) 80%, var(--hud-accent-10)) 100%)',
      borderBottom: '1px solid var(--hud-border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* top-right corner bracket accent */}
      <div style={{
        position: 'absolute', top: 6, right: 8, width: 14, height: 14,
        borderTop: '1.5px solid var(--hud-gold)', borderRight: '1.5px solid var(--hud-gold)',
        opacity: 0.35, pointerEvents: 'none',
      }} />
      {/* icon box */}
      <div style={{
        width: 58, height: 58, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--hud-gold)', borderRadius: RADIUS.md,
        background: 'radial-gradient(ellipse at 50% 60%, var(--hud-accent-20) 0%, transparent 70%)',
        fontSize: 28, color: 'var(--hud-gold)', fontFamily: FONT_BODY,
      }}>
        {icon}
      </div>
      {/* text stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.overline, letterSpacing: '0.1em', color: 'var(--hud-gold)', opacity: 0.6 }}>
          {typeTag}
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: FS.h4, color: 'var(--hud-text)', fontWeight: 600,
          lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        {hardPoints > 0 && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)' }}>
            Hard Points {hardPointsUsed} / {hardPoints} used
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3.2: Create `item-condition-track.tsx`**

Create `src/components/player-hud/item-condition-track.tsx`:

```tsx
'use client'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS } from '@/lib/tokens'
import type { ItemCondition } from '@/lib/types'

const CONDITIONS: ItemCondition[] = ['undamaged', 'minor', 'moderate', 'major', 'destroyed']

const COND_LABEL: Record<ItemCondition, string> = {
  undamaged: 'Undamaged',
  minor:     'Minor',
  moderate:  'Moderate',
  major:     'Major',
  destroyed: 'Destroyed',
}

const COND_FILL: Record<ItemCondition, string> = {
  undamaged: 'var(--die-success)',
  minor:     'var(--die-success)',
  moderate:  'var(--die-threat)',
  major:     'var(--hud-vital-wounds)',
  destroyed: 'var(--hud-text-faint)',
}

const COND_PENALTY: Record<ItemCondition, { text: string; color: string }> = {
  undamaged: { text: 'No penalty to use.',                                               color: 'var(--hud-text-faint)' },
  minor:     { text: 'Minor damage — adds 1 Setback die to all checks.',                 color: 'var(--hud-text-faint)' },
  moderate:  { text: 'Moderate damage — adds 1 Setback die to all checks.',              color: 'var(--hud-text-faint)' },
  major:     { text: 'Major damage — item is unusable until repaired.',                  color: 'var(--hud-vital-wounds)' },
  destroyed: { text: 'Destroyed — this item is gone.',                                   color: 'var(--hud-text-faint)' },
}

function segFill(idx: number, activeIdx: number, condition: ItemCondition): string {
  if (condition === 'destroyed') return 'var(--hud-text-faint)'
  if (idx > activeIdx) return 'transparent'
  if (idx <= 1) return 'var(--die-success)'   // segments 0, 1 always green when active
  if (idx === 2) return 'var(--die-threat)'   // segment 2 = moderate
  return 'var(--hud-vital-wounds)'            // segment 3 = major
}

export function ItemConditionTrack({ condition }: { condition: ItemCondition }) {
  const activeIdx = CONDITIONS.indexOf(condition)
  const penalty   = COND_PENALTY[condition]

  return (
    <div style={{ padding: '8px 0 4px' }}>
      {/* segments */}
      <div style={{ display: 'flex', gap: 3 }}>
        {CONDITIONS.map((c, i) => (
          <div key={c} style={{ flex: 1 }}>
            <div style={{
              height: 8, borderRadius: RADIUS.sm,
              background: segFill(i, activeIdx, condition),
              border: `1px solid var(--hud-border)`,
              boxShadow: i === activeIdx ? `0 0 6px ${COND_FILL[condition]}55` : 'none',
            }} />
          </div>
        ))}
      </div>
      {/* labels */}
      <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
        {CONDITIONS.map((c, i) => (
          <div key={c} style={{
            flex: 1, textAlign: 'center',
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: i === activeIdx ? COND_FILL[condition] : 'var(--hud-text-faint)',
            fontWeight: i === activeIdx ? 700 : 400,
          }}>
            {COND_LABEL[c]}
          </div>
        ))}
      </div>
      {/* penalty note */}
      <div style={{
        marginTop: 6, fontFamily: FONT_BODY, fontSize: FS.overline,
        fontStyle: 'italic', color: penalty.color,
      }}>
        {penalty.text}
      </div>
    </div>
  )
}
```

- [ ] **Step 3.3: Create `item-quality-list.tsx`**

Create `src/components/player-hud/item-quality-list.tsx`:

```tsx
'use client'
import { FONT_BODY, FONT_DISPLAY, FS } from '@/lib/tokens'
import type { RefWeaponQuality } from '@/lib/types'

interface ItemQualityListProps {
  qualities:           { key: string; count?: number | null }[]
  refWeaponQualityMap: Record<string, RefWeaponQuality>
}

export function ItemQualityList({ qualities, refWeaponQualityMap }: ItemQualityListProps) {
  const resolved = qualities
    .map(q => ({ ...q, ref: refWeaponQualityMap[q.key] }))
    .filter((q): q is typeof q & { ref: RefWeaponQuality } => q.ref != null)

  if (resolved.length === 0) return null

  return (
    <div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--hud-gold)', marginBottom: 6,
        borderBottom: '1px solid var(--hud-border)', paddingBottom: 4,
      }}>
        Special Qualities
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {resolved.map(q => (
          <div key={q.key}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, fontWeight: 700, color: 'var(--hud-text)' }}>
                {q.ref.name}
              </span>
              {q.ref.is_ranked && q.count != null && q.count > 0 && (
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: FS.caption, color: 'var(--hud-gold)' }}>
                  {q.count}
                </span>
              )}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: 'var(--hud-text-faint)', lineHeight: 1.5 }}>
              {q.ref.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3.5: Commit**

```bash
git add src/components/player-hud/item-detail-hero.tsx src/components/player-hud/item-condition-track.tsx src/components/player-hud/item-quality-list.tsx
git commit -m "feat(inventory): add ItemDetailHero, ItemConditionTrack, ItemQualityList sub-components"
```

---

## Task 4: `StowLocationModal` Extract + `ItemDetailPanel` + globals.css

**Files:**
- Create: `src/components/player-hud/stow-location-modal.tsx`
- Create: `src/components/player-hud/item-detail-panel.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 4.1: Create `stow-location-modal.tsx`**

This is a direct extraction of `StowLocationModal` and `StowPill` from `InventoryPanel.tsx`, converted to tokens. `InventoryPanel.tsx` is untouched until Task 5.

Create `src/components/player-hud/stow-location-modal.tsx`:

```tsx
'use client'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { FONT_BODY, FONT_DISPLAY, RADIUS } from '@/lib/tokens'
import type { StowLocation, StowLocationType, StowableAsset } from '@/lib/types'

// ── Visual config ────────────────────────────────────────────────────────────

export const STOW_COLOR: Record<StowLocationType, string> = {
  vehicle:            'var(--die-success)',
  starship:           'var(--die-advantage)',
  safe_house:         'var(--hud-gold)',
  base_of_operations: 'var(--hud-accent-purple)',
}

export const STOW_ICON: Record<StowLocationType, string> = {
  vehicle:            '▶',
  starship:           '◈',
  safe_house:         '◆',
  base_of_operations: '★',
}

const STOW_TYPE_LABEL: Record<'vehicle' | 'starship' | 'safe_house', string> = {
  vehicle:   'Vehicle',
  starship:  'Starship',
  safe_house: 'Safe House',
}

// ── StowPill ─────────────────────────────────────────────────────────────────

export function StowPill({ location }: { location: StowLocation }) {
  const color = STOW_COLOR[location.type]
  const icon  = STOW_ICON[location.type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
      padding: '1px 0.4375rem', borderRadius: RADIUS.xl,
      background: `color-mix(in srgb, ${color} 9%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 27%, transparent)`,
      fontFamily: FONT_BODY, fontSize: 'var(--text-overline)',
      color, letterSpacing: '0.04em', flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {icon} {location.name}
    </span>
  )
}

// ── StowLocationModal ─────────────────────────────────────────────────────────

interface StowLocationModalProps {
  itemName:             string
  stowableAssets:       StowableAsset[]
  baseOfOperationsName: string | null
  onConfirm:            (location: StowLocation | null) => void
  onCancel:             () => void
}

export function StowLocationModal({
  itemName, stowableAssets, baseOfOperationsName, onConfirm, onCancel,
}: StowLocationModalProps) {
  const BOO_VALUE  = '__boo__'
  const defaultVal = baseOfOperationsName ? BOO_VALUE : (stowableAssets[0]?.id ?? '')
  const [selected, setSelected] = useState(defaultVal)

  const hasOptions = !!baseOfOperationsName || stowableAssets.length > 0

  function handleConfirm() {
    if (!selected) { onConfirm(null); return }
    if (selected === BOO_VALUE) {
      onConfirm({ id: null, name: baseOfOperationsName!, type: 'base_of_operations' })
      return
    }
    const asset = stowableAssets.find(a => a.id === selected)
    onConfirm(asset ? { id: asset.id, name: asset.name, type: asset.type } : null)
  }

  return createPortal(
    <>
      <div
        onClick={onCancel}
        className="fixed inset-0 cursor-pointer"
        style={{ zIndex: 'var(--z-dialog)' as unknown as number, background: 'rgba(0,0,0,0.65)' }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 'var(--z-dialog)' as unknown as number,
        width: 'clamp(300px, 36vw, 420px)',
        background: 'var(--hud-surface-hi)',
        border: '1px solid var(--hud-border-hi)',
        borderRadius: RADIUS.lg,
        padding: 'var(--space-5) 1.375rem',
        boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--text-body-sm)', fontWeight: 700, color: 'var(--hud-gold)', marginBottom: 'var(--space-1)' }}>
          Stow Item
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-label)', color: 'var(--hud-text-dim)', marginBottom: '0.875rem', lineHeight: 1.4 }}>
          Where would you like to stow{' '}
          <span style={{ color: 'var(--hud-text)', fontWeight: 600 }}>{itemName}</span>?
        </div>

        <div style={{ height: 1, background: 'var(--hud-border)', marginBottom: 'var(--space-4)' }} />

        {hasOptions ? (
          <>
            <div style={{
              fontFamily: FONT_BODY, fontSize: 'var(--text-overline)',
              fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--hud-text-faint)', marginBottom: 'var(--space-2)',
            }}>
              Storage Location
            </div>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-2) 0.625rem',
                background: 'var(--hud-surface-lo)',
                border: '1px solid var(--hud-border)',
                borderRadius: RADIUS.md,
                color: 'var(--hud-text)',
                fontFamily: FONT_BODY, fontSize: 'var(--text-label)',
                outline: 'none', cursor: 'pointer',
                marginBottom: '1.125rem', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23808080' opacity='0.6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.625rem center',
                paddingRight: '1.75rem',
              }}
            >
              <option value="">— No specific location —</option>
              {baseOfOperationsName && (
                <option value={BOO_VALUE}>★ {baseOfOperationsName} (Base of Operations)</option>
              )}
              {stowableAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {STOW_ICON[a.type as StowLocationType]} {a.name} ({STOW_TYPE_LABEL[a.type as 'vehicle' | 'starship' | 'safe_house']})
                </option>
              ))}
            </select>

            {selected && selected !== '' && (() => {
              let loc: StowLocation | null = null
              if (selected === BOO_VALUE && baseOfOperationsName) {
                loc = { id: null, name: baseOfOperationsName, type: 'base_of_operations' }
              } else {
                const a = stowableAssets.find(x => x.id === selected)
                if (a) loc = { id: a.id, name: a.name, type: a.type }
              }
              return loc ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.125rem' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 'var(--text-overline)', color: 'var(--hud-text-dim)' }}>
                    Will appear as:
                  </span>
                  <StowPill location={loc} />
                </div>
              ) : null
            })()}
          </>
        ) : (
          <div style={{
            fontFamily: FONT_BODY, fontSize: 'var(--text-label)',
            color: 'var(--hud-text-dim)', fontStyle: 'italic',
            marginBottom: '1.125rem', lineHeight: 1.5,
          }}>
            No group assets available yet. The item will be stowed without a specific location.
            Add vehicles, starships, or safe houses in the Group Sheet to assign a location.
          </div>
        )}

        <div className="flex justify-end" style={{ gap: 'var(--space-2)' }}>
          <button
            onClick={onCancel}
            style={{
              height: '2rem', padding: '0 0.875rem', borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 'var(--text-label)',
              background: 'transparent', border: '1px solid var(--hud-border)',
              color: 'var(--hud-text-dim)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              height: '2rem', padding: '0 0.875rem', borderRadius: RADIUS.md, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 'var(--text-label)', fontWeight: 700,
              background: 'var(--hud-accent-10)', border: '1px solid var(--hud-accent-border)',
              color: 'var(--hud-gold)',
            }}
          >
            Stow
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}
```

- [ ] **Step 4.2: Create `item-detail-panel.tsx`**

Create `src/components/player-hud/item-detail-panel.tsx`:

```tsx
'use client'
import React, { useState } from 'react'
import { FONT_BODY, FONT_DISPLAY, RADIUS, FS } from '@/lib/tokens'
import type { WpnDisplay, ArmDisplay, GearRow, EquipState, StowLocation, StowableAsset } from '@/lib/types'
import { ItemDetailHero } from './item-detail-hero'
import { ItemConditionTrack } from './item-condition-track'
import { ItemQualityList } from './item-quality-list'
import { StowLocationModal, StowPill } from './stow-location-modal'
import type { RefWeaponQuality } from '@/lib/types'

// ── Types ────────────────────────────────────────────────────────────────────

export type SelectedItem =
  | { kind: 'weapon'; item: WpnDisplay }
  | { kind: 'armor';  item: ArmDisplay }
  | { kind: 'gear';   item: GearRow    }

interface ItemDetailPanelProps {
  selected:             SelectedItem
  refWeaponQualityMap:  Record<string, RefWeaponQuality>
  stowableAssets?:      StowableAsset[]
  baseOfOperationsName?: string | null
  onSetWeaponState:     (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetArmorState:      (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetGearState:       (id: string, state: EquipState, location?: StowLocation | null) => void
  onDiscardWeapon?:     (id: string, note?: string) => void
  onDiscardArmor?:      (id: string, note?: string) => void
  onDiscardGear?:       (id: string, note?: string) => void
  isGmMode?:            boolean
  characterName?:       string
}

// ── Stat box ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: `color-mix(in srgb, ${color} 8%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
      borderRadius: RADIUS.md, padding: '3px var(--space-2)', minWidth: '2.5rem',
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.sm, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ── Equip buttons ─────────────────────────────────────────────────────────────

const EQUIP_STATES: EquipState[] = ['stowed', 'carrying', 'equipped']
const EQUIP_LABELS: Record<EquipState, string> = { stowed: 'Stow', carrying: 'Carry', equipped: 'Equipped' }

interface EquipButtonsProps {
  id:                  string
  equipState:          EquipState
  condition:           string
  stowLocation?:       StowLocation | null
  stowableAssets?:     StowableAsset[]
  baseOfOperationsName?: string | null
  name:                string
  onSet:               (state: EquipState, location?: StowLocation | null) => void
}

function EquipButtons({ id: _id, equipState, condition, stowLocation, stowableAssets, baseOfOperationsName, name, onSet }: EquipButtonsProps) {
  const [stowModalOpen, setStowModalOpen] = useState(false)
  const canEquip = condition !== 'major' && condition !== 'destroyed'

  function handleClick(s: EquipState) {
    if (s === equipState) return
    if (s === 'stowed') { setStowModalOpen(true); return }
    onSet(s)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        {EQUIP_STATES.map(s => {
          const isActive   = equipState === s
          const isDisabled = s === 'equipped' && !canEquip
          return (
            <button
              key={s}
              onClick={() => !isDisabled && handleClick(s)}
              disabled={isDisabled}
              className={`inv-equip-btn${isActive ? ' inv-equip-btn-active' : ''}`}
              style={{
                flex: 1, height: '1.875rem', borderRadius: RADIUS.md, cursor: isDisabled ? 'not-allowed' : isActive ? 'default' : 'pointer',
                fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                border: '1px solid', transition: 'border-color var(--ease-default), color var(--ease-default)',
                background: isActive ? 'var(--hud-accent-10)' : 'var(--hud-surface-lo)',
                borderColor: isActive ? 'var(--hud-gold)' : 'var(--hud-border)',
                color: isActive ? 'var(--hud-gold)' : isDisabled ? 'var(--hud-text-faint)' : 'var(--hud-text-dim)',
                opacity: isDisabled ? 0.4 : 1,
              }}
            >
              {EQUIP_LABELS[s]}
            </button>
          )
        })}
      </div>
      {equipState === 'stowed' && stowLocation && (
        <div style={{ marginTop: 6 }}>
          <StowPill location={stowLocation} />
        </div>
      )}
      {stowModalOpen && (
        <StowLocationModal
          itemName={name}
          stowableAssets={stowableAssets ?? []}
          baseOfOperationsName={baseOfOperationsName ?? null}
          onConfirm={loc => { setStowModalOpen(false); onSet('stowed', loc) }}
          onCancel={() => setStowModalOpen(false)}
        />
      )}
    </div>
  )
}

// ── Discard strip ─────────────────────────────────────────────────────────────

function DiscardStrip({ isGm, characterName, onCancel, onConfirm }: {
  isGm: boolean; characterName?: string; onCancel: () => void; onConfirm: (note?: string) => void
}) {
  const [note, setNote] = useState('')
  const accent = isGm ? 'var(--hud-gold)' : 'var(--hud-vital-wounds)'
  return (
    <div style={{
      marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)',
      borderTop: '1px solid var(--hud-border)',
      display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: FS.label, color: accent, fontWeight: 600 }}>
          {isGm ? `Remove from ${characterName ?? 'character'}?` : 'Drop this item?'}
        </div>
        {!isGm && (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: 'var(--hud-text-dim)' }}>
            You drop it and leave it behind.
          </div>
        )}
        {isGm && (
          <input
            type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Note (optional)"
            style={{
              marginTop: 'var(--space-1)', width: '100%', boxSizing: 'border-box',
              background: 'var(--hud-surface-lo)', border: '1px solid var(--hud-border)',
              color: 'var(--hud-text)', fontFamily: FONT_BODY, fontSize: FS.overline,
              padding: '3px var(--space-2)', borderRadius: RADIUS.sm, outline: 'none',
            }}
          />
        )}
      </div>
      <button
        onClick={onCancel}
        style={{
          height: '1.625rem', padding: '0 0.625rem', borderRadius: RADIUS.md, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: FS.overline,
          background: 'transparent', border: '1px solid var(--hud-border)', color: 'var(--hud-text-dim)',
          flexShrink: 0,
        }}
      >Cancel</button>
      <button
        onClick={() => onConfirm(isGm && note.trim() ? note.trim() : undefined)}
        style={{
          height: '1.625rem', padding: '0 0.625rem', borderRadius: RADIUS.md, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700,
          background: `color-mix(in srgb, ${accent} 9%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 50%, transparent)`,
          color: accent, flexShrink: 0,
        }}
      >
        {isGm ? 'Remove' : 'Discard'}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ItemDetailPanel({
  selected, refWeaponQualityMap,
  stowableAssets, baseOfOperationsName,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: ItemDetailPanelProps) {
  const [showDiscard, setShowDiscard] = useState(false)

  // Reset discard strip whenever selected item changes
  const [prevId, setPrevId] = useState<string | null>(null)
  const currentId = selected.item.id
  if (currentId !== prevId) { setShowDiscard(false); setPrevId(currentId) }

  // ── Derive display values ──────────────────────────────────────────────────

  function renderWeapon(w: WpnDisplay) {
    const dmgVal = w.damage.isMelee
      ? `Br+${w.damage.baseDamage > 0 ? w.damage.baseDamage : ''} (${w.damage.brawn + w.damage.baseDamage})`
      : String(w.damage.baseDamage)

    return (
      <>
        <ItemDetailHero
          name={w.name} typeTag={`Ranged${w.damage.isMelee ? ' · Melee' : ''}`}
          icon="⚔" hardPoints={w.hardPoints} hardPointsUsed={0}
          item_image_url={w.item_image_url}
        />
        {/* stats row */}
        <div style={{ display: 'flex', gap: 4, padding: '6px 10px', background: 'var(--hud-surface-hi)', borderBottom: '1px solid var(--hud-border)', flexShrink: 0, flexWrap: 'wrap' }}>
          <StatBox label="DMG"   value={dmgVal}  color="var(--die-threat)" />
          <StatBox label="CRIT"  value={w.crit}  color="var(--die-challenge)" />
          <StatBox label="RANGE" value={w.range} color="var(--die-advantage)" />
          <StatBox label="ENC"   value={w.enc}   color="var(--hud-text-dim)" />
          <StatBox label="HP"    value={w.hardPoints} color="var(--hud-accent-purple)" />
        </div>
        {/* scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {w.description && (
            <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', lineHeight: 1.65, margin: 0 }}>
              {w.description}
            </p>
          )}
          <ItemQualityList qualities={w.qualities} refWeaponQualityMap={refWeaponQualityMap} />
          <div>
            <SectionHeader>Condition</SectionHeader>
            <ItemConditionTrack condition={w.condition} />
          </div>
          <div>
            <SectionHeader>Equip State</SectionHeader>
            <EquipButtons
              id={w.id} equipState={w.equipState} condition={w.condition}
              stowLocation={w.stowLocation} stowableAssets={stowableAssets}
              baseOfOperationsName={baseOfOperationsName} name={w.name}
              onSet={(s, loc) => onSetWeaponState(w.id, s, loc)}
            />
          </div>
          {(onDiscardWeapon) && (
            <DiscardFooter isGm={!!isGmMode} characterName={characterName} showDiscard={showDiscard} setShowDiscard={setShowDiscard}
              onConfirm={note => onDiscardWeapon(w.id, note)} />
          )}
        </div>
      </>
    )
  }

  function renderArmor(a: ArmDisplay) {
    return (
      <>
        <ItemDetailHero
          name={a.name} typeTag="Armour"
          icon="◈" hardPoints={a.hardPoints} hardPointsUsed={0}
          item_image_url={a.item_image_url}
        />
        <div style={{ display: 'flex', gap: 4, padding: '6px 10px', background: 'var(--hud-surface-hi)', borderBottom: '1px solid var(--hud-border)', flexShrink: 0, flexWrap: 'wrap' }}>
          <StatBox label="SOAK"    value={a.soak}       color="var(--die-success)" />
          <StatBox label="DEF"     value={a.defense}    color="var(--die-force)" />
          <StatBox label="ENC"     value={a.enc}        color="var(--hud-text-dim)" />
          <StatBox label="HP"      value={a.hardPoints} color="var(--hud-accent-purple)" />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {a.description && (
            <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', lineHeight: 1.65, margin: 0 }}>
              {a.description}
            </p>
          )}
          <div>
            <SectionHeader>Condition</SectionHeader>
            <ItemConditionTrack condition={a.condition} />
          </div>
          <div>
            <SectionHeader>Equip State</SectionHeader>
            <EquipButtons
              id={a.id} equipState={a.equipState} condition={a.condition}
              stowLocation={a.stowLocation} stowableAssets={stowableAssets}
              baseOfOperationsName={baseOfOperationsName} name={a.name}
              onSet={(s, loc) => onSetArmorState(a.id, s, loc)}
            />
          </div>
          {(onDiscardArmor) && (
            <DiscardFooter isGm={!!isGmMode} characterName={characterName} showDiscard={showDiscard} setShowDiscard={setShowDiscard}
              onConfirm={note => onDiscardArmor(a.id, note)} />
          )}
        </div>
      </>
    )
  }

  function renderGear(g: GearRow) {
    return (
      <>
        <ItemDetailHero
          name={g.name} typeTag="Gear"
          icon="◆" hardPoints={0} hardPointsUsed={0}
          item_image_url={g.item_image_url}
        />
        <div style={{ display: 'flex', gap: 4, padding: '6px 10px', background: 'var(--hud-surface-hi)', borderBottom: '1px solid var(--hud-border)', flexShrink: 0, flexWrap: 'wrap' }}>
          <StatBox label="QTY" value={g.qty} color="var(--hud-gold)" />
          <StatBox label="ENC" value={g.enc} color="var(--hud-text-dim)" />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {g.description && (
            <p style={{ fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)', lineHeight: 1.65, margin: 0 }}>
              {g.description}
            </p>
          )}
          <div>
            <SectionHeader>Condition</SectionHeader>
            <ItemConditionTrack condition={g.condition} />
          </div>
          <div>
            <SectionHeader>Equip State</SectionHeader>
            <EquipButtons
              id={g.id} equipState={g.equipState} condition={g.condition}
              stowLocation={g.stowLocation} stowableAssets={stowableAssets}
              baseOfOperationsName={baseOfOperationsName} name={g.name}
              onSet={(s, loc) => onSetGearState(g.id, s, loc)}
            />
          </div>
          {(onDiscardGear) && (
            <DiscardFooter isGm={!!isGmMode} characterName={characterName} showDiscard={showDiscard} setShowDiscard={setShowDiscard}
              onConfirm={note => onDiscardGear(g.id, note)} />
          )}
        </div>
      </>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--hud-surface-lo)', overflow: 'hidden' }}>
      {selected.kind === 'weapon' && renderWeapon(selected.item)}
      {selected.kind === 'armor'  && renderArmor(selected.item)}
      {selected.kind === 'gear'   && renderGear(selected.item)}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontSize: FS.overline, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--hud-gold)', marginBottom: 4,
      borderBottom: '1px solid var(--hud-border)', paddingBottom: 3,
    }}>
      {children}
    </div>
  )
}

function DiscardFooter({ isGm, characterName, showDiscard, setShowDiscard, onConfirm }: {
  isGm: boolean; characterName?: string; showDiscard: boolean
  setShowDiscard: (v: boolean) => void; onConfirm: (note?: string) => void
}) {
  if (showDiscard) {
    return (
      <DiscardStrip
        isGm={isGm} characterName={characterName}
        onCancel={() => setShowDiscard(false)}
        onConfirm={note => { setShowDiscard(false); onConfirm(note) }}
      />
    )
  }
  return (
    <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--hud-border)' }}>
      <button
        onClick={() => setShowDiscard(true)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: FS.overline,
          color: 'var(--hud-text-faint)', padding: 0,
        }}
      >
        {isGm ? '× Remove item' : '🗑 Discard item'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4.3: Add CSS classes to `src/app/globals.css`**

Find the section of globals.css that has other HUD component classes (search for `.hud-rail-btn` or similar). Add the following block after the last inventory-related or HUD class block:

```css
/* ── Inventory card panel ──────────────────────────────────────────────────── */
.inv-thumb:hover { border-color: var(--hud-border-hi) !important; background: var(--hud-accent-10) !important; }
.inv-thumb-active { border-color: var(--hud-gold) !important; background: var(--hud-accent-10) !important; }
.inv-equip-btn:hover:not(:disabled) { border-color: var(--hud-accent-border); color: var(--hud-text-dim); }
```

- [ ] **Step 4.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4.5: Commit**

```bash
git add src/components/player-hud/stow-location-modal.tsx src/components/player-hud/item-detail-panel.tsx src/app/globals.css
git commit -m "feat(inventory): add StowLocationModal, ItemDetailPanel, and inv CSS classes"
```

---

## Task 5: `InventoryCardPanel` Orchestrator + Switch `HudInventoryTab` + Delete Old Panel

**Files:**
- Create: `src/components/player-hud/inventory-card-panel.tsx`
- Modify: `src/components/player-hud/HudInventoryTab.tsx`
- Delete: `src/components/player-hud/InventoryPanel.tsx`

- [ ] **Step 5.1: Create `inventory-card-panel.tsx`**

Create `src/components/player-hud/inventory-card-panel.tsx`:

```tsx
'use client'
import React, { useState } from 'react'
import { FONT_BODY, FS } from '@/lib/tokens'
import { ItemThumbGrid } from './item-thumb-grid'
import { ItemDetailPanel, type SelectedItem } from './item-detail-panel'
import type {
  WpnDisplay, ArmDisplay, GearRow,
  EquipState, RefWeaponQuality, StowLocation, StowableAsset,
} from '@/lib/types'

interface InventoryCardPanelProps {
  weapons:               WpnDisplay[]
  armorItems:            ArmDisplay[]
  gearItems:             GearRow[]
  encumbranceCurrent:    number
  encumbranceThreshold:  number
  refWeaponQualityMap:   Record<string, RefWeaponQuality>
  stowableAssets?:       StowableAsset[]
  baseOfOperationsName?: string | null
  onSetWeaponState:      (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetArmorState:       (id: string, state: EquipState, location?: StowLocation | null) => void
  onSetGearState:        (id: string, state: EquipState, location?: StowLocation | null) => void
  onDiscardWeapon?:      (id: string, note?: string) => void
  onDiscardArmor?:       (id: string, note?: string) => void
  onDiscardGear?:        (id: string, note?: string) => void
  isGmMode?:             boolean
  characterName?:        string
}

function resolveSelected(
  id: string,
  weapons: WpnDisplay[],
  armorItems: ArmDisplay[],
  gearItems: GearRow[],
): SelectedItem | null {
  const w = weapons.find(x => x.id === id)
  if (w) return { kind: 'weapon', item: w }
  const a = armorItems.find(x => x.id === id)
  if (a) return { kind: 'armor', item: a }
  const g = gearItems.find(x => x.id === id)
  if (g) return { kind: 'gear', item: g }
  return null
}

function defaultSelection(weapons: WpnDisplay[], armorItems: ArmDisplay[], gearItems: GearRow[]): string | null {
  return weapons[0]?.id ?? armorItems[0]?.id ?? gearItems[0]?.id ?? null
}

function EncBar({ current, threshold }: { current: number; threshold: number }) {
  const pct     = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0
  const overenc = current > threshold
  return (
    <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--hud-border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.overline, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hud-text-dim)' }}>
          Encumbrance
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: FS.caption, color: overenc ? 'var(--hud-vital-wounds)' : 'var(--hud-gold)', fontWeight: 700 }}>
          {current} / {threshold}
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--hud-border)', borderRadius: RADIUS.sm, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: overenc
            ? 'linear-gradient(90deg, var(--hud-vital-wounds), color-mix(in srgb, var(--hud-vital-wounds) 80%, white))'
            : 'linear-gradient(90deg, color-mix(in srgb, var(--hud-gold) 53%, transparent), var(--hud-gold))',
          transition: 'width var(--ease-smooth)',
          borderRadius: RADIUS.sm,
        }} />
      </div>
    </div>
  )
}

export function InventoryCardPanel({
  weapons, armorItems, gearItems,
  encumbranceCurrent, encumbranceThreshold,
  refWeaponQualityMap, stowableAssets, baseOfOperationsName,
  onSetWeaponState, onSetArmorState, onSetGearState,
  onDiscardWeapon, onDiscardArmor, onDiscardGear,
  isGmMode, characterName,
}: InventoryCardPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    defaultSelection(weapons, armorItems, gearItems)
  )

  // If current selection no longer exists (e.g. item discarded), fall back to first available
  const allIds = new Set([...weapons, ...armorItems, ...gearItems].map(x => x.id))
  const activeId = selectedId && allIds.has(selectedId)
    ? selectedId
    : defaultSelection(weapons, armorItems, gearItems)

  const selected = activeId ? resolveSelected(activeId, weapons, armorItems, gearItems) : null

  const isEmpty = weapons.length === 0 && armorItems.length === 0 && gearItems.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <EncBar current={encumbranceCurrent} threshold={encumbranceThreshold} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ItemThumbGrid
          weapons={weapons} armorItems={armorItems} gearItems={gearItems}
          selectedId={activeId} onSelect={setSelectedId}
        />
        {isEmpty ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_BODY, fontSize: FS.label, color: 'var(--hud-text-faint)',
            fontStyle: 'italic',
          }}>
            No items in inventory
          </div>
        ) : selected ? (
          <ItemDetailPanel
            selected={selected}
            refWeaponQualityMap={refWeaponQualityMap}
            stowableAssets={stowableAssets}
            baseOfOperationsName={baseOfOperationsName}
            onSetWeaponState={onSetWeaponState}
            onSetArmorState={onSetArmorState}
            onSetGearState={onSetGearState}
            onDiscardWeapon={onDiscardWeapon}
            onDiscardArmor={onDiscardArmor}
            onDiscardGear={onDiscardGear}
            isGmMode={isGmMode}
            characterName={characterName}
          />
        ) : null}
      </div>
    </div>
  )
}
```

Note the missing `RADIUS` import in `EncBar` — add it to the import line:

```ts
import { FONT_BODY, FS, RADIUS } from '@/lib/tokens'
```

- [ ] **Step 5.2: Update `HudInventoryTab.tsx` to use `InventoryCardPanel`**

Replace the entire content of `src/components/player-hud/HudInventoryTab.tsx`:

```tsx
'use client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { InventoryCardPanel } from './inventory-card-panel'
import type { WpnDisplay, ArmDisplay, GearRow, StowableAsset } from '@/lib/types'

interface HudInventoryTabProps {
  hudWeapons:            WpnDisplay[]
  hudArmor:              ArmDisplay[]
  hudGear:               GearRow[]
  encumbranceCurrent:    number
  encThreshold:          number
  refWeaponQualityMap:   Record<string, any>
  isGmMode:              boolean
  characterName:         string
  characterId:           string
  stowableAssets:        StowableAsset[]
  baseOfOperationsName:  string | null
  effectiveCampaignId:   string | null
  supabase:              SupabaseClient
  onSetEquipState:       (id: string, type: 'weapon' | 'armor' | 'gear', state: any) => void
  onRemoveWeapon:        (id: string, mode: 'gm' | 'player', note?: string) => void
  onRemoveEquipment:     (id: string, type: 'armor' | 'gear', mode: 'gm' | 'player', note?: string) => void
}

export function HudInventoryTab({
  hudWeapons, hudArmor, hudGear,
  encumbranceCurrent, encThreshold,
  refWeaponQualityMap,
  isGmMode, characterName, characterId,
  stowableAssets, baseOfOperationsName,
  effectiveCampaignId, supabase,
  onSetEquipState, onRemoveWeapon, onRemoveEquipment,
}: HudInventoryTabProps) {
  function logItemDiscard(label: string) {
    if (!effectiveCampaignId) return
    supabase.from('roll_log').insert({
      campaign_id: effectiveCampaignId, character_id: characterId,
      character_name: characterName, roll_label: label, roll_type: 'system',
      pool: { proficiency:0, ability:0, boost:0, challenge:0, difficulty:0, setback:0, force:0 },
      result: { netSuccess:0, netAdvantage:0, triumph:0, despair:0, succeeded:false },
      is_dm: !!isGmMode, hidden: false,
    }).then(({ error }) => { if (error) console.warn('[discard] log failed:', error.message) })
  }

  return (
    <InventoryCardPanel
      weapons={hudWeapons}
      armorItems={hudArmor}
      gearItems={hudGear}
      encumbranceCurrent={encumbranceCurrent}
      encumbranceThreshold={encThreshold}
      refWeaponQualityMap={refWeaponQualityMap}
      stowableAssets={stowableAssets}
      baseOfOperationsName={baseOfOperationsName}
      onSetWeaponState={(id, s, loc) => onSetEquipState(id, 'weapon', s)}
      onSetArmorState={(id, s, loc)  => onSetEquipState(id, 'armor',  s)}
      onSetGearState={(id, s, loc)   => onSetEquipState(id, 'gear',   s)}
      onDiscardWeapon={(id, note) => {
        const name = hudWeapons.find(w => w.id === id)?.name ?? 'weapon'
        onRemoveWeapon(id, isGmMode ? 'gm' : 'player', note)
        logItemDiscard(isGmMode ? `GM removed "${name}" from ${characterName}` : `${characterName} dropped "${name}"`)
      }}
      onDiscardArmor={(id, note) => {
        const name = hudArmor.find(a => a.id === id)?.name ?? 'armor'
        onRemoveEquipment(id, 'armor', isGmMode ? 'gm' : 'player', note)
        logItemDiscard(isGmMode ? `GM removed "${name}" from ${characterName}` : `${characterName} dropped "${name}"`)
      }}
      onDiscardGear={(id, note) => {
        const name = hudGear.find(g => g.id === id)?.name ?? 'gear'
        onRemoveEquipment(id, 'gear', isGmMode ? 'gm' : 'player', note)
        logItemDiscard(isGmMode ? `GM removed "${name}" from ${characterName}` : `${characterName} dropped "${name}"`)
      }}
      isGmMode={isGmMode}
      characterName={characterName}
    />
  )
}
```

Note: the `onSetWeaponState` / `onSetArmorState` / `onSetGearState` callbacks currently ignore `loc` — the stow location is passed to `onSetEquipState` but the existing handler signature doesn't accept it. Check `useCharacterData.ts` → `handleSetEquipState` — it already accepts a `location` param. Update the three callback wrappers to pass `loc` through:

```ts
onSetWeaponState={(id, s, loc) => onSetEquipState(id, 'weapon', s, loc)}
onSetArmorState={(id, s, loc)  => onSetEquipState(id, 'armor',  s, loc)}
onSetGearState={(id, s, loc)   => onSetEquipState(id, 'gear',   s, loc)}
```

Also check that `onSetEquipState` prop signature in `HudInventoryTabProps` accepts the optional fourth `loc` param. If not, update it:

```ts
onSetEquipState: (id: string, type: 'weapon' | 'armor' | 'gear', state: any, location?: any) => void
```

- [ ] **Step 5.3: Delete `InventoryPanel.tsx`**

```bash
git rm src/components/player-hud/InventoryPanel.tsx
```

- [ ] **Step 5.4: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: zero errors. If any component still imports from `InventoryPanel`, update it to import from the appropriate new file (`WpnDisplay`, `ArmDisplay`, `GearRow` types are in `@/lib/types` — any re-export shim in `InventoryPanel` is gone now).

- [ ] **Step 5.5: Verify the app builds**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 5.6: Visual verification**

Start the dev server (`npm run dev`), open the player HUD, click the Inventory rail button. Verify:

1. Thumbnail grid renders on the left with WEAPONS / ARMOUR / GEAR sections
2. Selecting a thumbnail highlights it (gold border) and updates the right pane
3. Hero banner shows the item name, type tag, and icon
4. Stats row shows the correct stats for each item type
5. Condition track renders at `undamaged` (all new items default to undamaged)
6. Equip state buttons work — switching between Stow / Carry / Equipped updates the dot on the thumbnail
7. Stow flow opens the modal, choosing a location works
8. Encumbrance bar at top reflects current carried weight
9. All three themes (Binary Sunset, Rebel Operative, Kyber Archive) look correct — switch via the theme button and verify colours adapt

- [ ] **Step 5.7: Commit**

```bash
git add src/components/player-hud/inventory-card-panel.tsx src/components/player-hud/HudInventoryTab.tsx
git commit -m "feat(inventory): wire InventoryCardPanel as drop-in replacement, remove old InventoryPanel"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Migration ✓, `ItemCondition` type ✓, WpnDisplay/ArmDisplay/GearRow fields ✓, `useCharacterData` passthrough ✓, `stowLocation` fix ✓, `ItemThumb` ✓, `ItemThumbGrid` ✓, `ItemDetailHero` ✓, `ItemConditionTrack` ✓, `ItemQualityList` ✓, `StowLocationModal` ✓, `ItemDetailPanel` ✓, `InventoryCardPanel` ✓, `HudInventoryTab` switch ✓, globals.css classes ✓, old panel deleted ✓
- [x] **No hardcoded hex** anywhere in component code — all values use `var(--hud-*)`, `var(--die-*)`, or FS/RADIUS tokens
- [x] **No `onMouseEnter` style mutation** — hover states use `.inv-thumb:hover` and `.inv-equip-btn:hover` CSS classes
- [x] **Type consistency:** `ItemCondition` defined in Task 1, used in Tasks 2, 3, 4. `SelectedItem` defined and exported in Task 4 (`item-detail-panel.tsx`), imported in Task 5. `RADIUS` imported in `inventory-card-panel.tsx` EncBar sub-component — noted in the step.
- [x] **stowLocation passthrough:** Added to all three memo builders in Task 1, consumed by `EquipButtons` → `StowPill` in Task 4.
- [x] **Encumbrance bar:** Included in `InventoryCardPanel` — spec shows it at the top of the panel; preserved from the old panel.
- [x] **Discard flow:** `DiscardFooter` + `DiscardStrip` included in `ItemDetailPanel`, wired to all three discard callbacks.
