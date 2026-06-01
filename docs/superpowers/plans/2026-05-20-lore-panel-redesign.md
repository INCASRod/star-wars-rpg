# Lore Panel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Lore panel's full-width portrait card into a compact horizontal strip, reorder the sidebar for narrative flow, and add a read-only Conflict card for Force-sensitive characters.

**Architecture:** Three files change in sequence: `CharacterAvatar` gets a horizontal layout with optional summary chips; `HudLoreTab` computes chip data from the character object and passes it down; `LoreContent` gains a Conflict card slot and a reordered sidebar. No data model changes — the Conflict card renders from an empty array for now (data comes later with the GM Force tab feature).

**Tech Stack:** Next.js 14 App Router, React client components, inline styles with design tokens from `@/lib/tokens`, no test suite (verify visually in dev server).

---

## File Map

| File | Change |
|---|---|
| `src/components/player-hud/CharacterAvatar.tsx` | Replace tall layout with horizontal strip; add `gender`, `obligationChip`, `conflictTotal`, `motivationChip` props |
| `src/components/player-hud/HudLoreTab.tsx` | Compute chip strings from `character`; pass new props to `CharacterAvatar` and `conflictEntries`+`isForceUser` to `LoreContent` |
| `src/components/character/LoreContent.tsx` | Add `conflictEntries` + `isForceUser` props; add Conflict card; reorder sidebar |

---

## Task 1: CharacterAvatar — horizontal strip layout

**Files:**
- Modify: `src/components/player-hud/CharacterAvatar.tsx`

- [ ] **Step 1: Add new imports**

At the top of the file, after the existing import line, add:

```ts
import { FS, RADIUS } from '@/lib/tokens'
```

The file already has:
```ts
import { C, FONT_CINZEL, FONT_RAJDHANI, panelBase } from './design-tokens'
```
Keep that line — `C` (= HUD), `panelBase`, `FONT_CINZEL`, `FONT_RAJDHANI` are still used.

- [ ] **Step 2: Expand the props interface**

Replace the existing `CharacterAvatarProps` interface with:

```ts
interface CharacterAvatarProps {
  avatarUrl:       string | null | undefined
  characterName:   string
  career:          string
  spec:            string
  gender?:         string
  onUpload?:       (file: File) => Promise<void>
  onDelete?:       () => Promise<void>
  // Optional summary chips — hidden when undefined/falsy
  obligationChip?: string   // e.g. "Obligation · 15" or "Duty · 20"
  conflictTotal?:  number   // shown only when defined and > 0
  motivationChip?: string   // e.g. "Cause · Freedom"
}
```

- [ ] **Step 3: Update the function signature**

Replace the destructuring line:

```ts
export function CharacterAvatar({ avatarUrl, characterName, career, spec, onUpload, onDelete }: CharacterAvatarProps) {
```

With:

```ts
export function CharacterAvatar({
  avatarUrl, characterName, career, spec, gender,
  onUpload, onDelete,
  obligationChip, conflictTotal, motivationChip,
}: CharacterAvatarProps) {
```

- [ ] **Step 4: Define chip styles as constants inside the function body**

Add these after the existing `const canEdit = ...` line:

```ts
const chipBase: React.CSSProperties = {
  fontFamily: FONT_RAJDHANI,
  fontSize: FS.overline,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  padding: '2px 8px',
  borderRadius: RADIUS.sm,
  display: 'inline-block',
}
const redChip: React.CSSProperties = {
  ...chipBase,
  background: 'rgba(224,80,80,0.10)',
  border: '1px solid rgba(224,80,80,0.28)',
  color: '#E05050',
}
const blueChip: React.CSSProperties = {
  ...chipBase,
  background: 'rgba(90,170,224,0.10)',
  border: '1px solid rgba(90,170,224,0.28)',
  color: '#5AAAE0',
}
const showChips = obligationChip || (conflictTotal !== undefined && conflictTotal > 0) || motivationChip
```

- [ ] **Step 5: Replace the return JSX with the horizontal layout**

Replace everything from `return (` to the closing `  )` with:

```tsx
  return (
    <div style={{ ...panelBase, padding: 12 }}>
      <CornerBrackets />

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>

        {/* Portrait frame — fixed 72×96px */}
        <div
          style={{
            width: 72,
            height: 96,
            border: `1.5px solid rgba(224,58,30,${hovered && canEdit ? '0.65' : '0.4'})`,
            borderRadius: RADIUS.md,
            overflow: 'hidden',
            position: 'relative',
            cursor: canEdit ? 'pointer' : 'default',
            transition: 'border-color .2s',
            flexShrink: 0,
          }}
          onMouseEnter={() => canEdit && setHovered(true)}
          onMouseLeave={() => { canEdit && setHovered(false); setConfirming(false) }}
          onClick={() => { if (canEdit && !avatarUrl && !uploading) fileRef.current?.click() }}
        >
          {/* Image or initials */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={characterName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'filter .2s', filter: hovered ? 'brightness(0.55)' : 'none' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: hovered ? 'rgba(224,58,30,0.10)' : 'rgba(224,58,30,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_CINZEL, fontSize: 22, fontWeight: 700,
              color: C.gold, letterSpacing: '0.1em',
              transition: 'background .2s',
            }}>
              {uploading ? '…' : getInitials(characterName)}
            </div>
          )}

          {/* Bottom gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, var(--hud-surface-mid) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Edit overlay — shown on hover */}
          {canEdit && hovered && !uploading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: 6,
            }}>
              <button
                onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                className="hov-gold-bg"
                style={{
                  background: 'rgba(224,58,30,0.22)',
                  border: '1px solid rgba(224,58,30,0.7)',
                  borderRadius: RADIUS.sm, padding: '4px 0',
                  fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: C.gold, cursor: 'pointer', width: '100%',
                  transition: '.15s',
                }}
              >
                ↑ {avatarUrl ? 'Replace' : 'Upload'}
              </button>

              {avatarUrl && onDelete && !confirming && (
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(true) }}
                  className="hov-red-bg"
                  style={{
                    background: 'rgba(224,80,80,0.18)',
                    border: '1px solid rgba(224,80,80,0.55)',
                    borderRadius: RADIUS.sm, padding: '4px 0',
                    fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#E05050', cursor: 'pointer', width: '100%',
                    transition: '.15s',
                  }}
                >
                  ✕ Remove
                </button>
              )}

              {confirming && (
                <div style={{ display: 'flex', gap: 4, width: '100%' }}>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete() }}
                    style={{
                      flex: 1, background: 'rgba(224,80,80,0.35)',
                      border: '1px solid rgba(224,80,80,0.8)',
                      borderRadius: RADIUS.sm, padding: '4px 0',
                      fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: '#E05050', cursor: 'pointer',
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirming(false) }}
                    style={{
                      flex: 1, background: 'var(--hud-surface-mid)',
                      border: `1px solid ${C.border}`,
                      borderRadius: RADIUS.sm, padding: '4px 0',
                      fontFamily: FONT_RAJDHANI, fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: C.textDim, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Uploading spinner */}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'var(--hud-surface-lo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: FONT_RAJDHANI, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: C.gold,
              }}>
                Uploading…
              </div>
            </div>
          )}
        </div>

        {/* Right side: name, subtitle, chips */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_CINZEL, fontSize: FS.sm, fontWeight: 600,
            color: C.gold, letterSpacing: '0.04em', lineHeight: 1.2,
          }}>
            {characterName}
          </div>
          <div style={{
            fontFamily: FONT_RAJDHANI, fontSize: FS.overline, color: C.textDim,
            marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {career}{spec ? ` · ${spec}` : ''}{gender ? ` · ${gender}` : ''}
          </div>
          {canEdit && (
            <div style={{ fontFamily: FONT_RAJDHANI, fontSize: FS.overline, color: C.textFaint, marginTop: 2, letterSpacing: '0.06em' }}>
              hover portrait to edit
            </div>
          )}
          {showChips && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {obligationChip && <span style={redChip}>{obligationChip}</span>}
              {conflictTotal !== undefined && conflictTotal > 0 && (
                <span style={redChip}>Conflict · {conflictTotal}</span>
              )}
              {motivationChip && <span style={blueChip}>{motivationChip}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
```

- [ ] **Step 6: Start the dev server and verify visually**

```bash
npm run dev
```

Open the player HUD → Lore panel. Verify:
- Portrait is a small square-ish thumbnail (~72×96px), not the full-width tall card
- Name, career · species · gender appear to the right of the portrait
- Hover over the portrait — upload/remove overlay still works
- No summary chips appear yet (those come in Task 2)

- [ ] **Step 7: Commit**

```bash
git add src/components/player-hud/CharacterAvatar.tsx
git commit -m "feat(lore): convert CharacterAvatar to horizontal strip layout"
```

---

## Task 2: HudLoreTab — compute and pass chip data

**Files:**
- Modify: `src/components/player-hud/HudLoreTab.tsx`

- [ ] **Step 1: Read the file**

Open `src/components/player-hud/HudLoreTab.tsx`. Current content for reference:

```tsx
'use client'
import { LoreContent } from '@/components/character/LoreContent'
import { CharacterAvatar } from './CharacterAvatar'
import type { Character, RefSpecies } from '@/lib/types'

interface HudLoreTabProps {
  character: Character
  careerName: string
  speciesName: string
  refSpeciesAll: RefSpecies[]
  refDutyTypes: { key: string; name: string }[]
  refObligationTypes: { key: string; name: string }[]
  onBackstoryChange: (val: string) => void
  onNotesChange: (val: string) => void
  onPortraitUpload: (file: File) => Promise<void>
  onPortraitDelete: () => Promise<void>
}

export function HudLoreTab({
  character, careerName, speciesName,
  refSpeciesAll, refDutyTypes, refObligationTypes,
  onBackstoryChange, onNotesChange,
  onPortraitUpload, onPortraitDelete,
}: HudLoreTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <CharacterAvatar
        avatarUrl={character.portrait_url}
        characterName={character.name}
        career={careerName}
        spec={speciesName}
        onUpload={onPortraitUpload}
        onDelete={onPortraitDelete}
      />
      <LoreContent ... />
    </div>
  )
}
```

- [ ] **Step 2: Replace the full file content**

Replace the entire file with:

```tsx
'use client'
import { LoreContent } from '@/components/character/LoreContent'
import { CharacterAvatar } from './CharacterAvatar'
import type { Character, RefSpecies } from '@/lib/types'

interface HudLoreTabProps {
  character: Character
  careerName: string
  speciesName: string
  refSpeciesAll: RefSpecies[]
  refDutyTypes: { key: string; name: string }[]
  refObligationTypes: { key: string; name: string }[]
  onBackstoryChange: (val: string) => void
  onNotesChange: (val: string) => void
  onPortraitUpload: (file: File) => Promise<void>
  onPortraitDelete: () => Promise<void>
}

export function HudLoreTab({
  character, careerName, speciesName,
  refSpeciesAll, refDutyTypes, refObligationTypes,
  onBackstoryChange, onNotesChange,
  onPortraitUpload, onPortraitDelete,
}: HudLoreTabProps) {
  const isForceUser = character.force_rating > 0 || !!character.is_force_sensitive

  // Obligation/Duty summary chip — shows whichever is configured, obligation takes priority
  const obligationChip = character.duty_obligation_configured
    ? character.obligation_type && character.obligation_value !== undefined
      ? `Obligation · ${character.obligation_value}`
      : character.duty_type && character.duty_value !== undefined
      ? `Duty · ${character.duty_value}`
      : undefined
    : undefined

  // Motivation chip — "Type · Specific" or just "Type"
  const motivationChip = character.motivation_configured && character.motivation_type
    ? character.motivation_specific
      ? `${character.motivation_type} · ${character.motivation_specific}`
      : character.motivation_type
    : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <CharacterAvatar
        avatarUrl={character.portrait_url}
        characterName={character.name}
        career={careerName}
        spec={speciesName}
        gender={character.gender}
        onUpload={onPortraitUpload}
        onDelete={onPortraitDelete}
        obligationChip={obligationChip}
        conflictTotal={undefined}
        motivationChip={motivationChip}
      />
      <LoreContent
        characterName={character.name}
        careerName={careerName}
        speciesName={speciesName}
        gender={character.gender}
        backstory={character.backstory || ''}
        notes={character.notes || ''}
        speciesRef={refSpeciesAll.find(s => s.key === character.species_key)}
        motivationType={character.motivation_type || character.obligation_type || character.duty_type}
        motivationSpecific={character.motivation_specific}
        motivationDesc={character.motivation_description || character.obligation_notes || character.duty_notes}
        motivationConfigured={character.motivation_configured}
        dutyType={character.duty_type}
        dutyValue={character.duty_value}
        dutyLore={character.duty_lore}
        dutyCustomName={character.duty_custom_name}
        dutyResolvedType={refDutyTypes.find(d => d.key === character.duty_type)?.name}
        obligationType={character.obligation_type}
        obligationValue={character.obligation_value}
        obligationLore={character.obligation_lore}
        obligationCustomName={character.obligation_custom_name}
        obligationResolvedType={refObligationTypes.find(o => o.key === character.obligation_type)?.name}
        dutyObligationConfigured={character.duty_obligation_configured}
        conflictEntries={[]}
        isForceUser={isForceUser}
        onBackstoryChange={onBackstoryChange}
        onNotesChange={onNotesChange}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify dev server compiles without errors**

The dev server should still be running. Check the browser — no TypeScript errors visible, and `LoreContent` will throw a type error until Task 3 adds the new props to its interface. That's expected — proceed to Task 3 immediately.

- [ ] **Step 4: Commit (after Task 3 makes it green)**

Hold this commit until after Task 3. The file is ready but TypeScript won't be clean until `LoreContent` accepts the new props.

---

## Task 3: LoreContent — Conflict card + sidebar reorder

**Files:**
- Modify: `src/components/character/LoreContent.tsx`

- [ ] **Step 1: Update the token import**

Find the existing import at the top of the file:

```ts
import { HUD } from '@/lib/tokens'
```

Replace with:

```ts
import { HUD, FS, RADIUS } from '@/lib/tokens'
```

- [ ] **Step 2: Expand the props interface**

Find `interface LoreContentProps` and add two new props at the end of the interface, before the closing `}`:

```ts
  conflictEntries?: { label: string; value: number }[]
  isForceUser?: boolean
```

- [ ] **Step 3: Update the function signature**

Find the `export function LoreContent({` destructuring block and add the two new props to it:

```ts
  conflictEntries,
  isForceUser,
```

Add them after `dutyObligationConfigured,` in the destructuring.

- [ ] **Step 4: Add the ConflictCard sub-component**

Add this component below the existing `SectionDivider` function, before the `BackstoryView` function:

```tsx
function ConflictCard({ entries }: { entries: { label: string; value: number }[] }) {
  const total = entries.reduce((s, e) => s + e.value, 0)
  return (
    <div style={{ ...panelStyle, padding: '14px 16px', borderColor: 'rgba(224,80,80,0.2)' }}>
      <CornerBrackets />
      <SectionLabel label="Conflict" />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: FC, fontSize: FS.h4, fontWeight: 700, color: RED, lineHeight: 1 }}>
          {total}
        </div>
        <div style={{ fontFamily: FR, fontSize: FS.overline, color: FAINT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          total active
        </div>
      </div>
      {entries.map((entry, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 0',
            borderBottom: idx < entries.length - 1 ? '1px solid var(--hud-border)' : 'none',
          }}
        >
          <div style={{
            width: 7,
            height: 7,
            borderRadius: RADIUS.full,
            background: RED,
            boxShadow: '0 0 6px rgba(224,80,80,0.5)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, fontFamily: FR, fontSize: FS.caption, color: TEXT }}>
            {entry.label}
          </div>
          <div style={{ fontFamily: FC, fontSize: FS.caption, fontWeight: 700, color: RED }}>
            {entry.value}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Reorder the sidebar in the return JSX**

Find the `{/* ── RIGHT SIDEBAR ────────────────────────────────────────────────────── */}` section. It currently contains, in order:

1. Quick Facts ("Intelligence File")
2. Species Card
3. Duty card
4. Obligation card
5. Motivation card

Reorder to:

1. Quick Facts ("Intelligence File") — unchanged
2. Species Card — unchanged
3. **Conflict card** — new, conditional
4. Motivation card — moved up
5. Duty card — moved down
6. Obligation card — moved down

To do this, cut the motivation card JSX block (the `{(motivationConfigured && motivationType) ? (...)` block and its two fallback arms) from its current position after the Obligation card, and paste it **before** the Duty card.

Then insert the Conflict card between Species and Motivation:

```tsx
{/* Conflict — Force-sensitive only, shown when entries exist */}
{isForceUser && conflictEntries && conflictEntries.length > 0 && (
  <ConflictCard entries={conflictEntries} />
)}
```

The final sidebar order in JSX should be:

```tsx
{/* 1. Quick Facts */}
<div style={{ ...panelStyle, padding: '14px 16px' }}>
  ...Intelligence File...
</div>

{/* 2. Species Card */}
{speciesRef && (
  <div style={{ ...panelStyle, padding: '14px 16px' }}>
    ...Species...
  </div>
)}

{/* 3. Conflict — Force-sensitive only */}
{isForceUser && conflictEntries && conflictEntries.length > 0 && (
  <ConflictCard entries={conflictEntries} />
)}

{/* 4. Motivation */}
{(motivationConfigured && motivationType) ? (
  ...motivation card...
) : (!dutyObligationConfigured && motivationType) ? (
  ...legacy motivation...
) : motivationConfigured === false ? (
  ...not set...
) : null}

{/* 5. Duty */}
{dutyObligationConfigured && dutyType && dutyValue !== undefined && (
  <DutyCard ... />
)}

{/* 6. Obligation */}
{dutyObligationConfigured && obligationType && obligationValue !== undefined && (
  <ObligationCard ... />
)}
```

- [ ] **Step 6: Verify dev server compiles clean**

Check for TypeScript errors in the browser or terminal. The `conflictEntries` and `isForceUser` props in `HudLoreTab` should now resolve correctly.

- [ ] **Step 7: Visual verification**

Open the player HUD → Lore panel. Verify:
- Sidebar order is: Intelligence File → Species → Motivation → Duty/Obligation (Conflict card hidden because `conflictEntries` is `[]`)
- No layout regressions in the backstory column
- Portrait strip from Task 1 still renders correctly
- Summary chips (obligation, motivation) appear in the portrait strip header if the character has them configured

- [ ] **Step 8: Commit both Task 2 and Task 3 together**

```bash
git add src/components/player-hud/HudLoreTab.tsx src/components/character/LoreContent.tsx
git commit -m "feat(lore): add Conflict card slot, reorder sidebar, pass chip data from HudLoreTab"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Portrait fixed 72×96px — Task 1 Step 5
- ✅ Gender in subtitle — Task 1 Step 5, Task 2 Step 2
- ✅ Summary chips (obligation, conflict, motivation) — Task 1 Steps 4–5, Task 2 Step 2
- ✅ `isForceUser` derived from `force_rating > 0 || is_force_sensitive` — Task 2 Step 2
- ✅ Conflict card: total + list of entries + pips — Task 3 Step 4
- ✅ Conflict card: Force-sensitive only + hidden when empty — Task 3 Step 5
- ✅ Sidebar reorder: Intelligence File → Species → Conflict → Motivation → Duty → Obligation — Task 3 Step 5
- ✅ Left column unchanged — not touched
- ✅ `conflictEntries=[]` passed for now (data model deferred) — Task 2 Step 2

**Placeholder scan:** No TBDs, no "implement later", all code blocks are complete.

**Type consistency:**
- `conflictEntries: { label: string; value: number }[]` — defined in `LoreContentProps` (Task 3 Step 2), used in `ConflictCard` (Task 3 Step 4), passed from `HudLoreTab` (Task 2 Step 2). ✅
- `isForceUser: boolean` — defined in `LoreContentProps` (Task 3 Step 2), passed from `HudLoreTab` (Task 2 Step 2). ✅
- `obligationChip`, `conflictTotal`, `motivationChip` — defined in `CharacterAvatarProps` (Task 1 Step 2), passed from `HudLoreTab` (Task 2 Step 2). ✅
