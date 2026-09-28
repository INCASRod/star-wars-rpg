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
  '.tiptap-mount .ph-unknown{border:1px dashed red;color:red;padding:6px 8px;margin:0.8em 0;font-family:Consolas,monospace;font-size:0.8em}'

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
    container.textContent = 'Document not found.'
    return null
  }

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
