# GM: Add Critical Injury (Direct Apply)

**Date:** 2026-05-26  
**Status:** Approved

## Summary

Add an "＋ Add Injury" button next to the existing "⚡ Crit Roll" button in the GM character card. This allows the GM to directly apply a critical injury to a character without going through the dice-roll request flow. The player receives a dialog notification with the injury name, severity, and description.

---

## User-Facing Behaviour

### GM flow

1. GM opens a character card in the Party panel.
2. The crit section shows two side-by-side buttons: **⚡ Crit Roll** and **＋ Add Injury**.
3. Clicking **＋ Add Injury** expands an inline form panel (same pattern as the existing crit roll panel):
   - **Reference injury** — `<select>` populated from `refCritsDb` (sorted by `roll_min`). Selecting an entry pre-populates the name, severity, and description fields.
   - **Severity** — read-only badge derived from the selected ref injury (e.g. "Hard ★★★"). Not editable. Defaults to `"Average"` when no ref is selected.
   - **Injury name** — editable text input, pre-populated from ref selection.
   - **Description** — editable textarea, pre-populated from ref selection.
   - **Cancel** and **✓ Apply Injury** buttons.
4. Clicking **✓ Apply Injury**:
   - Writes the injury to `character_critical_injuries` (see Data section).
   - Broadcasts a `crit-injury-added` event to the player's realtime channel.
   - Shows a GM toast: `"Critical injury applied!"`.
   - Closes the form and resets all input state.

### Player flow

1. A dialog modal pops up on the player's screen.
2. Shows: "⚠ Critical Injury Received" eyebrow, injury name as title, severity badge, description text, and an **Acknowledge** button.
3. Player clicks **Acknowledge** → dialog closes.
4. Injury appears in the character's critical injuries list (written directly to DB).

---

## Data

### Database write — `character_critical_injuries`

No migration required. All columns already exist.

| Column | Value |
|---|---|
| `character_id` | target character ID |
| `injury_id` | `refCritId` if picked from ref table, otherwise `null` |
| `custom_name` | final name from input (always stored, even when from ref) |
| `severity` | from ref selection, or `"Average"` if custom |
| `description` | final description from textarea |
| `is_healed` | `false` |
| `received_at` | `new Date().toISOString()` |
| `roll_result` | `null` (no roll) |
| `session_label` | `null` |

### Realtime broadcast

Sent via `sendToChar(charId, payload)` from `useGmBroadcast`:

```ts
{
  type: 'crit-injury-added',
  name: string,
  severity: string,
  description: string,
}
```

---

## Architecture

### State

**`GmShell.tsx`** — adds:
```ts
const [addCritOpenFor, setAddCritOpenFor] = useState<string | null>(null)
```

**`useGmCharacterActions.ts`** — adds:
```ts
const [addCritRefId, setAddCritRefId] = useState<number | null>(null)
const [addCritName, setAddCritName] = useState('')
const [addCritDesc, setAddCritDesc] = useState('')
const [addCritSeverity, setAddCritSeverity] = useState('')
const [addCritBusy, setAddCritBusy] = useState(false)
```

Plus two exported functions:
- `selectCritRef(refId: number, refs: RefCriticalInjury[])` — populates name/severity/desc from ref table
- `addCriticalInjury(charId: string): Promise<void>` — DB insert + broadcast + flash + reset

### Files changed

| File | Change |
|---|---|
| `src/components/gm/GmCharacterCard.tsx` | Replace single crit button with two-button row; add "Add Injury" inline expansion panel |
| `src/hooks/useGmCharacterActions.ts` | Add form state + `selectCritRef()` + `addCriticalInjury()` |
| `src/app/gm/GmShell.tsx` | Add `addCritOpenFor` state, wire handlers, pass through |
| `src/app/gm/panels/GmPartyPanel.tsx` | Thread new props to `GmCharacterModal` |
| `src/app/gm/panels/GmCharacterModal.tsx` | Thread new props to `GmCharacterCard` |
| `src/hooks/usePlayerBroadcast.ts` | Add `crit-injury-added` case → sets `gmCritInjuryDialog` state |
| `src/components/player-hud/HudModalsOverlay.tsx` | Render injury dialog when `gmCritInjuryDialog` is set |

### No new migrations

`character_critical_injuries` already has all required columns. No schema changes.

---

## Error handling

- **Empty name**: "✓ Apply Injury" button is disabled if `addCritName.trim()` is empty.
- **Double-submit**: Button is also disabled while `addCritBusy` is `true`.
- **Supabase error on insert**: catch error, call `flashError('Failed to apply injury')`, keep form open, reset `addCritBusy`.
- **Broadcast failure**: silent — the DB write is the source of truth; the player will see the injury in their sheet regardless.

---

## Out of scope

- Allowing the GM to edit severity (it comes from the ref table; custom injuries default to "Average").
- A "custom-only" mode with no ref table starting point.
- Undo / recall of a directly applied injury (use existing heal flow).
