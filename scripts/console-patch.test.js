/* Tests for the console's patch validation / planning core (public/console/index.html).
   The functions are private to the vendored file's closure, so they are extracted
   verbatim at test time (balanced-brace, name-anchored -- the same technique as
   console-carddef-drift.test.js) and run in a vm sandbox. They are pure by design: no
   DOM, no DB. This covers spec section 9 test 5 (each refusal, with its message), the
   ordering/atomicity of ops (4, 6), seedFromBody (3a/3b logic), the delete-title
   confirmation, the open-document refusal and the size check. The write path is covered
   by the live acceptance run, not here. Includes a deliberate-failure check. */

var fs = require('fs')
var path = require('path')
var vm = require('vm')
var BT = require('../src/console-editor/block-types.js')

var SRC = fs.readFileSync(path.join(__dirname, '..', 'public', 'console', 'index.html'), 'utf8')

function fnSrc(name) {
  var start = SRC.indexOf('function ' + name + '(')
  if (start === -1) throw new Error('cannot find function ' + name)
  var i = SRC.indexOf('{', start), depth = 0, j = i
  for (; j < SRC.length; j++) {
    var ch = SRC[j]
    if (ch === '{') depth++
    else if (ch === '}') { depth--; if (depth === 0) break }
  }
  return SRC.slice(start, j + 1)
}
function stmtSrc(marker) {
  var i = SRC.indexOf(marker), j = SRC.indexOf(';', i)
  if (i === -1) throw new Error('cannot find ' + marker)
  return SRC.slice(i, j + 1)
}

var code = [
  stmtSrc('var COLLS='), stmtSrc('var DOCLIMIT='),
  stmtSrc('var PATCH_TOP='),
  'function dclone(v){return JSON.parse(JSON.stringify(v));}',
].concat(['byId', 'withId', 'blockText', 'docStoredSize', 'applyDocOps', 'docPlans', 'validatePatch',
  'recLabel', 'changedFields', 'planPatch', 'stable', 'patchTouches', 'planSig', 'bid', 'parseBlocks', 'seedBlocksForPatch'].map(fnSrc)).join('\n')
var ctx = vm.createContext({ TextEncoder: TextEncoder, JSON: JSON, Object: Object, Array: Array, Math: Math })
vm.runInContext(code, ctx)
var V = ctx

var pass = 0, fail = 0, failures = []
function ok(name, cond, detail) {
  if (cond) { pass++; return }
  fail++
  failures.push(name + (detail ? ': ' + detail : ''))
}

function blocks(prefix, n) {
  var out = []
  for (var i = 1; i <= n; i++) out.push({ id: prefix + i, t: 'p', x: 'text ' + prefix + i })
  return out
}
function freshS() {
  return JSON.parse(JSON.stringify({
    campaign: { era: '1 ABY', session: 29, position: 'here', appliedPatches: [{ id: 'p-old', when: '2026-10-01T00:00:00.000Z' }] },
    arcs: [{ id: 'a1', name: 'Arc' }], threads: [{ id: 't1', title: 'One', note: 'n', status: 'open' }, { id: 't2', title: 'Two' }],
    sessions: [{ id: 's1', n: 1, title: 'First' }], codex: [], planets: [], links: [], tags: [],
    docs: [
      { id: 'd-a', title: 'Doc A', folder: 'X', blocks: blocks('a', 4) },
      { id: 'd-story', title: 'The Story', folder: 'X', blocks: [], body: 'First paragraph.\n\nSecond paragraph.' },
      { id: 'd-big', title: 'Big', blocks: [{ id: 'g1', t: 'p', x: new Array(50).join('0123456789') }] },
    ],
  }))
}
function env(over) {
  var e = {
    types: BT.BLOCK_TYPES, open: [], limit: 8000000, overhead: 1.15,
    seed: function (body) {
      var n = 0
      return String(body || '').split(/\n\n+/).filter(Boolean).map(function (x) { return { id: 'sd' + (++n), t: 'p', x: x } })
    },
  }
  for (var k in over) e[k] = over[k]
  return e
}
function patch(over) {
  var p = { lor: 1, patch: 1, id: 'p-test' }
  for (var k in over) p[k] = over[k]
  return p
}
function problems(p, s, e) { return V.validatePatch(p, s || freshS(), e || env()) }
function refuses(name, p, needle, s, e) {
  var pr = problems(p, s, e)
  ok(name + ': refused', pr.length > 0, 'got no problems')
  ok(name + ': message names the problem', pr.length > 0 && pr.join(' | ').indexOf(needle) >= 0, 'wanted ' + JSON.stringify(needle) + ' in ' + JSON.stringify(pr))
}

/* ---- valid baselines ---- */
ok('empty patch with just id is valid', problems(patch({})).length === 0)
ok('upsert-only patch is valid', problems(patch({ upsert: { sessions: [{ id: 's28', n: 28 }] } })).length === 0)

/* ---- spec section 9 test 5: each refusal ---- */
refuses('unknown collection (upsert)', patch({ upsert: { bogus: [{ id: 'x' }] } }), 'unknown collection "bogus"')
refuses('unknown collection (delete)', patch({ 'delete': { bogus: ['x'] } }), 'unknown collection "bogus"')
refuses('missing record id', patch({ upsert: { threads: [{ title: 'no id' }] } }), 'has no id')
refuses('unknown block id', patch({ docs: [{ id: 'd-a', ops: [{ op: 'replace', block: 'nope', 'with': { t: 'p', x: 'q' } }] }] }), 'block "nope" is not in the document')
refuses('duplicate inserted id', patch({ docs: [{ id: 'd-a', ops: [{ op: 'append', blocks: [{ id: 'a1', t: 'p', x: 'dup' }] }] }] }), 'already exists in this document')
refuses('unknown block type', patch({ docs: [{ id: 'd-a', ops: [{ op: 'append', blocks: [{ t: 'zz', x: 'q' }] }] }] }), 'block type "zz"')
refuses('blocks key on doc entry', patch({ docs: [{ id: 'd-a', blocks: [], ops: [] }] }), 'carries a "blocks" key')
refuses('docs under upsert', patch({ upsert: { docs: [{ id: 'd-a' }] } }), '"docs" is not allowed under "upsert"')
refuses('wrong lor', { lor: 2, patch: 1, id: 'x' }, '"lor" must be 1')
refuses('wrong patch version', { lor: 1, patch: 2, id: 'x' }, '"patch" must be 1')
refuses('empty id', patch({ id: '  ' }), '"id" is required')
refuses('unknown op', patch({ docs: [{ id: 'd-a', ops: [{ op: 'explode', block: 'a1' }] }] }), 'unknown op "explode"')
refuses('missing required field (replace without with)', patch({ docs: [{ id: 'd-a', ops: [{ op: 'replace', block: 'a1' }] }] }), 'needs "with"')
refuses('missing required field (insertAfter without block)', patch({ docs: [{ id: 'd-a', ops: [{ op: 'insertAfter', blocks: [{ t: 'p', x: 'q' }] }] }] }), 'needs a "block" id')
refuses('unknown document', patch({ docs: [{ id: 'd-nope', ops: [{ op: 'append', blocks: [{ t: 'p', x: 'q' }] }] }] }), 'does not exist in this campaign')
refuses('unknown top-level key', patch({ upserts: {} }), 'unknown top-level key "upserts"')
refuses('with.id mismatch', patch({ docs: [{ id: 'd-a', ops: [{ op: 'replace', block: 'a1', 'with': { id: 'a2', t: 'p', x: 'q' } }] }] }), 'must equal "block"')

/* ---- ordering / atomicity ---- */
var order = patch({ docs: [{ id: 'd-a', ops: [
  { op: 'insertAfter', block: 'a1', blocks: [{ id: 'n1', t: 'h2', x: 'new' }] },
  { op: 'replace', block: 'n1', 'with': { t: 'h3', x: 'edited new' } },
  { op: 'insertBefore', block: 'a1', blocks: [{ t: 'p', x: 'first' }] },
  { op: 'move', block: 'a4', after: 'a1' },
  { op: 'delete', block: 'a3' },
  { op: 'append', blocks: [{ t: 'p', x: 'last' }] },
] }] })
ok('ops that reference earlier ops are valid', problems(order).length === 0, JSON.stringify(problems(order)))
var plan = V.planPatch(order, freshS(), env(), (function () { var n = 0; return function () { return 'g' + (++n) } })())
var fin = plan.docs[0].doc.blocks.map(function (b) { return b.id })
ok('final order is as expected', JSON.stringify(fin) === JSON.stringify(['g1', 'a1', 'a4', 'n1', 'a2', 'g2']),
  JSON.stringify(fin))
ok('block count before/after reported', plan.docs[0].before === 4 && plan.docs[0].after === 6)
var third = patch({ docs: [{ id: 'd-a', ops: [
  { op: 'replace', block: 'a1', 'with': { t: 'p', x: 'ok1' } },
  { op: 'replace', block: 'a2', 'with': { t: 'p', x: 'ok2' } },
  { op: 'replace', block: 'MISSING', 'with': { t: 'p', x: 'bad' } },
] }] })
refuses('third op invalid names op 3', third, 'op 3')
var sSnap = JSON.stringify(freshS())
var sUse = freshS()
V.validatePatch(third, sUse, env()); V.validatePatch(order, sUse, env())
ok('validation never mutates S', JSON.stringify(sUse) === sSnap)

/* ---- seedFromBody (3a/3b logic) ---- */
var storyOps = [{ op: 'append', blocks: [{ t: 'p', x: 'Added.' }] }]
refuses('3a: blockless doc refused without seedFromBody', patch({ docs: [{ id: 'd-story', ops: storyOps }] }), 'has no blocks')
var seeded = patch({ docs: [{ id: 'd-story', seedFromBody: true, ops: storyOps }] })
ok('3b: blockless doc allowed with seedFromBody: true', problems(seeded).length === 0, JSON.stringify(problems(seeded)))
var sp = V.planPatch(seeded, freshS(), env(), function () { return 'q' })
ok('3b: plan flags the conversion with counts', sp.docs[0].seeded === true && sp.docs[0].seedCount === 2 && sp.docs[0].after === 3)
refuses('seedFromBody on a doc that has blocks', patch({ docs: [{ id: 'd-a', seedFromBody: true, ops: storyOps }] }), 'already has 4 blocks')
refuses('seedFromBody must be boolean', patch({ docs: [{ id: 'd-story', seedFromBody: 'yes', ops: storyOps }] }), 'true or false')

/* ---- deletes ---- */
refuses('delete of a missing record', patch({ 'delete': { threads: ['zz'] } }), 'which does not exist')
refuses('doc delete without title', patch({ 'delete': { docs: ['d-a'] } }), 'exact current title')
refuses('doc delete with wrong title', patch({ 'delete': { docs: [{ id: 'd-a', title: 'Doc a' }] } }), 'does not match')
ok('doc delete with exact title is valid', problems(patch({ 'delete': { docs: [{ id: 'd-a', title: 'Doc A' }] } })).length === 0)
refuses('upsert + delete same id', patch({ upsert: { threads: [{ id: 't1', title: 'x' }] }, 'delete': { threads: ['t1'] } }), 'both upserted and deleted')
var dplan = V.planPatch(patch({ 'delete': { threads: ['t2'] } }), freshS(), env(), function () { return 'q' })
ok('delete shows in plan with label', dplan.deleted === 1 && dplan.dels[0].label === 'Two')

/* ---- open editor, size, types list ---- */
refuses('doc open in editor', patch({ docs: [{ id: 'd-a', ops: storyOps }] }), 'is open in the editor', freshS(), env({ open: ['d-a'] }))
refuses('size over limit names the document', patch({ docs: [{ id: 'd-big', ops: [{ op: 'append', blocks: [{ t: 'p', x: new Array(400).join('0123456789') }] }] }] }), 'document "d-big" would be about', freshS(), env({ limit: 1000 }))
refuses('block-type list missing', patch({}), 'block-type list did not load', freshS(), env({ types: null }))
refuses('ops leaving doc empty', patch({ docs: [{ id: 'd-a', ops: ['a1', 'a2', 'a3', 'a4'].map(function (b) { return { op: 'delete', block: b } }) }] }), 'no blocks')

/* ---- upsert planning ---- */
var up = patch({ upsert: { threads: [{ id: 't1', title: 'One', note: 'n', status: 'open' }, { id: 't2', title: 'Two!' }, { id: 't9', title: 'New' }] } })
var upPlan = V.planPatch(up, freshS(), env(), function () { return 'q' })
var st = {}; upPlan.recs.forEach(function (r) { st[r.id] = r.status })
ok('plan: identical / changed / added classified', st.t1 === 'same' && st.t2 === 'change' && st.t9 === 'add', JSON.stringify(st))
ok('plan: written count excludes identical', upPlan.written === 2 && upPlan.unchanged === 1)
ok('plan: changed record lists differing fields', upPlan.recs.filter(function (r) { return r.id === 't2' })[0].fields.indexOf('title') >= 0)
var camp = V.planPatch(patch({ campaign: { era: '1 ABY', session: 29, position: 'here' } }), freshS(), env(), function () { return 'q' })
ok('plan: campaign diff ignores appliedPatches', camp.campaign.status === 'same')
var applied = V.planPatch(patch({ id: 'p-old' }), freshS(), env(), function () { return 'q' })
ok('plan: previously applied id is reported', applied.applied && applied.applied.id === 'p-old')

/* ---- deterministic seed ids (fix 3) ---- */
var body3 = ['First paragraph.', 'Second paragraph.', '## Third heading', 'Fourth.'].join('\n\n')
var sa = V.seedBlocksForPatch(body3), sb = V.seedBlocksForPatch(body3)
ok('seed ids are s1..sN in document order', JSON.stringify(sa.map(function (b) { return b.id })) === '["s1","s2","s3","s4"]', JSON.stringify(sa.map(function (b) { return b.id })))
ok('seeding twice yields identical ids', JSON.stringify(sa.map(function (b) { return b.id })) === JSON.stringify(sb.map(function (b) { return b.id })))
ok('seed keeps id first and parseBlocks content', Object.keys(sa[0])[0] === 'id' && sa[2].t === 'h2' && sa[2].x === 'Third heading')
var realEnv = env({ seed: V.seedBlocksForPatch })
var seedTarget = patch({ docs: [{ id: 'd-story', seedFromBody: true, ops: [{ op: 'replace', block: 's3', 'with': { t: 'p', x: 'edited seeded block' } }, { op: 'insertAfter', block: 's1', blocks: [{ t: 'p', x: 'inserted after s1' }] }] }] })
var bigStory = freshS(); bigStory.docs[1].body = body3
ok('one patch can seed and target a seeded block (s3)', problems(seedTarget, bigStory, realEnv).length === 0, JSON.stringify(problems(seedTarget, bigStory, realEnv)))
var spl = V.planPatch(seedTarget, bigStory, realEnv, function () { return 'g1' })
ok('seeded + targeted plan ids are the ones that would be written', spl.docs[0].doc.blocks.map(function (b) { return b.id }).join() === 's1,g1,s2,s3,s4' && spl.docs[0].doc.blocks[3].x === 'edited seeded block', spl.docs[0].doc.blocks.map(function (b) { return b.id }).join())
refuses('targeting a seeded id beyond the seeded count', patch({ docs: [{ id: 'd-story', seedFromBody: true, ops: [{ op: 'replace', block: 's9', 'with': { t: 'p', x: 'q' } }] }] }), 'block "s9" is not in the document', bigStory, realEnv)

/* ---- patchTouches (fix 2): one helper for the preview gate and the apply gate ---- */
function sorted(a) { return a.slice().sort().join() }
ok('patchTouches always includes campaign', sorted(V.patchTouches(patch({}))) === 'campaign')
ok('patchTouches covers upsert, delete and docs', sorted(V.patchTouches(patch({ upsert: { threads: [{ id: 'a' }], sessions: [] }, 'delete': { codex: ['x'] }, docs: [{ id: 'd-a' }] }))) === 'campaign,codex,docs,threads')
ok('patchTouches counts delete.docs as docs', sorted(V.patchTouches(patch({ 'delete': { docs: [{ id: 'd-a', title: 'Doc A' }] } }))) === 'campaign,docs')
ok('patchTouches tolerates a malformed file', sorted(V.patchTouches({ upsert: 'x', 'delete': [], docs: 'y' })) === 'campaign' && sorted(V.patchTouches(null)) === 'campaign')

/* ---- planSig (optional fix): changes when the plan would change ---- */
var sigA = V.planSig(V.planPatch(up, freshS(), env(), function () { return 'q' }))
var sMoved = freshS(); sMoved.threads[1].title = 'Two!'
var sigB = V.planSig(V.planPatch(up, sMoved, env(), function () { return 'q' }))
ok('planSig differs when the underlying state changes the plan', sigA !== sigB)
ok('planSig is stable for the same state', sigA === V.planSig(V.planPatch(up, freshS(), env(), function () { return 'zz' })))

/* ---- deliberate failure: prove this harness can detect a problem ---- */
;(function () {
  var before = fail
  ok('(deliberate) a VALID patch is reported as having problems', problems(patch({ upsert: { sessions: [{ id: 's28' }] } })).length > 0)
  var detected = fail === before + 1
  failures.pop(); fail = before
  if (detected) pass++; else { fail++; failures.push('deliberate-failure check did NOT detect a wrong expectation') }
})()

console.log('console patch core: ' + pass + ' passed, ' + fail + ' failed')
if (fail) { failures.forEach(function (f) { console.log('  FAIL ' + f) }); console.log('\nFAIL'); process.exit(1) }
console.log('\nPASS')
