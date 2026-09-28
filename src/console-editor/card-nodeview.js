/* Plain-JS NodeViews for stat/vehicle/planet (one shared implementation,
   CARDDEF-driven, exactly mirroring the vendored blockHTML()/wireBlocks()
   structure) and npc (its own simpler view -- NOT normalised into CARDDEF,
   that migration stays deferred). No React, no @tiptap/react.

   Architecture for edits: each editable field is a plain contentEditable
   span/div INSIDE this atom node's own DOM (ProseMirror does not manage an
   atom's content, so these are ordinary browser contentEditable elements,
   wired with ordinary event listeners -- exactly like the vendored
   wireBlocks() wires its own card fields). On 'input', the field's current
   text (read via edText -- see dom-text.js) is written into the node's
   `data` attr via editor.view.dispatch(tr.setNodeMarkup(...)). That
   dispatch is itself a normal ProseMirror transaction, so TipTap's onUpdate
   fires immediately and the existing step-4 pipeline (onChange ->
   docToBlocks -> the index.html patch's schedule(ttcommit)) already
   debounces the actual saveDoc call at 700ms -- no second debounce is
   invented here. */

var domText = require('./dom-text.js')
var edText = domText.edText, esc = domText.esc, nl = domText.nl
var cardDef = require('./card-def.js')
var hooks = require('./hooks.js')

function currentNodeAndPos(editor, getPos) {
  var pos = getPos()
  if (typeof pos !== 'number') return null
  var node = editor.view.state.doc.nodeAt(pos)
  if (!node) return null
  return { pos: pos, node: node }
}

function writeAttrs(editor, getPos, patchAttrs) {
  var found = currentNodeAndPos(editor, getPos)
  if (!found) return
  var attrs = Object.assign({}, found.node.attrs, patchAttrs)
  var tr = editor.view.state.tr.setNodeMarkup(found.pos, null, attrs)
  editor.view.dispatch(tr)
}

/* ---- shared stat / vehicle / planet card -------------------------------- */

function createCardNodeView(props) {
  var editor = props.editor, getPos = props.getPos
  var kind = props.node.attrs.kind
  var C = cardDef.CARDDEF[kind]

  var dom = document.createElement('div')
  dom.className = 'b-card b-' + kind

  function liveData() {
    var found = currentNodeAndPos(editor, getPos)
    return (found ? found.node.attrs.data : props.node.attrs.data) || {}
  }

  function build() {
    var data = liveData()
    dom.innerHTML = ''

    var header = document.createElement('div')
    header.className = 'st-h'
    var clSpan = document.createElement('span')
    clSpan.className = 'cl'
    clSpan.contentEditable = 'true'
    clSpan.spellcheck = false
    clSpan.innerHTML = esc(data[C.cl] || C.clDef)
    var nmSpan = document.createElement('span')
    nmSpan.className = 'nm'
    nmSpan.contentEditable = 'true'
    nmSpan.spellcheck = false
    nmSpan.innerHTML = esc(data.name || 'Untitled')
    header.appendChild(clSpan)
    header.appendChild(nmSpan)
    dom.appendChild(header)

    function fieldCommit(el, apply) {
      var commit = function () {
        var v = edText(el).trim()
        apply(v)
      }
      el.addEventListener('input', commit)
      el.addEventListener('blur', commit)
    }

    fieldCommit(clSpan, function (v) {
      var d = liveData()
      if (d[C.cl] === v) return
      var nd = Object.assign({}, d); nd[C.cl] = v
      writeAttrs(editor, getPos, { data: nd })
    })
    fieldCommit(nmSpan, function (v) {
      var d = liveData()
      if (d.name === v) return
      var nd = Object.assign({}, d); nd.name = v
      writeAttrs(editor, getPos, { data: nd })
    })

    C.strips.forEach(function (sp) {
      var strip = document.createElement('div')
      strip.className = 'st-ch'
      sp.f.forEach(function (c) {
        var key = c[0], label = c[1]
        var v = sp.store ? ((data[sp.store] || {})[key] || sp.def) : (data[key] || sp.def)
        var cell = document.createElement('div')
        cell.className = 'st-c'
        var k = document.createElement('div'); k.className = 'k'; k.textContent = label
        var val = document.createElement('div'); val.className = 'v'; val.contentEditable = 'true'; val.spellcheck = false
        val.innerHTML = esc(v)
        cell.appendChild(k); cell.appendChild(val)
        strip.appendChild(cell)
        fieldCommit(val, function (nv) {
          var d = liveData()
          if (sp.store) {
            var store = Object.assign({}, d[sp.store] || {})
            if (store[key] === nv) return
            store[key] = nv
            var nd = Object.assign({}, d); nd[sp.store] = store
            writeAttrs(editor, getPos, { data: nd })
          } else {
            if (d[key] === nv) return
            var nd2 = Object.assign({}, d); nd2[key] = nv
            writeAttrs(editor, getPos, { data: nd2 })
          }
        })
      })
      dom.appendChild(strip)
    })

    var rowsWrap = document.createElement('div')
    rowsWrap.className = 'np-rows' + (C.grid ? ' grid' : '')
    ;(data.rows || []).forEach(function (r, ri) {
      var rowEl = document.createElement('div')
      rowEl.className = 'np-row'
      rowEl.dataset.ri = String(ri)
      var lEl = document.createElement('span'); lEl.className = 'np-l'; lEl.contentEditable = 'true'; lEl.spellcheck = false
      lEl.innerHTML = esc(r.l || '')
      var vEl = document.createElement('span'); vEl.className = 'np-v'; vEl.contentEditable = 'true'; vEl.spellcheck = false
      vEl.innerHTML = nl(r.v || '')
      var rm = document.createElement('button')
      rm.type = 'button'; rm.className = 'np-rm gmonly'; rm.title = 'Remove field'; rm.textContent = '×'
      rowEl.appendChild(lEl); rowEl.appendChild(vEl); rowEl.appendChild(rm)
      rowsWrap.appendChild(rowEl)

      fieldCommit(lEl, function (v) {
        var d = liveData()
        if (!d.rows || !d.rows[ri] || d.rows[ri].l === v) return
        var rows = d.rows.map(function (x, i) { return i === ri ? Object.assign({}, x, { l: v }) : x })
        writeAttrs(editor, getPos, { data: Object.assign({}, d, { rows: rows }) })
      })
      /* row values keep the same "collapse 3+ newlines to 2" rule as the
         vendored table-cell/card-row commit -- edText already gives real
         newlines back; this just matches the original's own trim rule. */
      vEl.addEventListener('input', function () {
        var v = edText(vEl).replace(/\n{3,}/g, '\n\n')
        var d = liveData()
        if (!d.rows || !d.rows[ri] || d.rows[ri].v === v) return
        var rows = d.rows.map(function (x, i) { return i === ri ? Object.assign({}, x, { v: v }) : x })
        writeAttrs(editor, getPos, { data: Object.assign({}, d, { rows: rows }) })
      })
      vEl.addEventListener('blur', function () {
        var v = edText(vEl).replace(/\n{3,}/g, '\n\n').trim()
        var d = liveData()
        if (!d.rows || !d.rows[ri] || d.rows[ri].v === v) return
        var rows = d.rows.map(function (x, i) { return i === ri ? Object.assign({}, x, { v: v }) : x })
        writeAttrs(editor, getPos, { data: Object.assign({}, d, { rows: rows }) })
      })

      rm.addEventListener('mousedown', function (e) { e.stopPropagation() })
      rm.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation()
        var d = liveData()
        var rows = (d.rows || []).slice()
        rows.splice(ri, 1)
        writeAttrs(editor, getPos, { data: Object.assign({}, d, { rows: rows }) })
        build()
      })
    })
    dom.appendChild(rowsWrap)

    var addBtn = document.createElement('button')
    addBtn.type = 'button'; addBtn.className = 'np-add gmonly'; addBtn.textContent = '+ Add field'
    addBtn.addEventListener('mousedown', function (e) { e.stopPropagation() })
    addBtn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation()
      var d = liveData()
      var rows = (d.rows || []).slice()
      rows.push({ l: 'Field', v: '' })
      writeAttrs(editor, getPos, { data: Object.assign({}, d, { rows: rows }) })
      build()
    })
    dom.appendChild(addBtn)

    if (kind === 'stat' && hooks.onArchiveExport) {
      var copyBtn = document.createElement('button')
      copyBtn.type = 'button'; copyBtn.className = 'arch-copy gmonly'
      copyBtn.title = "Copy this stat block as JSON for The Archive’s Adversary creator"
      copyBtn.textContent = 'Copy for Archive'
      copyBtn.addEventListener('mousedown', function (e) { e.stopPropagation() })
      copyBtn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation()
        var d = liveData()
        hooks.onArchiveExport(Object.assign({ id: props.node.attrs.blockId, t: 'stat' }, d), function () {
          copyBtn.textContent = 'Copied'; copyBtn.classList.add('ok')
          setTimeout(function () { copyBtn.textContent = 'Copy for Archive'; copyBtn.classList.remove('ok') }, 1600)
        })
      })
      header.appendChild(copyBtn)
    }
  }

  build()

  return {
    dom: dom,
    ignoreMutation: function () { return true },
    stopEvent: function () { return true }, /* let native contentEditable handle its own keys/selection */
    update: function (newNode) {
      if (newNode.type.name !== 'card' || newNode.attrs.kind !== kind) return false
      /* Accept external attr changes without rebuilding while a field inside
         this card might be focused -- this NodeView is the sole writer of
         its own attrs in the single-editor-session scope of this port, so
         there is no concurrent external writer to reconcile against here. */
      return true
    },
    destroy: function () {},
  }
}

/* ---- npc: its own separate, simpler view (NOT CARDDEF) ------------------ */

function createNpcNodeView(props) {
  var editor = props.editor, getPos = props.getPos

  var dom = document.createElement('div')
  dom.className = 'b-npc'

  function liveAttrs() {
    var found = currentNodeAndPos(editor, getPos)
    return found ? found.node.attrs : props.node.attrs
  }

  function build() {
    var a = liveAttrs()
    dom.innerHTML = ''

    var header = document.createElement('div')
    header.className = 'np-h'
    var nmEl = document.createElement('span')
    nmEl.className = 'nm'; nmEl.contentEditable = 'true'; nmEl.spellcheck = false
    nmEl.innerHTML = esc(a.name || 'Untitled NPC')
    header.appendChild(nmEl)
    dom.appendChild(header)

    function fieldCommit(el, apply) {
      var commit = function () { apply(edText(el).trim()) }
      el.addEventListener('input', commit)
      el.addEventListener('blur', commit)
    }
    fieldCommit(nmEl, function (v) {
      if (liveAttrs().name === v) return
      writeAttrs(editor, getPos, { name: v })
    })

    var rowsWrap = document.createElement('div')
    rowsWrap.className = 'np-rows'
    ;(a.rows || []).forEach(function (r, ri) {
      var rowEl = document.createElement('div')
      rowEl.className = 'np-row'
      rowEl.dataset.ri = String(ri)
      var lEl = document.createElement('span'); lEl.className = 'np-l'; lEl.contentEditable = 'true'; lEl.spellcheck = false
      lEl.innerHTML = esc(r.l || '')
      var vEl = document.createElement('span'); vEl.className = 'np-v'; vEl.contentEditable = 'true'; vEl.spellcheck = false
      vEl.innerHTML = nl(r.v || '')
      var rm = document.createElement('button')
      rm.type = 'button'; rm.className = 'np-rm gmonly'; rm.textContent = '×'
      rowEl.appendChild(lEl); rowEl.appendChild(vEl); rowEl.appendChild(rm)
      rowsWrap.appendChild(rowEl)

      fieldCommit(lEl, function (v) {
        var a2 = liveAttrs()
        if (!a2.rows || !a2.rows[ri] || a2.rows[ri].l === v) return
        var rows = a2.rows.map(function (x, i) { return i === ri ? Object.assign({}, x, { l: v }) : x })
        writeAttrs(editor, getPos, { rows: rows })
      })
      vEl.addEventListener('input', function () {
        var v = edText(vEl).replace(/\n{3,}/g, '\n\n')
        var a2 = liveAttrs()
        if (!a2.rows || !a2.rows[ri] || a2.rows[ri].v === v) return
        var rows = a2.rows.map(function (x, i) { return i === ri ? Object.assign({}, x, { v: v }) : x })
        writeAttrs(editor, getPos, { rows: rows })
      })
      vEl.addEventListener('blur', function () {
        var v = edText(vEl).replace(/\n{3,}/g, '\n\n').trim()
        var a2 = liveAttrs()
        if (!a2.rows || !a2.rows[ri] || a2.rows[ri].v === v) return
        var rows = a2.rows.map(function (x, i) { return i === ri ? Object.assign({}, x, { v: v }) : x })
        writeAttrs(editor, getPos, { rows: rows })
      })
      rm.addEventListener('mousedown', function (e) { e.stopPropagation() })
      rm.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation()
        var a2 = liveAttrs()
        var rows = (a2.rows || []).slice()
        rows.splice(ri, 1)
        writeAttrs(editor, getPos, { rows: rows })
        build()
      })
    })
    dom.appendChild(rowsWrap)

    var addBtn = document.createElement('button')
    addBtn.type = 'button'; addBtn.className = 'np-add gmonly'; addBtn.textContent = '+ Add field'
    addBtn.addEventListener('mousedown', function (e) { e.stopPropagation() })
    addBtn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation()
      var a2 = liveAttrs()
      var rows = (a2.rows || []).slice()
      rows.push({ l: 'Field', v: '' })
      writeAttrs(editor, getPos, { rows: rows })
      build()
    })
    dom.appendChild(addBtn)
  }

  build()

  return {
    dom: dom,
    ignoreMutation: function () { return true },
    stopEvent: function () { return true },
    update: function (newNode) {
      return newNode.type.name === 'npcCard'
    },
    destroy: function () {},
  }
}

module.exports = { createCardNodeView: createCardNodeView, createNpcNodeView: createNpcNodeView }
