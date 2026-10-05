/* Block-type drift detector. src/console-editor/block-types.js is the single list of
   block types; the editor's blocks<->doc mapping (scripts/console-blocks-doc.js) and the
   console's patch validation both depend on it. This fails when they disagree:
     - a listed type the editor does not map to a real node (it would fall through to
       `unknownBlock`), so a patch could insert a type the editor cannot show;
     - a type the editor can emit from a document that is not in the list, so a patch
       touching it would be refused although the editor happily creates it;
     - the bundle no longer exposing the list the console's validation reads.
   Includes a deliberate-failure check, like the other suites. */

var fs = require('fs')
var path = require('path')
var BT = require('../src/console-editor/block-types.js')
var D = require('./console-blocks-doc.js')

var pass = 0, fail = 0, failures = []
function ok(name, cond, detail) {
  if (cond) { pass++; return }
  fail++
  failures.push(name + (detail ? ': ' + detail : ''))
}

var SAMPLE = {
  h1: { x: 'A' }, h2: { x: 'A' }, h3: { x: 'A' }, p: { x: 'A' }, quote: { x: 'A' },
  callout: { x: 'A' }, read: { x: 'A' }, list: { x: 'A\nB' }, table: { r: [['h'], ['c']] },
  div: {}, pb: {}, npc: { name: 'N', rows: [{ l: 'a', v: 'b' }] },
  stat: { name: 'S', tier: 'Rival' }, vehicle: { name: 'V', tier: 'Starship' }, planet: { name: 'P' },
}

BT.BLOCK_TYPES.forEach(function (t) {
  var sample = SAMPLE[t]
  ok('sample exists for ' + t, !!sample, 'add a SAMPLE entry in this test for the new type')
  if (!sample) return
  var b = Object.assign({ id: 'x1', t: t }, sample)
  var doc = D.blocksToDoc([b])
  var types = doc.content.map(function (n) { return n.type })
  ok(t + ' maps to a real node', types.length > 0 && types.indexOf('unknownBlock') < 0, 'got ' + types.join(','))
  var back = D.docToBlocks(doc)
  ok(t + ' round-trips as the same t', back.length === 1 && back[0].t === t, 'got ' + JSON.stringify(back.map(function (x) { return x.t })))
})

/* the other direction: a type outside the list must NOT be silently handled */
var odd = D.blocksToDoc([{ id: 'z', t: 'zz-not-a-type', x: 'q' }])
ok('a type outside the list falls to unknownBlock', odd.content[0].type === 'unknownBlock')

/* every t the editor can emit from a document must be in the list */
var emitted = {}
BT.BLOCK_TYPES.forEach(function (t) {
  D.docToBlocks(D.blocksToDoc([Object.assign({ id: 'x1', t: t }, SAMPLE[t] || {})])).forEach(function (b) { emitted[b.t] = 1 })
})
Object.keys(emitted).forEach(function (t) {
  ok('editor-emittable type ' + t + ' is in the list', BT.BLOCK_TYPES.indexOf(t) >= 0)
})

/* the bundle exposes the list, read from the same module */
var entry = fs.readFileSync(path.join(__dirname, '..', 'src', 'console-editor', 'entry.js'), 'utf8')
ok('entry.js exposes window.LOR_BLOCK_TYPES from block-types.js',
  /window\.LOR_BLOCK_TYPES\s*=.*require\('\.\/block-types\.js'\)\.BLOCK_TYPES/.test(entry))
var bundlePath = path.join(__dirname, '..', 'public', 'console', 'editor.bundle.js')
if (fs.existsSync(bundlePath)) {
  ok('built bundle contains LOR_BLOCK_TYPES', fs.readFileSync(bundlePath, 'utf8').indexOf('LOR_BLOCK_TYPES') >= 0, 'run npm run build:console-editor')
}

/* deliberate failure: prove this harness can detect a mismatch */
;(function () {
  var before = fail
  var fake = BT.BLOCK_TYPES.concat(['phantom'])
  var mapped = D.blocksToDoc([{ id: 'x', t: 'phantom', x: 'q' }]).content[0].type !== 'unknownBlock'
  ok('(deliberate) phantom type would map to a real node', mapped && fake.indexOf('phantom') >= 0)
  var detected = fail === before + 1
  failures.pop(); fail = before; if (!detected) { fail++; failures.push('deliberate-failure check did NOT detect the mismatch') } else pass++
})()

console.log('block types: ' + pass + ' passed, ' + fail + ' failed')
if (fail) { failures.forEach(function (f) { console.log('  FAIL ' + f) }); console.log('\nFAIL'); process.exit(1) }
console.log('\nPASS')
