/* mountConsoleEditor -- step 6: navigation (outline, search, deep linking,
   stable scroll position). Step 4/5 groundwork (editing, card NodeViews)
   unchanged below; this adds a shell around the editor pane.
   ------------------------------------------------------------------
   The bundle stays pure: no persistence code, no reference to any save path
   (saveDoc, save(), stashDraft, schedule, flushAll -- none reachable from
   here). onChange/onArchiveExport/onBack are all callbacks the index.html
   patch supplies and acts on; this file only ever calls them.

   blocksToDoc/docToBlocks come from scripts/console-blocks-doc.js,
   unmodified -- that file is the tested contract. Outline/search are a
   SEPARATE, independent, read-only walk of editor.state.doc (text-extract.js/
   outline.js/search.js) -- they never touch console-blocks-doc.js, since
   they only ever read the document to build a list or a highlight, never
   produce the blocks array that gets saved. */

var Editor = require('@tiptap/core').Editor
var schema = require('./schema.js')
var blocksDoc = require('../../scripts/console-blocks-doc.js')
var blocksToDoc = blocksDoc.blocksToDoc
var docToBlocks = blocksDoc.docToBlocks
var hooks = require('./hooks.js')
var outlineMod = require('./outline.js')
var searchMod = require('./search.js')

var STYLE_ID = 'console-editor-placeholder-style'
/* Presentation. The old paginated editor drew every block on a cream .page sheet using
   .b-h1/.b-p/... classes; step 7 deleted both the sheet and those rules, which left dark
   ink (#22252B etc.) on the app's near-black ground. The rules below are the old ones,
   restored from 07fa86a and re-aimed at the nodes TipTap actually renders, inside ONE
   continuous fixed-width paper column (.tt-editor-pane). No page division, no fixed
   height. The card rules (the card and np/st/arch-copy classes) are NOT repeated here: the
   vendored file's unscoped globals already style the card NodeViews with the right
   fonts (var(--f-mono)); only what editing adds (always-visible "add field", hover-only
   remove) is overridden at the end.

   Layout note: the outline is a COLUMN of .tt-body (a grid), not a layer over the app, so
   it can never cover the left rail and needs no offset that depends on the rail width. The
   paper is a fixed 794px, so opening the outline cannot re-wrap a single paragraph (the
   cause of the ~10.9k px height change the scroll-anchor code compensates for). The
   stage scrolls horizontally rather than squeezing the paper on a narrow window. */
var PAPER = '.tt-editor-pane'
var PM = PAPER + ' .ProseMirror > '
var CSS = [
  '.tiptap-mount{font-family:Georgia,serif;color:#1A1A1A}',
  '.tt-toolbar{display:flex;gap:8px;align-items:center;padding:8px 12px;border-bottom:1px solid #DDD2BC;background:#FBF8F1;position:sticky;top:0;z-index:5;font-family:Consolas,monospace;font-size:11px}',
  '.tt-toolbar button{font-family:Consolas,monospace;font-size:11px;letter-spacing:.05em;text-transform:uppercase;background:none;border:1px solid #C9A84C;color:#8B1A1A;padding:5px 10px;border-radius:3px;cursor:pointer}',
  '.tt-toolbar button:hover{background:rgba(201,168,76,.14)}',
  '.tt-toolbar button.on{background:#8B1A1A;color:#FBF8F1}',
  /* shell: [outline column] [stage]. Outline is in flow; sticky only pins it while scrolling. */
  '.tt-body{display:grid;grid-template-columns:minmax(0,1fr);align-items:start}',
  '.tt-body.tt-has-outline{grid-template-columns:260px minmax(0,1fr)}',
  '.tt-outline{box-sizing:border-box;border-right:1px solid #DDD2BC;background:#FEFCF7;padding:10px;position:sticky;top:var(--tt-toolbar-h,46px);align-self:start;max-height:calc(100vh - var(--tt-toolbar-h,46px));overflow-y:auto}',
  '.tt-outline[hidden],.tt-search-bar[hidden]{display:none}',
  '.tt-outline-filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #EFE8D8}',
  '.tt-outline-filters label{font-family:Consolas,monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:.05em;color:#8B7F6B;display:flex;align-items:center;gap:3px;cursor:pointer}',
  '.tt-outline-entry{display:block;width:100%;text-align:left;background:none;border:none;padding:5px 6px;font-size:12px;color:#22252B;cursor:pointer;border-radius:3px;line-height:1.35}',
  '.tt-outline-entry:hover{background:rgba(201,168,76,.14)}',
  '.tt-outline-entry .kind{display:block;font-family:Consolas,monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8B1A1A;opacity:.75}',
  '.tt-outline-entry.lvl-2{padding-left:16px}',
  '.tt-outline-entry.lvl-3{padding-left:28px}',
  '.tt-search-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #DDD2BC;background:#FFF8E1;font-family:Consolas,monospace;font-size:12px}',
  '.tt-search-bar input{flex:1;padding:5px 8px;border:1px solid #C9A84C;border-radius:3px;font-family:Consolas,monospace;font-size:12px}',
  '.tt-search-bar button{background:none;border:1px solid #C9A84C;border-radius:3px;padding:4px 9px;cursor:pointer}',
  '.search-hl{background:#FFE58A}',
  '.search-hl-current{background:#FFB347}',
  '.tt-block-flash{animation:tt-flash 1.4s ease-out}',
  '@keyframes tt-flash{0%{background:#FFE58A}100%{background:transparent}}',

  /* the paper: one long cream sheet, fixed width, centred in the stage */
  '.tt-stage{background:#0A0C0F;padding:24px 10px 60px;overflow-x:auto;min-width:0}',
  PAPER + '{box-sizing:border-box;width:794px;margin:0 auto;padding:64px 88px 96px;background:#FBF8F1;color:#1A1A1A;font-family:var(--f-body,Georgia,serif);font-weight:300;box-shadow:0 3px 22px rgba(0,0,0,.55);position:relative}',
  PAPER + ' .ProseMirror{outline:none}',
  '.ProseMirror-selectednode{outline:2px solid #C9A84C;outline-offset:5px}',

  /* h1 / h2 / h3 / p / quote -- the old .b-h1 .b-h2 .b-h3 .b-p .b-quote */
  PM + 'h1{font-family:var(--f-display,Cinzel,Georgia,serif);font-size:15pt;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#FBF8F1;background:#8B1A1A;padding:9px 16px;margin:30px 0 16px}',
  PM + 'h2{font-family:var(--f-display,Cinzel,Georgia,serif);font-size:14.5pt;font-weight:600;color:#8B1A1A;letter-spacing:.02em;margin:26px 0 10px;padding-bottom:6px;border-bottom:1px solid #C9A84C}',
  PM + 'h3{font-family:var(--f-display,Cinzel,Georgia,serif);font-size:12pt;font-weight:600;color:#8B1A1A;margin:20px 0 6px}',
  PM + 'p{font-size:11.5pt;line-height:1.62;margin:0 0 11px;color:#22252B}',
  /* a continuation paragraph is the second half of one "a\n\nb" block, which the old renderer
     drew as a blank line, not a paragraph margin */
  PM + 'p[data-cont]{margin-top:1.62em}',
  PM + 'blockquote{font-size:13pt;line-height:1.5;font-style:italic;color:#4A4034;border-left:2px solid #C9A84C;padding:4px 0 4px 20px;margin:20px 0}',
  PM + 'blockquote > p{margin:0;font-size:inherit;line-height:inherit;color:inherit}',
  PM + 'blockquote > p + p{margin-top:1.5em}',

  /* callout / read-aloud -- the old .b-callout .b-read with their .cl label */
  PM + '.ph-callout{background:#FFF8E1;border-left:3px solid #8B1A1A;padding:15px 18px;margin:20px 0;font-size:11pt;line-height:1.58;color:#2A2620}',
  PM + '.ph-read{background:#F0EADD;border:1px solid #DDD2BC;padding:16px 19px;margin:20px 0;font-size:11.5pt;line-height:1.6;font-style:italic;color:#2A2620}',
  PAPER + ' .ph-callout-label,' + PAPER + ' .ph-read-label{font-family:var(--f-mono,Consolas,monospace);font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:#8B1A1A;font-style:normal;margin-bottom:8px}',
  PAPER + ' .ph-read-label{margin-bottom:9px}',
  PAPER + ' .ph-callout-body > p,' + PAPER + ' .ph-read-body > p{margin:0;font-size:inherit;line-height:inherit;color:inherit}',
  PAPER + ' .ph-callout-body > p + p,' + PAPER + ' .ph-read-body > p + p{margin-top:1.58em}',

  /* list -- the old .b-list: gold square bullets, not discs */
  PM + 'ul{list-style:none;font-size:11.5pt;line-height:1.6;margin:0 0 11px;padding-left:22px;color:#22252B}',
  PM + 'ul > li{margin-bottom:5px;position:relative}',
  PM + 'ul > li::before{content:"";position:absolute;left:-14px;top:.62em;width:4px;height:4px;background:#C9A84C}',
  PM + 'ul > li > p{margin:0;font-size:inherit;line-height:inherit;color:inherit}',

  /* table -- the old .b-table (the first row, a TipTap header row, is the red band) */
  PM + 'table, ' + PM + '.tableWrapper > table{width:100%;border-collapse:collapse;margin:16px 0;font-size:10.5pt;line-height:1.45}',
  PAPER + ' .ProseMirror table td,' + PAPER + ' .ProseMirror table th{border:1px solid #DDD2BC;padding:7px 10px;vertical-align:top;text-align:left;color:#22252B;font-weight:inherit}',
  PAPER + ' .ProseMirror table th{background:#8B1A1A;color:#FBF8F1;font-family:Cinzel,Georgia,serif;font-weight:600;font-size:9.5pt;letter-spacing:.04em}',
  PAPER + ' .ProseMirror table tr:nth-child(even):not(:first-child) td{background:#F3EDE0}',
  PAPER + ' .ProseMirror table td > p,' + PAPER + ' .ProseMirror table th > p{margin:0;font-size:inherit;line-height:inherit;color:inherit}',
  PAPER + ' .ProseMirror table td > p + p,' + PAPER + ' .ProseMirror table th > p + p{margin-top:1.45em}',

  /* ornament (div) and page break (pb) -- the old .b-div and .b-pb, kept as visible rules */
  PM + '.ph-ornament{height:1px;background:#DDD2BC;margin:26px 0;position:relative;font-size:0;color:transparent;text-align:left}',
  PM + '.ph-ornament::after{content:"\\25C6";position:absolute;left:50%;top:-9px;transform:translateX(-50%);background:#FBF8F1;padding:0 10px;color:#C9A84C;font-size:9px;line-height:1.6}',
  PM + '.ph-pagebreak{border-top:1px dashed #C7BCA4;margin:18px 0;text-align:center;height:0;font-size:0}',
  PM + '.ph-pagebreak > span{font-family:var(--f-mono,Consolas,monospace);font-size:8px;letter-spacing:.2em;color:#B3A78E;background:#FBF8F1;padding:0 9px;position:relative;top:-6px;text-transform:uppercase}',
  PM + '.ph-unknown{border:1px dashed red;color:red;padding:6px 8px;margin:.8em 0;font-family:Consolas,monospace;font-size:.8em}',

  /* cards: unscoped globals in index.html do the styling; these two are what live editing
     changes about them (the old UI showed the remove button on row hover and the add
     button in edit mode, which is now always) */
  PAPER + ' .np-rm{display:none}',
  PAPER + ' .np-row:hover .np-rm{display:inline-block}',
  PAPER + ' .np-add{display:inline-block}',
].join('\n')

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  var s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.appendChild(s)
}

var FILTER_STORAGE_KEY = 'console-editor-outline-filters'
var DEFAULT_FILTERS = { heading: true, card: true, callout: false, read: false, table: false }
function loadFilters() {
  try {
    var raw = sessionStorage.getItem(FILTER_STORAGE_KEY)
    if (!raw) return Object.assign({}, DEFAULT_FILTERS)
    return Object.assign({}, DEFAULT_FILTERS, JSON.parse(raw))
  } catch (e) { return Object.assign({}, DEFAULT_FILTERS) }
}
function saveFilters(f) {
  try { sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(f)) } catch (e) {}
}

var current = null /* the live Editor instance, if any -- destroyed before a re-mount */
var outlineDebounceTimer = null

/* D1 fix, continued. Opening/closing the outline genuinely changes the
   editor pane's width (280px sidebar), which reflows and re-wraps text,
   which changes total document height -- confirmed directly: toggling the
   outline on the 570-block clone grew .ProseMirror's own offsetHeight by
   ~10,662px, nothing to do with the outline element's own layout. A raw
   pixel scrollY is therefore NEVER a stable "return to where I was" across
   an outline open/close, by construction -- no CSS fix changes that, since
   the content itself is genuinely a different height afterward. The stable
   unit is a BLOCK, not a pixel offset: topBlockId() finds whichever
   top-level block is nearest the current viewport top, remembered before a
   jump so a "Back" control can return to that same block via
   scrollToBlockId() (identity-based, immune to any reflow) rather than to a
   coordinate that may no longer mean the same place. */
function topBlockId(editor) {
  /* nearest to viewport CENTER, matching scrollToBlockId's own
     scrollIntoView({block:'center'}) -- using "nearest to top" here while
     restoring via "center" would remember the wrong block relative to what
     actually ends up centered again. */
  var mid = window.innerHeight / 2
  var best = null, bestDist = Infinity
  editor.state.doc.forEach(function (node, offset) {
    if (!node.attrs || !node.attrs.blockId) return
    var dom = editor.view.nodeDOM(offset)
    if (!dom || !dom.getBoundingClientRect) return
    var dist = Math.abs(dom.getBoundingClientRect().top - mid)
    if (dist < bestDist) { bestDist = dist; best = node.attrs.blockId }
  })
  return best
}

function scrollToBlockId(editorPane, editor, blockId) {
  var target = null
  editor.state.doc.forEach(function (node, offset) {
    if (target) return
    if (node.attrs && node.attrs.blockId === blockId) target = editor.view.nodeDOM(offset)
  })
  if (!target || !target.scrollIntoView) return false
  target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  target.classList.remove('tt-block-flash')
  void target.offsetWidth /* restart the CSS animation if it's already been played once */
  target.classList.add('tt-block-flash')
  return true
}

function renderOutline(outlineListEl, editor, filters, editorPane, onBeforeJump) {
  var entries = outlineMod.buildOutline(editor.state.doc)
  outlineListEl.innerHTML = ''
  entries.forEach(function (e) {
    if (!filters[e.filterKind]) return
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'tt-outline-entry' + (e.level > 1 ? ' lvl-' + e.level : '')
    var kindSpan = document.createElement('span')
    kindSpan.className = 'kind'
    kindSpan.textContent = outlineMod.TYPE_LABELS[e.kind] || e.kind
    var labelDiv = document.createElement('span')
    labelDiv.textContent = e.label
    btn.appendChild(kindSpan)
    btn.appendChild(labelDiv)
    btn.addEventListener('click', function () {
      if (!e.blockId) return
      if (typeof onBeforeJump === 'function') onBeforeJump()
      scrollToBlockId(editorPane, editor, e.blockId)
    })
    outlineListEl.appendChild(btn)
  })
  if (!outlineListEl.children.length) {
    var empty = document.createElement('div')
    empty.style.cssText = 'font-size:11px;color:#8B7F6B;padding:6px'
    empty.textContent = 'Nothing matches the current filters.'
    outlineListEl.appendChild(empty)
  }
}

function scheduleOutlineRebuild(fn) {
  if (outlineDebounceTimer) clearTimeout(outlineDebounceTimer)
  outlineDebounceTimer = setTimeout(fn, 700) /* same 700ms cadence as the console's own save debounce */
}

/* container: the element to mount into. docRow: the console's own {id, title,
   folder, blocks, ...} object for the open document (S.docs entry), or a
   falsy value if it isn't available yet. opts: onChange(blocks), onArchiveExport,
   onBack -- see index.html's call site for what each does. */
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

  var toolbar = document.createElement('div'); toolbar.className = 'tt-toolbar'
  var backBtn = document.createElement('button'); backBtn.type = 'button'; backBtn.textContent = '← All documents'
  var outlineBtn = document.createElement('button'); outlineBtn.type = 'button'; outlineBtn.textContent = 'Outline'
  var searchBtn = document.createElement('button'); searchBtn.type = 'button'; searchBtn.textContent = 'Search'
  var exportBtn = document.createElement('button'); exportBtn.type = 'button'; exportBtn.textContent = 'Export to Word'
  var backToPositionBtn = document.createElement('button'); backToPositionBtn.type = 'button'; backToPositionBtn.textContent = '↑ Back to where you were'; backToPositionBtn.hidden = true
  toolbar.appendChild(backBtn); toolbar.appendChild(outlineBtn); toolbar.appendChild(searchBtn); toolbar.appendChild(exportBtn); toolbar.appendChild(backToPositionBtn)
  if (typeof opts.onBack === 'function') backBtn.addEventListener('click', opts.onBack)
  else backBtn.style.display = 'none'
  /* exportWord(d, btn) is the console's own, unmodified -- reads the block
     array directly, never reimplemented here (same one-copy-called-through-
     a-hook pattern as onArchiveExport). This is now the ONLY UI path to it:
     the old editor's #dword button (docEditor, deleted) was previously the
     sole caller. */
  if (typeof opts.onExportWord === 'function') exportBtn.addEventListener('click', function () { opts.onExportWord(docRow, exportBtn) })
  else exportBtn.style.display = 'none'
  var rememberedBlockId = null
  function rememberPosition() {
    rememberedBlockId = topBlockId(current)
    if (rememberedBlockId) backToPositionBtn.hidden = false
  }
  backToPositionBtn.addEventListener('click', function () {
    if (rememberedBlockId) scrollToBlockId(editorPane, current, rememberedBlockId)
    backToPositionBtn.hidden = true
  })

  var searchBar = document.createElement('div'); searchBar.className = 'tt-search-bar'; searchBar.hidden = true
  var searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.placeholder = 'Search this document…'
  var searchCount = document.createElement('span'); searchCount.className = 'tt-search-count'; searchCount.style.cssText = 'color:#8B7F6B;min-width:60px'
  var searchPrev = document.createElement('button'); searchPrev.type = 'button'; searchPrev.textContent = '↑'
  var searchNext = document.createElement('button'); searchNext.type = 'button'; searchNext.textContent = '↓'
  var searchClose = document.createElement('button'); searchClose.type = 'button'; searchClose.textContent = '×'
  searchBar.appendChild(searchInput); searchBar.appendChild(searchCount); searchBar.appendChild(searchPrev); searchBar.appendChild(searchNext); searchBar.appendChild(searchClose)

  var body = document.createElement('div'); body.className = 'tt-body'
  var stage = document.createElement('div'); stage.className = 'tt-stage'
  var outlinePane = document.createElement('div'); outlinePane.className = 'tt-outline'; outlinePane.hidden = true
  var filtersEl = document.createElement('div'); filtersEl.className = 'tt-outline-filters'
  var outlineList = document.createElement('div'); outlineList.className = 'tt-outline-list'
  outlinePane.appendChild(filtersEl); outlinePane.appendChild(outlineList)
  var editorPane = document.createElement('div'); editorPane.className = 'tt-editor-pane'
  stage.appendChild(editorPane)
  body.appendChild(outlinePane); body.appendChild(stage)

  container.appendChild(toolbar)
  container.appendChild(searchBar)
  container.appendChild(body)
  /* the outline pins just under the (sticky) toolbar, whatever height it wraps to */
  function syncToolbarHeight() { body.style.setProperty('--tt-toolbar-h', toolbar.offsetHeight + 'px') }
  syncToolbarHeight()

  var filters = loadFilters()
  var FILTER_KEYS = [['heading', 'Headings'], ['card', 'Cards'], ['callout', 'GM Notes'], ['read', 'Read-Aloud'], ['table', 'Tables']]
  FILTER_KEYS.forEach(function (pair) {
    var key = pair[0], label = pair[1]
    var lab = document.createElement('label')
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!filters[key]
    cb.addEventListener('change', function () {
      filters[key] = cb.checked
      saveFilters(filters)
      renderOutline(outlineList, current, filters, editorPane, rememberPosition)
    })
    lab.appendChild(cb)
    lab.appendChild(document.createTextNode(label))
    filtersEl.appendChild(lab)
  })

  outlineBtn.addEventListener('click', function () {
    outlinePane.hidden = !outlinePane.hidden
    outlineBtn.classList.toggle('on', !outlinePane.hidden)
    body.classList.toggle('tt-has-outline', !outlinePane.hidden)
    syncToolbarHeight()
    if (!outlinePane.hidden) renderOutline(outlineList, current, filters, editorPane, rememberPosition)
  })

  var searchController = null
  function openSearch() {
    searchBar.hidden = false
    searchBtn.classList.add('on')
    searchInput.focus()
  }
  function closeSearch() {
    searchBar.hidden = true
    searchBtn.classList.remove('on')
    searchInput.value = ''
    if (searchController) searchController.clear()
    searchCount.textContent = ''
  }
  searchBtn.addEventListener('click', function () { searchBar.hidden ? openSearch() : closeSearch() })
  searchClose.addEventListener('click', closeSearch)
  function updateCount(r) { searchCount.textContent = r.count ? (r.index + 1) + ' / ' + r.count : (searchInput.value ? '0 / 0' : '') }
  searchInput.addEventListener('input', function () { updateCount(searchController.setQuery(searchInput.value)) })
  searchNext.addEventListener('click', function () { updateCount(searchController.next()) })
  searchPrev.addEventListener('click', function () { updateCount(searchController.prev()) })
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeSearch(); return }
    if (e.key === 'Enter') { e.preventDefault(); updateCount(e.shiftKey ? searchController.prev() : searchController.next()) }
  })

  current = new Editor({
    element: editorPane,
    extensions: schema.extensions,
    content: doc,
    editable: true,
    onUpdate: function (props) {
      if (typeof opts.onChange === 'function') {
        var blocks
        try { blocks = docToBlocks(props.editor.getJSON()) } catch (e) { blocks = null }
        if (blocks) opts.onChange(blocks)
      }
      /* B4: outline reflects edits, but rebuilds on the same 700ms cadence as
         the save debounce rather than on every keystroke. */
      if (!outlinePane.hidden) scheduleOutlineRebuild(function () { renderOutline(outlineList, current, filters, editorPane, rememberPosition) })
    },
  })

  searchController = searchMod.createSearchController(current)

  if (!outlinePane.hidden) renderOutline(outlineList, current, filters, editorPane, rememberPosition)

  /* D3: ?block=<id> lands on a specific block, falling naturally out of the
     same scrollToBlockId the outline itself uses. Own frame's location.search
     works directly now that the wrapper forwards the whole query string
     (see ConsoleHost.tsx / index.html's tryDeepLinkDoc). */
  try {
    var m = /(?:^|[?&])block=([^&]+)/.exec(location.search)
    if (m) setTimeout(function () { scrollToBlockId(editorPane, current, decodeURIComponent(m[1])) }, 60)
  } catch (e) {}

  return current
}

function unmountConsoleEditor() {
  if (current) { try { current.destroy() } catch (e) {} current = null }
  hooks.onArchiveExport = null
}

module.exports = { mountConsoleEditor: mountConsoleEditor, unmountConsoleEditor: unmountConsoleEditor }
