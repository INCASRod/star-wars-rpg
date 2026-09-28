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
var CSS =
  /* This console is a naturally page-scrolling app -- no ancestor establishes
     a fixed viewport height (checked: .tiptap-mount's own parents all render
     at full content height, matching the vendored file's own layout model).
     A height:100%/flex-column shell with internal overflow:auto panes would
     silently never scroll (scrollHeight===clientHeight forever, verified),
     so the toolbar sticks against WINDOW scroll and the outline gets its own
     sticky+scrolling sidebar instead of a shell-level split. */
  '.tiptap-mount{font-family:Georgia,serif;color:#1A1A1A}' +
  '.tt-toolbar{display:flex;gap:8px;align-items:center;padding:8px 12px;border-bottom:1px solid #DDD2BC;background:#FBF8F1;position:sticky;top:0;z-index:5;font-family:Consolas,monospace;font-size:11px}' +
  '.tt-toolbar button{font-family:Consolas,monospace;font-size:11px;letter-spacing:.05em;text-transform:uppercase;background:none;border:1px solid #C9A84C;color:#8B1A1A;padding:5px 10px;border-radius:3px;cursor:pointer}' +
  '.tt-toolbar button:hover{background:rgba(201,168,76,.14)}' +
  '.tt-toolbar button.on{background:#8B1A1A;color:#FBF8F1}' +
  '.tt-body{display:flex;align-items:flex-start}' +
  '.tt-outline{width:280px;flex:0 0 280px;border-right:1px solid #DDD2BC;background:#FEFCF7;padding:10px;position:sticky;top:45px;max-height:calc(100vh - 45px);overflow-y:auto}' +
  '.tt-outline-filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #EFE8D8}' +
  '.tt-outline-filters label{font-family:Consolas,monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:.05em;color:#8B7F6B;display:flex;align-items:center;gap:3px;cursor:pointer}' +
  '.tt-outline-entry{display:block;width:100%;text-align:left;background:none;border:none;padding:5px 6px;font-size:12px;color:#22252B;cursor:pointer;border-radius:3px;line-height:1.35}' +
  '.tt-outline-entry:hover{background:rgba(201,168,76,.14)}' +
  '.tt-outline-entry .kind{display:block;font-family:Consolas,monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8B1A1A;opacity:.75}' +
  '.tt-outline-entry.lvl-2{padding-left:16px}' +
  '.tt-outline-entry.lvl-3{padding-left:28px}' +
  '.tt-search-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #DDD2BC;background:#FFF8E1;font-family:Consolas,monospace;font-size:12px}' +
  '.tt-search-bar input{flex:1;padding:5px 8px;border:1px solid #C9A84C;border-radius:3px;font-family:Consolas,monospace;font-size:12px}' +
  '.tt-search-bar button{background:none;border:1px solid #C9A84C;border-radius:3px;padding:4px 9px;cursor:pointer}' +
  '.tt-editor-pane{flex:1;padding:16px;max-width:900px;margin:0 auto;min-width:0}' +
  '.search-hl{background:#FFE58A}' +
  '.search-hl-current{background:#FFB347}' +
  '.tt-block-flash{animation:tt-flash 1.4s ease-out}' +
  '@keyframes tt-flash{0%{background:#FFE58A}100%{background:transparent}}' +
  '.ProseMirror{outline:none}' +
  '.tt-editor-pane h1{font-size:1.6em;margin:0.6em 0 0.3em}' +
  '.tt-editor-pane h2{font-size:1.3em;margin:0.6em 0 0.3em}' +
  '.tt-editor-pane h3{font-size:1.1em;margin:0.6em 0 0.3em}' +
  '.tt-editor-pane blockquote{border-left:2px solid #C9A84C;margin:0.8em 0;padding-left:12px;font-style:italic}' +
  '.tt-editor-pane table{border-collapse:collapse;margin:0.8em 0}' +
  '.tt-editor-pane td,.tt-editor-pane th{border:1px solid #999;padding:4px 8px}' +
  '.tt-editor-pane .ph-callout,.tt-editor-pane .ph-read{border:1px dashed #8B1A1A;margin:0.8em 0;padding:8px 10px}' +
  '.tt-editor-pane .ph-callout-label,.tt-editor-pane .ph-read-label{font-size:0.7em;letter-spacing:0.15em;color:#8B1A1A;margin-bottom:4px}' +
  '.tt-editor-pane .ph-ornament{text-align:center;color:#A79C86;margin:1em 0}' +
  '.tt-editor-pane .ph-pagebreak{text-align:center;font-size:0.7em;letter-spacing:0.2em;color:#A79C86;border-top:1px dashed #A79C86;border-bottom:1px dashed #A79C86;padding:4px 0;margin:1em 0}' +
  '.tt-editor-pane .ph-unknown{border:1px dashed red;color:red;padding:6px 8px;margin:0.8em 0;font-family:Consolas,monospace;font-size:0.8em}' +
  '.tt-editor-pane .b-npc,.tt-editor-pane .b-card{border:1px solid #C9A84C;border-radius:4px;margin:20px 0;overflow:hidden;background:#FEFCF7}' +
  '.tt-editor-pane .b-npc{border-color:#DDD2BC}' +
  '.tt-editor-pane .b-vehicle{border-color:#4E7C99}' +
  '.tt-editor-pane .b-planet{border-color:#6E9B7A}' +
  '.tt-editor-pane .b-planet .st-h{background:#1E2A22}' +
  '.tt-editor-pane .b-planet .st-h .cl{color:#9BD0AA}' +
  '.tt-editor-pane .b-planet .np-l{color:#2E5B3C}' +
  '.tt-editor-pane .b-npc .np-h,.tt-editor-pane .b-card .st-h{background:#2A2118;color:#FBF8F1;padding:9px 16px;display:flex;align-items:baseline;gap:12px}' +
  '.tt-editor-pane .b-npc .np-h{background:#8B1A1A}' +
  '.tt-editor-pane .b-npc .np-h .nm,.tt-editor-pane .b-card .st-h .nm{font-family:Cinzel,Georgia,serif;font-weight:600;font-size:12.5pt;flex:1;outline:none}' +
  '.tt-editor-pane .b-card .st-h .cl{font-family:Consolas,monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;flex:0 0 auto;outline:none}' +
  '.tt-editor-pane .b-card .st-ch{display:flex;border-bottom:1px solid #EFE8D8}' +
  '.tt-editor-pane .b-card .st-ch+.st-ch{background:#F7F1E4}' +
  '.tt-editor-pane .b-card .st-c{flex:1;text-align:center;padding:8px 4px;border-right:1px solid #EFE8D8;min-width:0}' +
  '.tt-editor-pane .b-card .st-c:last-child{border-right:none}' +
  '.tt-editor-pane .b-card .st-c .k{font-family:Consolas,monospace;font-size:7.5px;letter-spacing:.12em;text-transform:uppercase;color:#8B7F6B;margin-bottom:3px}' +
  '.tt-editor-pane .b-card .st-c .v{font-family:Cinzel,Georgia,serif;font-size:15pt;font-weight:600;color:#8B1A1A;outline:none;line-height:1.1}' +
  '.tt-editor-pane .np-rows{padding:2px 16px 6px}' +
  '.tt-editor-pane .np-rows.grid{display:grid;grid-template-columns:1fr 1fr;column-gap:22px}' +
  '.tt-editor-pane .np-rows.grid .np-row{padding:7px 0}' +
  '.tt-editor-pane .np-rows.grid .np-l{flex:0 0 92px}' +
  '.tt-editor-pane .np-rows.grid .np-v{font-size:10.5pt}' +
  '.tt-editor-pane .np-row{display:flex;gap:14px;padding:9px 0;border-bottom:1px solid #EFE8D8;align-items:flex-start}' +
  '.tt-editor-pane .np-row:last-child{border-bottom:none}' +
  '.tt-editor-pane .b-card .np-l{flex:0 0 110px}' +
  '.tt-editor-pane .b-npc .np-l{flex:0 0 150px}' +
  '.tt-editor-pane .np-l{font-family:Consolas,monospace;font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:#8B1A1A;padding-top:2px;outline:none}' +
  '.tt-editor-pane .np-v{flex:1;font-size:11pt;line-height:1.55;color:#22252B;outline:none;min-width:0}' +
  '.tt-editor-pane .np-rm{display:inline-block;flex:0 0 auto;background:none;border:none;color:#A79C86;cursor:pointer;font-size:14px;padding:0 4px}' +
  '.tt-editor-pane .np-add{display:inline-block;margin:2px 16px 12px;font-family:Consolas,monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8B1A1A;background:none;border:1px dashed #C9A84C;padding:6px 10px;cursor:pointer;border-radius:3px}' +
  '.tt-editor-pane .arch-copy{margin-left:auto;align-self:center;flex:0 0 auto;font-family:Consolas,monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;background:none;border:1px solid rgba(201,168,76,.45);color:#C9A84C;padding:4px 8px;border-radius:2px;cursor:pointer}' +
  '.tt-editor-pane .arch-copy:hover{background:rgba(201,168,76,.14);color:#FBF8F1}' +
  '.tt-editor-pane .arch-copy.ok{border-color:#9BD0AA;color:#9BD0AA}'

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

function renderOutline(outlineListEl, editor, filters, editorPane) {
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
      if (e.blockId) scrollToBlockId(editorPane, editor, e.blockId)
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
  toolbar.appendChild(backBtn); toolbar.appendChild(outlineBtn); toolbar.appendChild(searchBtn)
  if (typeof opts.onBack === 'function') backBtn.addEventListener('click', opts.onBack)
  else backBtn.style.display = 'none'

  var searchBar = document.createElement('div'); searchBar.className = 'tt-search-bar'; searchBar.hidden = true
  var searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.placeholder = 'Search this document…'
  var searchCount = document.createElement('span'); searchCount.className = 'tt-search-count'; searchCount.style.cssText = 'color:#8B7F6B;min-width:60px'
  var searchPrev = document.createElement('button'); searchPrev.type = 'button'; searchPrev.textContent = '↑'
  var searchNext = document.createElement('button'); searchNext.type = 'button'; searchNext.textContent = '↓'
  var searchClose = document.createElement('button'); searchClose.type = 'button'; searchClose.textContent = '×'
  searchBar.appendChild(searchInput); searchBar.appendChild(searchCount); searchBar.appendChild(searchPrev); searchBar.appendChild(searchNext); searchBar.appendChild(searchClose)

  var body = document.createElement('div'); body.className = 'tt-body'
  var outlinePane = document.createElement('div'); outlinePane.className = 'tt-outline'; outlinePane.hidden = true
  var filtersEl = document.createElement('div'); filtersEl.className = 'tt-outline-filters'
  var outlineList = document.createElement('div'); outlineList.className = 'tt-outline-list'
  outlinePane.appendChild(filtersEl); outlinePane.appendChild(outlineList)
  var editorPane = document.createElement('div'); editorPane.className = 'tt-editor-pane'
  body.appendChild(outlinePane); body.appendChild(editorPane)

  container.appendChild(toolbar)
  container.appendChild(searchBar)
  container.appendChild(body)

  var filters = loadFilters()
  var FILTER_KEYS = [['heading', 'Headings'], ['card', 'Cards'], ['callout', 'GM Notes'], ['read', 'Read-Aloud'], ['table', 'Tables']]
  FILTER_KEYS.forEach(function (pair) {
    var key = pair[0], label = pair[1]
    var lab = document.createElement('label')
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!filters[key]
    cb.addEventListener('change', function () {
      filters[key] = cb.checked
      saveFilters(filters)
      renderOutline(outlineList, current, filters, editorPane)
    })
    lab.appendChild(cb)
    lab.appendChild(document.createTextNode(label))
    filtersEl.appendChild(lab)
  })

  outlineBtn.addEventListener('click', function () {
    outlinePane.hidden = !outlinePane.hidden
    outlineBtn.classList.toggle('on', !outlinePane.hidden)
    if (!outlinePane.hidden) renderOutline(outlineList, current, filters, editorPane)
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
      if (!outlinePane.hidden) scheduleOutlineRebuild(function () { renderOutline(outlineList, current, filters, editorPane) })
    },
  })

  searchController = searchMod.createSearchController(current)

  if (!outlinePane.hidden) renderOutline(outlineList, current, filters, editorPane)

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
