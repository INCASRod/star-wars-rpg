# Console document editor — handover (post-port)

This supersedes the original brief that kicked off the TipTap port. That brief
named `d-formos` as the largest document and never mentioned the `data`
column; both are wrong now (`d-ghost` is larger at 570 blocks vs. 511, and
`data` has been documented for two ports running). Read this instead.

## What the editor is now

The Console's Documents view is TipTap. The vendored file's own paginated
editor (`docEditor`) is deleted, along with everything that existed only to
serve it. The other six views (Situation, Arcs, Threads, Sessions, Planets,
Codex) are still the vendored file's own vanilla-JS rendering — untouched,
out of scope, and not part of this port.

All new editor code lives in `src/console-editor/` (plain JavaScript, no
React), bundled by esbuild into `public/console/editor.bundle.js` via
`predev`/`prebuild` npm hooks so the bundle can never go stale silently. The
vendored file (`public/console/index.html`) loads it with one
`<script src="editor.bundle.js">` tag and calls exactly two globals:
`window.mountConsoleEditor(container, docRow, opts)` and
`window.unmountConsoleEditor()`.

The editor has: full editing of stock nodes (paragraph, heading, blockquote,
list, table) and real card NodeViews (stat/vehicle/planet share one
CARDDEF-driven renderer; npc has its own); an outline with per-type filters
and click-to-jump; in-document search across block content including card
row labels and values (not just rendered text); `?doc=`/`?block=` deep
linking; and a stable scroll position across unrelated collection snapshots
and outline navigation. Full detail is in `docs/architecture.md`'s Console
section — this document is about *why*, not *what*, and about what's still
open.

## The serialisation contract, and why it exists

`scripts/console-blocks-doc.js` (`blocksToDoc`/`docToBlocks`) is the whole
boundary between the block array (the storage format, unchanged) and a
TipTap/ProseMirror document (the editing surface, a projection of it). It is
tested — six passing suites, 2000+ fuzz cases, deliberate-failure checks in
every suite — and it has never been modified during the port. If it looks
wrong, that is a conversation to have explicitly, not something to patch
around.

Round-trip identity is *stronger* than deep equality: `docToBlocks(blocksToDoc(b))`
reproduces `b` including JSON key order, because the Word export, the
Archive stat-block export, and the JSON export/import all read blocks
directly, and a reordered key set makes a diff unreadable even when nothing
actually changed. This is why `rebuild()` exists inside that file, and why it
must stay untouched.

## Constraints that are still live

These are not historical notes — they are still exactly as true as when
each was discovered, and nothing in the port has removed the need for them.

- **The conditional `body` strip.** A document's `body` field is stripped
  only when `blocks` is a non-empty array. `d-story` is blockless and its
  4,733-character `body` is its entire content — an unconditional strip
  destroys it. This rule lives in `consoleBridge.ts`'s `splitDocBody()` and
  in `scripts/console-import.ts`.
- **The hydration gate.** The console boots with in-memory seed placeholders
  and hydrates from the database afterward. `save()`/`del()` refuse to write
  to any collection not yet hydrated (`HYDRATED{}`/`hydrated(c)` in the
  vendored file). This is what stops an edit fired in the race window from
  overwriting a real row with a placeholder — it happened once, to
  `d-formos`, before the gate existed.
- **The uppercase trap.** `innerText` returns *rendered* text. Any field
  styled `text-transform:uppercase` (a card's `.np-l` row label, `.st-h .cl`
  tier field) comes back uppercased through `innerText`, and that uppercase
  gets written to the database on every edit unless neutralised for the
  length of the read. The vendored file's `edText()` and the bundle's
  `dom-text.js` mirror of it both do this. `textContent` is not a
  substitute — it drops the newlines multi-paragraph values depend on.
- **Frozen objects.** Everything read out of the Supabase bridge is
  effectively immutable from the console's point of view; `blocksToDoc`
  never mutates its input (verified with `Object.freeze` in the round-trip
  test suite). Any new code that reads blocks should keep that property.
- **The Word export.** `exportWord(d, btn)` reads the block array directly
  and renders Word-flavoured HTML with its own cover page, running footer,
  and page breaks (the `pb` block type — still in the schema, still renders
  as a visible rule in the TipTap editor, even though the screen no longer
  paginates). It was never touched during the port; step 7 re-verified it
  still works and re-wired its only UI entry point, since deleting the old
  editor deleted the button that called it (`onExportWord`, wired through
  `mountConsoleEditor`'s `opts` the same way `onArchiveExport` is).
- **The Archive stat-block export.** `archiveJSON(b, d)` (plus
  `archSkills`/`archTalents`/`archEquipment`/`archNum`) reads purely from the
  block object, never the DOM — portable, and never reimplemented in the
  bundle. Called through `onArchiveExport`, same pattern as the Word export.
- **`DOCLIMIT=8000000`.** Deliberately ~7.6 MB, not the old artifact
  platform's 256 KB. Do not reintroduce a small cap.
- **Anon key only, for every verification script.** Privileged SQL sees rows
  the client cannot and would verify the wrong thing. `scripts/console-backup.js`
  is the standing tool for taking a full backup before any write-touching
  task; use it instead of an ad hoc `curl`.

## What remains deferred

- **npc normalisation into CARDDEF.** There is exactly one npc block
  campaign-wide (`d-ghost`). It keeps its own, simpler NodeView, deliberately
  not merged into the shared stat/vehicle/planet renderer. This is a real
  migration (block shape changes), not a port task, and stays deferred until
  explicitly asked for.
- **The optional d-formos split.** Never scoped into this port at all;
  raised once as a possibility, not acted on.
- **Mirial and Esseles material.** Referenced in passing during the port's
  campaign-content conversations; not part of the editor work, not looked at.

## What's still weak, plainly

- **The "Back to where you were" scroll fix is real but narrow.** It covers
  exactly the case it was built for (an outline jump reflowing the content
  column). It is not a general navigation history — there's no back/forward
  stack, and `?block=`/search jumps don't feed into it. If more reflow-
  causing UI gets added later (a second sidebar, a details panel), each one
  will need the same "remember by block identity, not pixel offset"
  treatment individually; nothing generalizes that yet.
- **The `.b-card`/`.b-npc`/`.np-*`/`.st-*`/`.arch-*` CSS is still owned by
  the vendored file, not the bundle**, and the bundle's cards rely on it
  being there (unscoped selectors, so it happens to apply to TipTap-rendered
  cards too). This was a deliberate choice during step 7's cleanup (deleting
  it risked breaking card styling with no way to verify the bundle's own CSS
  was self-sufficient without testing it), but it means the two are coupled
  in a way that isn't obvious from reading either file alone. A future pass
  should either fully duplicate that CSS into the bundle (scoped, self-
  contained) or fully delete it from the vendored file and prove the bundle
  doesn't need it — not leave it split.
- **The mirrored `CARDDEF`/`edText` have a drift test, but nothing enforces
  it running.** `console-carddef-drift.test.js` and `console-edtext.test.js`
  both exist and both pass, but neither is wired into CI (there is no CI for
  this repo's JS test suites at all, as far as this port established) — they
  only run when someone remembers to run them by hand.
- **Search's card-atom highlighting is a whole-node flash, not a precise
  in-text highlight.** A text match inside a paragraph gets an exact inline
  highlight; a match inside a card row gets the whole card scrolled into
  view and no visual indication of *which* row or word matched. Good enough
  to find things, not as precise as the text case.
- **No automated test exercises the TipTap editor in a real browser.**
  Every verification in this port was done by hand with Playwright scripts
  written for that task and then discarded. There is no standing browser
  test suite — the six `scripts/console-*.test.js` suites are all pure-Node
  and cover the serialisation/schema/drift layer, not the mounted editor
  itself. A regression in, say, the outline or search UI would not be caught
  by anything that runs today.
