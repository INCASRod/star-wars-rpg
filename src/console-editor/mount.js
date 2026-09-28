/* mountConsoleEditor -- step 4: editing enabled for stock node types.
   ------------------------------------------------------------------
   The bundle stays pure: this file contains no persistence code and no
   reference to any save path (saveDoc, save(), stashDraft, schedule,
   flushAll -- none of them are reachable from here, since they are private
   to the vendored file's own closure). All this does is call opts.onChange
   with the blocks array from docToBlocks on every edit; the index.html patch
   is what supplies that callback and does the actual saving, through the
   console's own existing saveDoc / schedule() debounce. Grep this whole
   directory for "saveDoc" or "schedule(" -- there is nothing to find.

   editable is true so paragraph/heading/blockquote/bulletList/listItem/
   table/hardBreak can be typed in; the placeholder nodes (callout, read,
   div, pb, npc, card, unknownBlock) stay non-editable simply because they
   are schema atoms with no editable content -- there is no cursor position
   inside an atom's content to type into, editable:true or not. Their attrs
   (including a card's whole `data` payload) are never touched by anything
   in this file: onChange only ever reads docToBlocks' output, which passes
   every attr straight through rebuild() in console-blocks-doc.js.

   blocksToDoc/docToBlocks come from scripts/console-blocks-doc.js, unmodified
   -- that file is the tested contract. */

var Editor = require('@tiptap/core').Editor
var schema = require('./schema.js')
var blocksDoc = require('../../scripts/console-blocks-doc.js')
var blocksToDoc = blocksDoc.blocksToDoc
var docToBlocks = blocksDoc.docToBlocks
var hooks = require('./hooks.js')

var STYLE_ID = 'console-editor-placeholder-style'
var CSS =
  '.tiptap-mount{padding:16px;max-width:900px;margin:0 auto;font-family:Georgia,serif;color:#1A1A1A}' +
  '.tiptap-mount .ProseMirror{outline:none}' +
  '.tiptap-mount h1{font-size:1.6em;margin:0.6em 0 0.3em}' +
  '.tiptap-mount h2{font-size:1.3em;margin:0.6em 0 0.3em}' +
  '.tiptap-mount h3{font-size:1.1em;margin:0.6em 0 0.3em}' +
  '.tiptap-mount blockquote{border-left:2px solid #C9A84C;margin:0.8em 0;padding-left:12px;font-style:italic}' +
  '.tiptap-mount table{border-collapse:collapse;margin:0.8em 0}' +
  '.tiptap-mount td,.tiptap-mount th{border:1px solid #999;padding:4px 8px}' +
  '.tiptap-mount .ph-callout,.tiptap-mount .ph-read{border:1px dashed #8B1A1A;margin:0.8em 0;padding:8px 10px}' +
  '.tiptap-mount .ph-callout-label,.tiptap-mount .ph-read-label{font-size:0.7em;letter-spacing:0.15em;color:#8B1A1A;margin-bottom:4px}' +
  '.tiptap-mount .ph-ornament{text-align:center;color:#A79C86;margin:1em 0}' +
  '.tiptap-mount .ph-pagebreak{text-align:center;font-size:0.7em;letter-spacing:0.2em;color:#A79C86;border-top:1px dashed #A79C86;border-bottom:1px dashed #A79C86;padding:4px 0;margin:1em 0}' +
  '.tiptap-mount .ph-card{border:1px solid #8B1A1A;background:#FFF8E1;padding:8px 10px;margin:0.8em 0;font-family:Consolas,monospace;font-size:0.85em}' +
  '.tiptap-mount .ph-unknown{border:1px dashed red;color:red;padding:6px 8px;margin:0.8em 0;font-family:Consolas,monospace;font-size:0.8em}' +
  /* real card/npc styling, mirrored from index.html's own .b-card/.b-npc rules
     (colours/spacing kept 1:1; the read/edit-mode hover-reveal gating on
     .np-rm/.np-add is dropped since this port has no separate reader mode --
     both are always visible here, simplification noted in the commit). */
  '.tiptap-mount .b-npc,.tiptap-mount .b-card{border:1px solid #C9A84C;border-radius:4px;margin:20px 0;overflow:hidden;background:#FEFCF7}' +
  '.tiptap-mount .b-npc{border-color:#DDD2BC}' +
  '.tiptap-mount .b-vehicle{border-color:#4E7C99}' +
  '.tiptap-mount .b-planet{border-color:#6E9B7A}' +
  '.tiptap-mount .b-planet .st-h{background:#1E2A22}' +
  '.tiptap-mount .b-planet .st-h .cl{color:#9BD0AA}' +
  '.tiptap-mount .b-planet .np-l{color:#2E5B3C}' +
  '.tiptap-mount .b-npc .np-h,.tiptap-mount .b-card .st-h{background:#2A2118;color:#FBF8F1;padding:9px 16px;display:flex;align-items:baseline;gap:12px}' +
  '.tiptap-mount .b-npc .np-h{background:#8B1A1A}' +
  '.tiptap-mount .b-npc .np-h .nm,.tiptap-mount .b-card .st-h .nm{font-family:Cinzel,Georgia,serif;font-weight:600;font-size:12.5pt;flex:1;outline:none}' +
  '.tiptap-mount .b-card .st-h .cl{font-family:Consolas,monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;flex:0 0 auto;outline:none}' +
  '.tiptap-mount .b-card .st-ch{display:flex;border-bottom:1px solid #EFE8D8}' +
  '.tiptap-mount .b-card .st-ch+.st-ch{background:#F7F1E4}' +
  '.tiptap-mount .b-card .st-c{flex:1;text-align:center;padding:8px 4px;border-right:1px solid #EFE8D8;min-width:0}' +
  '.tiptap-mount .b-card .st-c:last-child{border-right:none}' +
  '.tiptap-mount .b-card .st-c .k{font-family:Consolas,monospace;font-size:7.5px;letter-spacing:.12em;text-transform:uppercase;color:#8B7F6B;margin-bottom:3px}' +
  '.tiptap-mount .b-card .st-c .v{font-family:Cinzel,Georgia,serif;font-size:15pt;font-weight:600;color:#8B1A1A;outline:none;line-height:1.1}' +
  '.tiptap-mount .np-rows{padding:2px 16px 6px}' +
  '.tiptap-mount .np-rows.grid{display:grid;grid-template-columns:1fr 1fr;column-gap:22px}' +
  '.tiptap-mount .np-rows.grid .np-row{padding:7px 0}' +
  '.tiptap-mount .np-rows.grid .np-l{flex:0 0 92px}' +
  '.tiptap-mount .np-rows.grid .np-v{font-size:10.5pt}' +
  '.tiptap-mount .np-row{display:flex;gap:14px;padding:9px 0;border-bottom:1px solid #EFE8D8;align-items:flex-start}' +
  '.tiptap-mount .np-row:last-child{border-bottom:none}' +
  '.tiptap-mount .b-card .np-l{flex:0 0 110px}' +
  '.tiptap-mount .b-npc .np-l{flex:0 0 150px}' +
  '.tiptap-mount .np-l{font-family:Consolas,monospace;font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:#8B1A1A;padding-top:2px;outline:none}' +
  '.tiptap-mount .np-v{flex:1;font-size:11pt;line-height:1.55;color:#22252B;outline:none;min-width:0}' +
  /* the page also has the vendored file's own .b-card/.b-npc .np-rm{display:none}
     rule loaded (same document, unscoped selector) -- explicit display here
     overrides it; this port has no separate read/edit reader mode to gate
     visibility on, so the remove button is simply always shown. */
  '.tiptap-mount .np-rm{display:inline-block;flex:0 0 auto;background:none;border:none;color:#A79C86;cursor:pointer;font-size:14px;padding:0 4px}' +
  '.tiptap-mount .np-add{display:inline-block;margin:2px 16px 12px;font-family:Consolas,monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8B1A1A;background:none;border:1px dashed #C9A84C;padding:6px 10px;cursor:pointer;border-radius:3px}' +
  '.tiptap-mount .arch-copy{margin-left:auto;align-self:center;flex:0 0 auto;font-family:Consolas,monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;background:none;border:1px solid rgba(201,168,76,.45);color:#C9A84C;padding:4px 8px;border-radius:2px;cursor:pointer}' +
  '.tiptap-mount .arch-copy:hover{background:rgba(201,168,76,.14);color:#FBF8F1}' +
  '.tiptap-mount .arch-copy.ok{border-color:#9BD0AA;color:#9BD0AA}'

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  var s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.appendChild(s)
}

var current = null /* the live Editor instance, if any -- destroyed before a re-mount */

/* container: the element to mount into. docRow: the console's own {id, title,
   folder, blocks, ...} object for the open document (S.docs entry), or a
   falsy value if it isn't available yet. opts.onChange(blocks), if given, is
   called with the plain blocks array (docToBlocks' output, nothing else)
   after every edit -- never on the initial mount itself. */
function mountConsoleEditor(container, docRow, opts) {
  opts = opts || {}
  ensureStyle()
  if (current) { try { current.destroy() } catch (e) {} current = null }
  container.innerHTML = ''
  container.className = 'tiptap-mount'

  if (!docRow) {
    hooks.onArchiveExport = null
    container.textContent = 'Document not found.'
    return null
  }

  /* archiveJSON (and archSkills/archTalents/archEquipment/archNum) are never
     reimplemented here -- they stay the console's own, called through this
     hook. Bound fresh to THIS docRow on every mount so a stale reference
     from a previously-open document can never leak into a later one. */
  hooks.onArchiveExport = typeof opts.onArchiveExport === 'function'
    ? function (block, onCopied) { opts.onArchiveExport(block, docRow, onCopied) }
    : null

  var doc
  try {
    doc = blocksToDoc(docRow.blocks || [])
  } catch (e) {
    container.textContent = 'Could not convert this document: ' + e.message
    return null
  }

  current = new Editor({
    element: container,
    extensions: schema.extensions,
    content: doc,
    editable: true,
    onUpdate: function (props) {
      if (typeof opts.onChange !== 'function') return
      var blocks
      try {
        blocks = docToBlocks(props.editor.getJSON())
      } catch (e) {
        return /* malformed doc mid-edit is not this file's problem to solve; nothing is saved */
      }
      opts.onChange(blocks)
    },
  })
  return current
}

module.exports = { mountConsoleEditor: mountConsoleEditor }
