# Console patch upload: specification

**Target:** `public/console/index.html` in The Archive (build 2026-09-28.x onward).
**Goal:** replace the everyday use of the Upload button with a non-destructive patch
format, so a chat session can hand over a small JSON file describing only what changed.

---

## 1. Why

The current Upload button is a full-state replace. `validSnap()` requires every
collection to be present and `applySnap()` deletes any record not in the file. Absence
means deletion. That is correct for restoring a backup and actively dangerous as a
routine update path: it forces every handover to carry the entire campaign (the last
export was 1.4 MB), and a single omission silently destroys records.

The new patch format inverts that: nothing is touched unless the file names it, and
nothing is written until the GM has seen a diff and confirmed.

Documents get block-level operations rather than whole-array replacement. `d-formos` is
511 blocks; shipping all of them to change two is how `d-story` was emptied and how
`d-formos` was flattened to one block. A patch that names two block ids cannot drop the
other 509.

---

## 2. File format

```json
{
  "lor": 1,
  "patch": 1,
  "id": "p-2026-10-05-s28",
  "created": "2026-10-05T09:12:00.000Z",
  "note": "Session 28 write-up, two threads resolved, Formos ambush rewording",

  "campaign": { "...complete campaign state record..." },

  "upsert": {
    "threads":  [ { "id": "t9",  "...": "complete record" } ],
    "arcs":     [ { "id": "zid", "...": "complete record" } ],
    "sessions": [ { "id": "s28", "...": "complete record" } ],
    "codex":    [ { "id": "c-x", "...": "complete record" } ],
    "planets":  [],
    "links":    [],
    "tags":     []
  },

  "delete": {
    "threads": ["t12"]
  },

  "docs": [
    {
      "id": "d-formos",
      "title": "Trouble Brewing - Formos",
      "ops": [
        { "op": "replace",     "block": "f89",  "with": { "id": "f89", "t": "p", "x": "..." } },
        { "op": "insertAfter", "block": "f92",  "blocks": [ { "t": "callout", "x": "..." } ] },
        { "op": "insertBefore","block": "f1",   "blocks": [ { "t": "h2", "x": "..." } ] },
        { "op": "append",                        "blocks": [ { "t": "p", "x": "..." } ] },
        { "op": "delete",      "block": "f204" },
        { "op": "move",        "block": "f55",  "after": "f60" }
      ]
    }
  ]
}
```

Every top-level key except `lor`, `patch` and `id` is optional. A patch may contain only
`upsert.sessions`, or only `docs`, or any combination.

### Field rules

- `lor` must be `1`. `patch` must be `1`. A file with `patch` absent is treated as a
  legacy full-state snapshot and routed to the restore path (section 8), not the patch
  path.
- `id` is required, a non-empty string, used for idempotency (section 7).
- `created` and `note` are informational; `note` is shown in the preview.
- `upsert` values are **complete records**, not partial field sets. The record replaces
  the stored record wholesale. Each must carry an `id`. Unknown collection names are a
  validation error, not a silent skip.
- `campaign` is the complete campaign state record if present.
- `delete` names records to remove, by collection and id. This is the only way a patch
  removes anything.
- `docs` entries are block operations, never a whole `blocks` array. A patch that
  contains a `blocks` key on a doc entry is a validation error, with a message saying to
  use `ops`.

### Document ops

| op | fields | behaviour |
|---|---|---|
| `replace` | `block`, `with` | replaces that block. `with.id` must equal `block` if present; if absent it is set. |
| `insertAfter` | `block`, `blocks` | inserts the given blocks immediately after `block`, in order. |
| `insertBefore` | `block`, `blocks` | as above, before. |
| `append` | `blocks` | appends to the end of the document. |
| `delete` | `block` | removes that block. |
| `move` | `block`, and one of `after` / `before` | moves an existing block. |

Inserted blocks may omit `id`, in which case the console generates one with its existing
`bid()`. If an `id` is supplied it must not already exist in the document.

Ops are applied **in order** against a working copy of the block array. Earlier ops are
visible to later ones: inserting a block then referencing its id in a later op is legal.

---

## 3. Validation (before any preview is shown)

Reject the whole file, with a specific message naming the first problem, if:

- `lor !== 1` or `patch !== 1` or `id` is missing or empty.
- any key under `upsert` or `delete` is not one of
  `arcs, threads, sessions, codex, planets, links, docs, tags`.
  Note `docs` is **not** permitted under `upsert`; documents go through `docs` ops only.
- any `upsert` record lacks an `id`.
- any `docs` entry names a document id that does not exist in the campaign. (Creating a
  new document by patch is out of scope for v1; say so in the error.)
- any op references a `block` id not present in the document at the point that op is
  reached.
- any inserted block carries an `id` that already exists in that document.
- any inserted or replacing block has a `t` that is not one of the fifteen types in `BT`.
- any op has an unrecognised `op` value or is missing a required field.

Validation must be a pure function over the parsed file plus current `S`, returning a
list of problems, so it is testable without the DOM.

---

## 4. Preview

After validation passes, show a confirmation panel listing exactly what will happen.
Nothing is written before the GM confirms. The panel shows:

- the patch `id`, `created` and `note`.
- per collection, the records to be **added** (id not currently present) and **changed**
  (id present), with for changed records the list of field names whose values differ.
  Changed `blocks` arrays are reported as a block count delta, not as a field dump.
- records to be **deleted**, by id and title or name, each flagged visually.
- per document, one line per op: the op, the target block id, its type, and the first 60
  characters of the text involved. Plus a summary line: block count before and after.
- a prominent total: *N records written, M deleted, K documents changed*.

Two buttons: Apply, and Cancel. Cancel discards and writes nothing.

If the patch would delete anything, the Apply button requires a second confirmation using
the existing `askDelete` dialog, naming the count.

---

## 5. Applying

- Refuse to apply unless every collection the patch touches is hydrated
  (`HYDRATED[c]`). If not, show the existing LOADING state and do nothing. The hydration
  gate exists because an edit before first snapshot writes a placeholder over a real
  record, which cost `d-formos` once.
- Writes go through the console's existing paths, not direct `DB.doc().set()` calls:
  records through `save()`, documents through `saveDoc()`. This is what preserves the
  conditional body strip (`if (payload.blocks && payload.blocks.length) delete payload.body`),
  the size guard, and the failure banner. `d-story` has zero blocks and lives entirely in
  its `body`; a patch path that bypasses `saveDoc()` will empty it again.
- Reuse `runWrites()` for sequencing, backoff on `resource_exhausted` and `unavailable`,
  and the per-record failure tally with retry offer. Do not fire writes in parallel.
- Apply order: deletes last. Upserts and document ops first, so a failed patch leaves
  extra data rather than missing data.
- Document ops for one document are atomic: build the new block array in memory, apply
  every op, then write once. If any op fails mid-way, that document is not written at all
  and the failure is reported.
- On success, record the patch id (section 7) and report
  *"Patch p-... applied: N records, K documents."*

---

## 6. Where it lives in the UI

The existing "Backup and offline copy" panel becomes two clearly separate controls:

- **Download state** stays as is. Still useful as a backup and as the source of truth when
  composing a patch.
- **Upload patch** is the new primary action, accepting a `patch: 1` file.
- **Restore from backup file** is the old full-replace path, moved behind a collapsed
  section labelled as destructive, with its existing behaviour intact: backup download
  first, then the replace confirmation. It is for restoring a snapshot, not for updates.

If a file dropped on **Upload patch** turns out to be a legacy snapshot, do not apply it.
Say that it is a full-state file and point at the restore control.

---

## 7. Idempotency

Applied patch ids are stored in the campaign state record, not in `localStorage`, because
the console is used from more than one device and `localStorage` is per browser:

```
campaign.appliedPatches = [ { id: "p-...", when: "2026-10-05T09:14:22.511Z" }, ... ]
```

Cap at the most recent 50 entries.

On upload, if the patch id is already present, do not apply. Show when it was applied and
offer an explicit "Apply anyway" that requires a second confirmation. This is the fix for
the earlier confusion where a file was uploaded twice because nothing appeared to happen.

---

## 8. Out of scope for v1

- Creating a new document by patch.
- Partial field merges on records (`upsert` is always a complete record).
- Patching the `tags` colour swatches or reordering collections.
- Any schema migration of `npc` blocks into `CARDDEF`.

---

## 9. Acceptance tests

Each of these must pass before the work is considered done. Use a scratch campaign or a
scratch document where a test writes, and restore `d-formos` exactly after any test that
touches it.

1. **Partial patch does not delete.** A patch containing only `upsert.sessions` with one
   record leaves every thread, arc, codex entry, planet, link, tag and document
   untouched. Verify by full read-back and diff against a pre-test snapshot.
2. **Block op precision.** A patch replacing two blocks in `d-formos` by id results in
   511 blocks, with exactly those two changed and the other 509 byte-identical.
3a. **Blockless document refused by default.** A patch with ops on `d-story` (zero blocks,
   4,733 characters of `body`) and no `seedFromBody` is refused and `d-story` is unchanged.
3b. **`seedFromBody` preserves the text.** The same patch with `"seedFromBody": true`
   preserves the content: `docBody(newBlocks)` minus the appended block equals the original
   `body` with whitespace normalised, with any word present in one and not the other reported.
   (Amended from the original single test 3; see section 10.)
4. **Insert, delete, move.** A patch exercising `insertAfter`, `insertBefore`, `append`,
   `delete` and `move` on a scratch document produces the expected final order.
5. **Validation refuses bad input.** Each of: unknown collection, missing id, unknown
   block id, duplicate inserted id, unknown block type, `blocks` key on a doc entry,
   `docs` under `upsert`. Each must be refused with a specific message and write nothing.
6. **Atomicity.** A document patch whose third op is invalid writes nothing to that
   document.
7. **Hydration gate.** A patch applied before snapshots land is refused, the LOADING
   state shows, and the stored records are unchanged.
8. **Idempotency.** Uploading the same patch twice applies once; the second attempt
   reports the earlier application and requires an override.
9. **Delete path.** A patch with a `delete` entry shows the deletion in the preview,
   requires the second confirmation, and removes exactly that record.
10. **Legacy file routing.** A `patch`-less full-state export dropped on Upload patch is
    refused with a pointer to the restore control, and still applies correctly through
    the restore control itself.
11. **Cancel writes nothing.** Validate, preview, cancel, then read back and diff.

Verification is by anon-key REST read-back and block-for-block diff. Array order is
significant. Privileged SQL sees rows the client cannot and must not be used for
verification.

---

## 10. Amendments as implemented (build 2026-10-05.2)

Decisions taken during implementation that supersede or tighten the text above. Where this
section and an earlier one disagree, this section is correct.

### Write path

- `save()`, `saveDoc()` and `del()` resolve `true`/`false` and never throw. They leave the
  reason in `LASTERR` (`not_loaded` and `no_database` are refusals, anything else a failed
  write). The patch sequencer `runPatchSteps` is its own: strictly one write at a time, the
  same two retry codes as `runWrites` (`resource_exhausted`, `unavailable`), the same tally
  shape and `askDelete` retry offer. `runWrites` is unchanged and still serves restore.
- Size is checked during validation (`docStoredSize`, the same estimate `saveDoc`'s guard
  uses) and reported as a validation problem naming the document and projected size, so the
  too-large dialog can never fire mid-apply.
- Phases run in order: upserts, campaign and documents; then deletes (skipped if any earlier
  step failed); then the patch record. A failed phase stops everything after it.

### Documents

- **Blockless documents** (text lives in `body`) have ops refused unless the doc entry carries
  `"seedFromBody": true`. With it, the console seeds from the heuristic importer, applies the
  ops, and the preview states the conversion prominently. It is refused if the document
  already has blocks. Seeding is never a side effect.
- **Seeded block ids are deterministic:** `s1`, `s2`, ... in document order
  (`seedBlocksForPatch`; the editor's `parseBlocks` is untouched). Validation and apply seed
  identically, so the ids shown in the preview are the ids stored, and one patch can seed a
  document and then target `s3`.
- Ops are refused if any document named in the patch is open in the editor, and
  `flushAll()` runs before validation so pending debounced edits are committed first.
- Deleting a whole document (`delete.docs`) takes `{ "id": ..., "title": ... }`; the title
  must equal the document's exact current title or the patch is refused.
- A patch whose ops would leave a document with no blocks is refused.

### Validation additions

- Unknown top-level keys are refused (a typo such as `upserts` must not silently do nothing).
- Deleting a record that does not exist is refused; upserting and deleting the same id in one
  patch is refused; the same document twice in `docs` is refused.
- The block-type list is read from one constant, `src/console-editor/block-types.js`
  (exposed to the console as `window.LOR_BLOCK_TYPES`), shared with the editor mapping and
  guarded by `scripts/console-block-types.test.js`. If it did not load, every patch is refused.

### Preview and apply consistency

- **The ledger belongs to the console, never the file.** An incoming `campaign` record has
  `appliedPatches` removed unconditionally; the stored ledger is carried over. The final
  patch-record write overwrites `appliedPatches` outright from the stored ledger plus the new
  entry, so nothing the file carried can reach the database.
- **The preview is gated on hydration, not only the apply.** `patchTouches(p)` returns the
  collections a patch writes (always `campaign`, plus anything named in `upsert`/`delete`,
  plus `docs` when `p.docs` is non-empty) and is used by both gates. Until every one has been
  read, the panel shows a plain "still loading" message instead of validating or planning,
  because before the snapshots land `S` holds seed placeholders and any diff computed from
  them is fiction. It redraws itself (one timer, never stacked) when the data lands.
- **What is applied is what was approved.** Apply recomputes the plan against current state
  and compares its signature (`planSig`: written/deleted/documents counts, per-document block
  counts, per-record status) with the one the GM was shown; on any difference nothing is
  written and the preview is redrawn. The document plans are computed once and reused.
- The preview is redrawn from module state whenever the Situation view re-renders, so a
  snapshot can never wipe it, and is revalidated each time.
