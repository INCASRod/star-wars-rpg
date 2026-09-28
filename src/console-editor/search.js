/* In-document search: block content, not just what's rendered.
   ------------------------------------------------------------------
   Card/npc data (name, tier/kind, rows) lives entirely in NODE ATTRS, never
   in ProseMirror's own text content, so a search that only walked text nodes
   would silently miss the NPC names and equipment rows that are the whole
   point (per the brief). Every text leaf AND every card/npc atom's
   searchable attrs are scanned; atoms get a node-level highlight (there is
   no "inside" of an atom to put an inline range in), text gets an inline
   Decoration per match.

   Search never writes: it only ever reads editor.state.doc and applies
   plugin metadata to drive decorations. Nothing here calls a command that
   changes document content. */

var Plugin = require('@tiptap/pm/state').Plugin
var PluginKey = require('@tiptap/pm/state').PluginKey
var Decoration = require('@tiptap/pm/view').Decoration
var DecorationSet = require('@tiptap/pm/view').DecorationSet
var cardDef = require('./card-def.js')

var searchKey = new PluginKey('consoleSearch')

function cardSearchable(node) {
  var a = node.attrs
  if (node.type.name === 'npcCard') {
    var parts = [a.name || '']
    ;(a.rows || []).forEach(function (r) { parts.push(r.l || '', r.v || '') })
    return parts.join(' ␟ ')
  }
  var data = a.data || {}
  var C = cardDef.CARDDEF[a.kind] || {}
  var parts2 = [data.name || '', data[C.cl] || '']
  ;(data.rows || []).forEach(function (r) { parts2.push(r.l || '', r.v || '') })
  return parts2.join(' ␟ ')
}

function findMatches(doc, query) {
  if (!query) return []
  var q = query.toLowerCase()
  var matches = []
  doc.descendants(function (node, pos) {
    if (node.isText) {
      var text = (node.text || '').toLowerCase()
      var idx = 0, i
      while ((i = text.indexOf(q, idx)) !== -1) {
        matches.push({ from: pos + i, to: pos + i + q.length, kind: 'text' })
        idx = i + q.length
      }
      return false
    }
    if (node.type.name === 'card' || node.type.name === 'npcCard') {
      var hay = cardSearchable(node).toLowerCase()
      if (hay.indexOf(q) !== -1) matches.push({ from: pos, to: pos + node.nodeSize, kind: 'atom' })
      return false
    }
    return true
  })
  matches.sort(function (a, b) { return a.from - b.from })
  return matches
}

function buildDecorations(doc, matches, currentIndex) {
  var decos = matches.map(function (m, i) {
    var cls = (i === currentIndex) ? 'search-hl search-hl-current' : 'search-hl'
    return m.kind === 'atom' ? Decoration.node(m.from, m.to, { class: cls }) : Decoration.inline(m.from, m.to, { class: cls })
  })
  return DecorationSet.create(doc, decos)
}

function searchPlugin() {
  return new Plugin({
    key: searchKey,
    state: {
      init: function () { return { matches: [], currentIndex: -1, decorations: DecorationSet.empty } },
      apply: function (tr, prev) {
        var meta = tr.getMeta(searchKey)
        if (meta) {
          var decorations = buildDecorations(tr.doc, meta.matches, meta.currentIndex)
          return { matches: meta.matches, currentIndex: meta.currentIndex, decorations: decorations }
        }
        if (tr.docChanged) {
          return { matches: prev.matches, currentIndex: prev.currentIndex, decorations: prev.decorations.map(tr.mapping, tr.doc) }
        }
        return prev
      },
    },
    props: {
      decorations: function (state) { return searchKey.getState(state).decorations },
    },
  })
}

/* Controller: owns query state, exposes count/current, next/prev/clear.
   scrollToCurrent(editor) scrolls the DOM node for the current match into
   view -- editor.view.domAtPos for text, editor.view.nodeDOM for atoms. */
function createSearchController(editor) {
  var query = '', matches = [], currentIndex = -1

  function apply() {
    editor.view.dispatch(editor.view.state.tr.setMeta(searchKey, { matches: matches, currentIndex: currentIndex }))
  }

  function scrollToCurrent() {
    if (currentIndex < 0 || !matches[currentIndex]) return
    var m = matches[currentIndex]
    try {
      var dom
      if (m.kind === 'atom') dom = editor.view.nodeDOM(m.from)
      else { var r = editor.view.domAtPos(m.from); dom = r.node.nodeType === 1 ? r.node : r.node.parentElement }
      if (dom && dom.scrollIntoView) dom.scrollIntoView({ block: 'center', behavior: 'smooth' })
    } catch (e) {}
  }

  return {
    setQuery: function (q) {
      query = q || ''
      matches = findMatches(editor.state.doc, query)
      currentIndex = matches.length ? 0 : -1
      apply()
      scrollToCurrent()
      return { count: matches.length, index: currentIndex }
    },
    next: function () {
      if (!matches.length) return { count: 0, index: -1 }
      currentIndex = (currentIndex + 1) % matches.length
      apply(); scrollToCurrent()
      return { count: matches.length, index: currentIndex }
    },
    prev: function () {
      if (!matches.length) return { count: 0, index: -1 }
      currentIndex = (currentIndex - 1 + matches.length) % matches.length
      apply(); scrollToCurrent()
      return { count: matches.length, index: currentIndex }
    },
    clear: function () {
      query = ''; matches = []; currentIndex = -1
      apply()
    },
  }
}

module.exports = { searchPlugin: searchPlugin, createSearchController: createSearchController }
