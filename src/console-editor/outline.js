/* Outline: h1/h2/h3 (nested), stat/vehicle/planet/npc cards, callout, read,
   table. div and pb are not outline entries (per the brief).

   Built by walking editor.state.doc's TOP-LEVEL children directly -- these
   map 1:1 to blocks (every block-level node here is exactly one entry,
   never grouped/merged the way docToBlocks regroups multi-paragraph `p`
   nodes), so no dependency on scripts/console-blocks-doc.js is needed for
   this read-only, display-only walk. */

var textExtract = require('./text-extract.js')
var flattenText = textExtract.flattenText, firstLine = textExtract.firstLine, truncate = textExtract.truncate

var TYPE_LABELS = { h1: 'Heading', h2: 'Heading', h3: 'Heading', stat: 'Stat', vehicle: 'Vehicle', planet: 'Planet', npc: 'NPC', callout: 'GM Note', read: 'Read-Aloud', table: 'Table' }

/* B2: measured live, 2026-09-28 -- of 441 campaign-wide callouts, 44.7% have
   a first line under 60 chars with more content following (of THOSE, 88.8%
   are literal ALL-CAPS titles like "GM NOTE — THE BEACON IS PASSIVE"), 38.1%
   are single-line callouts with no second line at all, and 17.2% (76/441) do
   NOT fit the short-title pattern -- a long first "paragraph" before the
   first newline. That last group is too large to ignore, so: short first
   line -> use it whole as a title; long first line -> truncate it instead of
   pretending it's a title. One rule covers all three measured cases. */
function calloutLabel(node) {
  var first = firstLine(flattenText(node))
  return first.length < 60 ? first : truncate(first, 60)
}

function buildOutline(doc) {
  var entries = []
  doc.forEach(function (node, offset) {
    var type = node.type.name
    var entry = null
    if (type === 'heading') {
      var level = Math.min(3, Math.max(1, node.attrs.level || 1))
      entry = { kind: 'h' + level, filterKind: 'heading', label: flattenText(node) || 'Untitled', level: level }
    } else if (type === 'card') {
      var kind = node.attrs.kind
      var data = node.attrs.data || {}
      entry = { kind: kind, filterKind: 'card', label: (data.name || 'Untitled') + ' (' + (TYPE_LABELS[kind] || kind) + ')', level: 0 }
    } else if (type === 'npcCard') {
      entry = { kind: 'npc', filterKind: 'card', label: (node.attrs.name || 'Untitled') + ' (NPC)', level: 0 }
    } else if (type === 'calloutBlock') {
      entry = { kind: 'callout', filterKind: 'callout', label: calloutLabel(node) || '(empty GM note)', level: 0 }
    } else if (type === 'readAloud') {
      var rl = firstLine(flattenText(node))
      entry = { kind: 'read', filterKind: 'read', label: 'Read-aloud: ' + truncate(rl || '(empty)', 60), level: 0 }
    } else if (type === 'table') {
      var headerRow = node.child(0)
      var cells = []
      if (headerRow) headerRow.forEach(function (cell) { cells.push(flattenText(cell).replace(/\n/g, ' ')) })
      entry = { kind: 'table', filterKind: 'table', label: 'Table: ' + truncate(cells.join(' | ') || '(empty)', 60), level: 0 }
    }
    /* ornament (div) and pageBreak (pb) are deliberately not outline entries */
    if (entry) {
      entry.pos = offset
      entry.blockId = node.attrs.blockId || null
      entries.push(entry)
    }
  })
  return entries
}

module.exports = { buildOutline: buildOutline, TYPE_LABELS: TYPE_LABELS }
