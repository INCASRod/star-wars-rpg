/* Console TipTap schema -- step 3 (read-only bare mount).
   ------------------------------------------------------------------
   scripts/console-blocks-doc.js is the contract (already tested; not modified
   here). Every top-level node this schema defines must accept the exact attrs
   blocksToDoc() puts on it -- blockId, cont, keys, extra -- plus whatever
   type-specific attrs that block carries (level, kind, data, name, rows).
   None of these attrs need to render into the DOM (`rendered:false`): they
   exist so a doc round-trips through docToBlocks later, not to be visible.

   Placeholder nodes (callout, read, div, pb, npc, stat/vehicle/planet card,
   unknown) are deliberately ugly per the brief -- plain labelled boxes, no
   NodeView class, no interactivity. Real NodeViews are step 5.

   PLAIN JAVASCRIPT. No React, no @tiptap/react -- the console is vanilla JS
   end to end and this schema is part of that, not an exception to it. */

var Document = require('@tiptap/extension-document').Document
var Paragraph = require('@tiptap/extension-paragraph').Paragraph
var Text = require('@tiptap/extension-text').Text
var Heading = require('@tiptap/extension-heading').Heading
var Blockquote = require('@tiptap/extension-blockquote').Blockquote
var BulletList = require('@tiptap/extension-bullet-list').BulletList
var ListItem = require('@tiptap/extension-list-item').ListItem
var HardBreak = require('@tiptap/extension-hard-break').HardBreak
var Table = require('@tiptap/extension-table').Table
var TableRow = require('@tiptap/extension-table-row').TableRow
var TableHeader = require('@tiptap/extension-table-header').TableHeader
var TableCell = require('@tiptap/extension-table-cell').TableCell
var Node = require('@tiptap/core').Node
var Extension = require('@tiptap/core').Extension
var canSplit = require('@tiptap/pm/transform').canSplit
var cardNodeView = require('./card-nodeview.js')
var searchPlugin = require('./search.js').searchPlugin

/* Every block-level node blocksToDoc() emits carries exactly these four. */
var BLOCK_ATTRS = {
  blockId: { default: null, rendered: false },
  cont: { default: false, rendered: false },
  keys: { default: null, rendered: false },
  extra: { default: null, rendered: false },
}

function withBlockAttrs(more) {
  var out = {}, k
  for (k in BLOCK_ATTRS) out[k] = BLOCK_ATTRS[k]
  if (more) for (k in more) out[k] = more[k]
  return out
}

/* ---- stock nodes, extended only to carry the four contract attrs -------- */

/* `cont` marks the second half of one "a\n\nb" block. It never rendered; it now emits
   data-cont (display only -- parseHTML ignores it, nothing reads it back) so CSS can draw
   the blank line the old renderer drew between the halves. */
var ParagraphExt = Paragraph.extend({
  addAttributes: function () {
    return withBlockAttrs({
      cont: {
        default: false,
        rendered: true,
        parseHTML: function () { return false },
        renderHTML: function (attrs) { return attrs.cont ? { 'data-cont': '1' } : {} },
      },
    })
  },
})
var HeadingExt = Heading.configure({ levels: [1, 2, 3] }).extend({
  addAttributes: function () {
    return withBlockAttrs({ level: { default: 1, rendered: false } })
  },
})
var BlockquoteExt = Blockquote.extend({ addAttributes: function () { return withBlockAttrs() } })
var BulletListExt = BulletList.extend({ addAttributes: function () { return withBlockAttrs() } })
var TableExt = Table.extend({ addAttributes: function () { return withBlockAttrs() } })

/* ---- placeholder nodes: callout / read ----------------------------------
   Real content (paragraph+), a plain label, no NodeView. */
function labelledBlock(name, label, cssClass) {
  return Node.create({
    name: name,
    group: 'block',
    content: 'paragraph+',
    addAttributes: function () { return withBlockAttrs() },
    parseHTML: function () { return [{ tag: 'div[data-block="' + name + '"]' }] },
    renderHTML: function () {
      return [
        'div',
        { 'data-block': name, class: cssClass },
        ['div', { class: cssClass + '-label', contenteditable: 'false' }, label],
        ['div', { class: cssClass + '-body' }, 0],
      ]
    },
  })
}
var CalloutBlock = labelledBlock('calloutBlock', 'GM NOTE', 'ph-callout')
var ReadAloud = labelledBlock('readAloud', 'READ ALOUD', 'ph-read')

/* ---- placeholder nodes: div (ornament) / pb (pageBreak) -- leaves ------- */
var Ornament = Node.create({
  name: 'ornament',
  group: 'block',
  atom: true,
  addAttributes: function () { return withBlockAttrs() },
  parseHTML: function () { return [{ tag: 'div[data-block="ornament"]' }] },
  renderHTML: function () { return ['div', { 'data-block': 'ornament', class: 'ph-ornament' }, '✦'] },
})
var PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  addAttributes: function () { return withBlockAttrs() },
  parseHTML: function () { return [{ tag: 'div[data-block="pageBreak"]' }] },
  renderHTML: function () { return ['div', { 'data-block': 'pageBreak', class: 'ph-pagebreak' }, ['span', {}, 'Page break']] },
})

/* ---- placeholder nodes: npc / card (stat, vehicle, planet) --------------
   Atoms. "a simple labelled box showing the card's name and type" -- exactly
   that and nothing more; real NodeViews (editable fields, CARDDEF-driven
   layout) are step 5, not this one. */
var NpcCard = Node.create({
  name: 'npcCard',
  group: 'block',
  atom: true,
  addAttributes: function () {
    return withBlockAttrs({
      name: { default: '', rendered: false },
      rows: { default: null, rendered: false },
    })
  },
  parseHTML: function () { return [{ tag: 'div[data-block="npcCard"]' }] },
  renderHTML: function (props) {
    /* fallback for contexts with no live NodeView (clipboard/export paths
       that call generateHTML outside a mounted editor); the mounted editor
       itself always uses createNpcNodeView below. */
    var name = (props.node && props.node.attrs && props.node.attrs.name) || 'Untitled NPC'
    return ['div', { 'data-block': 'npcCard', class: 'ph-card' }, 'NPC — ' + name]
  },
  addNodeView: function () {
    return function (props) { return cardNodeView.createNpcNodeView(props) }
  },
})
var Card = Node.create({
  name: 'card',
  group: 'block',
  atom: true,
  addAttributes: function () {
    return withBlockAttrs({
      kind: { default: '', rendered: false },
      data: { default: null, rendered: false },
    })
  },
  parseHTML: function () { return [{ tag: 'div[data-block="card"]' }] },
  renderHTML: function (props) {
    /* fallback only -- see note on npcCard above. */
    var a = (props.node && props.node.attrs) || {}
    var name = (a.data && a.data.name) || 'Untitled'
    return ['div', { 'data-block': 'card', class: 'ph-card' },
      (a.kind || '').toUpperCase() + ' — ' + name]
  },
  addNodeView: function () {
    return function (props) { return cardNodeView.createCardNodeView(props) }
  },
})

/* ---- unknown block types: must survive, must stay visible --------------- */
var UnknownBlock = Node.create({
  name: 'unknownBlock',
  group: 'block',
  atom: true,
  addAttributes: function () {
    return withBlockAttrs({ kind: { default: '', rendered: false } })
  },
  parseHTML: function () { return [{ tag: 'div[data-block="unknownBlock"]' }] },
  renderHTML: function (props) {
    var kind = (props.node && props.node.attrs && props.node.attrs.kind) || '?'
    return ['div', { 'data-block': 'unknownBlock', class: 'ph-unknown' }, 'UNKNOWN BLOCK (' + kind + ')']
  },
})

/* ---- step 4: the duplicate-block-id hazard ------------------------------
   Pressing Enter mid-paragraph (or mid-heading) splits that node; ProseMirror's
   default split copies the original node's attrs onto both halves, so the new
   half inherits the same blockId as the block it was split from. Only
   top-level nodes ($from.depth === 1) carry blockId at all -- paragraphs
   inside a blockquote, list item or table cell carry no such attr (see
   blocksToDoc: only the OUTER blockquote/bulletList/table node gets attrs()),
   so this only needs to guard the direct doc children, paragraph and heading.

   This is (a) of the two-part fix scripts/console-block-ids.js's dedupeBlockIds
   is (b): resetting attrs here means a cleanly split node becomes a proper new
   block on its own (docToBlocks mints it a real id), so the safety net rarely
   has to fire; but paste can still duplicate an id, which is exactly why the
   safety net exists regardless of this. */
var SplitResetBlockId = Extension.create({
  name: 'splitResetBlockId',
  addKeyboardShortcuts: function () {
    return {
      Enter: function (props) {
        var editor = props.editor
        var state = editor.state
        var sel = state.selection
        if (!sel.empty) return false
        var $from = sel.$from
        if ($from.depth !== 1) return false /* not a direct child of doc -- leave to default handling */
        var parent = $from.parent
        if (!parent || !parent.attrs || !('blockId' in parent.attrs)) return false
        if (!canSplit(state.doc, $from.pos)) return false
        var resetAttrs = { blockId: null, cont: false, keys: null, extra: null }
        var tr = state.tr.split($from.pos, 1, [{ type: parent.type, attrs: resetAttrs }])
        editor.view.dispatch(tr.scrollIntoView())
        return true
      },
    }
  },
})

var ConsoleSearch = Extension.create({
  name: 'consoleSearch',
  addProseMirrorPlugins: function () { return [searchPlugin()] },
})

module.exports = {
  extensions: [
    Document,
    ParagraphExt,
    Text,
    HeadingExt,
    BlockquoteExt,
    BulletListExt,
    ListItem,
    HardBreak,
    TableExt,
    TableRow,
    TableHeader,
    TableCell,
    CalloutBlock,
    ReadAloud,
    Ornament,
    PageBreak,
    NpcCard,
    Card,
    UnknownBlock,
    SplitResetBlockId,
    ConsoleSearch,
  ],
}
