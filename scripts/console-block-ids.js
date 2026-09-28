/* dedupeBlockIds -- safety net against duplicate block ids.
   ------------------------------------------------------------------
   Pressing Enter mid-paragraph splits a ProseMirror node; the new node
   inherits the original's attrs, including blockId, unless something
   explicitly resets them (the schema's own SplitResetBlockId keyboard
   handler does this at the split point). Copy/paste can reintroduce the
   same hazard by duplicating a slice's attrs verbatim. Either way, two
   blocks can end up sharing one id by the time docToBlocks has run.

   This is the safety net regardless of whether the split-time reset caught
   it: it operates on the OUTPUT of docToBlocks (a plain blocks array), never
   on the ProseMirror document itself, because a multi-paragraph `p` block
   legitimately produces several TipTap nodes sharing one blockId -- that is
   handled inside docToBlocks by the `cont` flag and is invisible by the time
   there is a blocks array to look at. Anything still duplicated at THIS
   point is a real duplicate, not a multi-paragraph block's internal nodes. */

/* Same shape as the console's own bid(). */
function mintId() {
  return 'b' + Math.random().toString(36).slice(2, 9)
}

function dedupeBlockIds(blocks) {
  var seen = {}
  return (blocks || []).map(function (b) {
    var id = b && b.id
    if (id == null || seen[id]) {
      var newId
      do { newId = mintId() } while (seen[newId])
      seen[newId] = true
      return Object.assign({}, b, { id: newId })
    }
    seen[id] = true
    return b
  })
}

module.exports = { dedupeBlockIds: dedupeBlockIds, mintId: mintId }
