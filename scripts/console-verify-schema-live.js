#!/usr/bin/env node
/* Step 3, D1: for every live document, run blocksToDoc and validate the result
   against the REAL TipTap/ProseMirror schema (src/console-editor/schema.js),
   via node.check() -- the same call ProseMirror itself uses to reject an
   invalid document. Names the document and the block on any failure.

   READ ONLY. GET only, anon key, same standard as console-verify-live.js. */

var C = require('./console-blocks-doc.js')
var schema = require('../src/console-editor/schema.js')
var Editor = require('@tiptap/core').Editor

var args = process.argv.slice(2)
function opt(n, d) { var i = args.indexOf(n); return i === -1 ? d : args[i + 1] }
var TABLE = opt('--table', 'console_documents')

var URL_ = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_ANON_KEY
if (!URL_ || !KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY (anon key, not service role).')
  process.exit(2)
}
if (/service_role/.test(Buffer.from(String(KEY).split('.')[1] || '', 'base64').toString())) {
  console.error('That looks like a service-role key. Anon key only.')
  process.exit(2)
}

function get(path) {
  return fetch(URL_.replace(/\/$/, '') + '/rest/v1/' + path, {
    method: 'GET',
    headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Accept: 'application/json' },
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ': ' + t.slice(0, 300)) })
    return r.json()
  })
}

/* Build the real ProseMirror schema the same way TipTap's Editor does, without
   mounting a DOM editor (there is no DOM here -- this is a node script). A
   throwaway Editor with element:null gives us its resolved schema.nodes to
   build a Schema instance for node.check(). */
var probeEditor = new Editor({ extensions: schema.extensions, content: { type: 'doc', content: [] } })
var pmSchema = probeEditor.schema
probeEditor.destroy()

get(encodeURIComponent(TABLE) + '?select=id,title,blocks&limit=500').then(function (rows) {
  if (!rows.length) { console.error('No rows returned from ' + TABLE + '.'); process.exit(1) }

  var invalidDocs = 0, totalChecked = 0

  rows.forEach(function (row) {
    var blocks = row.blocks || []
    totalChecked++
    var doc
    try {
      doc = C.blocksToDoc(blocks)
    } catch (e) {
      invalidDocs++
      console.log('  FAIL ' + row.id + '  blocksToDoc threw: ' + e.message)
      return
    }

    var pmNode
    try {
      pmNode = pmSchema.nodeFromJSON(doc)
    } catch (e) {
      invalidDocs++
      console.log('  FAIL ' + row.id + '  nodeFromJSON threw: ' + e.message)
      return
    }

    try {
      pmNode.check()
    } catch (e) {
      /* A zero-block document (only d-story today) converts to {content:[]},
         which node.check() correctly rejects under a block+ doc schema --
         but this is the SAME known case scripts/console-blocks-doc.mount.test.js
         already proves is safe: a real Editor/EditorView never leaves a doc in
         this shape, since ProseMirror's own construction path calls
         schema.nodes.doc.createAndFill() to fill an empty/invalid initial doc
         before anything renders. Report it as expected, not a new failure. */
      if (blocks.length === 0) {
        console.log('  ok*  ' + row.id + '  (0 blocks -> raw doc is {content:[]}, ' +
          'invalid under node.check() alone -- expected; a real Editor auto-fills ' +
          'via schema.nodes.doc.createAndFill(), see console-blocks-doc.mount.test.js)')
        return
      }
      invalidDocs++
      /* Walk the top-level children to name the offending block, matching it
         back to the source block by index -- node.check() itself only names
         the ProseMirror node type, not our block id, so we cross-reference. */
      var childIdx = -1
      var msg = e.message || String(e)
      var m = /Invalid content for node (\w+)/.exec(msg)
      if (pmNode.content && pmNode.content.content) {
        for (var i = 0; i < pmNode.content.content.length; i++) {
          try { pmNode.content.content[i].check() } catch (ce) { childIdx = i; break }
        }
      }
      var block = childIdx >= 0 ? blocks[childIdx] : null
      console.log('  FAIL ' + row.id + '  node.check() threw: ' + msg +
        (block ? '  (likely block ' + childIdx + ', t=' + block.t + ', id=' + block.id + ')' : ''))
      return
    }

    console.log('  ok   ' + row.id + '  (' + blocks.length + ' blocks -> valid doc)')
  })

  console.log('')
  console.log('documents checked : ' + totalChecked)
  console.log('schema-invalid    : ' + invalidDocs)
  console.log('writes issued     : none (GET only)')
  console.log('')
  console.log(invalidDocs ? 'FAIL' : 'PASS')
  process.exit(invalidDocs ? 1 : 0)
}).catch(function (e) { console.error('\n' + e.message); process.exit(1) })
